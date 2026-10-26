"use client";

// Panel administrativo NOVA — punto de entrada (Task 7-b).
// Vive dentro del hash-route #/admin/<seccion> de la SPA (ver nova-app.tsx).
// Guard por rol ADMIN; navegación interna mediante anclas #/admin/<seccion>.

import { useState } from "react";
import {
  BadgePercent, LayoutDashboard, LayoutGrid, Loader2, LogOut, Package,
  PenSquare, ScrollText, ShieldAlert, ShoppingCart, Store, Truck, Users,
} from "lucide-react";
import { useApp } from "@/store/app";
import { ResumenSection } from "./sections/resumen";
import { PedidosSection } from "./sections/pedidos";
import { ProductosSection } from "./sections/productos";
import { CategoriasSection } from "./sections/categorias";
import { PromocionesSection } from "./sections/promociones";
import { EnviosSection } from "./sections/envios";
import { ContenidoSection } from "./sections/contenido";
import { UsuariosSection } from "./sections/usuarios";
import { AuditoriaSection } from "./sections/auditoria";

const SECTIONS = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "pedidos", label: "Pedidos", icon: ShoppingCart },
  { id: "productos", label: "Productos", icon: Package },
  { id: "categorias", label: "Categorías", icon: LayoutGrid },
  { id: "promociones", label: "Promociones", icon: BadgePercent },
  { id: "envios", label: "Envíos", icon: Truck },
  { id: "contenido", label: "Contenido", icon: PenSquare },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "auditoria", label: "Auditoría", icon: ScrollText },
] as const;

export function AdminApp({ section }: { section?: string }) {
  const user = useApp((s) => s.user);
  const initialized = useApp((s) => s.initialized);
  const logout = useApp((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!initialized) {
    return (
      <div className="grid min-h-screen place-items-center" role="status" aria-label="Cargando panel">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-primary" aria-hidden />
          <p className="font-display text-lg font-extrabold">Cargando panel NOVA…</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="grid min-h-screen place-items-center p-4">
        <div className="card-pop max-w-md w-full rounded-3xl bg-card p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" aria-hidden />
          <h1 className="mt-4 font-display text-xl font-extrabold">Panel restringido</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta área es exclusiva para administradores de la tienda. Si tienes credenciales
            de administración, inicia sesión para continuar.
          </p>
          <a
            href="#/ingresar"
            className="mt-6 inline-block rounded-xl border-2 border-ink bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground shadow-[4px_4px_0_var(--shadow-ink)] press-pop"
          >
            Iniciar sesión como administrador
          </a>
          <p className="mt-4 text-xs text-muted-foreground">
            ¿Solo quieres comprar?{" "}
            <a href="#/" className="font-bold text-primary underline underline-offset-2">
              Volver a la tienda
            </a>
          </p>
        </div>
      </div>
    );
  }

  const active = (SECTIONS.find((s) => s.id === section) ?? SECTIONS[0]).id;

  async function handleLogout() {
    setLoggingOut(true);
    window.location.hash = "#/";
    await logout();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Cabecera del panel ── */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b-2 border-ink bg-card px-3 sm:px-5">
        <a href="#/admin" className="flex min-w-0 items-center gap-2" aria-label="Inicio del panel NOVA">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-ink bg-primary font-display text-lg font-extrabold text-primary-foreground shadow-[3px_3px_0_var(--shadow-ink)]"
            aria-hidden
          >
            N
          </span>
          <span className="truncate font-display text-lg font-extrabold leading-none">
            NOVA<span className="text-primary">·</span>Admin
          </span>
        </a>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden text-right leading-tight sm:block">
            <p className="max-w-44 truncate text-xs font-extrabold">{user.name}</p>
            <p className="max-w-44 truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
          <a
            href="#/"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-ink bg-card px-3 text-xs font-extrabold shadow-[3px_3px_0_var(--shadow-ink)] press-pop hover:bg-muted"
          >
            <Store className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Ver tienda</span>
            <span className="sr-only sm:hidden">Ver tienda</span>
          </a>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-ink bg-destructive px-3 text-xs font-extrabold text-white shadow-[3px_3px_0_var(--shadow-ink)] press-pop hover:opacity-90 disabled:opacity-60"
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">Cerrar sesión</span>
            <span className="sr-only sm:hidden">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* ── Navegación móvil (tabs scrollables) ── */}
      <nav
        aria-label="Secciones del panel"
        className="sticky top-[58px] z-30 overflow-x-auto border-b-2 border-ink bg-card no-scrollbar lg:hidden"
      >
        <div className="flex gap-1.5 px-3 py-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#/admin/${s.id}`}
              aria-current={active === s.id ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold ${
                active === s.id
                  ? "border-ink bg-primary text-primary-foreground shadow-[3px_3px_0_var(--shadow-ink)]"
                  : "border-transparent bg-muted text-muted-foreground"
              }`}
            >
              <s.icon className="h-3.5 w-3.5" aria-hidden />
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="flex">
        {/* ── Barra lateral desktop ── */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav
            aria-label="Secciones del panel"
            className="sticky top-[58px] max-h-[calc(100vh-58px)] space-y-1 overflow-y-auto border-r-2 border-ink bg-card p-3 scroll-y"
          >
            <p className="px-2 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              Gestión
            </p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#/admin/${s.id}`}
                aria-current={active === s.id ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-sm font-extrabold ${
                  active === s.id
                    ? "border-ink bg-primary text-primary-foreground shadow-[3px_3px_0_var(--shadow-ink)]"
                    : "border-transparent text-foreground hover:border-ink hover:bg-muted"
                }`}
              >
                <s.icon className="h-4 w-4 shrink-0" aria-hidden />
                {s.label}
              </a>
            ))}
            <div className="mx-2 my-3 border-t-2 border-dashed border-input" />
            <a
              href="#/"
              className="flex items-center gap-2.5 rounded-xl border-2 border-transparent px-3 py-2 text-sm font-extrabold text-muted-foreground hover:border-ink hover:bg-muted"
            >
              <Store className="h-4 w-4 shrink-0" aria-hidden />
              Ver tienda
            </a>
          </nav>
        </aside>

        {/* ── Contenido de la sección ── */}
        <main className="min-w-0 flex-1 px-3 py-5 pb-16 sm:px-6 lg:pb-10">
          <div key={active} className="mx-auto max-w-6xl animate-pop-in">
            {active === "resumen" && <ResumenSection />}
            {active === "pedidos" && <PedidosSection />}
            {active === "productos" && <ProductosSection />}
            {active === "categorias" && <CategoriasSection />}
            {active === "promociones" && <PromocionesSection />}
            {active === "envios" && <EnviosSection />}
            {active === "contenido" && <ContenidoSection />}
            {active === "usuarios" && <UsuariosSection />}
            {active === "auditoria" && <AuditoriaSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
