"use client";

// Sección Pedidos — listado con filtros, detalle con acciones y exportación CSV.
// APIs: GET/PATCH /api/admin/orders, GET /api/admin/orders/[id], GET /api/admin/carriers.

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { Download, Eye, Loader2, PackageOpen, Search, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { fmtCOP, fmtDate, ORDER_STATUS_LABELS } from "@/lib/format";
import {
  btnPop, EmptyBlock, ErrorBlock, Field, LoadingBlock, MethodBadge,
  OrderStatusBadge, PageHeader, Pager, PaymentStatusBadge, parseIncidents,
  ShipmentStatusBadge, Thumb, toastError, useAdminQuery, useDebounced,
  type AdminCarrier, type AdminOrder,
} from "../ui";

type OrdersResponse = { orders: AdminOrder[]; total: number; page: number; pages: number };

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS);

function csvCell(v: unknown): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

/* ══════════════════════ Detalle de pedido (Dialog) ══════════════════════ */

function StatusActionForm({ order, busy, act }: { order: AdminOrder; busy: string | null; act: (label: string, body: Record<string, unknown>) => Promise<void> }) {
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState("");
  return (
    <div className="card-pop-sm rounded-2xl bg-card p-3">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Cambiar estado</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Select value={status} onValueChange={setStatus} disabled={busy !== null}>
          <SelectTrigger className="w-full rounded-xl border-2 border-input" aria-label="Nuevo estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(([v, label]) => (
              <SelectItem key={v} value={v}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className={`shrink-0 ${btnPop}`}
          disabled={busy !== null || status === order.status}
          onClick={() => void act("status", { status, note: note.trim() })}
        >
          {busy === "status" ? <Loader2 className="animate-spin" aria-hidden /> : null} Actualizar
        </Button>
      </div>
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota para el historial (opcional)…"
        className="mt-2 rounded-xl border-2 border-input"
        disabled={busy !== null}
      />
      <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
        Anticipado: exige pago aprobado para avanzar (solo puede cancelarse o marcarse rechazado).
        Contraentrega pendiente: solo confirmar o cancelar.
      </p>
    </div>
  );
}

