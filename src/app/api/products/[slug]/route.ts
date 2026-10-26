import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { productToDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

// GET /api/products/[slug] — ficha completa + relacionados
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });

  if (!product || !product.active) {
    return fail("Producto no encontrado o no disponible.", 404);
  }

  const related = await db.product.findMany({
    where: {
      active: true,
      categoryId: product.categoryId,
      id: { not: product.id },
      stock: { gt: 0 },
    },
    include: { category: true, variants: true },
    orderBy: { popularity: "desc" },
    take: 8,
  });

  const alsoViewed = related.length
    ? []
    : await db.product.findMany({
        where: { active: true, id: { not: product.id } },
        include: { category: true, variants: true },
        orderBy: { popularity: "desc" },
        take: 8,
      });

  return ok({
    product: productToDTO(product),
    related: (related.length ? related : alsoViewed).map(productToDTO),
  });
}
