"use client";

// Sección Productos — listado con filtros y editor completo (4 pestañas).
// APIs: /api/admin/products, /api/admin/products/[id], /api/admin/categories,
// POST /api/admin/upload.

import { useMemo, useState } from "react";
import { refreshStorefront } from "../ui";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import {
  Boxes, ImagePlus, Loader2, MoreVertical, PackagePlus, Pencil, Plus,
  Trash2, Upload, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fmtCOP } from "@/lib/format";
import {
  btnPop, btnPopGhost, ConfirmAction, EmptyBlock, ErrorBlock, Field, LoadingBlock,
  numOr, PageHeader, Pager, Thumb, toastError, uploadFile, useAdminQuery, useDebounced,
  type AdminCategory, type AdminProduct,
} from "../ui";

type ProductsResponse = { items: AdminProduct[]; total: number; page: number; pages: number };

const VARIANT_KINDS = ["Talla", "Color", "Tamaño", "Modelo", "Variante"];

/* ══════════════════════ Editor de producto ══════════════════════ */

type VariantRow = { kind: string; value: string; priceDelta: string; stock: string };

type FormState = {
  name: string;
  brand: string;
  seller: string;
  categoryId: string;
  subcategory: string;
  description: string;
  tags: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  sku: string;
  popularity: string;
  prepayEligible: boolean;
  codAvailable: boolean;
  isFeatured: boolean;
  isNew: boolean;
  active: boolean;
  images: string[];
  videoUrl: string;
  variants: VariantRow[];
};

function initForm(p: AdminProduct | null, categories: AdminCategory[]): FormState {
  return {
    name: p?.name ?? "",
    brand: p?.brand ?? "",
    seller: p?.seller ?? "NOVA Retail",
    categoryId: p?.categoryId ?? categories.find((c) => c.active)?.id ?? "",
    subcategory: p?.subcategory ?? "",
    description: p?.description ?? "",
    tags: (p?.tags ?? []).join(", "),
    price: p ? String(p.price) : "",
    compareAtPrice: p?.compareAtPrice != null ? String(p.compareAtPrice) : "",
    stock: p ? String(p.stock) : "0",
    sku: p?.sku ?? "",
    popularity: p ? String(p.popularity) : "50",
    prepayEligible: p?.prepayEligible ?? true,
    codAvailable: p?.codAvailable ?? true,
    isFeatured: p?.isFeatured ?? false,
    isNew: p?.isNew ?? false,
    active: p?.active ?? true,
    images: p ? [...p.images] : [],
    videoUrl: p?.videoUrl ?? "",
    variants: (p?.variants ?? []).map((v) => ({
      kind: v.kind, value: v.value, priceDelta: String(v.priceDelta), stock: String(v.stock),
    })),
  };
}

