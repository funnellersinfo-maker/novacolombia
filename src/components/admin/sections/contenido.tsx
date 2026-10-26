"use client";

// Sección Contenido — marca, textos de home, banners, colecciones y legales.
// API: GET/PATCH /api/admin/content (upsert por clave).

import { useState } from "react";
import { refreshStorefront } from "../ui";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import {
  FileText, ImagePlus, Loader2, Plus, Save, ScrollText, Trash2, Upload, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { BannerDTO, CollectionDTO } from "@/lib/types";
import {
  btnPop, EmptyBlock, ErrorBlock, Field, LoadingBlock, PageHeader, ProductSearchBox,
  Thumb, toastError, uploadFile, useAdminQuery,
  type BrandConfig, type HomeTextsConfig, type LegalDoc, type SiteContent,
} from "../ui";

type SaveFn = (key: string, value: unknown, msg?: string) => Promise<boolean>;

async function saveKey(key: string, value: unknown, msg: string, refetch: () => void): Promise<boolean> {
  try {
    await api.patch("/api/admin/content", { key, value });
    refreshStorefront();
    toast.success(msg, { description: "Recarga la tienda para ver los cambios." });
    refetch();
    return true;
  } catch (e) {
    toastError(e);
    return false;
  }
}

/* ══════════════════════ Marca ══════════════════════ */

function BrandForm({ initial, onSave }: { initial?: BrandConfig; onSave: SaveFn }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [shortName, setShortName] = useState(initial?.shortName ?? "");
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [supportEmail, setSupportEmail] = useState(initial?.supportEmail ?? "");
  const [supportPhone, setSupportPhone] = useState(initial?.supportPhone ?? "");
  const [guestCheckout, setGuestCheckout] = useState(initial?.guestCheckoutAllowed ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (name.trim().length < 2) { toast.error("El nombre de la marca es obligatorio."); return; }
    setSaving(true);
    await onSave("brand", {
      name: name.trim(),
      shortName: shortName.trim(),
      tagline: tagline.trim(),
      domain: domain.trim(),
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      guestCheckoutAllowed: guestCheckout,
    }, "Datos de marca guardados.");
    setSaving(false);
  }

  return (
    <div className="card-pop rounded-2xl bg-card p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre de la marca">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Nombre corto" hint="Se usa en espacios reducidos.">
          <Input value={shortName} onChange={(e) => setShortName(e.target.value)} className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Eslogan" className="sm:col-span-2">
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Dominio">
          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="novacolombia.co" className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Correo de soporte">
          <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Teléfono de soporte">
          <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} className="rounded-xl border-2 border-input" />
        </Field>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-input p-2.5">
            <Switch checked={guestCheckout} onCheckedChange={setGuestCheckout} aria-label="Compra como invitado" />
            <span className="text-xs font-bold">Permitir compra como invitado</span>
          </label>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button className={btnPop} onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />} Guardar marca
        </Button>
      </div>
    </div>
  );
}

/* ══════════════════════ Home: textos + banners ══════════════════════ */

function HomeTextsForm({ initial, onSave }: { initial?: HomeTextsConfig; onSave: SaveFn }) {
  const [trustTitle, setTrustTitle] = useState(initial?.trustTitle ?? "");
  const [prepayTitle, setPrepayTitle] = useState(initial?.prepayBannerTitle ?? "");
  const [prepayText, setPrepayText] = useState(initial?.prepayBannerText ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave("homeTexts", {
      trustTitle: trustTitle.trim(),
      prepayBannerTitle: prepayTitle.trim(),
      prepayBannerText: prepayText.trim(),
    }, "Textos de la home guardados.");
    setSaving(false);
  }

  return (
    <div className="card-pop rounded-2xl bg-card p-4 sm:p-5">
      <h2 className="font-display font-extrabold">Textos de la home</h2>
      <div className="mt-3 space-y-3">
        <Field label="Título de la franja de confianza">
          <Input value={trustTitle} onChange={(e) => setTrustTitle(e.target.value)} className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Título del banner de pago anticipado">
          <Input value={prepayTitle} onChange={(e) => setPrepayTitle(e.target.value)} className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Texto del banner de pago anticipado">
          <Textarea value={prepayText} onChange={(e) => setPrepayText(e.target.value)} rows={2} className="rounded-xl border-2 border-input" />
        </Field>
      </div>
      <div className="mt-4 flex justify-end">
        <Button className={btnPop} onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />} Guardar textos
        </Button>
      </div>
    </div>
  );
}

