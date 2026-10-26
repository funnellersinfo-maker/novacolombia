"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Package, Truck, Home, Copy, PartyPopper, Loader2, XCircle, Clock, CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { fmtCOP, fmtDate, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/format";
import type { OrderDTO } from "@/lib/types";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 36 }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2.2 + Math.random() * 1.2,
      color: ["#d93c0a", "#ffc838", "#0a8a50", "#e5399e", "#241a12"][Math.floor(Math.random() * 5)],
      rotate: Math.random() * 360,
    }))
  );
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: p.color,
            rotate: `${p.rotate}deg`,
          }}
          aria-hidden
        />
      ))}
    </>
  );
}

const TIMELINE = [
  { status: "PENDING_PAYMENT", label: "Pedido recibido", icon: Clock },
  { status: "PENDING", label: "En confirmación", icon: Clock },
  { status: "CONFIRMED", label: "Confirmado", icon: CheckCircle2 },
  { status: "PREPARING", label: "En preparación", icon: Package },
  { status: "SHIPPED", label: "Enviado", icon: Truck },
  { status: "DELIVERED", label: "Entregado", icon: Home },
];

export function StatusFlow({ order }: { order: OrderDTO }) {
  const seq = TIMELINE.map((t) => t.status);
  const currentIdx = (() => {
    if (order.status === "CANCELLED" || order.status === "PAYMENT_REJECTED") return -1;
    let idx = seq.indexOf(order.status);
    // pedidos COD parten de PENDING; PREPAID de PENDING_PAYMENT
    if (order.status === "CONFIRMED") idx = 2;
    if (order.status === "PENDING" && order.paymentMethod === "COD") idx = 1;
    if (order.status === "PENDING_PAYMENT") idx = 0;
    return idx;
  })();

  if (currentIdx === -1) {
    return (
      <div className="rounded-2xl border-2 border-destructive bg-destructive/10 p-4 text-sm font-semibold text-destructive flex items-center gap-2">
        <XCircle className="w-5 h-5" /> {ORDER_STATUS_LABELS[order.status] ?? order.status}
      </div>
    );
  }

  const visible = TIMELINE.filter((t) =>
    order.paymentMethod === "PREPAID" ? t.status !== "PENDING" : t.status !== "PENDING_PAYMENT"
  );

  return (
    <ol className="relative flex justify-between">
      {visible.map((step, i) => {
        const active = i <= currentIdx;
        return (
          <li key={step.status} className="flex flex-col items-center gap-1.5 relative z-10 flex-1">
            <span
              className={cn(
                "grid place-items-center w-10 h-10 rounded-full border-2 border-ink transition-colors",
                active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <step.icon className="w-5 h-5" />
            </span>
            <span className={cn("text-[0.62rem] font-bold text-center leading-tight", active ? "text-foreground" : "text-muted-foreground")}>
              {step.label}
            </span>
            {i < visible.length - 1 && (
              <span
                className={cn(
                  "absolute top-5 left-1/2 w-full h-0.5 -z-0",
                  i < currentIdx ? "bg-success" : "bg-muted"
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderConfirmationView({ number, isNew }: { number: string; isNew?: boolean }) {
  const { user } = useApp();
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(!!isNew);

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 3200);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  useEffect(() => {
    let phone = "";
    try {
      const stored = sessionStorage.getItem("nova-last-order-phone");
      if (stored?.startsWith(number + "|")) phone = stored.split("|")[1];
    } catch { /* noop */ }
    api
      .get<{ order: OrderDTO }>(`/api/orders/${number}${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`)
      .then((r) => setOrder(r.order))
      .catch(() => {
        if (user) {
          api
            .get<{ order: OrderDTO }>(`/api/orders/${number}`)
            .then((r) => setOrder(r.order))
            .catch(() => setError("No pudimos encontrar este pedido."));
        } else {
          setError("No pudimos verificar este pedido. Usa el seguimiento con tu teléfono.");
        }
      });
  }, [number, user]);

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <XCircle className="w-14 h-14 mx-auto text-destructive" />
        <h1 className="font-display text-2xl font-extrabold">{error}</h1>
        <a href="#/seguimiento" className="inline-block rounded-xl border-2 border-ink bg-primary text-primary-foreground px-6 py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop">
          Ir a seguimiento
        </a>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const paid = order.paymentStatus === "APPROVED";
  const isCod = order.paymentMethod === "COD";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {showConfetti && paid && <Confetti />}

      <div className="text-center pt-4">
        <div className="grid place-items-center w-20 h-20 mx-auto rounded-3xl bg-success text-success-foreground border-2 border-ink shadow-[4px_4px_0_var(--shadow-ink)] animate-pop-in">
          {paid ? <PartyPopper className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold mt-4">
          {paid
            ? "¡Gracias por tu compra!"
            : isCod
              ? "¡Pedido recibido!"
              : "Esperando tu pago"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {paid
            ? "Tu pago fue verificado y tu pedido está en proceso."
            : isCod
              ? "Confirmaremos tu pedido contraentrega y te avisaremos cuando salga a despacho."
              : "Completa el pago para que podamos preparar tu pedido."}
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(order.number).then(() => toast.success("Número de pedido copiado"));
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-ink bg-accent px-4 py-2 font-mono font-extrabold shadow-[3px_3px_0_var(--shadow-ink)] press-pop"
        >
          {order.number} <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="rounded-3xl card-pop bg-card p-5 space-y-5">
        <StatusFlow order={order} />

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs font-extrabold uppercase text-muted-foreground">Entrega</p>
            <p className="font-semibold mt-1">{order.customerName}</p>
            <p className="text-muted-foreground">{order.direccion}{order.complemento ? `, ${order.complemento}` : ""}</p>
            <p className="text-muted-foreground">{order.ciudad}, {order.departamento}</p>
            {order.etaMin && (
              <p className="text-xs font-bold mt-1.5 text-success">
                Llega entre {order.etaMin} y {order.etaMax} días hábiles tras confirmar
              </p>
            )}
          </div>
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs font-extrabold uppercase text-muted-foreground">Pago</p>
            <p className="font-semibold mt-1 flex items-center gap-1.5">
              {isCod ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              {isCod ? "Contraentrega" : "Pago anticipado"}
            </p>
            <p className="text-muted-foreground">{PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}</p>
            <p className="text-xs text-muted-foreground mt-1.5">Creado: {fmtDate(order.createdAt)}</p>
          </div>
        </div>

        <ul className="space-y-2 border-t-2 border-dashed border-ink/20 pt-4">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 text-sm">
              <img src={i.image} alt="" className="w-12 h-12 rounded-lg object-cover border-2 border-ink" loading="lazy" />
              <span className="flex-1 min-w-0">
                <span className="block font-bold truncate">{i.name}</span>
                <span className="text-xs text-muted-foreground">
                  {i.quantity} × {fmtCOP(i.unitPrice)}{i.variantLabel && ` · ${i.variantLabel}`}
                </span>
              </span>
              <span className="font-bold">{fmtCOP(i.lineSubtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t-2 border-dashed border-ink/20 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-bold">{fmtCOP(order.subtotal)}</span>
          </div>
          {order.prepayDiscount > 0 && (
            <div className="flex justify-between text-success font-bold">
              <span>Descuento pago anticipado (10%)</span>
              <span>−{fmtCOP(order.prepayDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span className="font-bold">{fmtCOP(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between items-center border-t-2 border-ink/20 pt-2">
            <span className="font-extrabold">Total {isCod ? "a pagar al recibir" : "pagado"}</span>
            <span className="font-display text-xl font-extrabold">{fmtCOP(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`#/seguimiento/${order.number}`}
          className="text-center rounded-xl border-2 border-ink bg-primary text-primary-foreground px-6 py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop"
        >
          Seguir mi pedido
        </a>
        <a
          href="#/"
          className="text-center rounded-xl border-2 border-ink bg-card px-6 py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop"
        >
          Seguir comprando
        </a>
      </div>
    </div>
  );
}
