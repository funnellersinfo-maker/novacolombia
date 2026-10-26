"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/client-api";
import type { ProductDTO, CategoryDTO } from "@/lib/types";
import { useApp } from "@/store/app";
import { ProductGrid, ProductCardSkeleton } from "./product-card";
import { CategoryIcon } from "./brand";
import { cn } from "@/lib/utils";

type BrowseResult = {
  items: ProductDTO[];
  total: number;
  page: number;
  pages: number;
  facets: { subcategories: { name: string; count: number }[]; priceMin: number; priceMax: number } | null;
};

export function BrowseView({
  mode,
  slug,
  q,
  prepay,
  deals,
  sub,
}: {
  mode: "categoria" | "buscar" | "coleccion";
  slug?: string;
  q?: string;
  prepay?: boolean;
  deals?: boolean;
  sub?: string;
}) {
  const { bootstrap } = useApp();
  const [result, setResult] = useState<BrowseResult | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("relevance");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [prepayOnly, setPrepayOnly] = useState(!!prepay);
  const [inStock, setInStock] = useState(false);
  const [activeSub, setActiveSub] = useState(sub ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category: CategoryDTO | undefined = slug ? bootstrap?.categories.find((c) => c.slug === slug) : undefined;
  const collection = mode === "coleccion" ? bootstrap?.collections.find((c) => c.slug === slug) : undefined;

  // Título de la vista
  const title =
    mode === "categoria"
      ? category?.name ?? "Categoría"
      : mode === "coleccion"
        ? collection?.name ?? "Colección"
        : q
          ? `Resultados de “${q}”`
          : "Explorar productos";

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (mode === "categoria") {
      params.set("category", slug ?? "");
      if (activeSub) params.set("sub", activeSub);
    } else if (mode === "coleccion" && collection) {
      params.set("slugs", collection.productSlugs.join(","));
    } else {
      if (q) params.set("q", q);
      if (prepayOnly) params.set("prepay", "1");
      if (deals) params.set("deals", "1");
    }
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    if (inStock) params.set("instock", "1");
    if (mode === "categoria" && prepayOnly) params.set("prepay", "1");
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("perPage", "20");

    api
      .get<BrowseResult>(`/api/products?${params.toString()}`)
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch(() => {
        if (!cancelled) setResult({ items: [], total: 0, page: 1, pages: 0, facets: null });
      });
    return () => {
      cancelled = true;
    };
  }, [mode, slug, q, prepayOnly, deals, activeSub, minPrice, maxPrice, inStock, sort, page, collection, prepay]);

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setPrepayOnly(mode === "buscar" ? !!prepay : false);
    setInStock(false);
    setActiveSub("");
  };

  const hasActiveFilters = !!minPrice || !!maxPrice || prepayOnly || inStock || !!activeSub;
  const items = result?.items ?? [];
  const showLoadMore = !!result && result.page < result.pages;

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <a href="#/" className="hover:text-foreground hover:underline">Inicio</a>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-semibold truncate">{title}</span>
      </div>

      {category && (
        <div
          className="rounded-3xl border-2 border-ink p-5 sm:p-7 text-white relative overflow-hidden shadow-[5px_5px_0_var(--shadow-ink)]"
          style={{ backgroundColor: category.color }}
        >
          <div className="absolute -right-6 -bottom-8 w-36 h-36 rounded-full bg-white/15" aria-hidden />
          <div className="relative flex items-center gap-4">
            <span className="hidden sm:grid place-items-center w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/60">
              <CategoryIcon name={category.icon} className="w-8 h-8" />
            </span>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold">{category.name}</h1>
              <p className="text-sm text-white/85 mt-0.5">{category.description}</p>
            </div>
          </div>
        </div>
      )}
      {!category && (
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
          <span className="marker-title">{title}</span>
          {result && (
            <span className="ml-3 text-sm font-bold text-muted-foreground align-middle">
              {result.total} {result.total === 1 ? "resultado" : "resultados"}
            </span>
          )}
        </h1>
      )}

      {/* Subcategorías (chips) */}
      {category && category.subcategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          <button
            onClick={() => setActiveSub("")}
            className={cn(
              "sticker-flat shrink-0 px-3.5 py-1.5 normal-case",
              !activeSub ? "bg-ink text-background" : "bg-muted"
            )}
          >
            Todo
          </button>
          {category.subcategories.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSub(activeSub === s ? "" : s)}
              className={cn(
                "sticker-flat shrink-0 px-3.5 py-1.5 normal-case",
                activeSub === s ? "bg-ink text-background" : "bg-muted"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Barra de orden y filtros */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={cn(
            "flex items-center gap-1.5 h-10 rounded-xl border-2 border-ink px-3 text-sm font-bold bg-card shadow-[3px_3px_0_var(--shadow-ink)] press-pop",
            hasActiveFilters && "bg-amber"
          )}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filtros
          {hasActiveFilters && <X className="w-3.5 h-3.5" onClick={(e) => { e.stopPropagation(); resetFilters(); }} />}
        </button>
        <div className="flex-1" />
        <label className="text-xs font-bold text-muted-foreground hidden sm:block" htmlFor="sort-select">
          Ordenar por
        </label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-xl border-2 border-ink bg-card px-2.5 text-sm font-bold shadow-[3px_3px_0_var(--shadow-ink)] focus:outline-none"
        >
          <option value="relevance">Relevancia</option>
          <option value="popular">Populares</option>
          <option value="price_asc">Precio: menor a mayor</option>
          <option value="price_desc">Precio: mayor a menor</option>
          <option value="new">Más nuevos</option>
          <option value="discount">Mayor descuento</option>
        </select>
      </div>

      {/* Panel de filtros */}
      {filtersOpen && (
        <div className="rounded-2xl card-pop bg-card p-4 animate-pop-in space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground mb-2">Precio (COP)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Mínimo"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full h-10 rounded-xl border-2 border-ink bg-background px-3 text-sm focus:outline-none"
                aria-label="Precio mínimo"
              />
              <span className="text-muted-foreground">—</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Máximo"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full h-10 rounded-xl border-2 border-ink bg-background px-3 text-sm focus:outline-none"
                aria-label="Precio máximo"
              />
            </div>
            {result?.facets && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Rango en esta categoría: ${new Intl.NumberFormat("es-CO").format(result.facets.priceMin)} — ${new Intl.NumberFormat("es-CO").format(result.facets.priceMax)}
              </p>
            )}
          </div>
          <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={prepayOnly}
              onChange={(e) => { setPrepayOnly(e.target.checked); setPage(1); }}
              className="w-5 h-5 accent-[var(--primary)]"
            />
            Solo productos con 10% de descuento pagando anticipado
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => { setInStock(e.target.checked); setPage(1); }}
              className="w-5 h-5 accent-[var(--primary)]"
            />
            Solo disponibles
          </label>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-sm font-bold text-primary hover:underline">
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Resultados */}
      {result == null ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyBrowse mode={mode} q={q} />
      ) : (
        <>
          <ProductGrid products={items} />
          {showLoadMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border-2 border-ink bg-primary text-primary-foreground px-6 py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop"
              >
                Cargar más productos
              </button>
            </div>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Página {result.page} de {result.pages} · {result.total} productos
          </p>
        </>
      )}
    </div>
  );
}

