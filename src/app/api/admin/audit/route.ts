import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, parseIntParam } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/audit?page= — registro de actividad administrativa
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const page = Math.max(1, parseIntParam(req.nextUrl.searchParams.get("page"), 1));
  const perPage = 30;

  const [total, logs] = await Promise.all([
    db.auditLog.count(),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return ok({
    logs: logs.map((l) => ({
      id: l.id,
      userName: l.user?.name ?? "sistema",
      userEmail: l.user?.email ?? "",
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      detail: l.detail,
      createdAt: l.createdAt.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / perPage) || 0,
  });
}
