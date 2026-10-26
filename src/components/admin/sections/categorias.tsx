"use client";

// Sección Categorías — grid de tarjetas con orden, activación, editor y borrado.
// APIs: GET/POST /api/admin/categories, PATCH/DELETE /api/admin/categories/[id].

import { useState } from "react";
import { refreshStorefront } from "../ui";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { ArrowDown, ArrowUp, LayoutGrid, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { categoryIconFallback, icons } from "@/lib/category-icons";
import {
  btnPop, ConfirmAction, EmptyBlock, ErrorBlock, Field, LoadingBlock, PageHeader,
  toastError, useAdminQuery, type AdminCategory,
} from "../ui";

const SUGGESTED_ICONS = [
  "Cpu", "Smartphone", "Sofa", "Shirt", "Footprints", "Sparkles", "HeartPulse", "Dumbbell",
  "PawPrint", "Baby", "Gamepad2", "Watch", "Hammer", "Briefcase", "Plane", "Car",
  "ShoppingBasket", "BadgePercent", "Tag", "Star", "Gift", "Coffee",
];

const SUGGESTED_COLORS = ["#FF5A36", "#00A76F", "#FFB800", "#9333EA", "#0D9488", "#E5399E", "#FF7A59", "#241A12"];

/* ══════════════════════ Editor de categoría ══════════════════════ */

function CategoryEditorDialog({
  category, onClose, onSaved,
}: { category: AdminCategory | null; onClose: () => void; onSaved: () => void }) {
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "Tag");
  const [color, setColor] = useState(category?.color ?? "#FF5A36");
  const [sortOrder, setSortOrder] = useState(category ? String(category.sortOrder) : "");
  const [active, setActive] = useState(category?.active ?? true);

  async function handleSave() {
    const n = name.trim();
    if (n.length < 3) { toast.error("El nombre debe tener al menos 3 caracteres."); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: n,
        description: description.trim(),
        icon,
        color,
        active,
        ...(sortOrder.trim() !== "" ? { sortOrder: Number(sortOrder) } : {}),
        ...(!category && slug.trim() !== "" ? { slug: slug.trim() } : {}),
      };
      if (category) {
        await api.patch(`/api/admin/categories/${category.id}`, body);
        refreshStorefront();
        toast.success("Categoría actualizada.");
      } else {
        await api.post("/api/admin/categories", body);
        refreshStorefront();
        toast.success("Categoría creada.");
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

  const iconChoices = Array.from(new Set([...SUGGESTED_ICONS, icon]));

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto rounded-2xl border-2 border-ink scroll-y sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl font-extrabold">
            {category ? "Editar categoría" : "Nueva categoría"}
          </DialogTitle>
          <DialogDescription>
            {category ? `/${category.slug} · ${category.productCount} producto(s)` : "El slug se genera desde el nombre si lo dejas vacío."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <Field label="Nombre *">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Hogar y cocina" className="rounded-xl border-2 border-input" />
          </Field>
          {!category ? (
            <Field label="Slug" hint="Identificador en la URL (opcional).">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="hogar-y-cocina" className="rounded-xl border-2 border-input" />
            </Field>
          ) : null}
          <Field label="Descripción">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="rounded-xl border-2 border-input" />
          </Field>

          <Field label="Ícono">
            <div className="grid grid-cols-8 gap-1.5 rounded-2xl border-2 border-input bg-card p-2">
              {iconChoices.map((name2) => {
                const Ico = icons[name2] ?? categoryIconFallback;
                return (
                  <button
                    key={name2}
                    type="button"
                    onClick={() => setIcon(name2)}
                    title={name2}
                    aria-label={`Ícono ${name2}`}
                    aria-pressed={icon === name2}
                    className={`grid aspect-square place-items-center rounded-lg border-2 ${icon === name2 ? "border-ink bg-primary text-primary-foreground" : "border-transparent bg-muted hover:border-ink"}`}
                  >
                    <Ico className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Color de acento">
            <div className="flex flex-wrap items-center gap-1.5">
              {SUGGESTED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  aria-pressed={color === c}
                  className={`h-8 w-8 rounded-lg border-2 ${color === c ? "border-ink shadow-[2px_2px_0_var(--shadow-ink)]" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <label className="ml-2 flex cursor-pointer items-center gap-1.5 text-xs font-bold text-muted-foreground">
                Personalizado
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#FF5A36"}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded-lg border-2 border-ink bg-card p-0.5"
                  aria-label="Color personalizado"
                />
              </label>
              <span className="rounded-lg border-2 border-ink bg-muted px-2 py-1 font-mono text-[11px]">{color}</span>
            </div>
          </Field>

          <div className="grid grid-cols-2 items-end gap-3">
            <Field label="Orden" hint="Menor = aparece primero.">
              <Input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} inputMode="numeric" placeholder="auto" className="rounded-xl border-2 border-input" />
            </Field>
            <div className="flex items-center gap-2 pb-1">
              <Switch id="cat-active" checked={active} onCheckedChange={setActive} />
              <Label htmlFor="cat-active" className="cursor-pointer text-xs font-bold">Visible en la tienda</Label>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-5 flex-row items-center gap-2 border-t-2 border-dashed border-input pt-4">
          <Button variant="outline" className="border-2 border-ink press-pop" onClick={() => { setOpen(false); onClose(); }} disabled={saving}>Cancelar</Button>
          <Button className={`sm:ml-auto ${btnPop}`} onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : null} Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════ Grid de categorías ══════════════════════ */

export function CategoriasSection() {
  const { data, loading, error, refetch } = useAdminQuery<{ categories: AdminCategory[] }>("/api/admin/categories");
  const [editor, setEditor] = useState<{ category: AdminCategory | null } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const categories = data?.categories ?? [];

  async function patchCategory(id: string, body: Record<string, unknown>, msg: string) {
    setBusyId(id);
    try {
      await api.patch(`/api/admin/categories/${id}`, body);
      refreshStorefront();
      toast.success(msg);
      refetch();
    } catch (e) {
      toastError(e);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteCategory(c: AdminCategory) {
    await api.delete(`/api/admin/categories/${c.id}`);
    refreshStorefront();
    toast.success(`Categoría "${c.name}" eliminada.`);
    refetch();
  }

  return (
    <div>
      <PageHeader title="Categorías" desc="Organiza el árbol de navegación de la tienda.">
        <Button className={btnPop} onClick={() => setEditor({ category: null })}>
          <Plus aria-hidden /> Nueva categoría
        </Button>
      </PageHeader>

      {loading ? <LoadingBlock rows={6} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}
      {!loading && !error && data && categories.length === 0 ? (
        <EmptyBlock title="Sin categorías" desc="Crea la primera categoría del catálogo." />
      ) : null}

      {categories.length > 0 ? (
        <section aria-label="Listado de categorías" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => {
            const Ico = icons[c.icon] ?? categoryIconFallback;
            return (
              <article key={c.id} className="card-pop-sm flex flex-col rounded-2xl bg-card p-4">
                <div className="flex items-start gap-3">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-ink"
                    style={{ backgroundColor: c.color }}
                    aria-hidden
                  >
                    <Ico className="h-5 w-5 text-white drop-shadow-sm" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display font-extrabold leading-tight">{c.name}</h2>
                    <p className="truncate text-[11px] text-muted-foreground">/{c.slug}</p>
                  </div>
                  <Switch
                    checked={c.active}
                    onCheckedChange={(v) => void patchCategory(c.id, { active: v }, v ? "Categoría visible." : "Categoría oculta.")}
                    disabled={busyId === c.id}
                    aria-label={c.active ? `Ocultar ${c.name}` : `Mostrar ${c.name}`}
                  />
                </div>

                {c.description ? (
                  <p className="mt-2 line-clamp-2 min-h-8 text-xs text-muted-foreground">{c.description}</p>
                ) : (
                  <p className="mt-2 min-h-8 text-xs italic text-muted-foreground/70">Sin descripción</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="sticker-flat bg-muted">{c.productCount} producto(s)</span>
                  {c.subcategories.length > 0 ? (
                    <span className="text-[11px] text-muted-foreground">{c.subcategories.length} subcategoría(s)</span>
                  ) : null}
                  {!c.active ? <span className="sticker-flat bg-destructive text-white">oculta</span> : null}
                  {c.special ? <span className="sticker">especial</span> : null}
                </div>

                <div className="mt-3 flex items-center justify-between border-t-2 border-dashed border-input pt-3">
                  <div className="flex items-center gap-1" aria-label="Orden de la categoría">
                    <Button
                      variant="outline" size="icon" className="h-7 w-7 border-2 border-ink press-pop"
                      onClick={() => void patchCategory(c.id, { sortOrder: c.sortOrder - 1 }, "Orden actualizado.")}
                      disabled={busyId === c.id}
                      aria-label={`Subir orden de ${c.name}`}
                    >
                      <ArrowUp aria-hidden />
                    </Button>
                    <span className="w-7 text-center text-xs font-extrabold tabular-nums" title="Orden actual">{c.sortOrder}</span>
                    <Button
                      variant="outline" size="icon" className="h-7 w-7 border-2 border-ink press-pop"
                      onClick={() => void patchCategory(c.id, { sortOrder: c.sortOrder + 1 }, "Orden actualizado.")}
                      disabled={busyId === c.id}
                      aria-label={`Bajar orden de ${c.name}`}
                    >
                      <ArrowDown aria-hidden />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline" size="sm" className="border-2 border-ink press-pop"
                      onClick={() => setEditor({ category: c })}
                      aria-label={`Editar ${c.name}`}
                    >
                      <Pencil aria-hidden /> Editar
                    </Button>
                    <ConfirmAction
                      render={(open) => (
                        <Button variant="outline" size="sm" className="border-2 border-ink text-destructive press-pop" onClick={open} aria-label={`Eliminar ${c.name}`}>
                          <Trash2 aria-hidden />
                        </Button>
                      )}
                      title="¿Eliminar categoría?"
                      desc={`"${c.name}" se eliminará permanentemente. No es posible si tiene productos asociados.`}
                      confirmLabel="Eliminar"
                      onConfirm={() => deleteCategory(c)}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {loading ? (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <LayoutGrid className="h-4 w-4" aria-hidden /> Cargando categorías…
        </p>
      ) : null}

      {editor ? (
        <CategoryEditorDialog
          key={editor.category?.id ?? "nueva"}
          category={editor.category}
          onClose={() => setEditor(null)}
          onSaved={refetch}
        />
      ) : null}
    </div>
  );
}
