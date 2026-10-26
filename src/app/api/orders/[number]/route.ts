import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { parseJsonField } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/orders/[number]?phone=... — seguimiento público con verificación
export async function GET(req: NextRequest, ctx: { params: Promise<{ number: string }> }) {
  const { number } = await ctx.params;
  const phone = (req.nextUrl.searchParams.get("phone") ?? "").trim();

  const order = await db.order.findUnique({
    where: { number },
    include: {
      items: true,
      history: { orderBy: { createdAt: "asc" } },
      shipment: true,
      payments: true,
    },
  });
  if (!order) return fail("Pedido no encontrado. Verifica el número.", 404);

  const user = await getSessionUser(req);
  const isOwner = !!user && order.userId === user.id;
  const isAdmin = user?.role === "ADMIN";
  const phoneMatches = phone && order.phone.replace(/\D/g, "").endsWith(phone.replace(/\D/g, "")) && phone.replace(/\D/g, "").length >= 7;

  if (!isOwner && !isAdmin && !phoneMatches) {
    return fail("Para ver el pedido ingresa el número de pedido y el teléfono de contacto.", 401);
  }

  const productIds = order.items.map((i) => i.productId);
  const slugRows = await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, slug: true } });
  const slugMap = new Map(slugRows.map((r) => [r.id, r.slug]));

  return ok({
    order: {
      id: order.id,
      number: order.number,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      departamento: order.departamento,
      ciudad: order.ciudad,
      direccion: order.direccion,
      complemento: order.complemento,
      subtotal: order.subtotal,
      prepayDiscount: order.prepayDiscount,
      shippingCost: order.shippingCost,
      total: order.total,
      etaMin: order.etaMin,
      etaMax: order.etaMax,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        slug: slugMap.get(i.productId) ?? "",
        name: i.name,
        brand: i.brand,
        variantLabel: i.variantLabel,
        image: i.image,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        prepayEligible: i.prepayEligible,
        lineSubtotal: i.lineSubtotal,
        lineDiscount: i.lineDiscount,
      })),
      history: order.history.map((h) => ({
        id: h.id,
        from: h.from,
        to: h.to,
        note: h.note,
        createdAt: h.createdAt.toISOString(),
      })),
      shipment: order.shipment
        ? {
            carrierName: order.shipment.carrierName,
            trackingNumber: order.shipment.trackingNumber,
            status: order.shipment.status,
            incidents: parseJsonField<{ at: string; note: string }[]>(order.shipment.incidents, []),
          }
        : null,
      payment: order.payments[0]
        ? { status: order.payments[0].status, reference: order.payments[0].reference }
        : null,
    },
  });
}
