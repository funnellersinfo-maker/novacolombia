import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson, getCartToken } from "@/lib/api";
import { quoteShipping } from "@/lib/shipping";
import type { QuoteDTO } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/checkout/quote?departamento=&ciudad=&productId= — cotización para un producto
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const departamento = (sp.get("departamento") ?? "").trim();
  const ciudad = (sp.get("ciudad") ?? "").trim();
  const productId = sp.get("productId");

  if (!departamento || !ciudad) return fail("Destino requerido.");

  let allCodAllowed = true;
  if (productId) {
    const p = await db.product.findUnique({ where: { id: productId } });
    allCodAllowed = !!p?.codAvailable;
  }

  const quote = await quoteShipping(departamento, ciudad, allCodAllowed);
  const payload: QuoteDTO = {
    covered: quote.covered,
    price: quote.price,
    etaMin: quote.etaMin,
    etaMax: quote.etaMax,
    codAvailable: quote.codAvailable,
    ...(quote.reason ? { reason: quote.reason } : {}),
  };
  return ok(payload);
}

// POST /api/checkout/quote — cobertura para el carrito actual
export async function POST(req: NextRequest) {
  const body = await readJson<{ departamento?: string; ciudad?: string }>(req);
  const departamento = (body?.departamento ?? "").trim();
  const ciudad = (body?.ciudad ?? "").trim();
  if (!departamento || !ciudad) return fail("Selecciona departamento y ciudad.");

  const cartToken = getCartToken(req);
  const items = cartToken
    ? await db.cartItem.findMany({
        where: { cartToken },
        include: { product: true },
      })
    : [];

  if (!items.length) return fail("Tu carrito está vacío.", 409);

  const allCodAllowed = items.every((i) => i.product.codAvailable);
  const quote = await quoteShipping(departamento, ciudad, allCodAllowed);

  const payload: QuoteDTO = {
    covered: quote.covered,
    price: quote.price,
    etaMin: quote.etaMin,
    etaMax: quote.etaMax,
    codAvailable: quote.codAvailable,
    ...(quote.reason ? { reason: quote.reason } : {}),
  };
  return ok(payload);
}
