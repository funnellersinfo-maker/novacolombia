"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogIn, UserPlus, Loader2, LogOut, Package, Heart, MapPin, Settings, ShieldCheck, Trash2, Plus, Star,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { fmtCOP, fmtDate, ORDER_STATUS_LABELS } from "@/lib/format";
import type { ProductDTO } from "@/lib/types";
import { useApp } from "@/store/app";
import { ProductGrid } from "./product-card";
import { cn } from "@/lib/utils";

type AccountOrder = {
  id: string;
  number: string;
  status: string;
  paymentMethod: string;
  total: number;
  ciudad: string;
  createdAt: string;
  itemCount: number;
  items: { id: string; name: string; image: string; quantity: number; variantLabel: string; lineSubtotal: number }[];
};

type AddressDTO = {
  id: string;
  label: string;
  name: string;
  phone: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  complemento: string | null;
  isDefault: boolean;
};

/* ── Autenticación ── */
function AuthForms() {
  const { login, register } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("¡Bienvenido de vuelta!");
      } else {
        await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
        toast.success("¡Cuenta creada! Ya puedes comprar más rápido.");
      }
      router.refresh();
      window.location.hash = "#/cuenta";
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
        if ("fieldErrors" in err) {
          const fe = (err as { fieldErrors?: Record<string, string> }).fieldErrors ?? {};
          setErrors(fe);
        }
      } else toast.error("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const field = (k: keyof typeof form, label: string, type = "text", required = true) => (
    <div>
      <label htmlFor={`auth-${k}`} className="text-xs font-extrabold uppercase text-muted-foreground">{label}</label>
      <input
        id={`auth-${k}`}
        type={type}
        value={form[k]}
        onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
        className={cn(
          "mt-1 w-full h-11 rounded-xl border-2 bg-card px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          errors[k] ? "border-destructive" : "border-ink"
        )}
        required={required}
        autoComplete={k === "password" ? "current-password" : k === "email" ? "email" : k === "name" ? "name" : "tel"}
      />
      {errors[k] && <p className="text-xs text-destructive font-semibold mt-1">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-3xl card-pop bg-card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setErrors({}); }}
              className={cn(
                "rounded-lg py-2 text-sm font-extrabold transition-colors",
                mode === m ? "bg-ink text-background" : "hover:bg-background/50"
              )}
            >
              {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && field("name", "Nombre completo")}
          {field("email", "Correo electrónico", "email")}
          {mode === "register" && field("phone", "Teléfono (opcional)", "tel", false)}
          {field("password", mode === "login" ? "Contraseña" : "Contraseña (mín. 8 caracteres)", "password")}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-primary text-primary-foreground py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {mode === "login" ? "Entrar" : "Crear mi cuenta"}
          </button>
        </form>

        <div className="text-xs text-muted-foreground text-center leading-relaxed">
          <p className="font-bold">¿Primera vez comprando?</p>
          También puedes comprar como invitado desde el carrito — solo te pediremos los datos de entrega.
        </div>

        <details className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          <summary className="font-bold cursor-pointer">Cuentas de demostración</summary>
          <p className="mt-1.5 font-mono">cliente@ejemplo.co · Cliente2025*</p>
          <p className="font-mono">admin@novacolombia.co · NovaAdmin2025* (panel admin)</p>
        </details>
      </div>
    </div>
  );
}

/* ── Pedidos ── */
function OrdersSection() {
  const [orders, setOrders] = useState<AccountOrder[] | null>(null);
  useEffect(() => {
    api
      .get<{ orders: AccountOrder[] }>("/api/account/orders")
      .then((r) => setOrders(r.orders))
      .catch(() => setOrders([]));
  }, []);

  if (!orders) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}</div>;
  if (!orders.length)
    return (
      <div className="text-center py-10">
        <Package className="w-10 h-10 mx-auto text-muted-foreground" />
        <p className="font-bold mt-3">Aún no tienes pedidos</p>
        <a href="#/" className="text-sm font-bold text-primary hover:underline mt-2 inline-block">Empieza a comprar →</a>
      </div>
    );

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id} className="rounded-2xl card-pop bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono font-extrabold text-sm">{o.number}</p>
              <p className="text-xs text-muted-foreground">{fmtDate(o.createdAt)} · {o.itemCount} artículos · {o.ciudad}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="sticker-flat bg-accent">{ORDER_STATUS_LABELS[o.status] ?? o.status}</span>
              <a
                href={`#/seguimiento/${o.number}`}
                className="rounded-lg border-2 border-ink bg-secondary px-3 py-1 text-xs font-extrabold press-pop"
              >
                Ver detalle
              </a>
            </div>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {o.items.slice(0, 6).map((i) => (
              <img key={i.id} src={i.image} alt={i.name} title={i.name} className="w-12 h-12 rounded-lg object-cover border-2 border-ink shrink-0" loading="lazy" />
            ))}
          </div>
          <p className="text-right font-display font-extrabold mt-2">{fmtCOP(o.total)}</p>
        </li>
      ))}
    </ul>
  );
}