function BannersForm({ initial, onSave }: { initial?: BannerDTO[]; onSave: SaveFn }) {
  const [banners, setBanners] = useState<BannerDTO[]>((initial ?? []).map((b) => ({ ...b })));
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  function update(id: string, patch: Partial<BannerDTO>) {
    setBanners((s) => s.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  async function handleUpload(id: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingId(id);
    try {
      const url = await uploadFile(files[0]);
      update(id, { image: url });
      toast.success("Imagen del banner subida.");
    } catch (e) {
      toastError(e, "Subiendo");
    } finally {
      setUploadingId(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    await onSave("banners", banners, "Banners guardados.");
    setSaving(false);
  }

  return (
    <div className="card-pop rounded-2xl bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display font-extrabold">Carrusel de banners ({banners.length})</h2>
        <Button
          variant="outline" size="sm" className="border-2 border-ink press-pop"
          onClick={() =>
            setBanners((s) => [
              ...s,
              {
                id: `hero-${Date.now().toString(36)}`,
                title: "Nuevo banner",
                subtitle: "",
                ctaText: "Ver más",
                ctaLink: "#/",
                image: "/images/hero-main.png",
                active: false,
                order: s.length + 1,
              },
            ])
          }
        >
          <Plus aria-hidden /> Agregar banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-input p-6 text-center">
          <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden />
          <p className="mt-2 text-xs text-muted-foreground">Sin banners: agrega uno para el carrusel de la home.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {banners.map((b) => (
            <li key={b.id} className="rounded-2xl border-2 border-input bg-card p-3">
              <div className="flex items-start gap-3">
                <Thumb src={b.image} alt={`Banner ${b.title}`} className="h-16 w-24" />
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                  <Field label="Título">
                    <Input value={b.title} onChange={(e) => update(b.id, { title: e.target.value })} className="rounded-xl border-2 border-input" />
                  </Field>
                  <Field label="Texto del botón">
                    <Input value={b.ctaText} onChange={(e) => update(b.id, { ctaText: e.target.value })} className="rounded-xl border-2 border-input" />
                  </Field>
                  <Field label="Subtítulo" className="sm:col-span-2">
                    <Input value={b.subtitle} onChange={(e) => update(b.id, { subtitle: e.target.value })} className="rounded-xl border-2 border-input" />
                  </Field>
                  <Field label="Enlace del botón (hash)">
                    <Input value={b.ctaLink} onChange={(e) => update(b.id, { ctaLink: e.target.value })} placeholder="#/c/ofertas" className="rounded-xl border-2 border-input" />
                  </Field>
                  <Field label="Imagen (URL)">
                    <div className="flex gap-1.5">
                      <Input value={b.image} onChange={(e) => update(b.id, { image: e.target.value })} className="rounded-xl border-2 border-input text-xs" />
                      <label
                        className={`inline-flex h-9 shrink-0 cursor-pointer items-center rounded-xl border-2 border-ink bg-muted px-2.5 press-pop ${uploadingId === b.id ? "pointer-events-none opacity-60" : ""}`}
                        title="Subir imagen"
                      >
                        {uploadingId === b.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
                        <span className="sr-only">Subir imagen para {b.title}</span>
                        <input
                          type="file" accept="image/*" className="sr-only"
                          onChange={(e) => { void handleUpload(b.id, e.target.files); e.currentTarget.value = ""; }}
                        />
                      </label>
                    </div>
                  </Field>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-input pt-2">
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold">
                    <Switch checked={b.active} onCheckedChange={(v) => update(b.id, { active: v })} aria-label={`Activar ${b.title}`} />
                    {b.active ? "Activo" : "Oculto"}
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    Orden
                    <Input
                      value={String(b.order)} inputMode="numeric"
                      onChange={(e) => update(b.id, { order: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                      className="h-8 w-16 rounded-lg border-2 border-input text-center"
                      aria-label={`Orden de ${b.title}`}
                    />
                  </label>
                </div>
                <Button
                  variant="outline" size="sm" className="border-2 border-ink text-destructive press-pop"
                  onClick={() => setBanners((s) => s.filter((x) => x.id !== b.id))}
                >
                  <Trash2 aria-hidden /> Quitar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-end">
        <Button className={btnPop} onClick={() => void handleSave()} disabled={saving || uploadingId !== null}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />} Guardar banners
        </Button>
      </div>
    </div>
  );
}

/* ══════════════════════ Colecciones ══════════════════════ */

function CollectionsForm({ initial, onSave }: { initial?: CollectionDTO[]; onSave: SaveFn }) {
  const [collections, setCollections] = useState<CollectionDTO[]>((initial ?? []).map((c) => ({ ...c })));
  const [saving, setSaving] = useState(false);

  function update(slug: string, patch: Partial<CollectionDTO>) {
    setCollections((s) => s.map((c) => (c.slug === slug ? { ...c, ...patch } : c)));
  }

  async function handleSave() {
    if (collections.some((c) => !c.slug.trim() || !c.name.trim())) {
      toast.error("Cada colección necesita slug y nombre.");
      return;
    }
    const slugs = collections.map((c) => c.slug.trim());
    if (new Set(slugs).size !== slugs.length) {
      toast.error("Hay slugs de colección duplicados.");
      return;
    }
    setSaving(true);
    await onSave("collections", collections, "Colecciones guardadas.");
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      <div className="card-pop rounded-2xl bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-extrabold">Colecciones ({collections.length})</h2>
          <Button
            variant="outline" size="sm" className="border-2 border-ink press-pop"
            onClick={() =>
              setCollections((s) => [
                ...s,
                { slug: `coleccion-${Date.now().toString(36)}`, name: "Nueva colección", description: "", color: "#FF5A36", productSlugs: [] },
              ])
            }
          >
            <Plus aria-hidden /> Agregar colección
          </Button>
        </div>

        {collections.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Sin colecciones editoriales.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {collections.map((c) => (
              <li key={c.slug} className="rounded-2xl border-2 border-input bg-card p-3">
                <div className="grid gap-2 sm:grid-cols-[1.2fr_1.6fr]">
                  <div className="space-y-2">
                    <Field label="Nombre">
                      <Input value={c.name} onChange={(e) => update(c.slug, { name: e.target.value })} className="rounded-xl border-2 border-input" />
                    </Field>
                    <Field label="Slug (identificador)">
                      <Input value={c.slug} onChange={(e) => update(c.slug, { slug: e.target.value.trim() })} className="rounded-xl border-2 border-input font-mono text-xs" />
                    </Field>
                    <Field label="Color">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={/^#[0-9a-fA-F]{6}$/.test(c.color) ? c.color : "#FF5A36"}
                          onChange={(e) => update(c.slug, { color: e.target.value })}
                          className="h-9 w-12 cursor-pointer rounded-lg border-2 border-ink bg-card p-0.5"
                          aria-label={`Color de ${c.name}`}
                        />
                        <span className="rounded-lg border-2 border-ink bg-muted px-2 py-1 font-mono text-[11px]">{c.color}</span>
                      </div>
                    </Field>
                  </div>
                  <div className="space-y-2">
                    <Field label="Descripción">
                      <Textarea value={c.description} onChange={(e) => update(c.slug, { description: e.target.value })} rows={2} className="rounded-xl border-2 border-input" />
                    </Field>
                    <Field label={`Productos (${c.productSlugs.length})`}>
                      {c.productSlugs.length ? (
                        <ul className="mb-2 flex flex-wrap gap-1.5">
                          {c.productSlugs.map((slug) => (
                            <li key={slug}>
                              <button
                                type="button"
                                onClick={() => update(c.slug, { productSlugs: c.productSlugs.filter((s) => s !== slug) })}
                                className="sticker-flat bg-muted hover:bg-destructive hover:text-white"
                                title="Quitar de la colección"
                                aria-label={`Quitar ${slug}`}
                              >
                                {slug} <X className="h-3 w-3" aria-hidden />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mb-2 text-xs italic text-muted-foreground/70">Sin productos asignados.</p>
                      )}
                      <ProductSearchBox
                        onPick={(p) => {
                          if (c.productSlugs.includes(p.slug)) { toast.info("Ese producto ya está en la colección."); return; }
                          update(c.slug, { productSlugs: [...c.productSlugs, p.slug] });
                        }}
                        placeholder="Buscar producto para agregar…"
                      />
                    </Field>
                  </div>
                </div>
                <div className="mt-2 flex justify-end border-t-2 border-dashed border-input pt-2">
                  <Button
                    variant="outline" size="sm" className="border-2 border-ink text-destructive press-pop"
                    onClick={() => setCollections((s) => s.filter((x) => x.slug !== c.slug))}
                  >
                    <Trash2 aria-hidden /> Quitar colección
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex justify-end">
          <Button className={btnPop} onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />} Guardar colecciones
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ Legales ══════════════════════ */

function LegalDocEditor({
  slug, doc, index, onSave,
}: { slug: string; doc: LegalDoc | null; index: { slug: string; title: string }[]; onSave: SaveFn }) {
  const [title, setTitle] = useState(doc?.title ?? index.find((d) => d.slug === slug)?.title ?? "");
  const [body, setBody] = useState(doc?.body ?? "");
  const [saving, setSaving] = useState(false);
  const indexTitle = index.find((d) => d.slug === slug)?.title ?? "";

  async function handleSave() {
    if (title.trim().length < 3) { toast.error("El título es obligatorio."); return; }
    setSaving(true);
    const ok = await onSave(`legal:${slug}`, { title: title.trim(), body }, "Documento legal guardado.");
    if (ok && title.trim() !== indexTitle) {
      await onSave(
        "legalIndex",
        index.map((d) => (d.slug === slug ? { slug, title: title.trim() } : d)),
        "Índice legal actualizado."
      );
    }
    setSaving(false);
  }

  return (
    <div className="card-pop rounded-2xl bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display font-extrabold">
          <ScrollText className="mr-1.5 inline h-5 w-5 text-primary" aria-hidden />
          /{slug}
        </h2>
        <span className="text-xs text-muted-foreground">Markdown admitido (negritas, listas, títulos)</span>
      </div>
      <div className="mt-3 space-y-3">
        <Field label="Título del documento">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border-2 border-input" />
        </Field>
        <Field label="Cuerpo (markdown)">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="rounded-xl border-2 border-input font-mono text-xs leading-relaxed"
          />
        </Field>
      </div>
      <div className="mt-4 flex justify-end">
        <Button className={btnPop} onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />} Guardar documento
        </Button>
      </div>
    </div>
  );
}

function LegalesTab({ content, onSave }: { content: SiteContent; onSave: SaveFn }) {
  const legalIndex = content.legalIndex ?? [];
  const [slug, setSlug] = useState(legalIndex[0]?.slug ?? "");
  const doc = (content[`legal:${slug}`] as LegalDoc | undefined) ?? null;

  if (legalIndex.length === 0) {
    return <EmptyBlock title="Sin documentos legales" desc="No hay documentos en el índice legal." />;
  }

  return (
    <div className="space-y-3">
      <div className="card-pop-sm rounded-2xl bg-card p-3">
        <Field label="Documento">
          <Select value={slug} onValueChange={setSlug}>
            <SelectTrigger className="w-full rounded-xl border-2 border-input sm:max-w-md" aria-label="Selecciona documento legal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {legalIndex.map((d) => (
                <SelectItem key={d.slug} value={d.slug}>{d.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      {slug ? (
        <LegalDocEditor key={slug} slug={slug} doc={doc} index={legalIndex} onSave={onSave} />
      ) : null}
    </div>
  );
}

/* ══════════════════════ Sección ══════════════════════ */

export function ContenidoSection() {
  const { data, loading, error, refetch } = useAdminQuery<{ content: SiteContent }>("/api/admin/content");
  const content = data?.content;

  const onSave: SaveFn = (key, value, msg) => saveKey(key, value, msg ?? "Contenido guardado.", refetch);

  return (
    <div>
      <PageHeader title="Contenido" desc="Marca, textos de la home, banners, colecciones y documentos legales.">
        <span className="sticker-flat bg-muted flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" aria-hidden /> Se aplica al recargar
        </span>
      </PageHeader>

      {loading ? <LoadingBlock rows={5} /> : null}
      {!loading && error ? <ErrorBlock message={error} onRetry={refetch} /> : null}

      {!loading && !error && content ? (
        <Tabs defaultValue="marca">
          <TabsList className="w-full justify-start overflow-x-auto rounded-xl border-2 border-ink bg-muted p-1 no-scrollbar">
            <TabsTrigger value="marca" className="rounded-lg text-xs font-extrabold">Marca</TabsTrigger>
            <TabsTrigger value="home" className="rounded-lg text-xs font-extrabold">Home</TabsTrigger>
            <TabsTrigger value="colecciones" className="rounded-lg text-xs font-extrabold">Colecciones</TabsTrigger>
            <TabsTrigger value="legales" className="rounded-lg text-xs font-extrabold">Legales</TabsTrigger>
          </TabsList>

          <TabsContent value="marca" className="mt-4">
            <BrandForm initial={content.brand} onSave={onSave} />
          </TabsContent>

          <TabsContent value="home" className="mt-4 space-y-4">
            <HomeTextsForm initial={content.homeTexts} onSave={onSave} />
            <BannersForm initial={content.banners} onSave={onSave} />
          </TabsContent>

          <TabsContent value="colecciones" className="mt-4">
            <CollectionsForm initial={content.collections} onSave={onSave} />
          </TabsContent>

          <TabsContent value="legales" className="mt-4">
            <LegalesTab content={content} onSave={onSave} />
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
