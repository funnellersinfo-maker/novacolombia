import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";
import { normalizeQuery, suggestCorrection } from "@/lib/search";
import { productToDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

// GET /api/search?q= — autocompletado con productos, categorías y corrección
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return ok({ products: [], categories: [], corrected: null });
  }

  const norm = normalizeQuery(q);
  const like = `%${norm.replace(/[%_]/g, "")}%`;

  const products = await db.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: like } },
        { brand: { contains: like } },
        { tags: { contains: like } },
        { subcategory: { contains: like } },
      ],
    },
    include: { category: true, variants: true },
    orderBy: { popularity: "desc" },
    take: 6,
  });

  const categories = await db.category.findMany({
    where: {
      active: true,
      OR: [{ name: { contains: like } }, { slug: { contains: like } }],
    },
    take: 3,
    orderBy: { sortOrder: "asc" },
  });

  let corrected: string | null = null;
  if (!products.length && !categories.length) {
    // sin resultados → intentar corrección de errores de tipeo
    const vocab = await db.product.findMany({
      where: { active: true },
      select: { name: true, brand: true, tags: true },
      take: 500,
    });
    corrected = suggestCorrection(
      q,
      vocab.flatMap((v) => [v.name, v.brand, ...JSON.parse(v.tags || "[]")]),
      2
    );
    if (corrected && corrected !== norm) {
      const correctedLike = `%${corrected.replace(/[%_]/g, "")}%`;
      const retry = await db.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: correctedLike } },
            { brand: { contains: correctedLike } },
            { tags: { contains: correctedLike } },
          ],
        },
        include: { category: true, variants: true },
        orderBy: { popularity: "desc" },
        take: 6,
      });
      return ok({
        products: retry.map(productToDTO),
        categories: [],
        corrected,
      });
    }
  }

  return ok({
    products: products.map(productToDTO),
    categories: categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, color: c.color })),
    corrected,
  });
}
