"use client";

// Sección Resumen — métricas generales de la tienda (GET /api/admin/stats).

import {
  ArrowRight, Banknote, Hourglass, Package, Receipt, ShoppingCart, TriangleAlert, TrendingUp, Users,
} from "lucide-react";
import { fmtCOP, fmtNumber, ORDER_STATUS_LABELS } from "@/lib/format";
import { EmptyBlock, ErrorBlock, LoadingBlock, PageHeader, useAdminQuery, type AdminStats } from "../ui";

const KPI_TONES = [
  "bg-secondary text-secondary-foreground",
  "bg-accent text-accent-foreground",
  "bg-success text-success-foreground",
];

function KpiCard({
  label, value, hint, icon: Icon, tone,
}: { label: string; value: string; hint?: string; icon: typeof ShoppingCart; tone: string }) {
  return (
    <div className="card-pop-sm rounded-2xl bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-ink ${tone}`} aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold tabular-nums leading-tight">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ResumenSection() {
  const { data, loading, error, refetch } = useAdminQuery<AdminStats>("/api/admin/stats");

  return (
    <div>
      <PageHeader title="Resumen" desc="Pulso de la tienda en las últimas 24 horas y 7 días.">
        <button
          type="button"
          onClick={refetch}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-ink bg-card px-3 text-xs font-extrabold shadow-[3px_3px_0_var(--shadow-ink)] press-pop hover:bg-muted"
        >
          <TrendingUp className="h-4 w-4" aria-hidden /> Actualizar
        </button>
      </PageHeader>

      {loading ? <LoadingBlock rows={4} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}
      {!loading && !error && !data ? <EmptyBlock title="Sin datos" /> : null}

      {data ? (
        <div className="space-y-5">
          {/* ── KPIs ── */}
          <section aria-label="Indicadores clave" className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <KpiCard label="Pedidos hoy" value={fmtNumber(data.ordersToday)} icon={ShoppingCart} tone={KPI_TONES[0]} />
            <KpiCard label="Ingresos (7 días)" value={fmtCOP(data.revenueWeek)} icon={Banknote} tone={KPI_TONES[1]} />
            <KpiCard
              label="Ticket promedio"
              value={data.ordersWeek > 0 ? fmtCOP(Math.round(data.revenueWeek / data.ordersWeek)) : "—"}
              hint={`${fmtNumber(data.ordersWeek)} pedido(s) en 7 días`}
              icon={Receipt}
              tone={KPI_TONES[2]}
            />
            <KpiCard
              label="Por confirmar"
              value={fmtNumber(data.pendingOrders)}
              hint={`${data.codPending} contraentrega · ${data.prepayPending} anticipo`}
              icon={Hourglass}
              tone={KPI_TONES[1]}
            />
            <KpiCard label="Usuarios" value={fmtNumber(data.userCount)} icon={Users} tone={KPI_TONES[0]} />
            <KpiCard label="Productos activos" value={fmtNumber(data.productCount)} icon={Package} tone={KPI_TONES[2]} />
          </section>

          {/* ── Descuento anticipado ── */}
          <a
            href="#/admin/promociones"
            className="card-pop-sm flex items-center gap-4 rounded-2xl bg-accent p-4 transition-transform hover:-translate-y-0.5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-card font-display text-lg font-extrabold" aria-hidden>
              %
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-extrabold uppercase tracking-wide text-accent-foreground/80">
                Descuento anticipado otorgado (histórico)
              </span>
              <span className="block font-display text-xl font-extrabold tabular-nums text-accent-foreground">
                {fmtCOP(data.prepayDiscountTotal)}
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-accent-foreground" aria-hidden />
          </a>

          {/* ── Listas ── */}
          <section aria-label="Detalles" className="grid gap-4 lg:grid-cols-3">
            {/* Stock bajo */}
            <div className="card-pop rounded-2xl bg-card p-4">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-destructive" aria-hidden />
                <h2 className="font-display font-extrabold">Stock bajo</h2>
                <span className="sticker-flat bg-muted ml-auto">{data.lowStock.length}</span>
              </div>
              {data.lowStock.length ? (
                <ul className="mt-3 max-h-72 space-y-1.5 overflow-y-auto scroll-y pr-1">
                  {data.lowStock.map((p) => (
                    <li key={p.id}>
                      <a
                        href="#/admin/productos"
                        className="flex items-center gap-2 rounded-lg border-2 border-transparent p-1.5 hover:border-ink hover:bg-muted"
                        title={p.name}
                      >
                        <span className="min-w-0 flex-1 truncate text-xs font-bold">{p.name}</span>
                        <span
                          className={`sticker-flat shrink-0 ${p.stock <= 0 ? "bg-destructive text-white" : "bg-accent"}`}
                        >
                          {p.stock <= 0 ? "agotado" : `${p.stock} uds`}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Todo el inventario está por encima de 5 unidades. 🎉</p>
              )}
            </div>

            {/* Top productos */}
            <div className="card-pop rounded-2xl bg-card p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
                <h2 className="font-display font-extrabold">Más vendidos</h2>
              </div>
              {data.topProducts.length ? (
                <ol className="mt-3 max-h-72 space-y-1.5 overflow-y-auto scroll-y pr-1">
                  {data.topProducts.map((p, i) => (
                    <li key={p.name} className="flex items-center gap-2.5 rounded-lg p-1.5 odd:bg-muted/60">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink bg-card text-[11px] font-extrabold" aria-hidden>
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold" title={p.name}>{p.name}</span>
                      <span className="sticker-flat bg-success text-success-foreground shrink-0">{p.quantity} vend.</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Aún no hay ventas registradas.</p>
              )}
            </div>

            {/* Distribución por estado */}
            <div className="card-pop rounded-2xl bg-card p-4">
              <h2 className="font-display font-extrabold">Pedidos por estado</h2>
              {data.statusGroups.length ? (
                <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto scroll-y pr-1">
                  {data.statusGroups
                    .slice()
                    .sort((a, b) => b.count - a.count)
                    .map((g) => {
                      const max = Math.max(...data.statusGroups.map((x) => x.count), 1);
                      return (
                        <li key={g.status}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-xs font-bold">{ORDER_STATUS_LABELS[g.status] ?? g.status}</span>
                            <span className="text-xs font-extrabold tabular-nums text-muted-foreground">{g.count}</span>
                          </div>
                          <div className="mt-1 h-2.5 overflow-hidden rounded-full border-2 border-ink bg-muted" role="img" aria-label={`${g.count} pedidos`}>
                            <div className="h-full bg-primary" style={{ width: `${Math.max(6, Math.round((g.count / max) * 100))}%` }} />
                          </div>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Sin pedidos todavía.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