/* ── Favoritos ── */
function FavoritesSection() {
  const [products, setProducts] = useState<ProductDTO[] | null>(null);
  useEffect(() => {
    api
      .get<{ products: ProductDTO[] }>("/api/account/favorites")
      .then((r) => setProducts(r.products))
      .catch(() => setProducts([]));
  }, []);

  if (!products) return <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[3/4] rounded-2xl shimmer" />)}</div>;
  if (!products.length)
    return (
      <div className="text-center py-10">
        <Heart className="w-10 h-10 mx-auto text-muted-foreground" />
        <p className="font-bold mt-3">Tus favoritos aparecerán aquí</p>
        <p className="text-sm text-muted-foreground">Toca el corazón en cualquier producto para guardarlo.</p>
      </div>
    );
  return <ProductGrid products={products} />;
}

/* ── Direcciones ── */
function AddressesSection() {
  const [addresses, setAddresses] = useState<AddressDTO[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "", name: "", phone: "", departamento: "", ciudad: "", direccion: "", complemento: "" });
  const { bootstrap } = useApp();

  const load = () => api.get<{ addresses: AddressDTO[] }>("/api/account/addresses").then((r) => setAddresses(r.addresses)).catch(() => setAddresses([]));
  useEffect(() => { void load(); }, []);

  const cities = bootstrap?.locations.find((l) => l.departamento === form.departamento)?.ciudades ?? [];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/account/addresses", form);
      toast.success("Dirección guardada");
      setAdding(false);
      setForm({ label: "", name: "", phone: "", departamento: "", ciudad: "", direccion: "", complemento: "" });
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    }
  };

  return (
    <div className="space-y-3">
      {addresses == null && <div className="h-20 rounded-2xl shimmer" />}
      {addresses?.map((a) => (
        <div key={a.id} className="rounded-2xl card-pop bg-card p-4 flex items-start gap-3">
          <MapPin className="w-5 h-5 mt-0.5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm flex items-center gap-2">
              {a.label} {a.isDefault && <span className="sticker-flat bg-accent">Predeterminada</span>}
            </p>
            <p className="text-sm text-muted-foreground">{a.direccion}{a.complemento ? `, ${a.complemento}` : ""}</p>
            <p className="text-xs text-muted-foreground">{a.ciudad}, {a.departamento} · {a.name} · {a.phone}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {!a.isDefault && (
              <button
                onClick={async () => {
                  await api.patch("/api/account/addresses", { id: a.id, isDefault: true }).catch(() => null);
                  void load();
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                <Star className="w-3.5 h-3.5 inline" /> Predeterminar
              </button>
            )}
            <button
              onClick={async () => {
                await api.delete(`/api/account/addresses?id=${a.id}`).catch(() => null);
                toast.success("Dirección eliminada");
                void load();
              }}
              className="text-xs font-bold text-destructive hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5 inline" /> Eliminar
            </button>
          </div>
        </div>
      ))}

      {adding ? (
        <form onSubmit={save} className="rounded-2xl card-pop bg-card p-4 grid sm:grid-cols-2 gap-3">
          <input placeholder="Etiqueta (Casa, Oficina…)" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="h-11 rounded-xl border-2 border-ink bg-card px-3 text-sm" />
          <input placeholder="Nombre de quien recibe *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="h-11 rounded-xl border-2 border-ink bg-card px-3 text-sm" required />
          <input placeholder="Teléfono *" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="h-11 rounded-xl border-2 border-ink bg-card px-3 text-sm" inputMode="tel" required />
          <select value={form.departamento} onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value, ciudad: "" }))} className="h-11 rounded-xl border-2 border-ink bg-card px-3 text-sm" required>
            <option value="">Departamento *</option>
            {(bootstrap?.locations ?? []).map((l) => <option key={l.departamento} value={l.departamento}>{l.departamento}</option>)}
          </select>
          <select value={form.ciudad} onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))} className="h-11 rounded-xl border-2 border-ink bg-card px-3 text-sm" required disabled={!form.departamento}>
            <option value="">Ciudad *</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="Dirección *" value={form.direccion} onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))} className="h-11 rounded-xl border-2 border-ink bg-card px-3 text-sm sm:col-span-2" required />
          <input placeholder="Complemento (opcional)" value={form.complemento} onChange={(e) => setForm((f) => ({ ...f, complemento: e.target.value }))} className="h-11 rounded-xl border-2 border-ink bg-card px-3 text-sm sm:col-span-2" />
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setAdding(false)} className="rounded-xl border-2 border-ink bg-muted px-4 py-2 text-sm font-bold">Cancelar</button>
            <button type="submit" className="rounded-xl border-2 border-ink bg-primary text-primary-foreground px-4 py-2 text-sm font-extrabold shadow-[3px_3px_0_var(--shadow-ink)] press-pop">Guardar dirección</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full rounded-2xl border-2 border-dashed border-ink/40 py-4 text-sm font-extrabold text-muted-foreground hover:border-ink hover:text-foreground transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Añadir nueva dirección
        </button>
      )}
    </div>
  );
}

