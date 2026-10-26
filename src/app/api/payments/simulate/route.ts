import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, readJson } from "@/lib/api";
import { applyPaymentResult, isTestMode } from "@/lib/payments";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// POST /api/payments/simulate — SOLO disponible en modo pruebas (sin proveedor real).
// Simula el resultado de la pasarela invocando la MISMA lógica que el webhook.
export async function POST(req: NextRequest) {
  if (!isTestMode()) {
    return fail("La simulación solo está disponible en modo pruebas.", 403);
  }

  const body = await readJson<{ reference?: string; outcome?: string }>(req);
  const reference = (body?.reference ?? "").trim();
  const outcome = body?.outcome === "REJECTED" ? "REJECTED" : "APPROVED";
  if (!reference) return fail("Referencia de pago requerida.");

  const payment = await db.payment.findUnique({ where: { reference } });
  if (!payment) return fail("Referencia no encontrada.", 404);

  const result = await applyPaymentResult({
    reference,
    providerTxId: `SIM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    eventId: `sim-${reference}-${outcome}-${crypto.randomBytes(4).toString("hex")}`,
    outcome,
    raw: JSON.stringify({ simulated: true, outcome, at: new Date().toISOString() }),
  });

  if (!result.ok) return fail(result.message, 409);
  return ok(result);
}
