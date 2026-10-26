import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CART_COOKIE, cartCookieOptions, newCartToken } from "@/lib/auth";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(message: string | Record<string, unknown>, status = 400) {
  const body = typeof message === "string" ? { error: message } : message;
  return NextResponse.json(body, { status });
}

export async function readJson<T = Record<string, unknown>>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

// Token de carrito: crea cookie si no existe
export function ensureCartToken(req: NextRequest, res: NextResponse): string {
  const existing = req.cookies.get(CART_COOKIE)?.value;
  if (existing) {
    res.cookies.set(CART_COOKIE, existing, cartCookieOptions);
    return existing;
  }
  const token = newCartToken();
  res.cookies.set(CART_COOKIE, token, cartCookieOptions);
  return token;
}

export function getCartToken(req: NextRequest): string | null {
  return req.cookies.get(CART_COOKIE)?.value ?? null;
}

export function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function logAdmin(
  user: { id: string; name: string } | null,
  action: string,
  entity: string,
  entityId: string = "",
  detail: string = ""
) {
  try {
    await db.auditLog.create({
      data: { userId: user?.id ?? null, action, entity, entityId, detail },
    });
  } catch {
    /* auditoría nunca debe romper la operación */
  }
}

export function parseIntParam(v: string | null, fallback: number): number {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}
