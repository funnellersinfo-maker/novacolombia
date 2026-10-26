import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/stats — métricas del panel
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    ordersToday,
    ordersWeek,
    revenueWeek,
    pendingOrders,
    codPending,
    prepayPending,
    userCount,
    productCount,
    lowStock,
    topProducts,
    statusGroups,
  ] = await Promise.all([
    db.order.count({ where: { createdAt: { gte: dayAgo } } }),
    db.order.count({ where: { createdAt: { gte: weekAgo } } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: weekAgo }, status: { notIn: ["CANCELLED", "PAYMENT_REJECTED"] } },
    }),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "PENDING", paymentMethod: "COD" } }),
    db.order.count({ where: { status: "PENDING_PAYMENT" } }),
    db.user.count(),
    db.product.count({ where: { active: true } }),
    db.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      select: { id: true, name: true, stock: true, slug: true },
      orderBy: { stock: "asc" },
      take: 8,
    }),
    db.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 6,
    }).catch(async () => {
      // Fallback para motores sin soporte completo de orderBy en groupBy
      const items = await db.orderItem.findMany({ select: { name: true, quantity: true } });
      const map = new Map<string, number>();
      for (const i of items) map.set(i.name, (map.get(i.name) ?? 0) + i.quantity);
      return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, qty]) => ({ name, _sum: { quantity: qty } }));
    }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const prepayDiscountTotal = await db.order.aggregate({
    _sum: { prepayDiscount: true },
    where: { status: { notIn: ["CANCELLED", "PAYMENT_REJECTED"] } },
  });

  return ok({
    ordersToday,
    ordersWeek,
    revenueWeek: revenueWeek._sum.total ?? 0,
    pendingOrders,
    codPending,
    prepayPending,
    userCount,
    productCount,
    lowStock,
    topProducts: (topProducts as { name: string; _sum: { quantity: number } }[]).map((p) => ({
      name: p.name,
      quantity: p._sum.quantity,
    })),
    statusGroups: statusGroups.map((g) => ({ status: g.status, count: g._count._all })),
    prepayDiscountTotal: prepayDiscountTotal._sum.prepayDiscount ?? 0,
  });
}
