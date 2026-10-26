import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/promotions — todas las promociones/campañas
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);
  const promotions = await db.promotion.findMany({ orderBy: { createdAt: "desc" } });
  return ok({
    promotions: promotions.map((p) => ({
      ...p,
      config: JSON.parse(p.config || "{}"),
    })),
  });
}

// POST /api/admin/promotions — crear campaña
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const body = await readJson<{
    code?: string; name?: string; type?: string; percent?: number;
    startsAt?: string; endsAt?: string;
  }>(req);
  const name = (body?.name ?? "").trim();
  if (name.length < 3) return fail("Nombre de campaña requerido.", 422);

  const code = (body?.code ?? "").trim() || `CAMP-${Date.now().toString(36).toUpperCase()}`;
  if (await db.promotion.findUnique({ where: { code } })) {
    return fail("Ya existe una promoción con ese código.", 409);
  }

  const promo = await db.promotion.create({
    data: {
      code,
      name,
      type: body?.type === "PREPAY_DISCOUNT" ? "PREPAY_DISCOUNT" : "CAMPAIGN",
      percent: body?.percent != null ? Math.round(body.percent) : null,
      startsAt: body?.startsAt ? new Date(body.startsAt) : null,
      endsAt: body?.endsAt ? new Date(body.endsAt) : null,
      active: true,
    },
  });
  await logAdmin(admin, "promotion.create", "Promotion", promo.id, name);
  return ok({ promotion: { ...promo, config: JSON.parse(promo.config || "{}") } });
}

// PATCH /api/admin/promotions — actualizar por id en body
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const body = await readJson<{
    id?: string; active?: boolean; percent?: number; minSubtotal?: number | null;
    maxDiscount?: number | null; startsAt?: string | null; endsAt?: string | null;
    excludedProductIds?: string[]; name?: string;
  }>(req);
  if (!body?.id) return fail("Promoción requerida.");

  const promo = await db.promotion.findUnique({ where: { id: body.id } });
  if (!promo) return fail("Promoción no encontrada.", 404);

  if (promo.type === "PREPAY_DISCOUNT" && body.percent !== undefined) {
    const pct = Math.round(body.percent);
    if (pct < 0 || pct > 50) return fail("El porcentaje debe estar entre 0 y 50.", 422);
  }

  const config = JSON.parse(promo.config || "{}") as { excludedProductIds?: string[] };
  if (body.excludedProductIds !== undefined) {
    config.excludedProductIds = body.excludedProductIds.slice(0, 200);
  }

  const updated = await db.promotion.update({
    where: { id: promo.id },
    data: {
      active: body.active !== undefined ? body.active === true : undefined,
      percent: body.percent !== undefined ? Math.round(body.percent) : undefined,
      minSubtotal: body.minSubtotal !== undefined ? (body.minSubtotal == null ? null : Math.round(body.minSubtotal)) : undefined,
      maxDiscount: body.maxDiscount !== undefined ? (body.maxDiscount == null ? null : Math.round(body.maxDiscount)) : undefined,
      startsAt: body.startsAt !== undefined ? (body.startsAt ? new Date(body.startsAt) : null) : undefined,
      endsAt: body.endsAt !== undefined ? (body.endsAt ? new Date(body.endsAt) : null) : undefined,
      name: body.name !== undefined ? body.name : undefined,
      config: JSON.stringify(config),
    },
  });

  await logAdmin(admin, "promotion.update", "Promotion", promo.id, `${promo.code} active=${updated.active}`);
  return ok({ promotion: { ...updated, config } });
}
