import crypto from "crypto";
import { db } from "@/lib/db";

// ─────────────────────────────────────────────────────────────
// CAPA DE PAGOS — modular y en MODO PRUEBAS por defecto.
//
// Producción (pendiente de credenciales): configurar en .env
//   PAYMENTS_MODE=wompi
//   WOMPI_PUBLIC_KEY=...   WOMPI_INTEGRITY_SECRET=...
//   WOMPI_EVENTS_TOKEN=... (verificación de webhooks)
// El adaptador Wompi deja preparada la verificación de firma
// de integridad (concatenación de propiedades + HMAC SHA256).
// Nunca se almacenan números de tarjeta ni códigos de seguridad.
// ─────────────────────────────────────────────────────────────

export const PAYMENTS_MODE = (process.env.PAYMENTS_MODE || "test").toLowerCase();
const WEBHOOK_SECRET = process.env.PAYMENTS_WEBHOOK_SECRET || "nova-test-webhook-secret";

export function isTestMode(): boolean {
  return PAYMENTS_MODE !== "wompi" && PAYMENTS_MODE !== "mercadopago";
}

export function providerLabel(): string {
  if (PAYMENTS_MODE === "wompi") return "Wompi";
  if (PAYMENTS_MODE === "mercadopago") return "Mercado Pago";
  return "Pasarela de pruebas NOVA";
}

export function generatePaymentReference(orderNumber: string): string {
  return `PAY-${orderNumber}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

// Firma HMAC-SHA256 del cuerpo crudo del webhook (estilo estándar)
export function computeWebhookSignature(rawBody: string): string {
  return `sha256=${crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex")}`;
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = computeWebhookSignature(rawBody);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Firma de integridad estilo Wompi (para cuando se active en producción):
// HMAC SHA256 sobre la concatenación de referencia+monto+moneda+integritySecret
export function computeWompiIntegrity(reference: string, amountInCents: number, currency: string): string {
  const secret = process.env.WOMPI_INTEGRITY_SECRET || "";
  return crypto
    .createHmac("sha256", secret)
    .update(`${reference}${amountInCents}${currency}`)
    .digest("hex");
}

export type PaymentOutcome = "APPROVED" | "REJECTED" | "DECLINED" | "PENDING";

// Aplica el resultado de un pago de forma IDEMPOTENTE.
// eventId del proveedor evita procesar el mismo webhook dos veces.
export async function applyPaymentResult(params: {
  reference: string;
  providerTxId?: string | null;
  eventId?: string | null;
  outcome: PaymentOutcome;
  raw?: string;
}): Promise<{ ok: boolean; duplicate: boolean; message: string }> {
  const { reference, providerTxId, eventId, outcome, raw } = params;

  // Idempotencia: ¿ya procesamos este evento?
  if (eventId) {
    const seen = await db.payment.findFirst({ where: { eventId } });
    if (seen) return { ok: true, duplicate: true, message: "Evento ya procesado previamente." };
  }

  const payment = await db.payment.findUnique({ where: { reference }, include: { order: true } });
  if (!payment) return { ok: false, duplicate: false, message: "Referencia de pago no encontrada." };

  // El pago ya tiene estado final → no reprocesar
  if (payment.status === "APPROVED" || payment.status === "REJECTED") {
    return { ok: true, duplicate: true, message: "El pago ya tenía estado final." };
  }

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: outcome,
      providerTxId: providerTxId ?? payment.providerTxId,
      eventId: eventId ?? payment.eventId,
      raw: raw ?? payment.raw,
    },
  });

  const order = payment.order;

  if (outcome === "APPROVED") {
    await db.order.update({
      where: { id: order.id },
      data: { status: "CONFIRMED", paymentStatus: "APPROVED" },
    });
    await db.orderStatusHistory.create({
      data: { orderId: order.id, from: order.status, to: "CONFIRMED", note: "Pago aprobado y verificado." },
    });
    await db.promotion.updateMany({
      where: { type: "PREPAY_DISCOUNT", active: true },
      data: { usageCount: { increment: 1 } },
    });
    return { ok: true, duplicate: false, message: "Pago aprobado. Pedido confirmado." };
  }

  if (outcome === "REJECTED" || outcome === "DECLINED") {
    // Se libera el inventario reservado
    const items = await db.orderItem.findMany({ where: { orderId: order.id } });
    for (const item of items) {
      if (item.variantId) {
        await db.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      } else {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    await db.order.update({
      where: { id: order.id },
      data: { status: "PAYMENT_REJECTED", paymentStatus: "REJECTED" },
    });
    await db.orderStatusHistory.create({
      data: { orderId: order.id, from: order.status, to: "PAYMENT_REJECTED", note: "Pago rechazado por el proveedor." },
    });
    return { ok: true, duplicate: false, message: "Pago rechazado. Inventario liberado." };
  }

  return { ok: true, duplicate: false, message: "Pago pendiente." };
}