function CheckRow({
  id, label, checked, onChange, hint,
}: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border-2 border-input bg-card p-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer text-xs font-bold leading-tight">{label}</Label>
        {hint ? <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

function ProductEditorDialog({
  product, categories, onClose, onSaved,
}: { product: AdminProduct | null; categories: AdminCategory[]; onClose: () => void; onSaved: () => void }) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(() => initForm(product, categories));

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function close() {
    setOpen(false);
    onClose();
  }

  async function handleSave() {
    const name = form.name.trim();
    const price = numOr(form.price, 0);
    if (name.length < 3) { toast.error("El nombre debe tener al menos 3 caracteres."); return; }
    if (!(price > 0)) { toast.error("El precio debe ser mayor a 0 (COP, sin decimales)."); return; }
    if (!form.categoryId) { toast.error("Selecciona una categoría."); return; }
    const compareAt = form.compareAtPrice.trim() === "" ? null : numOr(form.compareAtPrice, 0);
    if (compareAt != null && compareAt <= price) {
      toast.error("El precio anterior debe ser mayor al precio actual (representa el descuento real).");
      return;
    }

    const body: Record<string, unknown> = {
      name,
      brand: form.brand.trim(),
      seller: form.seller.trim() || "NOVA Retail",
      categoryId: form.categoryId,
      subcategory: form.subcategory.trim(),
      description: form.description,
      features: product?.features ?? [],
      price,
      compareAtPrice: compareAt,
      stock: numOr(form.stock, 0),
      sku: form.sku.trim(),
      popularity: Math.min(100, Math.max(0, numOr(form.popularity, 50))),
      prepayEligible: form.prepayEligible,
      codAvailable: form.codAvailable,
      isFeatured: form.isFeatured,
      isNew: form.isNew,
      active: form.active,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      images: form.images.filter(Boolean),
      videoUrl: form.videoUrl.trim() || null,
      variants: form.variants
        .filter((v) => v.value.trim())
        .map((v) => ({
          kind: v.kind || "Variante",
          value: v.value.trim(),
          priceDelta: numOr(v.priceDelta, 0),
          stock: numOr(v.stock, 0),
        })),
    };

    setSaving(true);
    try {
      if (product) {
        await api.patch(`/api/admin/products/${product.id}`, body);
        refreshStorefront();
        toast.success("Producto actualizado.");
      } else {
        await api.post("/api/admin/products", body);
        refreshStorefront();
        toast.success("Producto creado.");
      }
      onSaved();
      close();
    } catch (e) {
      toastError(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) urls.push(await uploadFile(f));
      setForm((s) => ({ ...s, images: [...s.images, ...urls] }));
      toast.success(`${urls.length} archivo(s) subido(s).`);
    } catch (e) {
      toastError(e, "Subiendo");
    } finally {
      setUploading(false);
    }
  }

  async function archive() {
    if (!product) return;
    await api.delete(`/api/admin/products/${product.id}`);
    refreshStorefront();
    toast.success(`"${product.name}" archivado (despublicado).`);
    onSaved();
    close();
  }

  async function hardDelete() {
    if (!product) return;
    await api.delete(`/api/admin/products/${product.id}?hard=1`);
    refreshStorefront();
    toast.success(`"${product.name}" eliminado definitivamente.`);
    onSaved();
    close();
  }

  const kindOptions = Array.from(new Set([...VARIANT_KINDS, ...form.variants.map((v) => v.kind).filter(Boolean)]));

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-2xl border-2 border-ink scroll-y sm:max-w-3xl">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl font-extrabold">
            {product ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
          <DialogDescription className="truncate">
            {product ? `/${product.slug}` : "El slug se genera automáticamente a partir del nombre."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basicos" className="mt-3">
          <TabsList className="w-full justify-start overflow-x-auto rounded-xl border-2 border-ink bg-muted p-1 no-scrollbar">
            <TabsTrigger value="basicos" className="rounded-lg text-xs font-extrabold">Básicos</TabsTrigger>
            <TabsTrigger value="precio" className="rounded-lg text-xs font-extrabold">Precio e inventario</TabsTrigger>
            <TabsTrigger value="media" className="rounded-lg text-xs font-extrabold">Multimedia</TabsTrigger>
            <TabsTrigger value="variantes" className="rounded-lg text-xs font-extrabold">Variantes</TabsTrigger>
          </TabsList>

          {/* ── Básicos ── */}
          <TabsContent value="basicos" className="mt-4 space-y-3">
            <Field label="Nombre *">
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ej. Freidora de aire 5L" className="rounded-xl border-2 border-input" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Marca">
                <Input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Ej. CrispyHome" className="rounded-xl border-2 border-input" />
              </Field>
              <Field label="Vendedor">
                <Input value={form.seller} onChange={(e) => set("seller", e.target.value)} placeholder="NOVA Retail" className="rounded-xl border-2 border-input" />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Categoría *">
                <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                  <SelectTrigger className="w-full rounded-xl border-2 border-input" aria-label="Categoría">
                    <SelectValue placeholder="Selecciona…" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{!c.active ? " (inactiva)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Subcategoría" hint="Ej. Freidoras, Audífonos…">
                <Input value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} className="rounded-xl border-2 border-input" />
              </Field>
            </div>
            <Field label="Descripción">
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Describe el producto, incluye y beneficios…" className="rounded-xl border-2 border-input" />
            </Field>
            <Field label="Etiquetas" hint="Separadas por comas. Se usan en el buscador.">
              <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="cocina, saludable, regalo" className="rounded-xl border-2 border-input" />
            </Field>
          </TabsContent>

          {/* ── Precio e inventario ── */}
          <TabsContent value="precio" className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Precio (COP) *" hint="Entero, sin puntos.">
                <Input value={form.price} onChange={(e) => set("price", e.target.value)} inputMode="numeric" placeholder="189900" className="rounded-xl border-2 border-input" />
              </Field>
              <Field label="Precio anterior" hint="Debe superar el precio actual (muestra descuento).">
                <Input value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} inputMode="numeric" placeholder="249900" className="rounded-xl border-2 border-input" />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Stock">
                <Input value={form.stock} onChange={(e) => set("stock", e.target.value)} inputMode="numeric" className="rounded-xl border-2 border-input" />
              </Field>
              <Field label="SKU / referencia">
                <Input value={form.sku} onChange={(e) => set("sku", e.target.value)} className="rounded-xl border-2 border-input" />
              </Field>
              <Field label="Popularidad" hint="0–100 (orden en destacados).">
                <Input value={form.popularity} onChange={(e) => set("popularity", e.target.value)} inputMode="numeric" className="rounded-xl border-2 border-input" />
              </Field>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <CheckRow id="f-prepay" label="Elegible a pago anticipado (-10%)" hint="Participa del descuento anticipado." checked={form.prepayEligible} onChange={(v) => set("prepayEligible", v)} />
              <CheckRow id="f-cod" label="Disponible contraentrega" hint="Se puede pagar al recibir." checked={form.codAvailable} onChange={(v) => set("codAvailable", v)} />
              <CheckRow id="f-featured" label="Destacado" hint="Aparece en la home y rails." checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} />
              <CheckRow id="f-new" label="Novedad" hint="Marca de nuevo ingreso." checked={form.isNew} onChange={(v) => set("isNew", v)} />
              <CheckRow id="f-active" label="Publicado" hint="Visible en la tienda." checked={form.active} onChange={(v) => set("active", v)} />
            </div>
          </TabsContent>

          {/* ── Multimedia ── */}
          <TabsContent value="media" className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Imágenes ({form.images.length})
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="border-2 border-ink press-pop" onClick={() => set("images", [...form.images, ""])} disabled={uploading}>
                  <Plus aria-hidden /> Agregar URL
                </Button>
                <label
                  className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border-2 border-ink bg-card px-3 text-xs font-extrabold shadow-[3px_3px_0_var(--shadow-ink)] press-pop hover:bg-muted ${uploading ? "pointer-events-none opacity-60" : ""}`}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
                  Subir archivos
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
                    multiple
                    className="sr-only"
                    onChange={(e) => { void handleUpload(e.target.files); e.currentTarget.value = ""; }}
                    aria-label="Subir imágenes"
                  />
                </label>
              </div>
            </div>
            {form.images.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-input p-6 text-center">
                <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden />
                <p className="mt-2 text-xs text-muted-foreground">Sin imágenes: agrega una URL o sube archivos (máx. 12MB c/u).</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {form.images.map((url, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Thumb src={url} alt={form.name || "Imagen"} className="h-12 w-12" />
                    <Input
                      value={url}
                      onChange={(e) => setForm((s) => ({ ...s, images: s.images.map((u, j) => (j === i ? e.target.value : u)) }))}
                      placeholder="https://… o /uploads/…"
                      className="rounded-xl border-2 border-input text-xs"
                    />
                    <Button
                      type="button" variant="outline" size="icon" className="shrink-0 border-2 border-ink press-pop"
                      onClick={() => setForm((s) => ({ ...s, images: s.images.filter((_, j) => j !== i) }))}
                      aria-label={`Quitar imagen ${i + 1}`}
                    >
                      <X aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Field label="Video (URL)" hint="MP4 embebido en la ficha (opcional).">
              <Input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://…/video.mp4" className="rounded-xl border-2 border-input text-xs" />
            </Field>
          </TabsContent>

          {/* ── Variantes ── */}
          <TabsContent value="variantes" className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Las variantes reemplazan el stock simple del producto (cada una con su propio inventario y ajuste de precio).
            </p>
            {form.variants.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-input p-6 text-center">
                <Boxes className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden />
                <p className="mt-2 text-xs text-muted-foreground">Sin variantes: el producto se vende con el stock general.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {form.variants.map((v, i) => (
                  <li key={i} className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-input bg-card p-2.5 sm:grid-cols-[1fr_1.4fr_1fr_1fr_auto]">
                    <Select value={v.kind} onValueChange={(val) => setForm((s) => ({ ...s, variants: s.variants.map((r, j) => (j === i ? { ...r, kind: val } : r)) }))}>
                      <SelectTrigger className="w-full rounded-xl border-2 border-input" aria-label="Tipo de variante">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {kindOptions.map((k) => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={v.value} placeholder="Ej. 42, Rojo…"
                      onChange={(e) => setForm((s) => ({ ...s, variants: s.variants.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)) }))}
                      className="rounded-xl border-2 border-input"
                    />
                    <Input
                      value={v.priceDelta} placeholder="Δ precio" inputMode="numeric"
                      onChange={(e) => setForm((s) => ({ ...s, variants: s.variants.map((r, j) => (j === i ? { ...r, priceDelta: e.target.value } : r)) }))}
                      className="rounded-xl border-2 border-input"
                      aria-label="Ajuste de precio"
                    />
                    <Input
                      value={v.stock} placeholder="Stock" inputMode="numeric"
                      onChange={(e) => setForm((s) => ({ ...s, variants: s.variants.map((r, j) => (j === i ? { ...r, stock: e.target.value } : r)) }))}
                      className="rounded-xl border-2 border-input"
                      aria-label="Stock de la variante"
                    />
                    <Button
                      type="button" variant="outline" size="icon" className="press-pop border-2 border-ink"
                      onClick={() => setForm((s) => ({ ...s, variants: s.variants.filter((_, j) => j !== i) }))}
                      aria-label={`Quitar variante ${i + 1}`}
                    >
                      <X aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              type="button" variant="outline" size="sm" className="border-2 border-ink press-pop"
              onClick={() => setForm((s) => ({ ...s, variants: [...s.variants, { kind: "Talla", value: "", priceDelta: "0", stock: "0" }] }))}
            >
              <Plus aria-hidden /> Agregar variante
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-5 flex-col gap-3 border-t-2 border-dashed border-input pt-4 sm:flex-row sm:items-center">
          {product ? (
            <div className="flex flex-wrap gap-2">
              <ConfirmAction
                render={(open) => (
                  <Button type="button" variant="outline" size="sm" className="border-2 border-ink press-pop" onClick={open}>
                    <Trash2 aria-hidden /> Archivar
                  </Button>
                )}
                title="¿Archivar producto?"
                desc={`"${product.name}" dejará de publicarse en la tienda (se conserva su historial).`}
                confirmLabel="Archivar"
                onConfirm={archive}
              />
              <ConfirmAction
                render={(open) => (
                  <Button type="button" variant="outline" size="sm" className="border-2 border-ink text-destructive press-pop" onClick={open}>
                    <X aria-hidden /> Eliminar
                  </Button>
                )}
                title="¿Eliminar definitivamente?"
                desc="Solo es posible si el producto no tiene pedidos históricos. Esta acción no se puede deshacer."
                confirmLabel="Eliminar para siempre"
                onConfirm={hardDelete}
              />
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Los campos con * son obligatorios.</span>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <Button type="button" variant="outline" className="border-2 border-ink press-pop" onClick={close} disabled={saving}>Cancelar</Button>
            <Button type="button" className={btnPop} onClick={() => void handleSave()} disabled={saving || uploading}>
              {saving ? <Loader2 className="animate-spin" aria-hidden /> : null} Guardar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════ Listado de productos ══════════════════════ */

export function ProductosSection() {
  const [qInput, setQInput] = useState("");
  const q = useDebounced(qInput);
  const [category, setCategory] = useState("all");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ product: AdminProduct | null } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: catsData } = useAdminQuery<{ categories: AdminCategory[] }>("/api/admin/categories");
  const categories = catsData?.categories ?? [];

  const path = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (category !== "all") p.set("category", category);
    if (includeInactive) p.set("includeInactive", "1");
    p.set("perPage", "12");
    p.set("page", String(page));
    return `/api/admin/products?${p.toString()}`;
  }, [q, category, includeInactive, page]);

  const { data, loading, error, refetch } = useAdminQuery<ProductsResponse>(path);
  const items = data?.items ?? [];

  async function toggleActive(p: AdminProduct) {
    setBusyId(p.id);
    try {
      await api.patch(`/api/admin/products/${p.id}`, { active: !p.active });
      refreshStorefront();
      toast.success(p.active ? "Producto despublicado." : "Producto publicado.");
      refetch();
    } catch (e) {
      toastError(e);
    } finally {
      setBusyId(null);
    }
  }

  async function archiveProduct(p: AdminProduct) {
    await api.delete(`/api/admin/products/${p.id}`);
    refreshStorefront();
    toast.success(`"${p.name}" archivado (despublicado).`);
    refetch();
  }

  async function hardDeleteProduct(p: AdminProduct) {
    await api.delete(`/api/admin/products/${p.id}?hard=1`);
    refreshStorefront();
    toast.success(`"${p.name}" eliminado definitivamente.`);
    refetch();
  }

  return (
    <div>
      <PageHeader title="Productos" desc="Catálogo, precios, inventario, multimedia y variantes.">
        <Button className={btnPop} onClick={() => setEditor({ product: null })}>
          <PackagePlus aria-hidden /> Nuevo producto
        </Button>
      </PageHeader>

      {/* ── Filtros ── */}
      <div className="card-pop-sm mb-4 rounded-2xl bg-card p-3">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Field label="Búsqueda" className="col-span-2">
            <Input
              value={qInput}
              onChange={(e) => { setQInput(e.target.value); setPage(1); }}
              placeholder="Nombre, marca, SKU o slug…"
              className="rounded-xl border-2 border-input"
            />
          </Field>
          <Field label="Categoría">
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="w-full rounded-xl border-2 border-input" aria-label="Filtrar por categoría">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-end justify-between gap-2 pb-1">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold">
              <Switch checked={includeInactive} onCheckedChange={(v) => { setIncludeInactive(v); setPage(1); }} aria-label="Mostrar archivados" />
              Ver archivados
            </label>
          </div>
        </div>
      </div>

      {loading ? <LoadingBlock rows={6} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}
      {!loading && !error && data && items.length === 0 ? (
        <EmptyBlock title="Sin productos" desc="Ajusta los filtros o crea un producto nuevo." />
      ) : null}

      {!loading && !error && data && items.length > 0 ? (
        <>
          {/* ── Tabla desktop ── */}
          <div className="card-pop hidden overflow-hidden rounded-2xl bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-ink bg-muted/60 [&>th]:font-extrabold [&>th]:text-muted-foreground">
                  <TableHead className="w-16">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Etiquetas</TableHead>
                  <TableHead>Publicado</TableHead>
                  <TableHead className="w-24"><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id} className="border-b border-dashed border-input last:border-0">
                    <TableCell><Thumb src={p.images[0]} alt={p.name} /></TableCell>
                    <TableCell>
                      <p className="max-w-56 truncate text-xs font-bold">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.brand || "—"}
                        {p.hasVariants ? ` · ${p.variants.length} variante(s)` : ""}
                        {!p.active ? " · archivado" : ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs">{p.categoryName}</TableCell>
                    <TableCell>
                      <p className="text-xs font-extrabold tabular-nums">{fmtCOP(p.price)}</p>
                      {p.compareAtPrice ? (
                        <p className="text-[11px] text-muted-foreground line-through tabular-nums">{fmtCOP(p.compareAtPrice)}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-xs font-extrabold tabular-nums ${p.stock <= 5 ? "text-destructive" : ""}`}>{p.stock}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-44 flex-wrap gap-1">
                        {p.isFeatured ? <span className="sticker">Destacado</span> : null}
                        {p.isNew ? <span className="sticker-flat bg-accent">Nuevo</span> : null}
                        {p.prepayEligible ? <span className="sticker-flat bg-success text-success-foreground">−10%</span> : null}
                        {!p.codAvailable ? <span className="sticker-flat bg-muted">solo anticipo</span> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={p.active}
                        onCheckedChange={() => void toggleActive(p)}
                        disabled={busyId === p.id}
                        aria-label={p.active ? `Despublicar ${p.name}` : `Publicar ${p.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" className="border-2 border-ink press-pop" onClick={() => setEditor({ product: p })} aria-label={`Editar ${p.name}`}>
                          <Pencil aria-hidden />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-2 border-ink" aria-label={`Más acciones para ${p.name}`}>
                              <MoreVertical aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-2 border-ink">
                            <DropdownMenuItem onSelect={() => setEditor({ product: p })}>
                              <Pencil aria-hidden /> Editar ficha
                            </DropdownMenuItem>
                            <ConfirmAction
                              render={(open) => (
                                <DropdownMenuItem onSelect={() => open()}>
                                  <Trash2 aria-hidden /> Archivar (despublicar)
                                </DropdownMenuItem>
                              )}
                              title="¿Archivar producto?"
                              desc={`"${p.name}" dejará de publicarse en la tienda.`}
                              confirmLabel="Archivar"
                              onConfirm={() => archiveProduct(p)}
                            />
                            <ConfirmAction
                              render={(open) => (
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => open()}>
                                  <X aria-hidden /> Eliminar definitivamente
                                </DropdownMenuItem>
                              )}
                              title="¿Eliminar definitivamente?"
                              desc="Solo es posible si el producto no tiene pedidos históricos."
                              confirmLabel="Eliminar para siempre"
                              onConfirm={() => hardDeleteProduct(p)}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── Tarjetas móviles ── */}
          <div className="space-y-2 md:hidden">
            {items.map((p) => (
              <div key={p.id} className="card-pop-sm rounded-2xl bg-card p-3">
                <div className="flex gap-3">
                  <Thumb src={p.images[0]} alt={p.name} className="h-14 w-14" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{p.categoryName}{p.brand ? ` · ${p.brand}` : ""}</p>
                    <p className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-extrabold tabular-nums">{fmtCOP(p.price)}</span>
                      <span className={`text-[11px] font-extrabold tabular-nums ${p.stock <= 5 ? "text-destructive" : "text-muted-foreground"}`}>
                        · stock {p.stock}
                      </span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0 self-start border-2 border-ink press-pop" onClick={() => setEditor({ product: p })} aria-label={`Editar ${p.name}`}>
                    <Pencil aria-hidden />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {p.isFeatured ? <span className="sticker">Destacado</span> : null}
                    {p.isNew ? <span className="sticker-flat bg-accent">Nuevo</span> : null}
                    {p.prepayEligible ? <span className="sticker-flat bg-success text-success-foreground">−10%</span> : null}
                    {!p.active ? <span className="sticker-flat bg-muted">archivado</span> : null}
                  </div>
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                    Publicado
                    <Switch checked={p.active} onCheckedChange={() => void toggleActive(p)} disabled={busyId === p.id} aria-label={p.active ? `Despublicar ${p.name}` : `Publicar ${p.name}`} />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <Pager page={data.page} pages={data.pages} total={data.total} onPage={setPage} disabled={loading} />
        </>
      ) : null}

      {editor ? (
        <ProductEditorDialog
          key={editor.product?.id ?? "nuevo"}
          product={editor.product}
          categories={categories}
          onClose={() => setEditor(null)}
          onSaved={refetch}
        />
      ) : null}
    </div>
  );
}
