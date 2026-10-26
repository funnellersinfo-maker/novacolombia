import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/carriers — transportadoras
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);
  const carriers = await db.carrier.findMany({ orderBy: { name: "asc" } });
  return ok({ carriers });
}

// POST /api/admin/carriers — crear
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const body = await readJson<{ code?: string; name?: string; supportsCod?: boolean; notes?: string }>(req);
  const code = (body?.code ?? "").trim().toUpperCase();
  const name = (body?.name ?? "").trim();
  if (code.length < 2 || name.length < 3) return fail("Código y nombre requeridos.", 422);
  if (await db.carrier.findUnique({ where: { code } })) return fail("Código ya existe.", 409);

  const carrier = await db.carrier.create({
    data: { code, name, supportsCod: body?.supportsCod !== false, notes: body?.notes ?? "" },
  });
  await logAdmin(admin, "carrier.create", "Carrier", code, name);
  return ok({ carrier });
}

// PATCH /api/admin/carriers — { code, name?, supportsCod?, notes?, active? }
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const body = await readJson<{ code?: string; name?: string; supportsCod?: boolean; notes?: string; active?: boolean }>(req);
  if (!body?.code) return fail("Transportadora requerida.");

  const carrier = await db.carrier.findUnique({ where: { code: body.code } });
  if (!carrier) return fail("Transportadora no encontrada.", 404);

  const updated = await db.carrier.update({
    where: { code: body.code },
    data: {
      name: body.name ?? undefined,
      supportsCod: body.supportsCod !== undefined ? body.supportsCod === true : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
      active: body.active !== undefined ? body.active === true : undefined,
    },
  });
  await logAdmin(admin, "carrier.update", "Carrier", carrier.code, updated.name);
  return ok({ carrier: updated });
}
