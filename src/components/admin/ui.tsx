"use client";

// Helpers compartidos del panel administrativo NOVA — Task 7-b
// Tipos de las APIs admin, hook de consulta, estados de carga/error, badges,
// paginación, confirmaciones destructivas y buscador de productos.

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { api, ApiError } from "@/lib/client-api";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox, Loader2, Plus,
  RefreshCw, Search, TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, SHIPMENT_STATUS_LABELS } from "@/lib/format";
import type { BannerDTO, CategoryDTO, CollectionDTO, ProductDTO, StoreBootstrapDTO } from "@/lib/types";

/* ─────────────────────────── Tipos de las APIs admin ─────────────────────────── */

export type AdminProduct = ProductDTO & { active: boolean };
export type AdminCategory = CategoryDTO;

export type AdminStats = {
  ordersToday: number;
  ordersWeek: number;
  revenueWeek: number;
  pendingOrders: number;
  codPending: number;
  prepayPending: number;
  userCount: number;
  productCount: number;
  lowStock: { id: string; name: string; stock: number; slug: string }[];
  topProducts: { name: string; quantity: number }[];
  statusGroups: { status: string; count: number }[];
  prepayDiscountTotal: number;
};

export type AdminOrderItem = {
  id: string;
  name: string;
  variantLabel: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  lineDiscount: number;
};

export type AdminOrderHistoryEntry = { id: string; from: string; to: string; note: string; createdAt: string };

export type AdminOrder = {
  id: string;
  number: string;
  status: string;
  paymentMethod: "PREPAID" | "COD";
  paymentStatus: string;
  customerName: string;
  phone: string;
  email: string | null;
  departamento: string;
  ciudad: string;
  direccion: string;
  complemento: string | null;
  indicaciones: string | null;
  subtotal: number;
  prepayDiscount: number;
  shippingCost: number;
  total: number;
  etaMin: number | null;
  etaMax: number | null;
  createdAt: string;
  items: AdminOrderItem[];
  history: AdminOrderHistoryEntry[];
  shipment: {
    carrierCode: string;
    carrierName: string;
    trackingNumber: string;
    status: string;
    incidents: string; // JSON [{at, note}]
  } | null;
  payment: { status: string; reference: string; provider: string } | null;
};

export type AdminCarrier = {
  code: string;
  name: string;
  supportsCod: boolean;
  integration: string;
  notes: string;
  active: boolean;
};

export type AdminZone = {
  id: string;
  departamento: string;
  ciudad: string;
  price: number;
  etaMin: number;
  etaMax: number;
  codAvailable: boolean;
  active: boolean;
};

export type AdminPromotion = {
  id: string;
  code: string;
  name: string;
  type: string;
  active: boolean;
  percent: number | null;
  minSubtotal: number | null;
  maxDiscount: number | null;
  startsAt: string | null;
  endsAt: string | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  config: { excludedProductIds?: string[] };
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "CUSTOMER";
  active: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
};

export type AdminAuditLog = {
  id: string;
  userName: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId: string;
  detail: string;
  createdAt: string;
};

export type LegalDoc = { title: string; body: string };

export type SiteContent = {
  brand?: StoreBootstrapDTO["brand"];
  homeTexts?: StoreBootstrapDTO["homeTexts"];
  banners?: BannerDTO[];
  collections?: CollectionDTO[];
  legalIndex?: { slug: string; title: string }[];
} & Record<string, unknown>;

export type BrandConfig = StoreBootstrapDTO["brand"];
export type HomeTextsConfig = StoreBootstrapDTO["homeTexts"];

export type Paginated<T> = { total: number; page: number; pages: number } & T;

/* ─────────────────────────── Errores ─────────────────────────── */

export function errText(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return "Ocurrió un error inesperado.";
}

export function toastError(e: unknown, prefix?: string): void {
  const m = errText(e);
  toast.error(prefix ? `${prefix}: ${m}` : m);
}

/* ─────────────────────────── Hook de consulta ─────────────────────────── */
// Evita setState síncrono dentro del cuerpo del useEffect (regla
// react-hooks/set-state-in-effect): todas las transiciones ocurren dentro de
// callbacks asíncronos y el estado de "cargando" se deriva comparando el path.

export function useAdminQuery<T>(path: string | null) {
  const [state, setState] = useState<{ path: string | null; data: T | null; error: string | null; stamp: number }>({
    path: null, data: null, error: null, stamp: 0,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) return;
    let alive = true;
    api
      .get<T>(path)
      .then((data) => { if (alive) setState({ path, data, error: null, stamp: Date.now() }); })
      .catch((e: unknown) => { if (alive) setState({ path, data: null, error: errText(e), stamp: Date.now() }); });
    return () => { alive = false; };
  }, [path, tick]);

  const loading = path !== null && (state.path !== path || state.stamp === 0);
  return {
    data: state.path === path ? state.data : null,
    error: state.path === path ? state.error : null,
    loading,
    stamp: state.stamp,
    refetch: useCallback(() => setTick((t) => t + 1), []),
  };
}

