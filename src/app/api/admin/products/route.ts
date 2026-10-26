import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin, parseIntParam, parseJsonField } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { productToDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

// GET /api/admin/products?q=&category=&page=&perPage=&includeInactive=1
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseIntParam(sp.get("page"), 1));
  const perPage = Math.min(100, Math.max(1, parseIntParam(sp.get("perPage"), 20)));
  const q = (sp.get("q") ?? "").trim();

  const where: Record<string, unknown> = {};
  if (sp.get("includeInactive") !== "1") where.active = true;
  if (sp.get("category")) {
    const cat = await db.category.findUnique({ where: { slug: sp.get("category")! } });
    where.categoryId = cat?.id ?? "none";
  }
  if (q) {
    const like = `%${q.replace(/[%_]/g, "")}%`;
    where.OR = [
      { name: { contains: like } },
      { brand: { contains: like } },
      { sku: { contains: like } },
      { slug: { contains: like } },
    ];
  }

  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return ok({
    items: rows.map((r) => ({ ...productToDTO(r), active: r.active })),
    total,
    page,
    pages: Math.ceil(total / perPage) || 0,
  });
}

// POST /api/admin/products — crear producto
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return fail("Cuerpo inválido.");

  const name = String(body.name ?? "").trim();
  const price = Math.round(Number(body.price ?? 0));
  const categoryId = String(body.categoryId ?? "");
  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = "Nombre requerido.";
  if (!(price > 0)) errors.price = "Precio debe ser mayor a 0.";
  if (!categoryId) errors.categoryId = "Categoría requerida.";
  if (Object.keys(errors).length) return fail({ message: "Revisa los datos.", errors }, 422);

  let slug = String(body.slug ?? "").trim() || slugify(name);
  const clash = await db.product.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const compareAt = body.compareAtPrice != null && String(body.compareAtPrice) !== "" ? Math.round(Number(body.compareAtPrice)) : null;
  if (compareAt != null && compareAt <= price) {
    return fail("El precio anterior debe ser mayor al precio actual para representar un descuento real.", 422);
  }

  const variants = Array.isArray(body.variants)
    ? (body.variants as { kind: string; value: string; priceDelta?: number; stock?: number }[])
        .filter((v) => v.value)
        .map((v) => ({
          kind: v.kind || "Variante",
          value: v.value,
          priceDelta: Math.round(Number(v.priceDelta ?? 0)),
          stock: Math.max(0, Math.round(Number(v.stock ?? 0))),
        }))
    : [];

  const product = await db.product.create({
    data: {
      slug,
      name,
      brand: String(body.brand ?? "").trim(),
      seller: String(body.seller ?? "NOVA Retail").trim(),
      description: String(body.description ?? "").trim(),
      features: JSON.stringify(Array.isArray(body.features) ? body.features : []),
      categoryId,
      subcategory: String(body.subcategory ?? "").trim(),
      price,
      compareAtPrice: compareAt,
      stock: Math.max(0, Math.round(Number(body.stock ?? 0))),
      sku: String(body.sku ?? "").trim(),
      prepayEligible: body.prepayEligible !== false,
      codAvailable: body.codAvailable !== false,
      isFeatured: body.isFeatured === true,
      isNew: body.isNew === true,
      popularity: Math.max(0, Math.round(Number(body.popularity ?? 50))),
      tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
      images: JSON.stringify(Array.isArray(body.images) ? body.images.filter(Boolean) : []),
      videoUrl: body.videoUrl ? String(body.videoUrl) : null,
      active: body.active !== false,
      variants: { create: variants },
      priceHistory: {
        create: { price, compareAt, byAdmin: admin.name },
      },
    },
    include: { category: true, variants: true },
  });

  await logAdmin(admin, "product.create", "Product", product.id, name);
  return ok({ product: { ...productToDTO(product), active: product.active } });
}