/* ── Vista principal de cuenta ── */
export function AccountView({ tab = "pedidos" }: { tab?: string }) {
  const { user, logout, personalization, setPersonalization } = useApp();

  if (!user) return <AuthForms />;

  const tabs = [
    { id: "pedidos", label: "Mis pedidos", icon: Package },
    { id: "favoritos", label: "Favoritos", icon: Heart },
    { id: "direcciones", label: "Direcciones", icon: MapPin },
    { id: "datos", label: "Mis datos", icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl card-pop bg-card p-5 flex flex-wrap items-center gap-4">
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground border-2 border-ink font-display font-extrabold text-xl">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="flex-1 min-w-40">
          <h1 className="font-display text-xl font-extrabold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
        </div>
        {user.role === "ADMIN" && (
          <a href="#/admin" className="rounded-xl border-2 border-ink bg-ink text-background px-4 py-2 text-sm font-extrabold press-pop flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Panel admin
          </a>
        )}
        <button
          onClick={() => logout().then(() => toast.success("Sesión cerrada"))}
          className="rounded-xl border-2 border-ink bg-muted px-4 py-2 text-sm font-bold press-pop flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <a
            key={t.id}
            href={`#/cuenta/${t.id}`}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border-2 border-ink px-4 py-2 text-sm font-extrabold whitespace-nowrap transition-colors",
              tab === t.id ? "bg-ink text-background shadow-[3px_3px_0_var(--shadow-ink)]" : "bg-card hover:bg-muted"
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </a>
        ))}
      </div>

      {tab === "pedidos" && <OrdersSection />}
      {tab === "favoritos" && <FavoritesSection />}
      {tab === "direcciones" && <AddressesSection />}
      {tab === "datos" && (
        <div className="rounded-3xl card-pop bg-card p-5 space-y-4">
          <h2 className="font-display font-extrabold">Preferencias</h2>
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <span>
              <span className="block text-sm font-bold">Recomendaciones personalizadas</span>
              <span className="block text-xs text-muted-foreground mt-0.5 max-w-md">
                Usamos las categorías de productos que viste (guardadas solo en tu dispositivo) para
                sugerirte productos. Puedes desactivarlo cuando quieras.
              </span>
            </span>
            <input
              type="checkbox"
              checked={personalization}
              onChange={(e) => setPersonalization(e.target.checked)}
              className="w-6 h-6 mt-1 accent-[var(--primary)] shrink-0"
            />
          </label>
          <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-bold text-foreground">Tus datos</p>
            <p className="mt-1">
              Conforme a la Ley 1581 de 2012 puedes conocer, actualizar, rectificar y suprimir tus datos
              escribiendo a nuestro SAC. Ver{" "}
              <a href="#/legal/datos" className="text-primary font-bold hover:underline">tratamiento de datos</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
