"use client";

// Sección Promociones — regla de pago anticipado (PREPAY10) destacada + campañas.
// APIs: GET/POST/PATCH /api/admin/promotions.

import { useState } from "react";
import { refreshStorefront } from "../ui";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { BadgePercent, Loader2, Megaphone, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { fmtDate } from "@/lib/format";
import {
  btnPop, EmptyBlock, ErrorBlock, Field, LoadingBlock, numOr, PageHeader,
  ProductSearchBox, toastError, toLocalInput, useAdminQuery,
  type AdminProduct, type AdminPromotion,
} from "../ui";

/* ══════════════════════ Editor de la regla anticipada ══════════════════════ */

function PrepayEditor({
  promo, nameById, onSaved,
}: { promo: AdminPromotion; nameById: Map<string, AdminProduct>; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [percent, setPercent] = useState(promo.percent != null ? String(promo.percent) : "10");
  const [minSubtotal, setMinSubtotal] = useState(promo.minSubtotal != null ? String(promo.minSubtotal) : "");
  const [maxDiscount, setMaxDiscount] = useState(promo.maxDiscount != null ? String(promo.maxDiscount) : "");
  const [startsAt, setStartsAt] = useState(toLocalInput(promo.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(promo.endsAt));
  const [excluded, setExcluded] = useState<string[]>(promo.config.excludedProductIds ?? []);
  const [extraNames, setExtraNames] = useState<Record<string, string>>({});

  function chipName(id: string): string {
    return extraNames[id] ?? nameById.get(id)?.name ?? `${id.slice(0, 10)}…`;
  }

  async function toggleActive() {
    setToggling(true);
    try {
      await api.patch("/api/admin/promotions", { id: promo.id, active: !promo.active });
      refreshStorefront();
      toast.success(promo.active ? "Descuento anticipado pausado." : "Descuento anticipado activado.");
      onSaved();
    } catch (e) {
      toastError(e);
    } finally {
      setToggling(false);
    }
  }

  async function handleSave() {
    const pct = numOr(percent, -1);
    if (pct < 0 || pct > 50) { toast.error("El porcentaje debe estar entre 0 y 50."); return; }
    const min = minSubtotal.trim() === "" ? null : numOr(minSubtotal, 0);
    const max = maxDiscount.trim() === "" ? null : numOr(maxDiscount, 0);
    if (min != null && min < 0) { toast.error("El mínimo de compra no puede ser negativo."); return; }
    if (max != null && max < 0) { toast.error("El tope de descuento no puede ser negativo."); return; }
    setSaving(true);
    try {
      await api.patch("/api/admin/promotions", {
        id: promo.id,
        percent: pct,
        minSubtotal: min,
        maxDiscount: max,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        excludedProductIds: excluded,
      });
      toast.success("Regla de pago anticipado guardada.");
      onSaved();
    } catch (e) {
      toastError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-label="Regla de pago anticipado" className="card-pop rounded-2xl bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-primary text-primary-foreground" aria-hidden>
            <BadgePercent className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold leading-tight">
              {promo.name} <span className="sticker ml-1 align-middle">{promo.code}</span>
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-snug text-muted-foreground">
              Descuento sobre el subtotal de productos elegibles (no incluye envío). Se muestra en la ficha,
              el carrito y el checkout como comparación de modalidades.
            </p>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-ink bg-muted px-3 py-2">
          <Switch checked={promo.active} onCheckedChange={() => void toggleActive()} disabled={toggling} aria-label="Activar descuento anticipado" />
          <span className="text-xs font-extrabold">{promo.active ? "Activa" : "Pausada"}</span>
          {toggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Porcentaje" hint="0 a 50 (%).">
          <Input value={percent} onChange={(e) => setPercent(e.target.value)} inputMode="numeric" className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Mínimo de compra (COP)" hint="Vacío = sin mínimo.">
          <Input value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} inputMode="numeric" placeholder="50000" className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Tope de descuento (COP)" hint="Vacío = sin tope.">
          <Input value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} inputMode="numeric" placeholder="200000" className="rounded-xl border-2 border-input" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Vigencia desde">
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="rounded-xl border-2 border-input text-xs" />
          </Field>
          <Field label="Vigencia hasta">
            <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="rounded-xl border-2 border-input text-xs" />
          </Field>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border-2 border-dashed border-input p-3">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Productos excluidos ({excluded.length})
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Los productos excluidos no reciben el descuento anticipado aunque sean elegibles.</p>
        {excluded.length ? (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {excluded.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setExcluded((s) => s.filter((x) => x !== id))}
                  className="sticker-flat bg-destructive text-white hover:opacity-80"
                  title="Quitar de la lista"
                  aria-label={`Quitar ${chipName(id)} de exclusiones`}
                >
                  {chipName(id)} <X className="h-3 w-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs italic text-muted-foreground/70">Sin exclusiones: todos los elegibles participan.</p>
        )}
        <div className="mt-2 max-w-md">
          <ProductSearchBox
            onPick={(p) => {
              if (excluded.includes(p.id)) { toast.info("Ese producto ya está excluido."); return; }
              setExcluded((s) => [...s, p.id]);
              setExtraNames((s) => ({ ...s, [p.id]: p.name }));
            }}
            placeholder="Buscar producto para excluir…"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Uso registrado: <span className="font-extrabold">{promo.usageCount}</span> · Actualizada: {fmtDate(promo.updatedAt)}
        </p>
        <Button className={btnPop} onClick={() => void handleSave()} disabled={saving || toggling}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : null} Guardar regla
        </Button>
      </div>
    </section>
  );
}

/* ══════════════════════ Crear campaña ══════════════════════ */

function CampaignCreateDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  async function handleCreate() {
    const n = name.trim();
    if (n.length < 3) { toast.error("El nombre de la campaña es obligatorio."); return; }
    setSaving(true);
    try {
      await api.post("/api/admin/promotions", {
        name: n,
        ...(code.trim() !== "" ? { code: code.trim() } : {}),
        type: "CAMPAIGN",
        ...(percent.trim() !== "" ? { percent: numOr(percent, 0) } : {}),
        ...(startsAt ? { startsAt: new Date(startsAt).toISOString() } : {}),
        ...(endsAt ? { endsAt: new Date(endsAt).toISOString() } : {}),
      });
      toast.success("Campaña creada y activada.");
      onCreated();
      setOpen(false);
      onClose();
    } catch (e) {
      toastError(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) onClose(); }}>
      <DialogContent className="rounded-2xl border-2 border-ink sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl font-extrabold">Nueva campaña</DialogTitle>
          <DialogDescription>Las campañas activas se destacan en la home con cuenta regresiva.</DialogDescription>
        </DialogHeader>
        <div className="mt-3 space-y-3">
          <Field label="Nombre *">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Black Friday NOVA" className="rounded-xl border-2 border-input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código" hint="Vacío = automático.">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="BLACKFRIDAY" className="rounded-xl border-2 border-input" />
            </Field>
            <Field label="Descuento (%)" hint="Opcional.">
              <Input value={percent} onChange={(e) => setPercent(e.target.value)} inputMode="numeric" placeholder="20" className="rounded-xl border-2 border-input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio">
              <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="rounded-xl border-2 border-input text-xs" />
            </Field>
            <Field label="Fin">
              <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="rounded-xl border-2 border-input text-xs" />
            </Field>
          </div>
        </div>
        <DialogFooter className="mt-4 flex-row gap-2">
          <Button variant="outline" className="border-2 border-ink press-pop" onClick={() => { setOpen(false); onClose(); }} disabled={saving}>Cancelar</Button>
          <Button className={`sm:ml-auto ${btnPop}`} onClick={() => void handleCreate()} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : null} Crear campaña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════ Sección ══════════════════════ */

export function PromocionesSection() {
  const { data, loading, error, refetch } = useAdminQuery<{ promotions: AdminPromotion[] }>("/api/admin/promotions");
  const { data: productsData } = useAdminQuery<{ items: AdminProduct[] }>("/api/admin/products?perPage=100&includeInactive=1");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const promotions = data?.promotions ?? [];
  const prepay = promotions.find((p) => p.type === "PREPAY_DISCOUNT") ?? null;
  const campaigns = promotions.filter((p) => p.type !== "PREPAY_DISCOUNT");
  const nameById = new Map((productsData?.items ?? []).map((p) => [p.id, p]));

  async function toggleCampaign(p: AdminPromotion) {
    setBusyId(p.id);
    try {
      await api.patch("/api/admin/promotions", { id: p.id, active: !p.active });
      refreshStorefront();
      toast.success(p.active ? `Campaña "${p.name}" pausada.` : `Campaña "${p.name}" activada.`);
      refetch();
    } catch (e) {
      toastError(e);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Promociones" desc="La regla estrella de NOVA y las campañas por temporada.">
        <Button className={btnPop} onClick={() => setCreating(true)}>
          <Plus aria-hidden /> Nueva campaña
        </Button>
      </PageHeader>

      {loading ? <LoadingBlock rows={5} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}

      {!loading && !error ? (
        <div className="space-y-5">
          {prepay ? (
            <PrepayEditor key={`prepay-${prepay.updatedAt}`} promo={prepay} nameById={nameById} onSaved={refetch} />
          ) : (
            <div className="card-pop rounded-2xl bg-card p-5 text-sm text-muted-foreground">
              No se encontró la promoción de pago anticipado (PREPAY10). Créala con tipo
              <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-xs">PREPAY_DISCOUNT</code>
              para habilitar esta sección.
            </div>
          )}

          <section aria-label="Campañas">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold">
              <Megaphone className="h-5 w-5 text-primary" aria-hidden /> Campañas ({campaigns.length})
            </h2>
            {campaigns.length === 0 ? (
              <EmptyBlock title="Sin campañas activas" desc="Crea campañas por temporada (Black Friday, Amor y Amistad…)." />
            ) : (
              <div className="card-pop overflow-hidden rounded-2xl bg-card">
                <div className="md:hidden">
                  {campaigns.map((c) => (
                    <div key={c.id} className="border-b-2 border-dashed border-input p-3 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-xs font-extrabold">{c.name}</p>
                        <label className="flex shrink-0 cursor-pointer items-center gap-1.5">
                          <Switch checked={c.active} onCheckedChange={() => void toggleCampaign(c)} disabled={busyId === c.id} aria-label={`Activar ${c.name}`} />
                          <span className="text-[11px] font-bold">{c.active ? "Activa" : "Pausada"}</span>
                        </label>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {c.code} · {c.startsAt ? fmtDate(c.startsAt) : "—"} → {c.endsAt ? fmtDate(c.endsAt) : "—"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">Uso: {c.usageCount}{c.percent != null ? ` · ${c.percent}%` : ""}</p>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-ink bg-muted/60 [&>th]:font-extrabold [&>th]:text-muted-foreground">
                        <TableHead>Campaña</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Vigencia</TableHead>
                        <TableHead className="text-right">Uso</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((c) => (
                        <TableRow key={c.id} className="border-b border-dashed border-input last:border-0">
                          <TableCell>
                            <p className="text-xs font-bold">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground">Creada {fmtDate(c.createdAt)}</p>
                          </TableCell>
                          <TableCell><span className="sticker-flat bg-muted font-mono">{c.code}</span></TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">
                            {c.startsAt ? fmtDate(c.startsAt) : "sin inicio"} → {c.endsAt ? fmtDate(c.endsAt) : "sin fin"}
                          </TableCell>
                          <TableCell className="text-right text-xs font-extrabold tabular-nums">{c.usageCount}</TableCell>
                          <TableCell>
                            <label className="flex cursor-pointer items-center gap-2">
                              <Switch checked={c.active} onCheckedChange={() => void toggleCampaign(c)} disabled={busyId === c.id} aria-label={`Activar ${c.name}`} />
                              <span className="text-xs font-bold">{c.active ? "Activa" : "Pausada"}</span>
                            </label>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {creating ? <CampaignCreateDialog onClose={() => setCreating(false)} onCreated={refetch} /> : null}
    </div>
  );
}
