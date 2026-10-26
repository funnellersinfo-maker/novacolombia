"use client";

import { useState } from "react";
import { MapPin, ChevronDown, ShoppingCart, User as UserIcon, Package, LayoutGrid, Sun, Moon, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { NovaLogo, CategoryIcon } from "./brand";
import { SearchBar } from "./search-bar";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";

function CityPicker() {
  const { bootstrap, city, setCity } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const locations = bootstrap?.locations ?? [];
  const filtered = query
    ? locations
        .map((l) => ({
          ...l,
          ciudades: l.ciudades.filter((c) => c.toLowerCase().includes(query.toLowerCase())),
        }))
        .filter((l) => l.ciudades.length || l.departamento.toLowerCase().includes(query.toLowerCase()))
    : locations;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-9 rounded-full border-2 border-ink bg-secondary px-3 text-sm font-bold max-w-[180px] hover:bg-accent transition-colors"
        aria-label="Elegir ciudad de entrega"
      >
        <MapPin className="w-4 h-4 shrink-0" />
        <span className="truncate">{city?.ciudad ?? "Elige tu ciudad"}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-2 w-[85vw] sm:w-96 max-h-[70vh] rounded-2xl card-pop bg-popover p-3 animate-pop-in">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              ¿A dónde enviamos tu compra?
            </p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtra por departamento o ciudad…"
              className="w-full h-10 rounded-xl border-2 border-ink bg-card px-3 text-sm mb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
            <div className="max-h-72 overflow-y-auto scroll-y space-y-3">
              {filtered.map((loc) => (
                <div key={loc.departamento}>
                  <p className="text-xs font-extrabold text-muted-foreground uppercase px-1 sticky top-0 bg-popover py-1">
                    {loc.departamento}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {loc.ciudades.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCity({ departamento: loc.departamento, ciudad: c });
                          setOpen(false);
                          setQuery("");
                        }}
                        className={cn(
                          "sticker-flat bg-muted hover:bg-secondary normal-case px-3 py-1.5",
                          city?.ciudad === c && "bg-primary text-primary-foreground"
                        )}
                      >
                        {city?.ciudad === c && <Check className="w-3 h-3" />}
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!filtered.length && (
                <p className="text-sm text-muted-foreground px-1 py-3">
                  No encontramos esa ciudad en nuestra cobertura. Puedes intentar en el checkout con “resto del departamento”.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Cambiar tema claro/oscuro"
      className="grid place-items-center w-9 h-9 rounded-full border-2 border-ink bg-card hover:bg-muted transition-colors"
    >
      <Sun className="w-4 h-4 dark:hidden" />
      <Moon className="w-4 h-4 hidden dark:block" />
    </button>
  );
}

export function Header() {
  const { cart, user, bootstrap } = useApp();
  const itemCount = cart?.itemCount ?? 0;
  const categories = bootstrap?.categories ?? [];

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b-2 border-ink">
      <div className="mx-auto max-w-7xl px-3 sm:px-5">
        {/* Fila superior */}
        <div className="flex items-center gap-2 sm:gap-4 h-14">
          <NovaLogo />
          <div className="hidden sm:block">
            <CityPicker />
          </div>
          <nav className="hidden lg:flex items-center gap-1 ml-2" aria-label="Principal">
            <a
              href="#/categorias"
              className="flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-bold hover:bg-muted transition-colors"
            >
              <LayoutGrid className="w-4 h-4" /> Categorías
            </a>
            <a
              href="#/c/ofertas"
              className="flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-bold bg-accent border-2 border-ink hover:bg-amber transition-colors"
            >
              Ofertas
            </a>
            <a
              href="#/seguimiento"
              className="flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-bold hover:bg-muted transition-colors"
            >
              <Package className="w-4 h-4" /> Mis pedidos
            </a>
          </nav>
          <div className="flex-1" />
          <ThemeToggle />
          <a
            href={user ? "#/cuenta" : "#/ingresar"}
            aria-label={user ? "Mi cuenta" : "Iniciar sesión"}
            className="flex items-center gap-1.5 h-9 rounded-full border-2 border-ink bg-card px-3 text-sm font-bold hover:bg-muted transition-colors"
          >
            <UserIcon className="w-4 h-4" />
            <span className="hidden sm:inline max-w-24 truncate">{user ? user.name.split(" ")[0] : "Ingresar"}</span>
          </a>
          <a
            href="#/carrito"
            aria-label={`Carrito con ${itemCount} productos`}
            className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-ink bg-primary text-primary-foreground shadow-[3px_3px_0_var(--shadow-ink)] press-pop"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span
                key={itemCount}
                className="absolute -top-1.5 -right-1.5 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-amber text-ink text-[0.68rem] font-extrabold border-2 border-ink animate-badge"
              >
                {itemCount}
              </span>
            )}
          </a>
        </div>

        {/* Búsqueda + ciudad móvil */}
        <div className="flex items-center gap-2 pb-2.5 sm:pb-3">
          <div className="flex-1">
            <SearchBar />
          </div>
          <div className="sm:hidden">
            <CityPicker />
          </div>
        </div>
      </div>

      {/* Franja de categorías (desktop) */}
      <div className="hidden md:block border-t border-ink/15">
        <div className="mx-auto max-w-7xl px-5 flex gap-1 overflow-x-auto no-scrollbar h-11 items-center">
          {categories.slice(0, 10).map((c) => (
            <a
              key={c.slug}
              href={`#/c/${c.slug}`}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[0.8rem] font-semibold whitespace-nowrap hover:bg-muted transition-colors"
            >
              <CategoryIcon name={c.icon} className="w-3.5 h-3.5" style={{ color: c.color }} />
              {c.name}
            </a>
          ))}
          <a href="#/categorias" className="ml-auto text-[0.8rem] font-bold text-primary whitespace-nowrap hover:underline">
            Ver todas →
          </a>
        </div>
      </div>
    </header>
  );
}
