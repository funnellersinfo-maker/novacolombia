"use client";

import { useEffect, useRef, useState } from "react";
import { Search, TrendingUp, X, Clock, ArrowRight } from "lucide-react";
import { useApp } from "@/store/app";
import { api } from "@/lib/client-api";
import { fmtCOP } from "@/lib/format";
import type { ProductDTO } from "@/lib/types";
import { CategoryIcon } from "./brand";
import { cn } from "@/lib/utils";

type Suggestions = {
  products: ProductDTO[];
  categories: { slug: string; name: string; icon: string; color: string }[];
  corrected: string | null;
};

export function SearchBar({ autoFocusOnFocus }: { autoFocusOnFocus?: boolean }) {
  const { searchHistory, pushSearch, clearSearchHistory } = useApp();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (value.trim().length < 2) {
      setSuggestions(null);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.get<Suggestions>(`/api/search?q=${encodeURIComponent(value.trim())}`);
        setSuggestions(res);
      } catch {
        setSuggestions(null);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value]);

  const go = (q: string) => {
    if (!q.trim()) return;
    pushSearch(q);
    setOpen(false);
    window.location.hash = `#/buscar?q=${encodeURIComponent(q.trim())}`;
  };

  const hasSuggestions =
    suggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0 || !!suggestions.corrected);
  const showHistory = !value.trim() && searchHistory.length > 0;

  return (
    <div ref={rootRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className="relative"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            setOpen(true);
            autoFocusOnFocus?.();
          }}
          placeholder="Busca productos, marcas o categorías…"
          aria-label="Buscar productos"
          className="w-full h-11 rounded-full border-2 border-ink bg-card pl-10 pr-10 text-sm font-medium shadow-[3px_3px_0_var(--shadow-ink)] placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl card-pop bg-popover p-2 max-h-[70vh] overflow-y-auto scroll-y animate-pop-in">
          {showHistory && (
            <div className="px-2 pt-1 pb-2">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Búsquedas recientes
                </p>
                <button onClick={clearSearchHistory} className="text-xs font-semibold text-primary hover:underline">
                  Limpiar
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {searchHistory.map((h) => (
                  <button
                    key={h}
                    onClick={() => go(h)}
                    className="sticker-flat bg-muted hover:bg-secondary px-3 py-1.5 normal-case"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="px-3 py-3 space-y-2">
              <div className="h-4 w-2/3 rounded shimmer" />
              <div className="h-4 w-1/2 rounded shimmer" />
            </div>
          )}

          {!loading && suggestions && (
            <>
              {suggestions.corrected && (
                <button
                  onClick={() => go(suggestions.corrected!)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-sm font-semibold mb-1"
                >
                  <TrendingUp className="w-4 h-4" /> ¿Quisiste decir: {suggestions.corrected}?
                </button>
              )}
              {suggestions.categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => {
                    setOpen(false);
                    window.location.hash = `#/c/${c.slug}`;
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-left"
                >
                  <span
                    className="grid place-items-center w-9 h-9 rounded-lg border-2 border-ink text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    <CategoryIcon name={c.icon} className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-semibold">{c.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Categoría</span>
                </button>
              ))}
              {suggestions.products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setOpen(false);
                    window.location.hash = `#/p/${p.slug}`;
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-left"
                >
                  <img
                    src={p.images[0] ?? "/images/placeholder-product.png"}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover border-2 border-ink"
                    loading="lazy"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold truncate">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">{fmtCOP(p.price)}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
              {!hasSuggestions && value.trim().length >= 2 && (
                <div className="px-3 py-4 text-center">
                  <p className="text-sm font-semibold">Sin sugerencias para “{value}”</p>
                  <button onClick={() => go(value)} className="mt-2 text-sm font-bold text-primary hover:underline">
                    Buscar de todas formas
                  </button>
                </div>
              )}
              {suggestions.products.length > 0 && (
                <button
                  onClick={() => go(value)}
                  className="w-full mt-1 rounded-xl border-2 border-ink bg-secondary py-2 text-sm font-extrabold press-pop"
                >
                  Ver todos los resultados de “{value}”
                </button>
              )}
            </>
          )}

          {!loading && !suggestions && !showHistory && (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              Escribe al menos 2 letras para ver sugerencias.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
