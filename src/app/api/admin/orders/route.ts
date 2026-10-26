import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, parseIntParam } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/orders?status=&method=&city=&from=&to=&q=&page=
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseIntParam(sp.get("page"), 1));
  const perPage = 20;

  const where: Record<string, unknown> = {};
  if (sp.get("status")) where.status = sp.get("status");
  if (sp.get("method")) where.paymentMethod = sp.get("method");
  if (sp.get("city")) where.ciudad = { contains: sp.get("city")! };
  const q = (sp.get("q") ?? "").trim();
  if (q) {
    where.OR = [{ number: { contains: q } }, { customerName: { contains: q } }, { phone: { contains: q } }];
  }
  if (sp.get("from")) where.createdAt = { ...(where.createdAt as object), gte: new Date(sp.get("from")!) };
  if (sp.get("to")) where.createdAt = { ...(where.createdAt as object), lte: new Date(`${sp.get("to")}T23:59:59`) };

  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true, shipment: true, payments: true },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return ok({
    orders: orders.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      customerName: o.customerName,
      phone: o.phone,
      email: o.email,
      departamento: o.departamento,
      ciudad: o.ciudad,
      direccion: o.direccion,
      complemento: o.complemento,
      indicaciones: o.indicaciones,
      subtotal: o.subtotal,
      prepayDiscount: o.prepayDiscount,
      shippingCost: o.shippingCost,
      total: o.total,
      etaMin: o.etaMin,
      etaMax: o.etaMax,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        name: i.name,
        variantLabel: i.variantLabel,
        image: i.image,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineSubtotal: i.lineSubtotal,
        lineDiscount: i.lineDiscount,
      })),
      shipment: o.shipment,
      payment: o.payments[0] ? { status: o.payments[0].status, reference: o.payments[0].reference, provider: o.payments[0].provider } : null,
      history: [],
    })),
    total,
    page,
    pages: Math.ceil(total / perPage) || 0,
  });
}
