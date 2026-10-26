"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, BadgePercent, Banknote, ShieldCheck } from "lucide-react";
import { fmtCOP } from "@/lib/format";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";

export function CartView() {
  const { cart, updateCartItem, removeCartItem, bootstrap } = useApp();
  const [removing, setRemoving] = useState<string | null>(null);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="grid place-items-center w-24 h-24 mx-auto rounded-3xl bg-accent border-2 border-ink rotate-3">
          <ShoppingCart className="w-11 h-11" />
        </div>
        <h1 className="font-display text-2xl font-extrabold mt-5">Tu carrito está vacío</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Descubre ofertas, novedades y todo lo que necesitas en la tienda.
        </p>
        <a
          href="#/"
          className="inline-flex items-center gap-2 mt-6 rounded-xl border-2 border-ink bg-primary text-primary-foreground px-6 py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop"
        >
          Explorar productos <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    );
  }

  const promo = cart.promo;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
        <span className="marker-title">Tu carrito</span>
        <span className="ml-3 text-sm font-bold text-muted-foreground align-middle">
          {cart.itemCount} {cart.itemCount === 1 ? "producto" : "productos"}
        </span>
      </h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Lista */}
        <ul className="space-y-3">
          {cart.items.map((item) => (
            <li key={item.id} className="flex gap-3 rounded-2xl card-pop bg-card p-3">
              <a href={`#/p/${item.slug}`} className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden border-2 border-ink">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              </a>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <a href={`#/p/${item.slug}`} className="text-sm font-bold line-clamp-2 hover:underline underline-offset-2">
                      {item.name}
                    </a>
                    {item.variantValue && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.variantKind}: {item.variantValue}</p>
                    )}
                    <p className="text-[0.68rem] font-bold text-success mt-1">
                      {item.prepayEligible && promo.inEffect
                        ? `${fmtCOP(Math.round(item.unitPrice * (1 - promo.percent / 100)))} pagando anticipado`
                        : "No aplica descuento anticipado"}
                    </p>
                    {item.stock <= 5 && (
                      <p className="text-[0.68rem] font-semibold text-destructive">Solo {item.stock} disponibles</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setRemoving(item.id);
                      removeCartItem(item.id).finally(() => setRemoving(null));
                    }}
                    aria-label={`Quitar ${item.name}`}
                    className="grid place-items-center w-8 h-8 rounded-lg border-2 border-ink/25 text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
                  >
                    <Trash2 className={cn("w-4 h-4", removing === item.id && "animate-spin")} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 mt-2">
                  <div className="flex items-center rounded-xl border-2 border-ink overflow-hidden">
                    <button
                      onClick={() => updateCartItem(item.id, item.quantity - 1)}
                      className="grid place-items-center w-8 h-8 hover:bg-muted"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-extrabold tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="grid place-items-center w-8 h-8 hover:bg-muted disabled:opacity-40"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-display font-extrabold">{fmtCOP(item.lineSubtotal)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Resumen */}
        <aside className="lg:sticky lg:top-36 space-y-3">
          <div className="rounded-3xl card-pop bg-card p-5 space-y-3">
            <h2 className="font-display text-lg font-extrabold">Resumen</h2>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">{fmtCOP(cart.subtotal)}</span>
            </div>

            {cart.prepayDiscount > 0 && (
              <div className="rounded-xl border-2 border-success bg-success/10 p-3 space-y-1.5">
                <p className="text-xs font-extrabold uppercase text-success flex items-center gap-1.5">
                  <BadgePercent className="w-3.5 h-3.5" /> Pago anticipado
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento {promo.percent}%</span>
                  <span className="font-extrabold text-success">−{fmtCOP(cart.prepayDiscount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pagando anticipado</span>
                  <span className="font-extrabold">{fmtCOP(cart.prepayTotal)}</span>
                </div>
              </div>
            )}

            <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-3">
              <p className="text-xs font-extrabold uppercase text-primary flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5" /> Contraentrega
              </p>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Pagando al recibir</span>
                <span className="font-extrabold">{fmtCOP(cart.codTotal)}</span>
              </div>
              <p className="text-[0.65rem] text-muted-foreground mt-1">
                Sujeto a cobertura y producto. Disponibilidad confirmada en el pago.
              </p>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Envío</span>
              <span className="font-bold text-muted-foreground">se calcula en el pago</span>
            </div>

            <a
              href="#/checkout"
              className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-ink bg-primary text-primary-foreground py-3.5 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop mt-2"
            >
              Continuar al pago <ArrowRight className="w-4 h-4" />
            </a>

            <p className="flex items-center justify-center gap-1.5 text-[0.68rem] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5" /> Precios verificados en servidor · sin cargos sorpresa
            </p>
          </div>

          <a href="#/" className="block text-center text-sm font-bold text-primary hover:underline">
            ← Seguir comprando
          </a>
        </aside>
      </div>
    </div>
  );
}
