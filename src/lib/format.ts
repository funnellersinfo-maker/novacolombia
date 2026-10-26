// Formato compartido (cliente y servidor) — COP sin decimales
export function fmtCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function fmtNumber(value: number): string {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value);
}

export function fmtDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Pendiente de pago",
  PENDING: "Pendiente de confirmación",
  CONFIRMED: "Confirmado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  PAYMENT_REJECTED: "Pago rechazado",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  COD_PENDING: "Contraentrega pendiente",
  COD_COLLECTED: "Cobrado en entrega",
  REFUNDED: "Reembolsado",
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Por despachar",
  DISPATCHED: "Despachado",
  IN_TRANSIT: "En tránsito",
  DELIVERED: "Entregado",
  RETURNED: "Devuelto",
};
