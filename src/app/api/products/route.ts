import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, parseIntParam } from "@/lib/api";
import { productToDTO } from "@/lib/serialize";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET /api/products
// Parámetros: category, sub, q, sort, min, max, prepay, deals, featured, new,
//             popular, slugs (coma separado), page, perPage
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseIntParam(sp.get("page"), 1));
  const perPage = Math.min(48, Math.max(1, parseIntParam(sp.get("perPage"), 24)));

  const where: Prisma.ProductWhereInput = { active: true };

  // Categoría (con soporte de categoría dinámica de ofertas)
  const categorySlug = sp.get("category");
  if (categorySlug) {
    if (categorySlug === "ofertas") {
      where.compareAtPrice = { not: null };
    } else {
      const cat = await db.category.findUnique({ where: { slug: categorySlug } });
      if (!cat) return ok({ items: [], total: 0, page, pages: 0, facets: null });
      where.categoryId = cat.id;
    }
  }

  const sub = sp.get("sub");
  if (sub) where.subcategory = sub;

  const q = (sp.get("q") ?? "").trim();
  if (q) {
    const like = `%${q.replace(/[%_]/g, "")}%`;
    where.OR = [
      { name: { contains: like } },
      { brand: { contains: like } },
      { tags: { contains: like } },
      { subcategory: { contains: like } },
      { description: { contains: like } },
    ];
  }

  const min = sp.get("min");
  const max = sp.get("max");
  if (min || max) {
    where.price = {};
    if (min) where.price.gte = parseIntParam(min, 0);
    if (max) where.price.lte = parseIntParam(max, Number.MAX_SAFE_INTEGER);
  }

  if (sp.get("prepay") === "1") where.prepayEligible = true;
  if (sp.get("deals") === "1") where.compareAtPrice = { not: null };
  if (sp.get("featured") === "1") where.isFeatured = true;
  if (sp.get("new") === "1") where.isNew = true;
  if (sp.get("instock") === "1") where.stock = { gt: 0 };

  const slugs = sp.get("slugs");
  if (slugs) where.slug = { in: slugs.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 60) };

  const sort = sp.get("sort") ?? "relevance";
  let orderBy: Prisma.ProductOrderByWithRelationInput[];
  switch (sort) {
    case "price_asc":
      orderBy = [{ price: "asc" }];
      break;
    case "price_desc":
      orderBy = [{ price: "desc" }];
      break;
    case "new":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "name":
      orderBy = [{ name: "asc" }];
      break;
    case "discount": {
      // mayor porcentaje de descuento real
      const rows = await db.product.findMany({
        where: { ...where, compareAtPrice: { not: null } },
        select: { id: true, price: true, compareAtPrice: true },
      });
      const ids = rows
        .sort((a, b) => (b.compareAtPrice! - b.price) / b.compareAtPrice! - (a.compareAtPrice! - a.price) / a.compareAtPrice!)
        .map((r) => r.id);
      if (!ids.length) return ok({ items: [], total: 0, page, pages: 0, facets: null });
      const items = await db.product.findMany({
        where: { id: { in: ids } },
        include: { category: true, variants: true },
      });
      const map = new Map(items.map((i) => [i.id, productToDTO(i)]));
      const sorted = ids.map((id) => map.get(id)!).filter(Boolean);
      return ok({
        items: sorted.slice((page - 1) * perPage, page * perPage),
        total: sorted.length,
        page,
        pages: Math.ceil(sorted.length / perPage),
        facets: null,
      });
    }
    default:
      orderBy = [{ popularity: "desc" }, { createdAt: "desc" }];
  }

  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      include: { category: true, variants: true },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  // Facetas para filtros (subcategorías y rango de precios de la consulta base)
  let facets: { subcategories: { name: string; count: number }[]; priceMin: number; priceMax: number } | null = null;
  if (categorySlug && categorySlug !== "ofertas") {
    const baseWhere: Prisma.ProductWhereInput = { active: true, categoryId: where.categoryId };
    const all = await db.product.findMany({
      where: baseWhere,
      select: { subcategory: true, price: true },
    });
    const subCount = new Map<string, number>();
    for (const p of all) {
      if (p.subcategory) subCount.set(p.subcategory, (subCount.get(p.subcategory) ?? 0) + 1);
    }
    const prices = all.map((p) => p.price);
    facets = {
      subcategories: Array.from(subCount.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
    };
  }

  return ok({
    items: rows.map(productToDTO),
    total,
    page,
    pages: Math.ceil(total / perPage) || 0,
    facets,
  });
}
