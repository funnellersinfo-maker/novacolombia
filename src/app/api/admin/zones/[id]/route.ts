import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/admin/zones/[id]
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const { id } = await ctx.params;
  const body = await readJson<{
    price?: number; etaMin?: number; etaMax?: number; codAvailable?: boolean; active?: boolean;
  }>(req);

  const zone = await db.shippingZone.findUnique({ where: { id } });
  if (!zone) return fail("Zona no encontrada.", 404);

  const updated = await db.shippingZone.update({
    where: { id },
    data: {
      price: body?.price !== undefined ? Math.max(0, Math.round(body.price)) : undefined,
      etaMin: body?.etaMin !== undefined ? Math.max(0, Math.round(body.etaMin)) : undefined,
      etaMax: body?.etaMax !== undefined ? Math.max(0, Math.round(body.etaMax)) : undefined,
      codAvailable: body?.codAvailable !== undefined ? body.codAvailable === true : undefined,
      active: body?.active !== undefined ? body.active === true : undefined,
    },
  });
  await logAdmin(admin, "zone.update", "ShippingZone", id, `${zone.departamento}/${zone.ciudad}`);
  return ok({ zone: updated });
}

// DELETE /api/admin/zones/[id]
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const { id } = await ctx.params;
  const zone = await db.shippingZone.findUnique({ where: { id } });
  if (!zone) return fail("Zona no encontrada.", 404);

  await db.shippingZone.delete({ where: { id } });
  await logAdmin(admin, "zone.delete", "ShippingZone", id, `${zone.departamento}/${zone.ciudad}`);
  return ok({ deleted: true });
}
