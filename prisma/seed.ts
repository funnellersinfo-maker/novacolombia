// Seed de NOVA Colombia — ejecutar con: bun run db:seed
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";
import { seedCategories, seedProducts } from "../data/catalog";
import { seedCarriers, seedZones } from "../data/colombia";
import { seedBanners, seedCollections, seedLegalDocs, seedBrandConfig, seedHomeTexts } from "../data/content";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const db = new PrismaClient();

function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function loadImageMap(): Record<string, string[]> {
  const p = join(__dirname, "..", "data", "image-map.json");
  if (existsSync(p)) {
    try {
      return JSON.parse(readFileSync(p, "utf-8")) as Record<string, string[]>;
    } catch {
      return {};
    }
  }
  return {};
}

async function main() {
  console.log("🌱 Sembrando NOVA Colombia...");

  // ── Categorías ──
  for (const cat of seedCategories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        special: cat.special ?? null,
        sortOrder: cat.order,
        active: true,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        special: cat.special ?? null,
        sortOrder: cat.order,
        active: true,
      },
    });
  }
  const catMap = new Map((await db.category.findMany()).map((c) => [c.slug, c.id]));
  console.log(`  ✅ ${seedCategories.length} categorías`);

  // ── Productos ──
  const imageMap = loadImageMap();
  let count = 0;
  for (const p of seedProducts) {
    const categoryId = catMap.get(p.category);
    if (!categoryId) {
      console.warn(`  ⚠️  categoría no encontrada para ${p.slug} (${p.category})`);
      continue;
    }
    const images = imageMap[p.slug] ?? [];
    const data = {
      name: p.name,
      brand: p.brand,
      seller: p.seller,
      description: p.description,
      features: JSON.stringify(p.features),
      categoryId,
      subcategory: p.subcategory,
      price: p.price,
      compareAtPrice: p.compareAt ?? null,
      stock: p.stock,
      sku: p.sku ?? "",
      prepayEligible: p.prepayEligible !== false,
      codAvailable: p.codAvailable !== false,
      isFeatured: p.isFeatured === true,
      isNew: p.isNew === true,
      popularity: p.popularity ?? 50,
      tags: JSON.stringify(p.tags),
      images: JSON.stringify(images),
      active: true,
    };
    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await db.product.update({ where: { slug: p.slug }, data });
      await db.variant.deleteMany({ where: { productId: existing.id } });
      if (p.variants?.length) {
        await db.variant.createMany({
          data: p.variants.map((v) => ({
            productId: existing.id,
            kind: v.kind,
            value: v.value,
            priceDelta: v.priceDelta ?? 0,
            stock: v.stock,
          })),
        });
      }
    } else {
      const created = await db.product.create({
        data: { slug: p.slug, ...data },
      });
      if (p.variants?.length) {
        await db.variant.createMany({
          data: p.variants.map((v) => ({
            productId: created.id,
            kind: v.kind,
            value: v.value,
            priceDelta: v.priceDelta ?? 0,
            stock: v.stock,
          })),
        });
      }
    }
    count++;
  }
  console.log(`  ✅ ${count} productos (${Object.keys(imageMap).length} con imágenes reales)`);

  // ── Transportadoras ──
  for (const c of seedCarriers) {
    await db.carrier.upsert({
      where: { code: c.code },
      update: { name: c.name, supportsCod: c.supportsCod, integration: c.integration, notes: c.notes },
      create: { code: c.code, name: c.name, supportsCod: c.supportsCod, integration: c.integration, notes: c.notes },
    });
  }
  console.log(`  ✅ ${seedCarriers.length} transportadoras`);

  // ── Zonas de envío ──
  let zoneCount = 0;
  for (const z of seedZones) {
    const exists = await db.shippingZone.findFirst({
      where: { departamento: z.departamento, ciudad: z.ciudad },
    });
    if (!exists) {
      await db.shippingZone.create({ data: z });
      zoneCount++;
    } else {
      await db.shippingZone.update({ where: { id: exists.id }, data: z });
    }
  }
  console.log(`  ✅ ${seedZones.length} zonas logísticas (${zoneCount} nuevas)`);

  // ── Promociones ──
  await db.promotion.upsert({
    where: { code: "PREPAY10" },
    update: {
      name: "10% de descuento por pago anticipado",
      type: "PREPAY_DISCOUNT",
      active: true,
      percent: 10,
      minSubtotal: null,
      maxDiscount: null,
      config: JSON.stringify({ excludedProductIds: [] }),
    },
    create: {
      code: "PREPAY10",
      name: "10% de descuento por pago anticipado",
      type: "PREPAY_DISCOUNT",
      active: true,
      percent: 10,
      config: JSON.stringify({ excludedProductIds: [] }),
    },
  });

  const campaignEnd = new Date(Date.now() + 72 * 60 * 60 * 1000); // campaña real de 72h
  const existingCampaign = await db.promotion.findUnique({ where: { code: "FLASH72" } });
  if (!existingCampaign) {
    await db.promotion.create({
      data: {
        code: "FLASH72",
        name: "Ofertas de relámpago",
        type: "CAMPAIGN",
        active: true,
        startsAt: new Date(),
        endsAt: campaignEnd,
      },
    });
  }
  console.log("  ✅ promociones (PREPAY10 + campaña FLASH72)");

  // ── Configuración del sitio ──
  const configEntries: [string, unknown][] = [
    ["brand", seedBrandConfig],
    ["homeTexts", seedHomeTexts],
    ["banners", seedBanners],
    ["collections", seedCollections],
    ["legalIndex", seedLegalDocs.map((d) => ({ slug: d.slug, title: d.title }))],
  ];
  for (const [key, value] of configEntries) {
    await db.siteConfig.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }
  for (const doc of seedLegalDocs) {
    await db.siteConfig.upsert({
      where: { key: `legal:${doc.slug}` },
      update: { value: JSON.stringify({ title: doc.title, body: doc.body }) },
      create: { key: `legal:${doc.slug}`, value: JSON.stringify({ title: doc.title, body: doc.body }) },
    });
  }
  console.log("  ✅ configuración del sitio (marca, banners, colecciones, legales)");

  // ── Usuarios de prueba ──
  await db.user.upsert({
    where: { email: "admin@novacolombia.co" },
    update: {},
    create: {
      email: "admin@novacolombia.co",
      name: "Equipo NOVA",
      phone: "+57 300 000 0000",
      passwordHash: hashPassword("NovaAdmin2025*"),
      role: "ADMIN",
    },
  });
  await db.user.upsert({
    where: { email: "cliente@ejemplo.co" },
    update: {},
    create: {
      email: "cliente@ejemplo.co",
      name: "Laura Restrepo",
      phone: "+57 310 555 0199",
      passwordHash: hashPassword("Cliente2025*"),
      role: "CUSTOMER",
    },
  });
  console.log("  ✅ usuarios de prueba (admin + cliente)");

  console.log("🎉 Seed completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