function ShipmentActionForm({
  order, carriers, busy, act,
}: { order: AdminOrder; carriers: AdminCarrier[]; busy: string | null; act: (label: string, body: Record<string, unknown>) => Promise<void> }) {
  const [carrierCode, setCarrierCode] = useState(order.shipment?.carrierCode || carriers.find((c) => c.active)?.code || "");
  const [tracking, setTracking] = useState(order.shipment?.trackingNumber ?? "");
  const [incident, setIncident] = useState("");
  return (
    <div className="card-pop-sm rounded-2xl bg-card p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
        <Truck className="h-3.5 w-3.5" aria-hidden /> Transporte y guía
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Select value={carrierCode} onValueChange={setCarrierCode} disabled={busy !== null}>
          <SelectTrigger className="w-full rounded-xl border-2 border-input" aria-label="Transportadora">
            <SelectValue placeholder="Transportadora…" />
          </SelectTrigger>
          <SelectContent>
            {carriers.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}{!c.active ? " (inactiva)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="N.º de guía"
          className="rounded-xl border-2 border-input"
          disabled={busy !== null}
        />
        <Button
          className={`shrink-0 ${btnPop}`}
          disabled={busy !== null || !carrierCode}
          onClick={() => void act("shipment", { carrierCode, trackingNumber: tracking.trim() })}
        >
          {busy === "shipment" ? <Loader2 className="animate-spin" aria-hidden /> : null} Asignar
        </Button>
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          value={incident}
          onChange={(e) => setIncident(e.target.value)}
          placeholder="Registrar incidencia del envío (ej. demora, dirección errada)…"
          className="rounded-xl border-2 border-input"
          disabled={busy !== null}
        />
        <Button
          variant="outline"
          className={`shrink-0 border-2 border-ink ${busy !== null ? "opacity-50" : "press-pop"}`}
          disabled={busy !== null || incident.trim().length < 3}
          onClick={() => { void act("incident", { incident: incident.trim() }); setIncident(""); }}
        >
          {busy === "incident" ? <Loader2 className="animate-spin" aria-hidden /> : null} Registrar
        </Button>
      </div>
    </div>
  );
}

function PaymentActionForm({ order, busy, act }: { order: AdminOrder; busy: string | null; act: (label: string, body: Record<string, unknown>) => Promise<void> }) {
  const options = ["COD_PENDING", "COD_COLLECTED", "REFUNDED"];
  const [paymentStatus, setPaymentStatus] = useState(options.includes(order.paymentStatus) ? order.paymentStatus : "COD_PENDING");
  return (
    <div className="card-pop-sm rounded-2xl bg-card p-3">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Estado del pago</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Select value={paymentStatus} onValueChange={setPaymentStatus} disabled={busy !== null}>
          <SelectTrigger className="w-full rounded-xl border-2 border-input" aria-label="Estado del pago">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((v) => (
              <SelectItem key={v} value={v}>
                {v === "COD_PENDING" ? "Contraentrega pendiente" : v === "COD_COLLECTED" ? "Cobrado en entrega" : "Reembolsado"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className={`shrink-0 ${btnPop}`}
          disabled={busy !== null || paymentStatus === order.paymentStatus}
          onClick={() => void act("payment", { paymentStatus })}
        >
          {busy === "payment" ? <Loader2 className="animate-spin" aria-hidden /> : null} Marcar
        </Button>
      </div>
    </div>
  );
}

function OrderDetailDialog({
  orderId, onClose, onChanged,
}: { orderId: string; onClose: () => void; onChanged: () => void }) {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const { data, loading, error, refetch } = useAdminQuery<{ order: AdminOrder }>(`/api/admin/orders/${orderId}`);
  const { data: carriersData } = useAdminQuery<{ carriers: AdminCarrier[] }>("/api/admin/carriers");
  const order = data?.order;

  async function act(label: string, body: Record<string, unknown>) {
    setBusy(label);
    try {
      await api.patch(`/api/admin/orders/${orderId}`, body);
      toast.success(`Pedido ${order?.number ?? ""} actualizado.`);
      refetch();
      onChanged();
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) onClose(); }}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-y-auto rounded-2xl border-2 border-ink scroll-y sm:max-w-3xl">
        <DialogHeader className="text-left">
          <DialogTitle className="flex flex-wrap items-center gap-2 font-display text-xl font-extrabold">
            {order ? (
              <>
                {order.number}
                <OrderStatusBadge status={order.status} />
                <MethodBadge method={order.paymentMethod} />
              </>
            ) : (
              "Detalle del pedido"
            )}
          </DialogTitle>
          <DialogDescription>
            {order
              ? `Creado el ${fmtDate(order.createdAt)} · ${order.items.reduce((s, i) => s + i.quantity, 0)} artículo(s)` +
                (order.etaMin != null && order.etaMax != null ? ` · ETA ${order.etaMin}–${order.etaMax} días` : "")
              : "Cargando la información más reciente…"}
          </DialogDescription>
        </DialogHeader>

        {loading ? <LoadingBlock rows={6} className="pt-2" /> : null}
        {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}

        {order ? (
          <>
            {/* Cliente y dirección */}
            <section aria-label="Cliente y destino" className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-ink bg-muted/50 p-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Cliente</p>
                <p className="mt-1.5 text-sm font-extrabold">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">Tel: {order.phone}</p>
                {order.email ? <p className="text-xs text-muted-foreground">{order.email}</p> : null}
              </div>
              <div className="rounded-2xl border-2 border-ink bg-muted/50 p-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Envío a</p>
                <address className="mt-1.5 space-y-0.5 not-italic text-xs">
                  <p className="font-extrabold">{order.ciudad}, {order.departamento}</p>
                  <p>{order.direccion}</p>
                  {order.complemento ? <p className="text-muted-foreground">{order.complemento}</p> : null}
                  {order.indicaciones ? <p className="text-muted-foreground">📌 {order.indicaciones}</p> : null}
                </address>
              </div>
            </section>

            {/* Artículos */}
            <section aria-label="Artículos" className="mt-4">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Artículos (precio congelado)</h3>
              <ul className="mt-2 divide-y-2 divide-dashed divide-input">
                {order.items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 py-2">
                    <Thumb src={it.image} alt={it.name} className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{it.name}</p>
                      {it.variantLabel ? <p className="text-[11px] text-muted-foreground">{it.variantLabel}</p> : null}
                      <p className="text-[11px] text-muted-foreground">{it.quantity} × {fmtCOP(it.unitPrice)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-extrabold tabular-nums">{fmtCOP(it.lineSubtotal)}</p>
                      {it.lineDiscount > 0 ? <p className="text-[11px] font-bold text-success">−{fmtCOP(it.lineDiscount)}</p> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Desglose económico + pago */}
            <section aria-label="Desglose económico" className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-ink bg-muted/50 p-3">
                <dl className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-bold tabular-nums">{fmtCOP(order.subtotal)}</dd></div>
                  {order.prepayDiscount > 0 ? (
                    <div className="flex justify-between gap-2 text-success"><dt className="font-bold">Descuento anticipado</dt><dd className="font-bold tabular-nums">−{fmtCOP(order.prepayDiscount)}</dd></div>
                  ) : null}
                  <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Envío</dt><dd className="font-bold tabular-nums">{order.shippingCost === 0 ? "Gratis" : fmtCOP(order.shippingCost)}</dd></div>
                  <Separator className="my-1" />
                  <div className="flex justify-between gap-2 text-sm">
                    <dt className="font-display font-extrabold">Total</dt>
                    <dd className="font-display font-extrabold tabular-nums">{fmtCOP(order.total)}</dd>
                  </div>
                </dl>
              </div>
              <div className="rounded-2xl border-2 border-ink bg-muted/50 p-3">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Pago</p>
                <div className="mt-2 space-y-1.5 text-xs">
                  <p className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Estado</span>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </p>
                  <p className="flex justify-between gap-2"><span className="text-muted-foreground">Modalidad</span><span className="font-bold">{order.paymentMethod === "PREPAID" ? "Anticipado" : "Contraentrega"}</span></p>
                  {order.payment ? (
                    <>
                      <p className="flex justify-between gap-2"><span className="text-muted-foreground">Referencia</span><span className="truncate font-mono text-[11px]">{order.payment.reference || "—"}</span></p>
                      <p className="flex justify-between gap-2"><span className="text-muted-foreground">Proveedor</span><span className="font-bold">{order.payment.provider}</span></p>
                    </>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Envío actual */}
            <section aria-label="Envío" className="mt-3 rounded-2xl border-2 border-ink bg-muted/50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Envío actual</h3>
                {order.shipment ? <ShipmentStatusBadge status={order.shipment.status} /> : <span className="sticker-flat bg-muted">Sin asignar</span>}
              </div>
              {order.shipment ? (
                <div className="mt-2 space-y-1 text-xs">
                  <p><span className="text-muted-foreground">Transportadora:</span> <span className="font-bold">{order.shipment.carrierName || "—"}</span></p>
                  <p><span className="text-muted-foreground">Guía:</span> <span className="font-mono">{order.shipment.trackingNumber || "—"}</span></p>
                  {parseIncidents(order.shipment.incidents).length ? (
                    <div className="pt-1">
                      <p className="text-muted-foreground">Incidencias:</p>
                      <ul className="mt-1 space-y-1">
                        {parseIncidents(order.shipment.incidents).map((inc, i) => (
                          <li key={i} className="rounded-lg border-2 border-dashed border-input bg-card p-1.5">
                            <span className="text-[11px] text-muted-foreground">{fmtDate(inc.at)}</span>
                            <p className="text-[11px] font-bold">{inc.note}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Aún no se ha asignado transportadora ni guía.</p>
              )}
            </section>

            {/* Historial */}
            <section aria-label="Historial" className="mt-3">
              <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">Historial</h3>
              {order.history.length ? (
                <ol className="relative mt-3 space-y-3 border-l-2 border-ink pl-4">
                  {order.history.map((h) => (
                    <li key={h.id} className="relative">
                      <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-ink bg-primary" aria-hidden />
                      <p className="text-xs font-extrabold">
                        {ORDER_STATUS_LABELS[h.from] ?? h.from} → {ORDER_STATUS_LABELS[h.to] ?? h.to}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {fmtDate(h.createdAt)}{h.note ? ` · ${h.note}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Sin eventos registrados.</p>
              )}
            </section>

            {/* Acciones */}
            <section aria-label="Acciones administrativas" className="mt-4 grid gap-3">
              <StatusActionForm key={`st-${order.status}`} order={order} busy={busy} act={act} />
              <ShipmentActionForm
                key={`sh-${order.shipment?.carrierCode ?? ""}-${order.shipment?.trackingNumber ?? ""}`}
                order={order}
                carriers={carriersData?.carriers ?? []}
                busy={busy}
                act={act}
              />
              <PaymentActionForm key={`pay-${order.paymentStatus}`} order={order} busy={busy} act={act} />
            </section>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════ Listado de pedidos ══════════════════════ */

export function PedidosSection() {
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [qInput, setQInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const q = useDebounced(qInput);
  const city = useDebounced(cityInput);

  const filterParams = useMemo(() => {
    const p = new URLSearchParams();
    if (status !== "all") p.set("status", status);
    if (method !== "all") p.set("method", method);
    if (q.trim()) p.set("q", q.trim());
    if (city.trim()) p.set("city", city.trim());
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    return p;
  }, [status, method, q, city, from, to]);

  const path = useMemo(() => {
    const p = new URLSearchParams(filterParams);
    p.set("page", String(page));
    return `/api/admin/orders?${p.toString()}`;
  }, [filterParams, page]);

  const { data, loading, error, refetch } = useAdminQuery<OrdersResponse>(path);
  const orders = data?.orders ?? [];
  const hasFilters =
    status !== "all" || method !== "all" || qInput.trim() !== "" || cityInput.trim() !== "" || from !== "" || to !== "";

  async function handleExport() {
    setExporting(true);
    try {
      const all: AdminOrder[] = [];
      let p = 1;
      let pages = 1;
      do {
        const res = await api.get<OrdersResponse>(`/api/admin/orders?${filterParams.toString()}&page=${p}`);
        all.push(...res.orders);
        pages = res.pages;
        p++;
      } while (p <= pages && p <= 100);

      const headers = [
        "Número", "Fecha", "Estado", "Modalidad", "Estado de pago", "Cliente", "Teléfono", "Email",
        "Departamento", "Ciudad", "Dirección", "Subtotal", "Descuento anticipo", "Envío", "Total",
        "Transportadora", "Guía", "Artículos",
      ];
      const lines = [headers, ...all.map((o) => [
        o.number, fmtDate(o.createdAt), ORDER_STATUS_LABELS[o.status] ?? o.status,
        o.paymentMethod === "PREPAID" ? "Anticipado" : "Contraentrega", o.paymentStatus,
        o.customerName, o.phone, o.email ?? "", o.departamento, o.ciudad, o.direccion,
        o.subtotal, o.prepayDiscount, o.shippingCost, o.total,
        o.shipment?.carrierName ?? "", o.shipment?.trackingNumber ?? "",
        o.items.map((i) => `${i.quantity}x ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ""}`).join(" | "),
      ])];
      const csv = lines.map((row) => row.map(csvCell).join(";")).join("\r\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pedidos-nova-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`${all.length} pedido(s) exportados a CSV.`, { description: "Formato compatible con Excel (separador ;)." });
    } catch (e) {
      toastError(e, "Exportando");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Pedidos" desc="Gestiona confirmación, guías, pagos contraentrega e incidencias.">
        <Button className={btnPop} onClick={() => void handleExport()} disabled={exporting || loading || !!error}>
          {exporting ? <Loader2 className="animate-spin" aria-hidden /> : <Download aria-hidden />}
          <span className="hidden sm:inline">Exportar CSV</span>
          <span className="sr-only sm:hidden">Exportar CSV</span>
        </Button>
      </PageHeader>

      {/* ── Filtros ── */}
      <div className="card-pop-sm mb-4 rounded-2xl bg-card p-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <Field label="Estado">
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-full rounded-xl border-2 border-input" aria-label="Filtrar por estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {STATUS_OPTIONS.map(([v, label]) => (
                  <SelectItem key={v} value={v}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Modalidad">
            <Select value={method} onValueChange={(v) => { setMethod(v); setPage(1); }}>
              <SelectTrigger className="w-full rounded-xl border-2 border-input" aria-label="Filtrar por modalidad">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="PREPAID">Anticipado</SelectItem>
                <SelectItem value="COD">Contraentrega</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Búsqueda" className="col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={qInput}
                onChange={(e) => { setQInput(e.target.value); setPage(1); }}
                placeholder="Número, nombre o teléfono…"
                className="rounded-xl border-2 border-input pl-9"
              />
            </div>
          </Field>
          <Field label="Ciudad">
            <Input
              value={cityInput}
              onChange={(e) => { setCityInput(e.target.value); setPage(1); }}
              placeholder="Ej. Medellín"
              className="rounded-xl border-2 border-input"
            />
          </Field>
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <Field label="Desde">
              <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="rounded-xl border-2 border-input" />
            </Field>
            <Field label="Hasta">
              <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="rounded-xl border-2 border-input" />
            </Field>
          </div>
        </div>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => { setStatus("all"); setMethod("all"); setQInput(""); setCityInput(""); setFrom(""); setTo(""); setPage(1); }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline"
          >
            <X className="h-3.5 w-3.5" aria-hidden /> Limpiar filtros
          </button>
        ) : null}
      </div>

      {loading ? <LoadingBlock rows={6} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}
      {!loading && !error && data && orders.length === 0 ? (
        <EmptyBlock title="Sin pedidos" desc="Ningún pedido coincide con los filtros actuales." />
      ) : null}

      {!loading && !error && data && orders.length > 0 ? (
        <>
          {/* ── Tabla desktop ── */}
          <div className="card-pop hidden overflow-hidden rounded-2xl bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-ink bg-muted/60 [&>th]:font-extrabold [&>th]:text-muted-foreground">
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="w-14"><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow
                    key={o.id}
                    className="cursor-pointer border-b border-dashed border-input last:border-0 hover:bg-muted/50"
                    onClick={() => setDetailId(o.id)}
                  >
                    <TableCell className="font-display font-extrabold">{o.number}</TableCell>
                    <TableCell>
                      <p className="text-xs font-bold">{o.customerName}</p>
                      <p className="text-[11px] text-muted-foreground">{o.phone}</p>
                    </TableCell>
                    <TableCell className="text-xs">
                      {o.ciudad}
                      <span className="block text-[11px] text-muted-foreground">{o.departamento}</span>
                    </TableCell>
                    <TableCell><MethodBadge method={o.paymentMethod} /></TableCell>
                    <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                    <TableCell className="text-right text-xs font-extrabold tabular-nums">{fmtCOP(o.total)}</TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">{fmtDate(o.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-ink press-pop"
                        onClick={(e) => { e.stopPropagation(); setDetailId(o.id); }}
                        aria-label={`Ver detalle del pedido ${o.number}`}
                      >
                        <Eye aria-hidden />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── Tarjetas móviles ── */}
          <div className="space-y-2 md:hidden">
            {orders.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setDetailId(o.id)}
                className="card-pop-sm w-full rounded-2xl bg-card p-3 text-left press-pop"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display font-extrabold">{o.number}</span>
                  <OrderStatusBadge status={o.status} />
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {o.customerName} · {o.ciudad} · {fmtDate(o.createdAt)}
                </span>
                <span className="mt-2 flex items-center justify-between gap-2">
                  <span className="font-display font-extrabold tabular-nums">{fmtCOP(o.total)}</span>
                  <MethodBadge method={o.paymentMethod} />
                </span>
              </button>
            ))}
          </div>

          <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} disabled={loading} />
        </>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="mt-6 flex justify-center">
          <PackageOpen className="h-10 w-10 text-muted-foreground/50" aria-hidden />
        </div>
      ) : null}

      {detailId ? (
        <OrderDetailDialog
          key={detailId}
          orderId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={refetch}
        />
      ) : null}
    </div>
  );
}
