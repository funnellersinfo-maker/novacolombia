"use client";

import { useEffect, useState } from "react";
import { Search, Loader2, PackageSearch, Truck, AlertTriangle } from "lucide-react";
import { api } from "@/lib/client-api";
import { fmtCOP, fmtDate, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, SHIPMENT_STATUS_LABELS } from "@/lib/format";
import type { OrderDTO } from "@/lib/types";
import { useApp } from "@/store/app";
import { StatusFlow } from "./order-confirmation";

export function TrackView({ number }: { number?: string }) {
  const { user } = useApp();
  const [orderNumber, setOrderNumber] = useState(number ?? "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = async (num: string, ph: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const q = ph.trim() ? `?phone=${encodeURIComponent(ph.trim())}` : "";
      const res = await api.get<{ order: OrderDTO }>(`/api/orders/${num.trim()}${q}`);
      setOrder(res.order);
      try {
        sessionStorage.setItem("nova-last-order-phone", `${num.trim()}|${ph.trim()}`);
      } catch { /* noop */ }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo consultar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let storedPhone = "";
    try {
      const stored = sessionStorage.getItem("nova-last-order-phone");
      if (stored) storedPhone = stored.split("|")[1] ?? "";
    } catch { /* noop */ }
    if (number && (storedPhone || user)) {
      setPhone(storedPhone);
      void lookup(number, storedPhone);
    }
  }, [number]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <div className="grid place-items-center w-16 h-16 mx-auto rounded-2xl bg-accent border-2 border-ink rotate-3">
          <PackageSearch className="w-8 h-8" />
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-3">
          <span className="marker-title">Seguimiento de pedidos</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Ingresa tu número de pedido y el teléfono de contacto.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(orderNumber, phone);
        }}
        className="rounded-3xl card-pop bg-card p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
      >
        <div>
          <label htmlFor="t-number" className="text-xs font-extrabold uppercase text-muted-foreground">Número de pedido</label>
          <input
            id="t-number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="NOVA-XXXXXX-XXXXXX"
            className="mt-1 w-full h-11 rounded-xl border-2 border-ink bg-card px-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>
        <div>
          <label htmlFor="t-phone" className="text-xs font-extrabold uppercase text-muted-foreground">Teléfono de contacto</label>
          <input
            id="t-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="310 555 0199"
            inputMode="tel"
            className="mt-1 w-full h-11 rounded-xl border-2 border-ink bg-card px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {!user && <p className="text-[0.62rem] text-muted-foreground mt-1">Necesario para verificar que eres tú.</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-11 rounded-xl border-2 border-ink bg-primary text-primary-foreground px-5 text-sm font-extrabold shadow-[3px_3px_0_var(--shadow-ink)] press-pop disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>

      {error && (
        <div className="rounded-2xl border-2 border-destructive bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {order && (
        <div className="rounded-3xl card-pop bg-card p-5 space-y-5 animate-slide-up">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono font-extrabold">{order.number}</p>
            <span className="sticker-flat bg-accent">{ORDER_STATUS_LABELS[order.status] ?? order.status}</span>
          </div>

          <StatusFlow order={order} />

          {/* Historial */}
          <div>
            <h2 className="font-display font-extrabold text-sm uppercase tracking-wide mb-2">Historial</h2>
            <ol className="space-y-2.5">
              {order.history.map((h) => (
                <li key={h.id} className="flex gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>
                    <strong>{ORDER_STATUS_LABELS[h.to] ?? h.to}</strong>
                    {h.note && <span className="text-muted-foreground"> — {h.note}</span>}
                    <span className="block text-xs text-muted-foreground">{fmtDate(h.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Envío */}
          {order.shipment && (order.shipment.trackingNumber || order.shipment.carrierName) && (
            <div className="rounded-xl bg-muted p-3">
              <p className="text-xs font-extrabold uppercase text-muted-foreground flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" /> Envío
              </p>
              <p className="text-sm font-semibold mt-1">
                {order.shipment.carrierName || "Transportadora por asignar"}
                {order.shipment.trackingNumber && (
                  <span className="font-mono ml-2 bg-card border-2 border-ink rounded-lg px-2 py-0.5 text-xs">
                    {order.shipment.trackingNumber}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Estado: {SHIPMENT_STATUS_LABELS[order.shipment.status] ?? order.shipment.status}
              </p>
              {order.shipment.incidents?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {order.shipment.incidents.map((inc, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      ⚠ {inc.note} ({fmtDate(inc.at)})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Resumen económico */}
          <div className="border-t-2 border-dashed border-ink/20 pt-4 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">{fmtCOP(order.subtotal)}</span>
            </div>
            {order.prepayDiscount > 0 && (
              <div className="flex justify-between text-success font-bold">
                <span>Descuento pago anticipado</span>
                <span>−{fmtCOP(order.prepayDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="font-bold">{fmtCOP(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-extrabold border-t border-ink/15 pt-1.5">
              <span>Total</span>
              <span>{fmtCOP(order.total)}</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {order.paymentMethod === "COD" ? "Pago contraentrega" : "Pago anticipado"} ·{" "}
              {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Entrega en {order.ciudad}, {order.departamento} · {order.direccion}
          </p>
        </div>
      )}

      {!order && !error && !loading && (
        <p className="text-center text-sm text-muted-foreground">
          ¿No conoces tu número de pedido? Revisa el correo de confirmación o{" "}
          {user ? (
            <a href="#/cuenta/pedidos" className="text-primary font-bold hover:underline">
              mira tus pedidos en tu cuenta
            </a>
          ) : (
            <a href="#/ingresar" className="text-primary font-bold hover:underline">
              inicia sesión para ver tus pedidos
            </a>
          )}
          .
        </p>
      )}
    </div>
  );
}
