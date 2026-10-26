"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  MapPin, CreditCard, Banknote, BadgePercent, Check, AlertTriangle, Loader2, ArrowRight, Info,
} from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/client-api";
import { fmtCOP } from "@/lib/format";
import type { QuoteDTO } from "@/lib/types";
import { useApp } from "@/store/app";
import { PaymentGateway, type PaymentSession } from "./payment-gateway";
import { cn } from "@/lib/utils";

type AddressDTO = {
  id: string;
  label: string;
  name: string;
  phone: string;
  email: string | null;
  departamento: string;
  ciudad: string;
  direccion: string;
  complemento: string | null;
  indicaciones: string | null;
  isDefault: boolean;
};

type CreateOrderResponse = {
  order: { number: string; status: string; total: number };
  payment: { reference: string; amount: number; status: string; testMode: boolean; provider: string } | null;
};

const IDEMPOTENCY_KEY = "nova-checkout-idempotency";

export function CheckoutView() {
  const { cart, bootstrap, user, city, refreshCart } = useApp();
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    departamento: "",
    ciudad: "",
    direccion: "",
    complemento: "",
    indicaciones: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<QuoteDTO | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"PREPAID" | "COD">("PREPAID");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);

  // Direcciones guardadas del usuario
  useEffect(() => {
    if (!user) return;
    api
      .get<{ addresses: AddressDTO[] }>("/api/account/addresses")
      .then((r) => setAddresses(r.addresses))
      .catch(() => setAddresses([]));
  }, [user]);

  // Prellenar con ciudad elegida / dirección guardada / datos de usuario
  useEffect(() => {
    setForm((f) => ({
      ...f,
      customerName: f.customerName || user?.name || "",
      phone: f.phone || user?.phone || "",
      email: f.email || user?.email || "",
      departamento: f.departamento || city?.departamento || "",
      ciudad: f.ciudad || city?.ciudad || "",
    }));
  }, [user, city]);

  const applySavedAddress = (a: AddressDTO) => {
    setForm((f) => ({
      ...f,
      customerName: a.name,
      phone: a.phone,
      email: a.email ?? f.email,
      departamento: a.departamento,
      ciudad: a.ciudad,
      direccion: a.direccion,
      complemento: a.complemento ?? "",
      indicaciones: a.indicaciones ?? "",
    }));
  };

  // Cotización automática al cambiar destino
  useEffect(() => {
    if (!form.departamento || !form.ciudad || !cart?.items.length) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    api
      .post<QuoteDTO>("/api/checkout/quote", { departamento: form.departamento, ciudad: form.ciudad })
      .then(setQuote)
      .catch(() => setQuote(null))
      .finally(() => setQuoteLoading(false));
  }, [form.departamento, form.ciudad, cart?.items.length]);

  const cities = useMemo(() => {
    const loc = bootstrap?.locations.find((l) => l.departamento === form.departamento);
    return loc?.ciudades ?? [];
  }, [bootstrap, form.departamento]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <h1 className="font-display text-2xl font-extrabold">No hay nada que pagar aún</h1>
        <p className="text-sm text-muted-foreground mt-2">Añade productos a tu carrito para continuar.</p>
        <a href="#/" className="inline-block mt-6 rounded-xl border-2 border-ink bg-primary text-primary-foreground px-6 py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop">
          Ir a la tienda
        </a>
      </div>
    );
  }

  const promo = cart.promo;
  const prepayDiscount = paymentMethod === "PREPAID" ? cart.prepayDiscount : 0;
  const productsTotal = paymentMethod === "PREPAID" ? cart.prepayTotal : cart.codTotal;
  const shipping = quote?.covered ? quote.price : 0;
  const total = productsTotal + shipping;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setErrors({});
    if (!acceptTerms) {
      setErrors({ acceptTerms: "Debes aceptar los términos y la política de datos." });
      return;
    }
    setSubmitting(true);

    // Idempotencia: una clave por intención de compra (evita pedidos duplicados)
    let idempotencyKey = "";
    try {
      idempotencyKey = sessionStorage.getItem(IDEMPOTENCY_KEY) ?? "";
      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();
        sessionStorage.setItem(IDEMPOTENCY_KEY, idempotencyKey);
      }
    } catch {
      idempotencyKey = crypto.randomUUID();
    }

    try {
      const res = await api.post<CreateOrderResponse>("/api/orders", {
        ...form,
        paymentMethod,
        acceptTerms: true,
        saveAddress: user ? saveAddress : false,
        idempotencyKey,
      });
      sessionStorage.removeItem(IDEMPOTENCY_KEY);
      try {
        sessionStorage.setItem("nova-last-order-phone", res.order.number + "|" + form.phone);
      } catch { /* noop */ }

      if (res.payment && res.order.status === "PENDING_PAYMENT") {
        setPaymentSession({
          reference: res.payment.reference,
          amount: res.payment.amount,
          status: res.payment.status,
          testMode: res.payment.testMode,
          provider: res.payment.provider,
          orderNumber: res.order.number,
        });
      } else {
        await refreshCart();
        toast.success("¡Pedido creado!", { description: `Te avisaremos cuando sea confirmado. Pedido ${res.order.number}` });
        window.location.hash = `#/pedido/${res.order.number}?new=1`;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
        toast.error(err.message || "No se pudo crear el pedido");
      } else {
        toast.error("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldCls = (k: string) =>
    cn(
      "w-full h-11 rounded-xl border-2 bg-card px-3 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      errors[k] ? "border-destructive" : "border-ink"
    );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
        <span className="marker-title">Finalizar compra</span>
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-5">
          {/* 1. Entrega */}
          <section className="rounded-3xl card-pop bg-card p-5 space-y-4" aria-labelledby="checkout-delivery">
            <h2 id="checkout-delivery" className="font-display text-lg font-extrabold flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-ink text-background text-sm font-extrabold">1</span>
              <MapPin className="w-4 h-4" /> Datos de entrega
            </h2>

            {addresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Direcciones guardadas</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedAddress(a.id);
                        applySavedAddress(a);
                      }}
                      className={cn(
                        "text-left rounded-xl border-2 border-ink p-3 text-sm transition-colors",
                        selectedAddress === a.id ? "bg-accent" : "bg-muted hover:bg-secondary"
                      )}
                    >
                      <span className="font-extrabold flex items-center gap-1.5">
                        {a.label} {a.isDefault && <span className="sticker-flat bg-card">Predeterminada</span>}
                      </span>
                      <span className="block text-muted-foreground mt-0.5 text-xs">
                        {a.direccion}, {a.ciudad} · {a.name}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">…o completa una nueva abajo:</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="f-name" className="text-xs font-extrabold uppercase text-muted-foreground">Nombre y apellido *</label>
                <input id="f-name" value={form.customerName} onChange={set("customerName")} className={cn(fieldCls("customerName"), "mt-1")} autoComplete="name" />
                {errors.customerName && <p className="text-xs text-destructive font-semibold mt-1">{errors.customerName}</p>}
              </div>
              <div>
                <label htmlFor="f-phone" className="text-xs font-extrabold uppercase text-muted-foreground">Teléfono *</label>
                <input id="f-phone" value={form.phone} onChange={set("phone")} className={cn(fieldCls("phone"), "mt-1")} inputMode="tel" placeholder="310 555 0199" autoComplete="tel" />
                {errors.phone && <p className="text-xs text-destructive font-semibold mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="f-email" className="text-xs font-extrabold uppercase text-muted-foreground">Correo *</label>
                <input id="f-email" value={form.email} onChange={set("email")} className={cn(fieldCls("email"), "mt-1")} inputMode="email" autoComplete="email" />
                {errors.email && <p className="text-xs text-destructive font-semibold mt-1">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="f-dep" className="text-xs font-extrabold uppercase text-muted-foreground">Departamento *</label>
                <select
                  id="f-dep"
                  value={form.departamento}
                  onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value, ciudad: "" }))}
                  className={cn(fieldCls("departamento"), "mt-1")}
                >
                  <option value="">Selecciona…</option>
                  {(bootstrap?.locations ?? []).map((l) => (
                    <option key={l.departamento} value={l.departamento}>{l.departamento}</option>
                  ))}
                </select>
                {errors.departamento && <p className="text-xs text-destructive font-semibold mt-1">{errors.departamento}</p>}
              </div>
              <div>
                <label htmlFor="f-city" className="text-xs font-extrabold uppercase text-muted-foreground">Ciudad o municipio *</label>
                <select id="f-city" value={form.ciudad} onChange={set("ciudad")} className={cn(fieldCls("ciudad"), "mt-1")} disabled={!form.departamento}>
                  <option value="">{form.departamento ? "Selecciona…" : "Elige departamento primero"}</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.ciudad && <p className="text-xs text-destructive font-semibold mt-1">{errors.ciudad}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="f-dir" className="text-xs font-extrabold uppercase text-muted-foreground">Dirección *</label>
                <input id="f-dir" value={form.direccion} onChange={set("direccion")} className={cn(fieldCls("direccion"), "mt-1")} placeholder="Calle 100 # 15-30" autoComplete="street-address" />
                {errors.direccion && <p className="text-xs text-destructive font-semibold mt-1">{errors.direccion}</p>}
              </div>
              <div>
                <label htmlFor="f-comp" className="text-xs font-extrabold uppercase text-muted-foreground">Complemento</label>
                <input id="f-comp" value={form.complemento} onChange={set("complemento")} className={cn(fieldCls("complemento"), "mt-1")} placeholder="Apto 502, torre 2" />
              </div>
              <div>
                <label htmlFor="f-ind" className="text-xs font-extrabold uppercase text-muted-foreground">Indicaciones para el transportador</label>
                <input id="f-ind" value={form.indicaciones} onChange={set("indicaciones")} className={cn(fieldCls("indicaciones"), "mt-1")} placeholder="Portón negro, tocar el timo 2 veces" />
              </div>
            </div>

            {/* Estado de la cotización */}
            {quoteLoading && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Calculando envío a {form.ciudad}…
              </p>
            )}
            {!quoteLoading && quote && quote.covered && (
              <div className="rounded-xl border-2 border-success bg-success/10 p-3 text-sm flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span>
                  <strong>Envío disponible:</strong> {fmtCOP(quote.price)} · llega entre {quote.etaMin} y {quote.etaMax} días hábiles
                  después de confirmar el pedido.
                </span>
              </div>
            )}
            {!quoteLoading && quote && !quote.covered && (
              <div className="rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <span>{quote.reason}</span>
              </div>
            )}
          </section>

          {/* 2. Pago */}
          <section className="rounded-3xl card-pop bg-card p-5 space-y-4" aria-labelledby="checkout-payment">
            <h2 id="checkout-payment" className="font-display text-lg font-extrabold flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-ink text-background text-sm font-extrabold">2</span>
              Modalidad de pago
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Opción A */}
              <button
                type="button"
                onClick={() => setPaymentMethod("PREPAID")}
                aria-pressed={paymentMethod === "PREPAID"}
                className={cn(
                  "text-left rounded-2xl border-2 border-ink p-4 transition-all relative",
                  paymentMethod === "PREPAID"
                    ? "bg-success/10 shadow-[4px_4px_0_var(--shadow-ink)]"
                    : "bg-card hover:bg-muted"
                )}
              >
                {paymentMethod === "PREPAID" && (
                  <span className="absolute -top-2.5 -right-2.5 grid place-items-center w-7 h-7 rounded-full bg-success text-success-foreground border-2 border-ink">
                    <Check className="w-4 h-4" />
                  </span>
                )}
                <p className="font-extrabold flex items-center gap-1.5 text-sm uppercase">
                  <CreditCard className="w-4 h-4" /> A · Pago anticipado
                </p>
                {cart.prepayDiscount > 0 && promo.inEffect ? (
                  <>
                    <p className="mt-2 font-display text-2xl font-extrabold text-success">
                      −{fmtCOP(cart.prepayDiscount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {promo.percent}% de descuento sobre {fmtCOP(cart.eligibleSubtotal)} de productos elegibles.
                      El envío no recibe descuento.
                    </p>
                    <p className="text-sm font-extrabold mt-2">{fmtCOP(cart.prepayTotal)} + envío</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    Tu carrito no tiene productos elegibles para el descuento en este momento.
                  </p>
                )}
                <p className="text-[0.65rem] text-muted-foreground mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> {bootstrap?.payments.providerLabel}
                  {bootstrap?.payments.testMode ? " (modo pruebas)" : ""}
                </p>
              </button>

              {/* Opción B */}
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                aria-pressed={paymentMethod === "COD"}
                disabled={quote?.covered && !quote.codAvailable}
                className={cn(
                  "text-left rounded-2xl border-2 border-ink p-4 transition-all relative disabled:opacity-50 disabled:cursor-not-allowed",
                  paymentMethod === "COD"
                    ? "bg-primary/10 shadow-[4px_4px_0_var(--shadow-ink)]"
                    : "bg-card hover:bg-muted"
                )}
              >
                {paymentMethod === "COD" && (
                  <span className="absolute -top-2.5 -right-2.5 grid place-items-center w-7 h-7 rounded-full bg-primary text-primary-foreground border-2 border-ink">
                    <Check className="w-4 h-4" />
                  </span>
                )}
                <p className="font-extrabold flex items-center gap-1.5 text-sm uppercase">
                  <Banknote className="w-4 h-4" /> B · Contraentrega
                </p>
                <p className="mt-2 font-display text-2xl font-extrabold">{fmtCOP(cart.codTotal)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Paga en efectivo al recibir tu pedido. Sin descuento anticipado.
                </p>
                {quote?.covered && !quote.codAvailable && (
                  <p className="text-xs font-semibold text-destructive mt-2">
                    No disponible para {form.ciudad} o algunos de tus productos.
                  </p>
                )}
                {!quote?.covered && form.ciudad && (
                  <p className="text-xs font-semibold text-destructive mt-2">Sin cobertura en este destino.</p>
                )}
              </button>
            </div>
          </section>

          {/* 3. Revisión */}
          <section className="rounded-3xl card-pop bg-card p-5 space-y-4" aria-labelledby="checkout-review">
            <h2 id="checkout-review" className="font-display text-lg font-extrabold flex items-center gap-2">
              <span className="grid place-items-center w-7 h-7 rounded-lg bg-ink text-background text-sm font-extrabold">3</span>
              Revisa tu pedido
            </h2>
            <ul className="space-y-2">
              {cart.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 text-sm">
                  <img src={i.image} alt="" className="w-12 h-12 rounded-lg object-cover border-2 border-ink" loading="lazy" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold truncate">{i.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {i.quantity} × {fmtCOP(i.unitPrice)}
                      {i.variantValue && ` · ${i.variantKind}: ${i.variantValue}`}
                    </span>
                  </span>
                  <span className="font-bold">{fmtCOP(i.lineSubtotal)}</span>
                </li>
              ))}
            </ul>

            {user && (
              <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="w-5 h-5 accent-[var(--primary)]" />
                Guardar esta dirección en mi cuenta
              </label>
            )}

            <label className="flex items-start gap-2.5 text-sm cursor-pointer">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="w-5 h-5 mt-0.5 accent-[var(--primary)]" />
              <span className="text-muted-foreground">
                Acepto los{" "}
                <a href="#/legal/terminos" className="text-primary font-bold hover:underline" target="_blank">términos y condiciones</a>{" "}
                y el{" "}
                <a href="#/legal/datos" className="text-primary font-bold hover:underline" target="_blank">tratamiento de mis datos personales</a>{" "}
                conforme a la Ley 1581 de 2012. *
              </span>
            </label>
            {errors.acceptTerms && <p className="text-xs text-destructive font-semibold">{errors.acceptTerms}</p>}
          </section>
        </div>

        {/* Resumen sticky */}
        <aside className="lg:sticky lg:top-36">
          <div className="rounded-3xl card-pop bg-card p-5 space-y-3">
            <h2 className="font-display text-lg font-extrabold">Total a pagar</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal productos</span>
              <span className="font-bold">{fmtCOP(cart.subtotal)}</span>
            </div>
            {prepayDiscount > 0 && (
              <div className="flex justify-between text-sm text-success font-bold">
                <span>Descuento anticipado ({promo.percent}%)</span>
                <span>−{fmtCOP(prepayDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              {quoteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : quote?.covered ? (
                <span className="font-bold">{fmtCOP(shipping)}</span>
              ) : (
                <span className="text-muted-foreground text-xs">verifica destino</span>
              )}
            </div>
            <div className="border-t-2 border-dashed border-ink/25 pt-3 flex justify-between items-center">
              <span className="font-extrabold">Total</span>
              <span className="font-display text-2xl font-extrabold">{fmtCOP(total)}</span>
            </div>

            {prepayDiscount > 0 && (
              <p className="rounded-lg bg-success/10 border-2 border-success/40 text-success text-xs font-bold p-2 text-center">
                <BadgePercent className="w-3.5 h-3.5 inline mr-1" />
                Estás ahorrando {fmtCOP(prepayDiscount)} con pago anticipado
              </p>
            )}

            <button
              onClick={submit}
              disabled={submitting || !quote?.covered || (paymentMethod === "COD" && !quote?.codAvailable) || !acceptTerms}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-primary text-primary-foreground py-3.5 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Procesando…
                </>
              ) : (
                <>
                  {paymentMethod === "PREPAID" ? "Pagar anticipado" : "Confirmar pedido"} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {!quote?.covered && form.ciudad && !quoteLoading && (
              <p className="text-xs text-destructive font-semibold text-center">
                No podemos despachar a este destino todavía. Prueba otra ciudad.
              </p>
            )}
            <p className="text-[0.65rem] text-muted-foreground text-center leading-relaxed">
              Los totales se recalculan y verifican en nuestro servidor al confirmar.
              Protección contra pedidos duplicados activada.
            </p>
          </div>
        </aside>
      </div>

      {paymentSession && (
        <PaymentGateway
          session={paymentSession}
          onApproved={() => {
            setPaymentSession(null);
            toast.success("¡Pago aprobado!", { description: "Tu pedido fue confirmado." });
            window.location.hash = `#/pedido/${paymentSession.orderNumber}?new=1`;
          }}
          onRejected={(msg) => {
            setPaymentSession(null);
            toast.error("Pago rechazado", { description: msg });
            window.location.hash = `#/pedido/${paymentSession.orderNumber}`;
          }}
          onClose={() => setPaymentSession(null)}
        />
      )}
    </div>
  );
}
