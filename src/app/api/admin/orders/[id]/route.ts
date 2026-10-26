import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "PENDING_PAYMENT", "PENDING", "CONFIRMED", "PREPARING",
  "SHIPPED", "DELIVERED", "CANCELLED", "PAYMENT_REJECTED",
]);

// GET /api/admin/orders/[id] — detalle con historial
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const { id } = await ctx.params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, history: { orderBy: { createdAt: "asc" } }, shipment: true, payments: true },
  });
  if (!order) return fail("Pedido no encontrado.", 404);
  return ok({ order });
}

// PATCH /api/admin/orders/[id] — cambiar estado, asignar transportadora/guía, incidencias
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const { id } = await ctx.params;
  const body = await readJson<{
    status?: string;
    note?: string;
    carrierCode?: string;
    trackingNumber?: string;
    incident?: string;
    paymentStatus?: string;
  }>(req);
  if (!body) return fail("Cuerpo inválido.");

  const order = await db.order.findUnique({ where: { id }, include: { shipment: true } });
  if (!order) return fail("Pedido no encontrado.", 404);

  const history: { from: string; to: string; note: string; byAdmin: boolean }[] = [];

  // Cambio de estado con validación de flujo
  if (body.status && body.status !== order.status) {
    if (!ALLOWED.has(body.status)) return fail("Estado no permitido.", 422);

    if (order.paymentMethod === "PREPAID" && order.paymentStatus !== "APPROVED" && body.status !== "CANCELLED" && body.status !== "PAYMENT_REJECTED") {
      return fail("No se puede avanzar un pedido de pago anticipado sin pago aprobado.", 409);
    }
    if (order.paymentMethod === "COD" && order.status === "PENDING" && body.status !== "CONFIRMED" && body.status !== "CANCELLED") {
      return fail("Un pedido contraentrega pendiente solo puede confirmarse o cancelarse.", 409);
    }

    if (body.status === "CANCELLED") {
      // Devolver inventario
      const items = await db.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        if (item.variantId) {
          await db.variant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        } else {
          await db.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
      }
    }

    if (order.paymentMethod === "COD" && body.status === "CONFIRMED") {
      await db.promotion.updateMany({
        where: { type: "PREPAY_DISCOUNT", active: true },
        data: { usageCount: { increment: 0 } },
      });
    }

    await db.order.update({
      where: { id },
      data: {
        status: body.status,
        ...(order.paymentMethod === "COD" && body.status === "DELIVERED" ? { paymentStatus: "COD_COLLECTED" } : {}),
      },
    });
    history.push({ from: order.status, to: body.status, note: body.note ?? "", byAdmin: true });
  }

  if (body.paymentStatus && ["COD_PENDING", "COD_COLLECTED", "REFUNDED", "APPROVED", "REJECTED", "PENDING"].includes(body.paymentStatus)) {
    await db.order.update({ where: { id }, data: { paymentStatus: body.paymentStatus } });
  }

  // Guía y transportadora
  if (body.carrierCode !== undefined || body.trackingNumber !== undefined || body.incident !== undefined) {
    const carrier = body.carrierCode
      ? await db.carrier.findUnique({ where: { code: body.carrierCode } })
      : null;

    const incidents = JSON.parse(order.shipment?.incidents || "[]") as { at: string; note: string }[];
    if (body.incident) {
      incidents.push({ at: new Date().toISOString(), note: body.incident });
    }

    const shipmentData = {
      carrierCode: carrier?.code ?? order.shipment?.carrierCode ?? "",
      carrierName: carrier?.name ?? order.shipment?.carrierName ?? "",
      trackingNumber: body.trackingNumber !== undefined ? body.trackingNumber : order.shipment?.trackingNumber ?? "",
      status: order.shipment?.status ?? "PENDING",
      incidents: JSON.stringify(incidents),
    };

    if (order.shipment) {
      await db.shipment.update({ where: { orderId: id }, data: shipmentData });
    } else {
      await db.shipment.create({ data: { orderId: id, ...shipmentData } });
    }

    if (history.length === 0 && body.carrierCode) {
      history.push({ from: order.status, to: order.status, note: `Transportadora asignada: ${carrier?.name ?? body.carrierCode}`, byAdmin: true });
    }
  }

  for (const h of history) {
    await db.orderStatusHistory.create({ data: { orderId: id, ...h } });
  }

  await logAdmin(admin, "order.update", "Order", id, `estado=${body.status ?? "sin cambio"}`);
  const updated = await db.order.findUnique({
    where: { id },
    include: { items: true, history: { orderBy: { createdAt: "asc" } }, shipment: true, payments: true },
  });
  return ok({ order: updated });
}
