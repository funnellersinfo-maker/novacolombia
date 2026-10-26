import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { productToDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

// PATCH /api/admin/products/[id] — actualizar producto
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const { id } = await ctx.params;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body) return fail("Cuerpo inválido.");

  const product = await db.product.findUnique({ where: { id }, include: { variants: true } });
  if (!product) return fail("Producto no encontrado.", 404);

  const data: Record<string, unknown> = {};

  if (body.name != null) data.name = String(body.name).trim();
  if (body.brand != null) data.brand = String(body.brand).trim();
  if (body.seller != null) data.seller = String(body.seller).trim();
  if (body.description != null) data.description = String(body.description).trim();
  if (body.features !== undefined) data.features = JSON.stringify(Array.isArray(body.features) ? body.features : []);
  if (body.categoryId != null) data.categoryId = String(body.categoryId);
  if (body.subcategory != null) data.subcategory = String(body.subcategory).trim();
  if (body.sku != null) data.sku = String(body.sku).trim();
  if (body.videoUrl !== undefined) data.videoUrl = body.videoUrl ? String(body.videoUrl) : null;

  let priceChanged = false;

  if (body.price !== undefined) {
    const price = Math.round(Number(body.price));
    if (!(price > 0)) return fail("Precio inválido.", 422);
    data.price = price;
    priceChanged = price !== product.price;
  }
  if (body.compareAtPrice !== undefined) {
    const compareAt = body.compareAtPrice == null || String(body.compareAtPrice) === "" ? null : Math.round(Number(body.compareAtPrice));
    if (compareAt != null && compareAt <= Number(data.price ?? product.price)) {
      return fail("El precio anterior debe ser mayor al precio actual.", 422);
    }
    data.compareAtPrice = compareAt;
    priceChanged = true;
  }
  if (body.stock !== undefined) data.stock = Math.max(0, Math.round(Number(body.stock)));
  if (body.prepayEligible !== undefined) data.prepayEligible = body.prepayEligible !== false;
  if (body.codAvailable !== undefined) data.codAvailable = body.codAvailable !== false;
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured === true;
  if (body.isNew !== undefined) data.isNew = body.isNew === true;
  if (body.popularity !== undefined) data.popularity = Math.max(0, Math.round(Number(body.popularity)));
  if (body.tags !== undefined) data.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
  if (body.images !== undefined) data.images = JSON.stringify(Array.isArray(body.images) ? body.images.filter(Boolean) : []);
  if (body.active !== undefined) data.active = body.active === true;

  // Variantes: reemplazo completo
  if (Array.isArray(body.variants)) {
    const variants = (body.variants as { kind: string; value: string; priceDelta?: number; stock?: number }[])
      .filter((v) => v.value)
      .map((v) => ({
        kind: v.kind || "Variante",
        value: v.value,
        priceDelta: Math.round(Number(v.priceDelta ?? 0)),
        stock: Math.max(0, Math.round(Number(v.stock ?? 0))),
      }));

    const inCarts = await db.cartItem.findMany({ where: { productId: id } });
    const usedVariantIds = new Set(inCarts.map((c) => c.variantId).filter(Boolean));
    for (const v of product.variants) {
      if (usedVariantIds.has(v.id) && !variants.some((nv) => nv.value === v.value && nv.kind === v.kind)) {
        return fail(`La variante "${v.value}" está en carritos activos y no puede eliminarse.`, 409);
      }
    }
    await db.variant.deleteMany({ where: { productId: id } });
    (data as { variants?: { create: unknown[] } }).variants = { create: variants };
  }

  const updated = await db.product.update({
    where: { id },
    data,
    include: { category: true, variants: true },
  });

  if (priceChanged) {
    await db.priceHistory.create({
      data: { productId: id, price: updated.price, compareAt: updated.compareAtPrice, byAdmin: admin.name },
    });
  }

  await logAdmin(admin, "product.update", "Product", id, updated.name);
  return ok({ product: { ...productToDTO(updated), active: updated.active } });
}

// DELETE /api/admin/products/[id]?hard=1 — archivar o eliminar
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const { id } = await ctx.params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return fail("Producto no encontrado.", 404);

  const hard = req.nextUrl.searchParams.get("hard") === "1";
  if (hard) {
    const orderCount = await db.orderItem.count({ where: { productId: id } });
    if (orderCount > 0) {
      return fail("El producto tiene pedidos históricos: usa archivar (despublicar) en su lugar.", 409);
    }
    await db.product.delete({ where: { id } });
    await logAdmin(admin, "product.delete", "Product", id, product.name);
    return ok({ deleted: true });
  }

  await db.product.update({ where: { id }, data: { active: false } });
  await logAdmin(admin, "product.archive", "Product", id, product.name);
  return ok({ archived: true });
}
