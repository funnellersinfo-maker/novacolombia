import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/users?q=&page=
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim();
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const perPage = 20;

  const where = q
    ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] }
    : {};

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        active: true, createdAt: true,
        orders: { select: { total: true } },
      },
    }),
  ]);

  return ok({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      active: u.active,
      createdAt: u.createdAt.toISOString(),
      orderCount: u.orders.length,
      totalSpent: u.orders.reduce((s, o) => s + o.total, 0),
    })),
    total,
    page,
    pages: Math.ceil(total / perPage) || 0,
  });
}

// PATCH /api/admin/users — rol y estado { id, role?, active? }
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const body = await readJson<{ id?: string; role?: string; active?: boolean }>(req);
  if (!body?.id) return fail("Usuario requerido.");

  const user = await db.user.findUnique({ where: { id: body.id } });
  if (!user) return fail("Usuario no encontrado.", 404);
  if (user.id === admin.id && (body.role === "CUSTOMER" || body.active === false)) {
    return fail("No puedes quitarte tus propios permisos de administración.", 409);
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      role: body.role === "ADMIN" || body.role === "CUSTOMER" ? body.role : undefined,
      active: body.active !== undefined ? body.active === true : undefined,
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  await logAdmin(admin, "user.update", "User", user.id, `role=${updated.role} active=${updated.active}`);
  return ok({ user: updated });
}
