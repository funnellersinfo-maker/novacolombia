import { db } from "@/lib/db";

// ─────────────────────────────────────────────────────────────
// MOTOR DE PRECIOS (autoridad: siempre el servidor)
// Regla central: pago anticipado = X% de descuento sobre el
// subtotal de productos elegibles (nunca sobre envío ni cargos).
// ─────────────────────────────────────────────────────────────

export type PricingItem = {
  productId: string;
  unitPrice: number;
  quantity: number;
  prepayEligible: boolean;
};

export type PrepayPromo = {
  active: boolean;
  percent: number;
  minSubtotal: number | null;
  maxDiscount: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  excludedProductIds: string[];
};

export const DEFAULT_PREPAY_PROMO: PrepayPromo = {
  active: false,
  percent: 10,
  minSubtotal: null,
  maxDiscount: null,
  startsAt: null,
  endsAt: null,
  excludedProductIds: [],
};

export async function getPrepayPromo(): Promise<PrepayPromo> {
  const promo = await db.promotion.findFirst({
    where: { type: "PREPAY_DISCOUNT", active: true },
    orderBy: { createdAt: "desc" },
  });
  if (!promo) return DEFAULT_PREPAY_PROMO;
  let excluded: string[] = [];
  try {
    const cfg = JSON.parse(promo.config || "{}");
    if (Array.isArray(cfg.excludedProductIds)) excluded = cfg.excludedProductIds;
  } catch {
    /* config inválida → sin exclusiones */
  }
  return {
    active: promo.active,
    percent: promo.percent ?? 10,
    minSubtotal: promo.minSubtotal,
    maxDiscount: promo.maxDiscount,
    startsAt: promo.startsAt,
    endsAt: promo.endsAt,
    excludedProductIds: excluded,
  };
}

export function isPromoInEffect(promo: PrepayPromo, now = new Date()): boolean {
  if (!promo.active) return false;
  if (promo.startsAt && promo.startsAt > now) return false;
  if (promo.endsAt && promo.endsAt < now) return false;
  return true;
}

export type PricingBreakdown = {
  subtotal: number; // suma de líneas
  eligibleSubtotal: number; // base del descuento
  prepayDiscount: number; // descuento si se paga anticipado
  prepayTotal: number; // subtotal - descuento (sin envío)
  codTotal: number; // = subtotal (sin envío)
  promoInEffect: boolean;
};

export function computePricing(
  items: PricingItem[],
  promo: PrepayPromo,
  paymentMethod: "PREPAID" | "COD",
  now = new Date()
): PricingBreakdown {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const inEffect = isPromoInEffect(promo, now);
  const eligibleSubtotal = items.reduce(
    (s, i) =>
      s +
      (i.prepayEligible && !promo.excludedProductIds.includes(i.productId)
        ? i.unitPrice * i.quantity
        : 0),
    0
  );

  let prepayDiscount = 0;
  if (paymentMethod === "PREPAID" && inEffect) {
    const meetsMin = promo.minSubtotal == null || eligibleSubtotal >= promo.minSubtotal;
    if (meetsMin && eligibleSubtotal > 0) {
      prepayDiscount = Math.round((eligibleSubtotal * promo.percent) / 100);
      if (promo.maxDiscount != null) prepayDiscount = Math.min(prepayDiscount, promo.maxDiscount);
    }
  }

  return {
    subtotal,
    eligibleSubtotal,
    prepayDiscount,
    prepayTotal: subtotal - prepayDiscount,
    codTotal: subtotal,
    promoInEffect: inEffect,
  };
}

// Reparte el descuento total entre las líneas (para snapshots de pedido)
export function allocateDiscount(
  items: PricingItem[],
  discount: number
): { lineDiscounts: number[]; allocated: number } {
  const eligible = items.filter(
    (i) => i.prepayEligible && items.length >= 0
  );
  const eligibleTotal = eligible.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const lineDiscounts = items.map((i) => {
    if (!i.prepayEligible) return 0;
    const line = i.unitPrice * i.quantity;
    if (eligibleTotal === 0) return 0;
    return Math.floor((line / eligibleTotal) * discount);
  });
  // Ajustar redondeo: asignar el resto a la línea elegible más grande
  let allocated = lineDiscounts.reduce((s, d) => s + d, 0);
  let remainder = discount - allocated;
  if (remainder > 0) {
    let maxIdx = -1;
    let maxVal = -1;
    items.forEach((i, idx) => {
      const v = i.prepayEligible ? i.unitPrice * i.quantity : -1;
      if (v > maxVal) {
        maxVal = v;
        maxIdx = idx;
      }
    });
    if (maxIdx >= 0) {
      lineDiscounts[maxIdx] += remainder;
      allocated += remainder;
      remainder = 0;
    }
  }
  return { lineDiscounts, allocated };
}