export function useDebounced<T>(value: T, ms = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/* ─────────────────────────── Clases de botones ─────────────────────────── */

export const btnPop =
  "border-2 border-ink bg-primary text-primary-foreground shadow-[4px_4px_0_var(--shadow-ink)] press-pop hover:bg-primary/90";
export const btnPopGhost =
  "border-2 border-ink bg-card text-foreground shadow-[3px_3px_0_var(--shadow-ink)] press-pop hover:bg-muted";
export const btnPopDanger =
  "border-2 border-ink bg-destructive text-white shadow-[3px_3px_0_var(--shadow-ink)] press-pop hover:opacity-90";

/* ─────────────────────────── Cabecera de sección ─────────────────────────── */

export function PageHeader({ title, desc, children }: { title: ReactNode; desc?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-extrabold">
          <span className="marker-title">{title}</span>
        </h1>
        {desc ? <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

/* ─────────────────────────── Estados de carga / error / vacío ─────────────────────────── */

export function LoadingBlock({ rows = 5, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-2.5 ${className}`} role="status" aria-label="Cargando datos">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card-pop rounded-2xl bg-card p-8 text-center">
      <TriangleAlert className="mx-auto h-10 w-10 text-destructive" aria-hidden />
      <p className="mt-3 font-display text-lg font-extrabold">No pudimos cargar los datos</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button onClick={onRetry} className={`mt-5 ${btnPopGhost}`}>
          <RefreshCw aria-hidden /> Reintentar
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyBlock({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="card-pop rounded-2xl bg-card p-8 text-center">
      <Inbox className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
      <p className="mt-3 font-display text-lg font-extrabold">{title}</p>
      {desc ? <p className="mt-1 text-sm text-muted-foreground">{desc}</p> : null}
    </div>
  );
}

/* ─────────────────────────── Paginación ─────────────────────────── */

export function Pager({
  page, pages, total, onPage, disabled,
}: { page: number; pages: number; total?: number; onPage: (p: number) => void; disabled?: boolean }) {
  if (pages <= 1) {
    return total != null ? <p className="px-1 pt-3 text-xs text-muted-foreground">{total} resultado(s)</p> : null;
  }
  const btn = "border-2 border-ink bg-card press-pop disabled:opacity-40";
  return (
    <nav className="mt-4 flex flex-wrap items-center justify-between gap-2" aria-label="Paginación">
      <p className="text-xs text-muted-foreground">
        {total != null ? `${total} resultado(s) · ` : ""}Página {page} de {pages}
      </p>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="icon" className={btn} disabled={page <= 1 || disabled} onClick={() => onPage(1)} aria-label="Primera página">
          <ChevronsLeft aria-hidden />
        </Button>
        <Button variant="outline" size="icon" className={btn} disabled={page <= 1 || disabled} onClick={() => onPage(page - 1)} aria-label="Página anterior">
          <ChevronLeft aria-hidden />
        </Button>
        <span className="rounded-xl border-2 border-ink bg-muted px-3 py-1 text-xs font-extrabold tabular-nums">{page}</span>
        <Button variant="outline" size="icon" className={btn} disabled={page >= pages || disabled} onClick={() => onPage(page + 1)} aria-label="Página siguiente">
          <ChevronRight aria-hidden />
        </Button>
        <Button variant="outline" size="icon" className={btn} disabled={page >= pages || disabled} onClick={() => onPage(pages)} aria-label="Última página">
          <ChevronsRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}

/* ─────────────────────────── Badges de estado ─────────────────────────── */

const ORDER_STATUS_TONES: Record<string, string> = {
  PENDING_PAYMENT: "bg-muted",
  PENDING: "bg-accent",
  CONFIRMED: "bg-accent",
  PREPARING: "bg-secondary text-secondary-foreground",
  SHIPPED: "bg-secondary text-secondary-foreground",
  DELIVERED: "bg-success text-success-foreground",
  CANCELLED: "bg-destructive text-white",
  PAYMENT_REJECTED: "bg-destructive text-white",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return <span className={`sticker-flat ${ORDER_STATUS_TONES[status] ?? "bg-muted"}`}>{ORDER_STATUS_LABELS[status] ?? status}</span>;
}

const PAYMENT_STATUS_TONES: Record<string, string> = {
  PENDING: "bg-muted",
  APPROVED: "bg-success text-success-foreground",
  REJECTED: "bg-destructive text-white",
  COD_PENDING: "bg-accent",
  COD_COLLECTED: "bg-success text-success-foreground",
  REFUNDED: "bg-secondary text-secondary-foreground",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  return <span className={`sticker-flat ${PAYMENT_STATUS_TONES[status] ?? "bg-muted"}`}>{PAYMENT_STATUS_LABELS[status] ?? status}</span>;
}

export function MethodBadge({ method }: { method: string }) {
  return method === "PREPAID" ? (
    <span className="sticker">Anticipado</span>
  ) : (
    <span className="sticker-flat bg-muted">Contraentrega</span>
  );
}

export function ShipmentStatusBadge({ status }: { status: string }) {
  return <span className="sticker-flat bg-secondary text-secondary-foreground">{SHIPMENT_STATUS_LABELS[status] ?? status}</span>;
}

/* ─────────────────────────── Campos de formulario ─────────────────────────── */

export function Field({ label, hint, children, className = "" }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <span className="block text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

/* ─────────────────────────── Confirmación destructiva ─────────────────────────── */

export function ConfirmAction({
  render, title, desc, confirmLabel = "Confirmar", cancelLabel = "Cancelar", danger = true, onConfirm,
}: {
  render: (open: () => void) => ReactNode;
  title: string;
  desc?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (e) {
      toastError(e);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {render(() => setOpen(true))}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-2xl border-2 border-ink">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-extrabold">{title}</AlertDialogTitle>
            {desc ? <AlertDialogDescription>{desc}</AlertDialogDescription> : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending} className="border-2 border-ink press-pop">{cancelLabel}</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => { e.preventDefault(); void handleConfirm(); }}
              className={danger ? "border-2 border-ink bg-destructive text-white press-pop" : "border-2 border-ink bg-primary text-primary-foreground press-pop"}
            >
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ─────────────────────────── Miniaturas ─────────────────────────── */

export function Thumb({ src, alt, className = "h-11 w-11" }: { src?: string; alt: string; className?: string }) {
  return (
    <img
      src={src || "/images/placeholder-product.png"}
      alt={alt}
      className={`shrink-0 rounded-lg border-2 border-ink bg-muted object-cover ${className}`}
      loading="lazy"
    />
  );
}

/* ─────────────────────────── Subida de archivos ─────────────────────────── */

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form, credentials: "same-origin" });
  let data: { url?: string; error?: string } | null = null;
  try {
    data = (await res.json()) as { url?: string; error?: string } | null;
  } catch {
    /* respuesta vacía */
  }
  if (!res.ok || !data?.url) throw new Error(data?.error ?? `Error subiendo archivo (${res.status})`);
  return data.url;
}

/* ─────────────────────────── Buscador de productos ─────────────────────────── */

export function ProductSearchBox({
  onPick, placeholder = "Buscar producto por nombre o marca…",
}: { onPick: (p: AdminProduct) => void; placeholder?: string }) {
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 300);
  const trimmed = dq.trim();
  const { data, loading } = useAdminQuery<{ items: AdminProduct[] }>(
    trimmed.length >= 2 ? `/api/admin/products?q=${encodeURIComponent(trimmed)}&includeInactive=1&perPage=6` : null
  );

  function pick(p: AdminProduct) {
    onPick(p);
    setQ("");
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="rounded-xl border-2 border-input pl-9"
          aria-label={placeholder}
        />
        {loading ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden /> : null}
      </div>
      {trimmed.length >= 2 && data ? (
        data.items.length ? (
          <ul className="max-h-56 space-y-1 overflow-y-auto scroll-y rounded-xl border-2 border-ink bg-card p-1.5">
            {data.items.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => pick(p)}
                  className="flex w-full items-center gap-2.5 rounded-lg border-2 border-transparent p-1.5 text-left hover:border-ink hover:bg-muted"
                >
                  <Thumb src={p.images[0]} alt={p.name} className="h-9 w-9" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">{p.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {p.brand || "Sin marca"} · {p.categoryName}
                    </span>
                  </span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border-2 border-dashed border-input p-2 text-center text-xs text-muted-foreground">
            Sin resultados para “{trimmed}”.
          </p>
        )
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Utilidades varias ─────────────────────────── */

export function parseIncidents(raw: string | undefined | null): { at: string; note: string }[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? (v as { at: string; note: string }[]) : [];
  } catch {
    return [];
  }
}

export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function numOr(s: string, fallback: number): number {
  const n = Number(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

/* ─────────────────── Sincronización con la tienda ─────────────────── */
// Tras mutaciones de admin que afectan el storefront (categorías, contenido,
// productos, promociones) hay que refrescar el bootstrap de la SPA.
import { useApp } from "@/store/app";

export function refreshStorefront() {
  void useApp.getState().refreshBootstrap();
}
