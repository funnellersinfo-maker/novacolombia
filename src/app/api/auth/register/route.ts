import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/api";
import { createSessionToken, hashPassword, sessionCookieOptions, CART_COOKIE, cartCookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/auth/register
export async function POST(req: NextRequest) {
  const body = await readJson<{ name?: string; email?: string; password?: string; phone?: string }>(req);
  const name = (body?.name ?? "").trim();
  const email = (body?.email ?? "").trim().toLowerCase();
  const password = body?.password ?? "";
  const phone = (body?.phone ?? "").trim() || null;

  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = "Escribe tu nombre completo.";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Correo inválido.";
  if (password.length < 8) errors.password = "La contraseña debe tener al menos 8 caracteres.";
  if (Object.keys(errors).length) return fail({ message: "Revisa los datos.", errors }, 422);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return fail("Ya existe una cuenta con este correo. Inicia sesión.", 409);

  const user = await db.user.create({
    data: { name, email, phone, passwordHash: hashPassword(password), role: "CUSTOMER" },
  });

  const res = ok({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  });
  res.cookies.set("nova_session", createSessionToken(user), sessionCookieOptions);

  // El carrito anónimo pasa a ser el carrito del usuario
  const anonToken = req.cookies.get(CART_COOKIE)?.value;
  if (anonToken && anonToken !== `u-${user.id}`) {
    await db.cartItem.updateMany({ where: { cartToken: anonToken }, data: { cartToken: `u-${user.id}` } });
  }
  res.cookies.set(CART_COOKIE, `u-${user.id}`, cartCookieOptions);
  return res;
}