function EmptyBrowse({ mode, q }: { mode: string; q?: string }) {
  const { bootstrap } = useApp();
  return (
    <div className="rounded-3xl card-pop bg-card p-8 sm:p-12 text-center max-w-xl mx-auto">
      <div className="grid place-items-center w-20 h-20 mx-auto rounded-2xl bg-accent border-2 border-ink rotate-3">
        <SlidersHorizontal className="w-9 h-9" />
      </div>
      <h2 className="font-display text-xl font-extrabold mt-4">
        {mode === "buscar" ? `Sin resultados para “${q}”` : "No encontramos productos"}
      </h2>
      <p className="text-sm text-muted-foreground mt-2">
        Prueba con otras palabras, revisa la ortografía o explora nuestras categorías más populares.
      </p>
      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {(bootstrap?.categories ?? []).slice(0, 6).map((c) => (
          <a
            key={c.slug}
            href={`#/c/${c.slug}`}
            className="sticker-flat bg-muted hover:bg-secondary normal-case px-3.5 py-2"
          >
            {c.name}
          </a>
        ))}
      </div>
      <a
        href="#/c/ofertas"
        className="inline-flex items-center gap-2 mt-6 rounded-xl border-2 border-ink bg-amber px-5 py-2.5 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop"
      >
        Ver ofertas del día
      </a>
    </div>
  );
}
