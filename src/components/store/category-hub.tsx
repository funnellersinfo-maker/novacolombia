"use client";

import { CategoryIcon, SectionTitle } from "./brand";
import { useApp } from "@/store/app";

export function CategoryHub() {
  const { bootstrap } = useApp();
  const categories = bootstrap?.categories ?? [];
  const collections = bootstrap?.collections ?? [];

  return (
    <div className="space-y-10">
      <section aria-label="Todas las categorías">
        <SectionTitle kicker="Encuéntralo todo">Hub de categorías</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((c) => (
            <a
              key={c.slug}
              href={`#/c/${c.slug}`}
              className="group rounded-2xl card-pop bg-card p-4 hover-pop flex flex-col gap-2.5"
            >
              <span
                className="grid place-items-center w-12 h-12 rounded-xl border-2 border-ink text-white shadow-[3px_3px_0_var(--shadow-ink)]"
                style={{ backgroundColor: c.color }}
              >
                <CategoryIcon name={c.icon} className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-display font-extrabold text-sm leading-tight group-hover:underline underline-offset-2">
                  {c.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {c.productCount} {c.productCount === 1 ? "producto" : "productos"}
                  {c.special === "deals" ? " en oferta" : ""}
                </p>
              </div>
              {c.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto pt-1">
                  {c.subcategories.slice(0, 3).map((s) => (
                    <span key={s} className="sticker-flat bg-muted normal-case text-[0.6rem] px-2 py-0.5">
                      {s}
                    </span>
                  ))}
                  {c.subcategories.length > 3 && (
                    <span className="text-[0.6rem] font-bold text-muted-foreground self-center">
                      +{c.subcategories.length - 3}
                    </span>
                  )}
                </div>
              )}
            </a>
          ))}
        </div>
      </section>

      {collections.length > 0 && (
        <section aria-label="Colecciones temáticas">
          <SectionTitle kicker="Descubre">Colecciones temáticas</SectionTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {collections.map((col) => (
              <a
                key={col.slug}
                href={`#/coleccion/${col.slug}`}
                className="group rounded-2xl card-pop p-5 hover-pop relative overflow-hidden"
                style={{ backgroundColor: col.color }}
              >
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/15" aria-hidden />
                <h3 className="font-display text-lg font-extrabold text-white relative">{col.name}</h3>
                <p className="text-sm text-white/80 relative mt-1">{col.description}</p>
                <span className="relative inline-flex items-center gap-1.5 mt-3 text-sm font-extrabold text-white group-hover:underline">
                  Explorar colección →
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
