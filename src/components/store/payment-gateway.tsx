"use client";

import { useState } from "react";
import { Lock, ShieldCheck, X } from "lucide-react";
import { api } from "@/lib/client-api";
import { fmtCOP } from "@/lib/format";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";

export type PaymentSession = {
  reference: string;
  amount: number;
  status: string;
  testMode: boolean;
  provider: string;
  orderNumber: string;
};

export function PaymentGateway({
  session,
  onApproved,
  onRejected,
  onClose,
}: {
  session: PaymentSession;
  onApproved: () => void;
  onRejected: (message: string) => void;
  onClose: () => void;
}) {
  const { refreshCart } = useApp();
  const [processing, setProcessing] = useState<"approve" | "reject" | null>(null);
  const [card, setCard] = useState("4111 1111 1111 1111");

  const simulate = async (outcome: "APPROVED" | "REJECTED") => {
    setProcessing(outcome === "APPROVED" ? "approve" : "reject");
    try {
      await api.post("/api/payments/simulate", { reference: session.reference, outcome });
      await refreshCart();
      if (outcome === "APPROVED") onApproved();
      else onRejected("El pago fue rechazado por la pasarela. Puedes intentarlo de nuevo con otro medio de pago.");
    } catch {
      onRejected("No se pudo procesar la simulación. Intenta nuevamente.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4 bg-ink/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Pasarela de pago">
      <div className="w-full max-w-md rounded-3xl card-pop bg-card overflow-hidden animate-pop-in">
        {/* Cabecera sandbox */}
        <div className="bg-ink text-background p-4 flex items-center justify-between">
          <div>
            <p className="font-display font-extrabold">{session.provider}</p>
            <p className="text-[0.65rem] text-background/60 uppercase tracking-widest">
              {session.testMode ? "Ambiente de pruebas — sin dinero real" : "Producción"}
            </p>
          </div>
          <span className="grid place-items-center w-9 h-9 rounded-full border-2 border-background/30">
            <Lock className="w-4 h-4" />
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border-2 border-ink bg-muted p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referencia</span>
              <span className="font-mono font-bold">{session.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pedido</span>
              <span className="font-bold">{session.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total a pagar</span>
              <span className="font-display font-extrabold text-lg">{fmtCOP(session.amount)}</span>
            </div>
          </div>

          <div>
            <label htmlFor="card-sim" className="text-xs font-extrabold uppercase text-muted-foreground">
              Tarjeta (datos de prueba)
            </label>
            <input
              id="card-sim"
              value={card}
              onChange={(e) => setCard(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border-2 border-ink bg-card px-3 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              inputMode="numeric"
            />
            <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
              <input value="12/28" readOnly aria-label="Vencimiento" className="h-9 rounded-lg border-2 border-ink/30 bg-muted px-2 font-mono" />
              <input value="123" readOnly aria-label="CVV" className="h-9 rounded-lg border-2 border-ink/30 bg-muted px-2 font-mono" />
              <input value="NOVA TEST" readOnly aria-label="Titular" className="h-9 rounded-lg border-2 border-ink/30 bg-muted px-2 font-mono" />
            </div>
          </div>

          <p className="text-[0.68rem] text-muted-foreground leading-relaxed">
            🔒 Este es un simulador de pasarela en modo pruebas. Ningún dato financiero real se
            procesa ni almacena. Al conectar el proveedor real (Wompi/Mercado Pago) esta pantalla
            será reemplazada por su checkout seguro.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => simulate("REJECTED")}
              disabled={processing != null}
              className="rounded-xl border-2 border-ink bg-muted py-3 text-sm font-extrabold press-pop disabled:opacity-50"
            >
              {processing === "reject" ? "Procesando…" : "Rechazar pago"}
            </button>
            <button
              onClick={() => simulate("APPROVED")}
              disabled={processing != null}
              className={cn(
                "rounded-xl border-2 border-ink bg-success text-success-foreground py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop disabled:opacity-50"
              )}
            >
              {processing === "approve" ? "Procesando…" : "Aprobar pago"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" /> Volver al pedido (pago pendiente)
          </button>

          <p className="flex items-center justify-center gap-1 text-[0.62rem] text-muted-foreground">
            <ShieldCheck className="w-3 h-3" /> Conexión cifrada · verificación por webhook firmado
          </p>
        </div>
      </div>
    </div>
  );
}
