"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight, BadgePercent, ChevronLeft, ChevronRight, Clock, CreditCard, PackageCheck,
  ShieldCheck, Truck, Sparkles,
} from "lucide-react";
import { api } from "@/lib/client-api";
import { fmtCOP } from "@/lib/format";
import type { ProductDTO } from "@/lib/types";
import { useApp } from "@/store/app";
import { CategoryIcon, SectionTitle } from "./brand";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { ProductRail } from "./product-rail";
import { cn } from "@/lib/utils";

/* ── Hero con carrusel de banners ── */
function HeroCarousel() {
  const { bootstrap } = useApp();
  const banners = bootstrap?.banners ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6500);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) {
    return <div className="rounded-3xl card-pop h-56 sm:h-72 shimmer" aria-hidden />;
  }

  return (
    <section aria-label="Promociones destacadas" className="relative">
      <div className="overflow-hidden rounded-3xl card-pop bg-card">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={cn(
              "grid sm:grid-cols-2 transition-opacity duration-500",
              i === index ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"
            )}
            aria-hidden={i !== index}
          >
            <div className="flex flex-col justify-center gap-3 p-5 sm:p-10 dots-bg">
              {b.id === "hero-prepay" && <span className="sticker w-max"><BadgePercent className="w-3.5 h-3.5" /> 10% dcto</span>}
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-[1.05]">
                {b.title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md">{b.subtitle}</p>
              <a
                href={b.ctaLink}
                className="mt-1 w-max inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-primary text-primary-foreground px-5 py-2.5 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop"
              >
                {b.ctaText} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="relative h-44 sm:h-64 lg:h-72">
              <Image
                src={b.image}
                alt=""
                fill
                priority={i === 0}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover sm:rounded-l-[2rem]"
              />
            </div>
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="flex justify-center gap-2 -mt-4 relative z-10">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setIndex(i)}
              aria-label={`Ir a promoción ${i + 1}`}
              className={cn(
                "h-2.5 rounded-full border-2 border-ink transition-all",
                i === index ? "w-7 bg-amber" : "w-2.5 bg-card"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Countdown real de campaña ── */
function Countdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(endsAt).getTime();
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (remaining == null) return null;
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);

  return (
    <div className="flex items-center gap-1.5" role="timer" aria-label="Tiempo restante de la oferta">
      <Clock className="w-4 h-4" />
      {[h, m, s].map((v, i) => (
        <span key={i} className="font-display font-extrabold text-sm bg-ink text-background rounded-lg px-1.5 py-0.5 tabular-nums">
          {String(v).padStart(2, "0")}
        </span>
      ))}
    </div>
  );
}

/* ── Sección de confianza ── */
function TrustSection() {
  const items = [
    {
      icon: BadgePercent,
      title: "10% de descuento real",
      text: "Pagando anticipado en miles de productos elegibles. Compara antes de pagar.",
      color: "bg-success text-success-foreground",
    },
    {
      icon: PackageCheck,
      title: "Pago contraentrega",
      text: "Paga cuando recibas tu pedido en las ciudades con cobertura habilitada.",
      color: "bg-primary text-primary-foreground",
    },
    {
      icon: Truck,
      title: "Envíos a toda Colombia",
      text: "Tarifas y plazos claros según tu destino, mostrados antes de confirmar.",
      color: "bg-amber text-ink",
    },
    {
      icon: ShieldCheck,
      title: "Compra protegida",
      text: "Precios calculados en servidor, historial de pedido y devoluciones según la ley.",
      color: "bg-ink text-background",
    },
  ];
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((t) => (
        <div key={t.title} className="flex gap-3 rounded-2xl card-pop bg-card p-4">
          <span className={cn("grid place-items-center w-11 h-11 rounded-xl border-2 border-ink shrink-0", t.color)}>
            <t.icon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-display font-extrabold text-sm">{t.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ── Vista Home ── */
export function HomeView() {
  const { bootstrap, recentViews, personalization, city } = useApp();
  const [popular, setPopular] = useState<ProductDTO[] | null>(null);
  const [newest, setNewest] = useState<ProductDTO[] | null>(null);
  const [deals, setDeals] = useState<ProductDTO[] | null>(null);
  const [prepayPicks, setPrepayPicks] = useState<ProductDTO[] | null>(null);
  const [recent, setRecent] = useState<ProductDTO[] | null>(null);
  const [forYou, setForYou] = useState<ProductDTO[] | null>(null);

  const campaign = bootstrap?.campaign;
  const collections = bootstrap?.collections ?? [];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [pop, fresh, deal, prepay] = await Promise.all([
        api.get<{ items: ProductDTO[] }>("/api/products?popular=1&perPage=10").catch(() => null),
        api.get<{ items: ProductDTO[] }>("/api/products?new=1&perPage=10").catch(() => null),
        api.get<{ items: ProductDTO[] }>("/api/products?deals=1&perPage=10&sort=discount").catch(() => null),
        api.get<{ items: ProductDTO[] }>("/api/products?prepay=1&perPage=10&sort=discount").catch(() => null),
      ]);
      if (cancelled) return;
      setPopular(pop?.items ?? []);
      setNewest(fresh?.items ?? []);
      setDeals(deal?.items ?? []);
      setPrepayPicks(prepay?.items ?? []);

      if (recentViews.length) {
        const bySlug = await api
          .get<{ items: ProductDTO[] }>(`/api/products?slugs=${recentViews.slice(0, 8).join(",")}`)
          .catch(() => null);
        if (!cancelled) setRecent(bySlug?.items ?? []);
      }
      if (personalization && recentViews.length) {
        // sugerencias basadas en categorías vistas (solo se envían slugs, no historial completo)
        const viewed = await api
          .get<{ items: ProductDTO[] }>(`/api/products?slugs=${recentViews.slice(0, 4).join(",")}`)
          .catch(() => null);
        const catSlugs = Array.from(new Set((viewed?.items ?? []).map((p) => p.categorySlug))).slice(0, 3);
        if (catSlugs.length) {
          const rec = await api
            .get<{ items: ProductDTO[] }>(`/api/products?category=${catSlugs[0]}&perPage=10`)
            .catch(() => null);
          if (!cancelled) {
            const seen = new Set(recentViews);
            setForYou((rec?.items ?? []).filter((p) => !seen.has(p.slug)).slice(0, 10));
          }
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [recentViews.join(","), personalization]);

  const heroFlash = useMemo(() => (deals ?? []).slice(0, 10), [deals]);

  return (
    <div className="space-y-10">
      <HeroCarousel />

      {/* Rail de categorías */}
      <section aria-label="Categorías">
        <SectionTitle kicker="Explora" action={<a href="#/categorias" className="text-sm font-bold text-primary hover:underline">Ver todas →</a>}>
          Categorías
        </SectionTitle>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x pb-1 -mx-1 px-1">
          {(bootstrap?.categories ?? []).map((c) => (
            <a
              key={c.slug}
              href={`#/c/${c.slug}`}
              className="snap-start shrink-0 w-24 sm:w-28 group"
            >
              <span
                className="grid place-items-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-ink text-white shadow-[4px_4px_0_var(--shadow-ink)] transition-transform group-hover:-translate-y-1"
                style={{ backgroundColor: c.color }}
              >
                <CategoryIcon name={c.icon} className="w-9 h-9" />
              </span>
              <span className="block mt-1.5 text-[0.7rem] sm:text-xs font-bold leading-tight text-center line-clamp-2">
                {c.name}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Ofertas con countdown (solo si hay campaña activa real) */}
      {campaign?.active && campaign.endsAt && heroFlash.length > 0 && (
        <section aria-label="Ofertas por tiempo limitado" className="rounded-3xl card-pop bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {campaign.name}
              </p>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold">
                <span className="marker-title">Ofertas por tiempo limitado</span>
              </h2>
            </div>
            <Countdown endsAt={campaign.endsAt} />
          </div>
          <ProductRail products={heroFlash} />
        </section>
      )}

      {/* Banner pago anticipado */}
      <section
        aria-label="Promoción pago anticipado"
        className="rounded-3xl border-2 border-ink bg-success text-success-foreground shadow-[5px_5px_0_var(--shadow-ink)] p-5 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10" aria-hidden />
        <div className="absolute right-10 bottom-4 w-16 h-16 rounded-full bg-amber border-2 border-ink hidden sm:grid place-items-center rotate-12">
          <span className="font-display font-extrabold text-ink">-10%</span>
        </div>
        <div className="relative max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" /> Pago anticipado
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold mt-1">
            {bootstrap?.homeTexts.prepayBannerTitle ?? "Paga anticipado y ahorra 10%"}
          </h2>
          <p className="mt-2 text-sm text-success-foreground/85">
            {bootstrap?.homeTexts.prepayBannerText}
          </p>
          <a
            href="#/buscar?prepay=1"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-amber text-ink px-5 py-2.5 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop"
          >
            Ver productos con descuento <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Populares */}
      <section aria-label="Productos populares">
        <SectionTitle kicker="Los más deseados" action={<a href="#/buscar?q=" className="text-sm font-bold text-primary hover:underline">Ver más →</a>}>
          Los favoritos de la tienda
        </SectionTitle>
        {popular == null ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {popular.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Colecciones */}
      {collections.slice(0, 3).map((col) => (
        <section key={col.slug} aria-label={`Colección ${col.name}`}>
          <SectionTitle kicker="Colección" action={<a href={`#/coleccion/${col.slug}`} className="text-sm font-bold text-primary hover:underline">Ver colección →</a>}>
            {col.name}
          </SectionTitle>
          <CollectionRail slug={col.slug} />
        </section>
      ))}

      {/* Con 10% dcto pagando anticipado */}
      <section aria-label="Productos con descuento por pago anticipado">
        <SectionTitle kicker="Ahorra pagando anticipado" action={<a href="#/buscar?prepay=1" className="text-sm font-bold text-primary hover:underline">Ver más →</a>}>
          Con 10% de descuento
        </SectionTitle>
        {prepayPicks == null ? (
          <div className="flex gap-3 overflow-hidden">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
        ) : (
          <ProductRail products={prepayPicks} />
        )}
      </section>

      {/* Novedades */}
      <section aria-label="Novedades">
        <SectionTitle kicker="Recién llegados">Novedades</SectionTitle>
        {newest == null ? (
          <div className="flex gap-3 overflow-hidden">{Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
        ) : (
          <ProductRail products={newest} />
        )}
      </section>

      {/* Vistos recientemente */}
      {recent && recent.length > 0 && (
        <section aria-label="Vistos recientemente">
          <SectionTitle kicker="Tu historial local">Vistos recientemente</SectionTitle>
          <ProductRail products={recent} />
        </section>
      )}

      {/* Para ti */}
      {forYou && forYou.length > 0 && personalization && (
        <section aria-label="Recomendaciones personalizadas">
          <SectionTitle kicker="Porque navegaste por la tienda">Para ti</SectionTitle>
          <ProductRail products={forYou} />
        </section>
      )}

      <TrustSection />

      {/* Nota honesta de cobertura */}
      {city && (
        <p className="text-center text-xs text-muted-foreground">
          Mostrando opciones para envíos a <strong>{city.ciudad}, {city.departamento}</strong> ·
          la disponibilidad final se confirma en el pago
        </p>
      )}
    </div>
  );
}

function CollectionRail({ slug }: { slug: string }) {
  const { bootstrap } = useApp();
  const [products, setProducts] = useState<ProductDTO[] | null>(null);

  useEffect(() => {
    const col = bootstrap?.collections.find((c) => c.slug === slug);
    if (!col) return;
    api
      .get<{ items: ProductDTO[] }>(`/api/products?slugs=${col.productSlugs.join(",")}`)
      .then((r) => setProducts(r.items))
      .catch(() => setProducts([]));
  }, [slug, bootstrap]);

  if (products == null) {
    return <div className="flex gap-3 overflow-hidden">{Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>;
  }
  const order = bootstrap?.collections.find((c) => c.slug === slug)?.productSlugs ?? [];
  const sorted = [...products].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
  return <ProductRail products={sorted} />;
}
