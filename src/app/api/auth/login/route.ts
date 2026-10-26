import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/api";
import { createSessionToken, sessionCookieOptions, verifyPassword, CART_COOKIE, cartCookieOptions, newCartToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  const body = await readJson<{ email?: string; password?: string }>(req);
  const email = (body?.email ?? "").trim().toLowerCase();
  const password = body?.password ?? "";
  if (!email || !password) return fail("Correo y contraseña requeridos.", 422);

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return fail("Correo o contraseña incorrectos.", 401);
  }
  if (!user.active) return fail("Tu cuenta está desactivada. Contacta al soporte.", 403);

  const res = ok({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  });
  res.cookies.set("nova_session", createSessionToken(user), sessionCookieOptions);

  // Fusionar carrito anónimo con el carrito persistente del usuario
  const anonToken = req.cookies.get(CART_COOKIE)?.value;
  const userToken = `u-${user.id}`;
  if (anonToken && anonToken !== userToken) {
    const anonItems = await db.cartItem.findMany({ where: { cartToken: anonToken } });
    for (const item of anonItems) {
      const existing = await db.cartItem.findFirst({
        where: { cartToken: userToken, productId: item.productId, variantKey: item.variantKey },
      });
      if (existing) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
        await db.cartItem.delete({ where: { id: item.id } });
      } else {
        await db.cartItem.update({
          where: { id: item.id },
          data: { cartToken: userToken },
        });
      }
    }
  }
  res.cookies.set(CART_COOKIE, userToken, cartCookieOptions);
  return res;
}
