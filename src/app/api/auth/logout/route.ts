import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { CART_COOKIE, cartCookieOptions, newCartToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/auth/logout — cierra sesión y devuelve un carrito anónimo nuevo
export async function POST(req: NextRequest) {
  const res = ok({ loggedOut: true });
  res.cookies.set("nova_session", "", { ...cartCookieOptions, maxAge: 0 });
  const current = req.cookies.get(CART_COOKIE)?.value;
  if (current?.startsWith("u-")) {
    res.cookies.set(CART_COOKIE, newCartToken(), cartCookieOptions);
  }
  return res;
}
