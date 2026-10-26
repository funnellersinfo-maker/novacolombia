import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin, parseJsonField } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/content — toda la configuración del sitio
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const rows = await db.siteConfig.findMany();
  const content: Record<string, unknown> = {};
  for (const r of rows) {
    content[r.key] = parseJsonField<unknown>(r.value, null);
  }
  return ok({ content });
}

// PATCH /api/admin/content — { key, value } actualiza una clave de configuración
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const body = await readJson<{ key?: string; value?: unknown }>(req);
  const key = (body?.key ?? "").trim();
  if (!key || !/^[a-zA-Z0-9:._-]+$/.test(key)) return fail("Clave inválida.", 422);

  const value = JSON.stringify(body?.value ?? null);
  const existing = await db.siteConfig.findUnique({ where: { key } });
  if (existing) {
    await db.siteConfig.update({ where: { key }, data: { value } });
  } else {
    await db.siteConfig.create({ data: { key, value } });
  }

  await logAdmin(admin, "content.update", "SiteConfig", key);
  return ok({ key, value: body?.value ?? null });
}
