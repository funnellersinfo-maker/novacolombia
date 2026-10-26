import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, logAdmin, parseIntParam } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/zones?departamento=&page= — zonas de envío
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseIntParam(sp.get("page"), 1));
  const perPage = 50;
  const where = sp.get("departamento") ? { departamento: sp.get("departamento")! } : {};

  const [total, zones] = await Promise.all([
    db.shippingZone.count({ where }),
    db.shippingZone.findMany({
      where,
      orderBy: [{ departamento: "asc" }, { ciudad: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return ok({ zones, total, page, pages: Math.ceil(total / perPage) || 0 });
}

// POST /api/admin/zones — crear zona
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return fail("Acceso restringido al panel administrativo.", 403);

  const body = await readJson<{
    departamento?: string; ciudad?: string; price?: number;
    etaMin?: number; etaMax?: number; codAvailable?: boolean;
  }>(req);

  const departamento = (body?.departamento ?? "").trim();
  const ciudad = (body?.ciudad ?? "*").trim() || "*";
  const price = Math.round(Number(body?.price ?? 0));
  const etaMin = Math.round(Number(body?.etaMin ?? 1));
  const etaMax = Math.round(Number(body?.etaMax ?? etaMin));

  const errors: Record<string, string> = {};
  if (!departamento) errors.departamento = "Departamento requerido.";
  if (!(price >= 0)) errors.price = "Tarifa inválida.";
  if (!(etaMin >= 0 && etaMax >= etaMin)) errors.eta = "ETA inválida.";
  if (Object.keys(errors).length) return fail({ message: "Revisa la zona.", errors }, 422);

  const exists = await db.shippingZone.findFirst({ where: { departamento, ciudad } });
  if (exists) return fail("Ya existe una zona para ese destino.", 409);

  const zone = await db.shippingZone.create({
    data: { departamento, ciudad, price, etaMin, etaMax, codAvailable: body?.codAvailable === true },
  });
  await logAdmin(admin, "zone.create", "ShippingZone", zone.id, `${departamento}/${ciudad}`);
  return ok({ zone });
}
