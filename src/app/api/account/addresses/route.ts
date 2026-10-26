import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/account/addresses
export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return fail("Inicia sesión.", 401);
  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return ok({ addresses });
}

// POST /api/account/addresses
export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return fail("Inicia sesión.", 401);

  const body = await readJson<{
    label?: string; name?: string; phone?: string; email?: string;
    departamento?: string; ciudad?: string; direccion?: string;
    complemento?: string; indicaciones?: string; isDefault?: boolean;
  }>(req);

  const errors: Record<string, string> = {};
  const name = (body?.name ?? "").trim();
  const phone = (body?.phone ?? "").trim();
  const departamento = (body?.departamento ?? "").trim();
  const ciudad = (body?.ciudad ?? "").trim();
  const direccion = (body?.direccion ?? "").trim();
  if (name.length < 5) errors.name = "Nombre de quien recibe.";
  if (!/^[0-9+\s()-]{7,15}$/.test(phone)) errors.phone = "Teléfono válido requerido.";
  if (!departamento) errors.departamento = "Departamento requerido.";
  if (!ciudad) errors.ciudad = "Ciudad requerida.";
  if (direccion.length < 6) errors.direccion = "Dirección requerida.";
  if (Object.keys(errors).length) return fail({ message: "Revisa la dirección.", errors }, 422);

  const count = await db.address.count({ where: { userId: user.id } });
  if (count >= 10) return fail("Puedes guardar hasta 10 direcciones.", 409);

  if (body?.isDefault || count === 0) {
    await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  const address = await db.address.create({
    data: {
      userId: user.id,
      label: (body?.label ?? "").trim() || `Dirección ${count + 1}`,
      name, phone,
      email: (body?.email ?? "").trim() || null,
      departamento, ciudad, direccion,
      complemento: (body?.complemento ?? "").trim() || null,
      indicaciones: (body?.indicaciones ?? "").trim() || null,
      isDefault: body?.isDefault || count === 0,
    },
  });
  return ok({ address });
}

// PATCH /api/account/addresses — marcar predeterminada { id, isDefault }
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return fail("Inicia sesión.", 401);

  const body = await readJson<{ id?: string; isDefault?: boolean }>(req);
  if (!body?.id) return fail("Dirección requerida.");

  const address = await db.address.findFirst({ where: { id: body.id, userId: user.id } });
  if (!address) return fail("Dirección no encontrada.", 404);

  if (body.isDefault) {
    await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }
  const updated = await db.address.update({ where: { id: address.id }, data: { isDefault: !!body.isDefault } });
  return ok({ address: updated });
}

// DELETE /api/account/addresses?id=...
export async function DELETE(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return fail("Inicia sesión.", 401);

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return fail("Dirección requerida.");

  const address = await db.address.findFirst({ where: { id, userId: user.id } });
  if (!address) return fail("Dirección no encontrada.", 404);

  await db.address.delete({ where: { id } });
  return ok({ deleted: true });
}
