import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { productToDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

// GET /api/account/favorites — lista de favoritos
export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return fail("Inicia sesión para ver tus favoritos.", 401);

  const favorites = await db.favorite.findMany({
    where: { userId: user.id },
    include: { product: { include: { category: true, variants: true } } },
    orderBy: { createdAt: "desc" },
  });

  return ok({
    products: favorites.filter((f) => f.product.active).map((f) => productToDTO(f.product)),
    ids: favorites.map((f) => f.productId),
  });
}

// POST /api/account/favorites — alternar favorito { productId }
export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return fail("Inicia sesión para guardar favoritos.", 401);

  const body = await readJson<{ productId?: string }>(req);
  if (!body?.productId) return fail("Producto requerido.");

  const existing = await db.favorite.findUnique({
    where: { userId_productId: { userId: user.id, productId: body.productId } },
  });

  if (existing) {
    await db.favorite.delete({ where: { userId_productId: { userId: user.id, productId: body.productId } } });
    return ok({ favorited: false });
  }

  await db.favorite.create({ data: { userId: user.id, productId: body.productId } });
  return ok({ favorited: true });
}

// DELETE /api/account/favorites?productId=...
export async function DELETE(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return fail("Inicia sesión.", 401);

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return fail("Producto requerido.");

  await db.favorite
    .delete({ where: { userId_productId: { userId: user.id, productId } } })
    .catch(() => undefined);
  return ok({ favorited: false });
}
