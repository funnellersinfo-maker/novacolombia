import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, ensureCartToken, parseJsonField } from "@/lib/api";
import { computePricing, getPrepayPromo, isPromoInEffect, type PricingItem } from "@/lib/pricing";
import type { CartSummaryDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

async function buildCartSummary(cartToken: string): Promise<CartSummaryDTO> {
  const [rows, promo] = await Promise.all([
    db.cartItem.findMany({
      where: { cartToken },
      include: { product: { include: { category: true } }, variant: true },
      orderBy: { createdAt: "asc" },
    }),
    getPrepayPromo(),
  ]);

  const items = rows.map((r) => {
    const images = parseJsonField<string[]>(r.product.images, []);
    return {
      id: r.id,
      productId: r.productId,
      slug: r.product.slug,
      name: r.product.name,
      brand: r.product.brand,
      image: images[0] ?? "/images/placeholder-product.png",
      variantId: r.variantId,
      variantKind: r.variant?.kind ?? "",
      variantValue: r.variant?.value ?? "",
      unitPrice: r.product.price + (r.variant?.priceDelta ?? 0),
      quantity: r.quantity,
      stock: r.variant ? r.variant.stock : r.product.stock,
      prepayEligible: r.product.prepayEligible,
      codAvailable: r.product.codAvailable,
      lineSubtotal: (r.product.price + (r.variant?.priceDelta ?? 0)) * r.quantity,
    };
  });

  const pricingItems: PricingItem[] = items.map((i) => ({
    productId: i.productId,
    unitPrice: i.unitPrice,
    quantity: i.quantity,
    prepayEligible: i.prepayEligible,
  }));
  // Se calcula con PREPAID para mostrar el ahorro máximo disponible al usuario
  const pricing = computePricing(pricingItems, promo, "PREPAID");

  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: pricing.subtotal,
    eligibleSubtotal: pricing.eligibleSubtotal,
    prepayDiscount: pricing.prepayDiscount,
    prepayTotal: pricing.prepayTotal,
    codTotal: pricing.codTotal,
    promo: { active: promo.active, percent: promo.percent, inEffect: isPromoInEffect(promo) },
  };
}

function cartResponse(cartToken: string, res?: NextResponse) {
  return buildCartSummary(cartToken).then((summary) => {
    const payload = ok(summary);
    if (res) {
      // copiar cookies del response base al payload
      res.cookies.getAll().forEach((c) => payload.cookies.set(c.name, c.value, c));
    }
    return payload;
  });
}

// GET /api/cart — estado del carrito (crea cookie si no existe)
export async function GET(req: NextRequest) {
  const base = new NextResponse();
  const token = ensureCartToken(req, base);
  return cartResponse(token, base);
}

// POST /api/cart — añadir producto { productId, variantId?, quantity }
export async function POST(req: NextRequest) {
  const body = await readJson<{ productId?: string; variantId?: string | null; quantity?: number }>(req);
  if (!body?.productId) return fail("Producto requerido.");

  const base = new NextResponse();
  const token = ensureCartToken(req, base);

  const product = await db.product.findUnique({ where: { id: body.productId }, include: { variants: true } });
  if (!product || !product.active) return fail("Producto no disponible.", 404);

  const variant = body.variantId ? product.variants.find((v) => v.id === body.variantId) : null;
  if (body.variantId && !variant) return fail("La variante seleccionada no existe.", 400);

  const qty = Math.max(1, Math.min(99, Math.floor(body.quantity ?? 1)));
  const availableStock = variant ? variant.stock : product.stock;
  if (availableStock < 1) return fail("Producto agotado.", 409);

  const existing = await db.cartItem.findFirst({
    where: { cartToken: token, productId: product.id, variantKey: variant?.id ?? "" },
  });
  const newQty = Math.min(availableStock, (existing?.quantity ?? 0) + qty);
  if (newQty <= 0) return fail("No hay más unidades disponibles.", 409);

  if (existing) {
    await db.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
  } else {
    await db.cartItem.create({
      data: {
        cartToken: token,
        productId: product.id,
        variantId: variant?.id ?? null,
        variantKey: variant?.id ?? "",
        quantity: newQty,
      },
    });
  }

  return cartResponse(token, base);
}

// PATCH /api/cart — cambiar cantidad { id, quantity }
export async function PATCH(req: NextRequest) {
  const body = await readJson<{ id?: string; quantity?: number }>(req);
  if (!body?.id || body.quantity == null) return fail("Datos incompletos.");

  const base = new NextResponse();
  const token = ensureCartToken(req, base);

  const item = await db.cartItem.findFirst({
    where: { id: body.id, cartToken: token },
    include: { product: true, variant: true },
  });
  if (!item) return fail("El ítem no está en tu carrito.", 404);

  const qty = Math.floor(body.quantity);
  if (qty <= 0) {
    await db.cartItem.delete({ where: { id: item.id } });
    return cartResponse(token, base);
  }

  const availableStock = item.variant ? item.variant.stock : item.product.stock;
  if (qty > availableStock) {
    return fail(`Solo hay ${availableStock} unidades disponibles de este producto.`, 409);
  }

  await db.cartItem.update({ where: { id: item.id }, data: { quantity: Math.min(99, qty) } });
  return cartResponse(token, base);
}

// DELETE /api/cart?id=... — quitar ítem | ?all=1 — vaciar
export async function DELETE(req: NextRequest) {
  const base = new NextResponse();
  const token = ensureCartToken(req, base);

  if (req.nextUrl.searchParams.get("all") === "1") {
    await db.cartItem.deleteMany({ where: { cartToken: token } });
    return cartResponse(token, base);
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return fail("Ítem requerido.");
  const item = await db.cartItem.findFirst({ where: { id, cartToken: token } });
  if (!item) return fail("El ítem no está en tu carrito.", 404);
  await db.cartItem.delete({ where: { id } });
  return cartResponse(token, base);
}
