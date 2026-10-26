import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { applyPaymentResult, verifyWebhookSignature } from "@/lib/payments";
import type { PaymentOutcome } from "@/lib/payments";

export const dynamic = "force-dynamic";

// POST /api/payments/webhook — notificaciones del proveedor de pagos.
// Seguridad: firma HMAC-SHA256 del cuerpo crudo (header x-nova-signature).
// Idempotencia: eventId del proveedor (no se procesa dos veces).
type WebhookBody = {
  event?: string;
  eventId?: string;
  data?: {
    reference?: string;
    status?: string; // APPROVED | DECLINED | PENDING | VOIDED
    transaction_id?: string;
  };
};

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-nova-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return fail("Firma de webhook inválida.", 401);
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(raw) as WebhookBody;
  } catch {
    return fail("JSON inválido.", 400);
  }

  const reference = body.data?.reference;
  if (!reference) return fail("Referencia ausente en el evento.", 400);

  const map: Record<string, PaymentOutcome> = {
    APPROVED: "APPROVED",
    DECLINED: "REJECTED",
    VOIDED: "REJECTED",
    PENDING: "PENDING",
  };
  const outcome = map[body.data?.status ?? ""] ?? "PENDING";

  const result = await applyPaymentResult({
    reference,
    providerTxId: body.data?.transaction_id ?? null,
    eventId: body.eventId ?? null,
    outcome,
    raw,
  });

  if (!result.ok) return fail(result.message, 404);
  return ok({ received: true, ...result });
}
