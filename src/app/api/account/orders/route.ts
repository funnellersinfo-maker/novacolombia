import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/account/orders — pedidos del usuario autenticado
export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return fail("Inicia sesión para ver tus pedidos.", 401);

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, shipment: true },
    take: 50,
  });

  return ok({
    orders: orders.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      subtotal: o.subtotal,
      prepayDiscount: o.prepayDiscount,
      shippingCost: o.shippingCost,
      total: o.total,
      ciudad: o.ciudad,
      createdAt: o.createdAt.toISOString(),
      itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
      items: o.items.map((i) => ({
        id: i.id,
        name: i.name,
        image: i.image,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineSubtotal: i.lineSubtotal,
        lineDiscount: i.lineDiscount,
      })),
      shipment: o.shipment
        ? { carrierName: o.shipment.carrierName, trackingNumber: o.shipment.trackingNumber, status: o.shipment.status }
        : null,
    })),
  });
}
