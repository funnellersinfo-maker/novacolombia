"use client";

// Sección Envíos — transportadoras (gestión manual de guías) y zonas de cobertura.
// APIs: GET/POST/PATCH /api/admin/carriers, GET/POST/PATCH/DELETE /api/admin/zones,
// GET /api/store (departamentos).

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { Info, Loader2, Pencil, Plus, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fmtCOP } from "@/lib/format";
import {
  btnPop, ConfirmAction, EmptyBlock, ErrorBlock, Field, LoadingBlock, numOr,
  PageHeader, Pager, toastError, useAdminQuery, type AdminCarrier, type AdminZone,
} from "../ui";

type ZonesResponse = { zones: AdminZone[]; total: number; page: number; pages: number };

/* ══════════════════════ Transportadoras ══════════════════════ */

function CarrierDialog({
  carrier, onClose, onSaved,
}: { carrier: AdminCarrier | null; onClose: () => void; onSaved: () => void }) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState(carrier?.code ?? "");
  const [name, setName] = useState(carrier?.name ?? "");
  const [notes, setNotes] = useState(carrier?.notes ?? "");
  const [supportsCod, setSupportsCod] = useState(carrier?.supportsCod ?? true);
  const [active, setActive] = useState(carrier?.active ?? true);

  async function handleSave() {
    const c = code.trim().toUpperCase();
    const n = name.trim();
    if (c.length < 2) { toast.error("El código debe tener al menos 2 caracteres."); return; }
    if (n.length < 3) { toast.error("El nombre debe tener al menos 3 caracteres."); return; }
    setSaving(true);
    try {
      if (carrier) {
        await api.patch("/api/admin/carriers", { code: carrier.code, name: n, supportsCod, notes, active });
        toast.success("Transportadora actualizada.");
      } else {
        await api.post("/api/admin/carriers", { code: c, name: n, supportsCod, notes });
        toast.success("Transportadora creada.");
      }
      onSaved();
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
          <DialogTitle className="font-display text-xl font-extrabold">
            {carrier ? "Editar transportadora" : "Nueva transportadora"}
          </DialogTitle>
          <DialogDescription>
            {carrier ? `${carrier.code} · integración: ${carrier.integration}` : "La gestión de guías es manual."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Código *" hint="Ej. COORDINADORA.">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SERVIENTREGA"
                className="rounded-xl border-2 border-input font-mono uppercase"
                disabled={!!carrier}
              />
            </Field>
            <Field label="Nombre *">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Servientrega" className="rounded-xl border-2 border-input" />
            </Field>
          </div>
          <Field label="Notas">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Observaciones operativas…" className="rounded-xl border-2 border-input" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-input p-2.5">
              <Switch checked={supportsCod} onCheckedChange={setSupportsCod} aria-label="Admite contraentrega" />
              <span className="text-xs font-bold">Admite contraentrega</span>
            </label>
            {carrier ? (
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-input p-2.5">
                <Switch checked={active} onCheckedChange={setActive} aria-label="Activa" />
                <span className="text-xs font-bold">Activa</span>
              </label>
            ) : (
              <span className="flex items-center text-xs text-muted-foreground">Se crea activa por defecto.</span>
            )}
          </div>
        </div>
        <DialogFooter className="mt-4 flex-row gap-2">
          <Button variant="outline" className="border-2 border-ink press-pop" onClick={() => { setOpen(false); onClose(); }} disabled={saving}>Cancelar</Button>
          <Button className={`sm:ml-auto ${btnPop}`} onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : null} Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CarriersTab() {
  const { data, loading, error, refetch } = useAdminQuery<{ carriers: AdminCarrier[] }>("/api/admin/carriers");
  const [editor, setEditor] = useState<{ carrier: AdminCarrier | null } | null>(null);
  const [busyCode, setBusyCode] = useState<string | null>(null);

  const carriers = data?.carriers ?? [];

  async function patchCarrier(code: string, body: Record<string, unknown>, msg: string) {
    setBusyCode(code);
    try {
      await api.patch("/api/admin/carriers", { code, ...body });
      toast.success(msg);
      refetch();
    } catch (e) {
      toastError(e);
    } finally {
      setBusyCode(null);
    }
  }

  return (
    <div>
      <Alert className="mb-4 rounded-2xl border-2 border-ink bg-accent text-accent-foreground">
        <Info className="h-4 w-4" aria-hidden />
        <AlertTitle className="font-display font-extrabold">Integración API pendiente de contrato</AlertTitle>
        <AlertDescription className="text-accent-foreground/80">
          La gestión de guías es manual por ahora: asigna transportadora y número de guía desde cada pedido.
        </AlertDescription>
      </Alert>

      <div className="mb-3 flex justify-end">
        <Button className={btnPop} size="sm" onClick={() => setEditor({ carrier: null })}>
          <Plus aria-hidden /> Nueva transportadora
        </Button>
      </div>

      {loading ? <LoadingBlock rows={5} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}
      {!loading && !error && data && carriers.length === 0 ? (
        <EmptyBlock title="Sin transportadoras" desc="Registra al menos una para poder asignar guías." />
      ) : null}

      {carriers.length > 0 ? (
        <div className="card-pop overflow-x-auto rounded-2xl bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-ink bg-muted/60 [&>th]:font-extrabold [&>th]:text-muted-foreground">
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Contraentrega</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Activa</TableHead>
                <TableHead className="w-16"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carriers.map((c) => (
                <TableRow key={c.code} className="border-b border-dashed border-input last:border-0">
                  <TableCell><span className="sticker-flat bg-muted font-mono">{c.code}</span></TableCell>
                  <TableCell className="text-xs font-bold">{c.name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={c.supportsCod}
                      onCheckedChange={(v) => void patchCarrier(c.code, { supportsCod: v }, "Modalidad actualizada.")}
                      disabled={busyCode === c.code}
                      aria-label={`Contraentrega ${c.name}`}
                    />
                  </TableCell>
                  <TableCell className="max-w-52 text-[11px] text-muted-foreground">
                    <span className="line-clamp-2">{c.notes || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={c.active}
                      onCheckedChange={(v) => void patchCarrier(c.code, { active: v }, v ? "Transportadora activada." : "Transportadora desactivada.")}
                      disabled={busyCode === c.code}
                      aria-label={`Activa ${c.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="border-2 border-ink press-pop" onClick={() => setEditor({ carrier: c })} aria-label={`Editar ${c.name}`}>
                      <Pencil aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {editor ? (
        <CarrierDialog
          key={editor.carrier?.code ?? "nueva"}
          carrier={editor.carrier}
          onClose={() => setEditor(null)}
          onSaved={refetch}
        />
      ) : null}
    </div>
  );
}

/* ══════════════════════ Zonas ══════════════════════ */

function ZoneDialog({
  zone, departamentos, onClose, onSaved,
}: { zone: AdminZone | null; departamentos: string[]; onClose: () => void; onSaved: () => void }) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departamento, setDepartamento] = useState(zone?.departamento ?? "");
  const [ciudad, setCiudad] = useState(zone?.ciudad && zone.ciudad !== "*" ? zone.ciudad : "");
  const [price, setPrice] = useState(zone ? String(zone.price) : "10000");
  const [etaMin, setEtaMin] = useState(zone ? String(zone.etaMin) : "2");
  const [etaMax, setEtaMax] = useState(zone ? String(zone.etaMax) : "4");
  const [codAvailable, setCodAvailable] = useState(zone?.codAvailable ?? false);
  const [active, setActive] = useState(zone?.active ?? true);

  async function handleSave() {
    if (!zone && !departamento.trim()) { toast.error("El departamento es obligatorio."); return; }
    const p = numOr(price, -1);
    if (p < 0) { toast.error("Tarifa inválida."); return; }
    const eMin = numOr(etaMin, -1);
    const eMax = numOr(etaMax, -1);
    if (eMin < 0 || eMax < eMin) { toast.error("La ETA debe ser coherente (mín ≤ máx)."); return; }
    setSaving(true);
    try {
      if (zone) {
        await api.patch(`/api/admin/zones/${zone.id}`, { price: p, etaMin: eMin, etaMax: eMax, codAvailable, active });
        toast.success("Zona actualizada.");
      } else {
        await api.post("/api/admin/zones", {
          departamento: departamento.trim(),
          ciudad: ciudad.trim() || "*",
          price: p,
          etaMin: eMin,
          etaMax: eMax,
          codAvailable,
        });
        toast.success("Zona creada.");
      }
      onSaved();
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
          <DialogTitle className="font-display text-xl font-extrabold">
            {zone ? "Editar zona" : "Nueva zona de cobertura"}
          </DialogTitle>
          <DialogDescription>
            {zone ? `${zone.departamento} / ${zone.ciudad === "*" ? "resto del departamento" : zone.ciudad}` : "Ciudad vacía o * = resto del departamento."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 space-y-3">
          {zone ? null : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Departamento *">
                <Input
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  list="admin-departamentos"
                  placeholder="Antioquia"
                  className="rounded-xl border-2 border-input"
                />
              </Field>
              <Field label="Ciudad" hint="* = resto del departamento.">
                <Input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Medellín" className="rounded-xl border-2 border-input" />
              </Field>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Tarifa (COP)">
              <Input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" className="rounded-xl border-2 border-input" />
            </Field>
            <Field label="ETA mín (días)">
              <Input value={etaMin} onChange={(e) => setEtaMin(e.target.value)} inputMode="numeric" className="rounded-xl border-2 border-input" />
            </Field>
            <Field label="ETA máx (días)">
              <Input value={etaMax} onChange={(e) => setEtaMax(e.target.value)} inputMode="numeric" className="rounded-xl border-2 border-input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-input p-2.5">
              <Switch checked={codAvailable} onCheckedChange={setCodAvailable} aria-label="Contraentrega disponible" />
              <span className="text-xs font-bold">Contraentrega</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-input p-2.5">
              <Switch checked={active} onCheckedChange={setActive} aria-label="Zona activa" />
              <span className="text-xs font-bold">Activa</span>
            </label>
          </div>
          <datalist id="admin-departamentos">
            {departamentos.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <DialogFooter className="mt-4 flex-row gap-2">
          <Button variant="outline" className="border-2 border-ink press-pop" onClick={() => { setOpen(false); onClose(); }} disabled={saving}>Cancelar</Button>
          <Button className={`sm:ml-auto ${btnPop}`} onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : null} Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ZonesTab() {
  const [departamento, setDepartamento] = useState("all");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ zone: AdminZone | null } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: storeData } = useAdminQuery<{ locations: { departamento: string }[] }>("/api/store");
  const departamentos = Array.from(new Set((storeData?.locations ?? []).map((l) => l.departamento))).sort();

  const path = useMemo(() => {
    const p = new URLSearchParams();
    if (departamento !== "all") p.set("departamento", departamento);
    p.set("page", String(page));
    return `/api/admin/zones?${p.toString()}`;
  }, [departamento, page]);

  const { data, loading, error, refetch } = useAdminQuery<ZonesResponse>(path);
  const zones = data?.zones ?? [];

  async function patchZone(id: string, body: Record<string, unknown>, msg: string) {
    setBusyId(id);
    try {
      await api.patch(`/api/admin/zones/${id}`, body);
      toast.success(msg);
      refetch();
    } catch (e) {
      toastError(e);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteZone(z: AdminZone) {
    await api.delete(`/api/admin/zones/${z.id}`);
    toast.success("Zona eliminada.");
    refetch();
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div className="w-64">
          <Field label="Departamento">
            <Select value={departamento} onValueChange={(v) => { setDepartamento(v); setPage(1); }}>
              <SelectTrigger className="w-full rounded-xl border-2 border-input" aria-label="Filtrar zonas por departamento">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({departamentos.length})</SelectItem>
                {departamentos.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Button className={btnPop} size="sm" onClick={() => setEditor({ zone: null })}>
          <Plus aria-hidden /> Nueva zona
        </Button>
      </div>

      {loading ? <LoadingBlock rows={6} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}
      {!loading && !error && data && zones.length === 0 ? (
        <EmptyBlock title="Sin zonas" desc="No hay zonas de cobertura para este filtro." />
      ) : null}

      {data && zones.length > 0 ? (
        <>
          <div className="card-pop overflow-x-auto rounded-2xl bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-ink bg-muted/60 [&>th]:font-extrabold [&>th]:text-muted-foreground">
                  <TableHead>Departamento</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead className="text-right">Tarifa</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Contraentrega</TableHead>
                  <TableHead>Activa</TableHead>
                  <TableHead className="w-24"><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.map((z) => (
                  <TableRow key={z.id} className="border-b border-dashed border-input last:border-0">
                    <TableCell className="text-xs font-bold">{z.departamento}</TableCell>
                    <TableCell className="text-xs">
                      {z.ciudad === "*" ? (
                        <span className="sticker-flat bg-muted">resto</span>
                      ) : (
                        z.ciudad
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs font-extrabold tabular-nums">{fmtCOP(z.price)}</TableCell>
                    <TableCell className="text-xs tabular-nums">{z.etaMin}–{z.etaMax} días</TableCell>
                    <TableCell>
                      <Switch
                        checked={z.codAvailable}
                        onCheckedChange={(v) => void patchZone(z.id, { codAvailable: v }, "Contracargo actualizado.")}
                        disabled={busyId === z.id}
                        aria-label={`Contraentrega en ${z.ciudad}, ${z.departamento}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={z.active}
                        onCheckedChange={(v) => void patchZone(z.id, { active: v }, v ? "Zona activada." : "Zona desactivada.")}
                        disabled={busyId === z.id}
                        aria-label={`Zona activa ${z.ciudad}, ${z.departamento}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" className="border-2 border-ink press-pop" onClick={() => setEditor({ zone: z })} aria-label={`Editar zona ${z.ciudad}`}>
                          <Pencil aria-hidden />
                        </Button>
                        <ConfirmAction
                          render={(open) => (
                            <Button variant="outline" size="sm" className="border-2 border-ink text-destructive press-pop" onClick={open} aria-label={`Eliminar zona ${z.ciudad}`}>
                              <Trash2 aria-hidden />
                            </Button>
                          )}
                          title="¿Eliminar zona?"
                          desc={`Se eliminará la cobertura para ${z.departamento} / ${z.ciudad === "*" ? "resto del departamento" : z.ciudad}.`}
                          confirmLabel="Eliminar"
                          onConfirm={() => deleteZone(z)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} disabled={loading} />
        </>
      ) : null}

      {editor ? (
        <ZoneDialog
          key={editor.zone?.id ?? "nueva"}
          zone={editor.zone}
          departamentos={departamentos}
          onClose={() => setEditor(null)}
          onSaved={refetch}
        />
      ) : null}
    </div>
  );
}

/* ══════════════════════ Sección ══════════════════════ */

export function EnviosSection() {
  return (
    <div>
      <PageHeader title="Envíos" desc="Transportadoras y zonas de cobertura con tarifas, ETA y contraentrega.">
        <span className="sticker flex items-center gap-1">
          <Truck className="h-3.5 w-3.5" aria-hidden /> Manual
        </span>
      </PageHeader>
      <Tabs defaultValue="carriers">
        <TabsList className="w-full justify-start overflow-x-auto rounded-xl border-2 border-ink bg-muted p-1 no-scrollbar">
          <TabsTrigger value="carriers" className="rounded-lg text-xs font-extrabold">Transportadoras</TabsTrigger>
          <TabsTrigger value="zones" className="rounded-lg text-xs font-extrabold">Zonas y tarifas</TabsTrigger>
        </TabsList>
        <TabsContent value="carriers" className="mt-4">
          <CarriersTab />
        </TabsContent>
        <TabsContent value="zones" className="mt-4">
          <ZonesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
