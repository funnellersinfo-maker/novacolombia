import crypto from "crypto";
import { db } from "@/lib/db";
import type { NextRequest } from "next/server";

const SECRET = process.env.SESSION_SECRET || "nova-dev-secret-cambiar-en-produccion";
export const SESSION_COOKIE = "nova_session";
export const CART_COOKIE = "nova_cart";
const SESSION_DAYS = 30;

// ── Contraseñas (scrypt, sin dependencias externas) ──
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const test = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), test);
  } catch {
    return false;
  }
}

// ── Tokens de sesión firmados (HMAC-SHA256) ──
type SessionPayload = { uid: string; role: string; exp: number };

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function createSessionToken(user: { id: string; role: string }): string {
  const payload: SessionPayload = {
    uid: user.id,
    role: user.role,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Lectura de sesión en route handlers ──
export async function getSessionUser(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const user = await db.user.findUnique({ where: { id: payload.uid } });
  if (!user || !user.active) return null;
  return user;
}

export async function requireAdmin(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
  secure: process.env.NODE_ENV === "production",
};

export const cartCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 365 * 24 * 60 * 60,
};

export function newCartToken(): string {
  return crypto.randomUUID();
}

export function newOrderNumber(): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `NOVA-${ymd}-${rand}`;
}
