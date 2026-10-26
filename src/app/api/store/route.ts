import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, parseJsonField } from "@/lib/api";
import { getPrepayPromo, isPromoInEffect } from "@/lib/pricing";
import { getLocations } from "@/lib/shipping";
import { isTestMode, providerLabel } from "@/lib/payments";
import { categoryToDTO } from "@/lib/serialize";
import type { BannerDTO, CollectionDTO, StoreBootstrapDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const [configRows, categories, promo, locations] = await Promise.all([
    db.siteConfig.findMany(),
    db.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getPrepayPromo(),
    getLocations(),
  ]);

  const config = new Map(configRows.map((r) => [r.key, parseJsonField<Record<string, unknown>>(r.value, {})]));
  const brand = { ...(config.get("brand") as object) } as StoreBootstrapDTO["brand"];
  const homeTexts = { ...(config.get("homeTexts") as object) } as StoreBootstrapDTO["homeTexts"];
  const banners = parseJsonField<BannerDTO[]>(
    JSON.stringify(config.get("banners") ?? []),
    []
  ).filter((b) => b.active).sort((a, b) => a.order - b.order);
  const collections = parseJsonField<CollectionDTO[]>(
    JSON.stringify(config.get("collections") ?? []),
    []
  );

  // Conteos de productos por categoría + subcategorías usadas
  const products = await db.product.findMany({
    where: { active: true },
    select: { categoryId: true, subcategory: true, compareAtPrice: true },
  });
  const counts = new Map<string, number>();
  const subs = new Map<string, Set<string>>();
  for (const p of products) {
    counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
    if (p.subcategory) {
      if (!subs.has(p.categoryId)) subs.set(p.categoryId, new Set());
      subs.get(p.categoryId)!.add(p.subcategory);
    }
  }

  const legalDocs = parseJsonField<{ slug: string; title: string }[]>(
    JSON.stringify(config.get("legalIndex") ?? []),
    []
  );

  const campaignRow = await db.promotion.findFirst({
    where: { type: "CAMPAIGN", active: true },
    orderBy: { createdAt: "desc" },
  });
  const now = new Date();
  const campaignActive =
    !!campaignRow &&
    (!campaignRow.startsAt || campaignRow.startsAt <= now) &&
    (!campaignRow.endsAt || campaignRow.endsAt >= now);

  const payload: StoreBootstrapDTO = {
    brand: {
      name: brand.name ?? "NOVA Colombia",
      shortName: brand.shortName ?? "NOVA",
      tagline: brand.tagline ?? "Descubre, compra, disfruta",
      domain: brand.domain ?? "novacolombia.co",
      supportEmail: brand.supportEmail ?? "sac@novacolombia.co",
      supportPhone: brand.supportPhone ?? "",
      guestCheckoutAllowed: brand.guestCheckoutAllowed !== false,
    },
    promo: {
      active: promo.active,
      percent: promo.percent,
      inEffect: isPromoInEffect(promo),
      maxDiscount: promo.maxDiscount,
    },
    banners,
    collections,
    categories: categories.map((c) =>
      categoryToDTO(
        c,
        c.special === "deals"
          ? products.filter((p) => p.compareAtPrice != null).length
          : counts.get(c.id) ?? 0,
        Array.from(subs.get(c.id) ?? []).sort()
      )
    ),
    locations,
    legalSlugs: legalDocs,
    payments: { testMode: isTestMode(), providerLabel: providerLabel() },
    campaign: campaignRow
      ? {
          active: campaignActive,
          name: campaignRow.name,
          endsAt: campaignRow.endsAt ? campaignRow.endsAt.toISOString() : null,
        }
      : null,
    homeTexts,
  };

  return ok(payload);
}
