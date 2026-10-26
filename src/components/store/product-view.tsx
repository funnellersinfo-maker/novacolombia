"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronRight, Heart, Minus, Plus, ShieldCheck, Truck, BadgePercent, Store,
  CreditCard, Banknote, Check, MapPin, RotateCcw, Package,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { fmtCOP } from "@/lib/format";
import type { ProductDTO, QuoteDTO } from "@/lib/types";
import { useApp } from "@/store/app";
import { SectionTitle } from "./brand";
import { ProductRail } from "./product-rail";
import { cn } from "@/lib/utils";

export function ProductView({ slug }: { slug: string }) {
  const { addToCart, favorites, toggleFavorite, user, bootstrap, city, pushRecentView } = useApp();
  const [data, setData] = useState<{ product: ProductDTO; related: ProductDTO[] } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api
      .get<{ product: ProductDTO; related: ProductDTO[] }>(`/api/products/${slug}`)
      .then((r) => {
        setData(r);
        pushRecentView(r.product.slug);
        setVariantId(r.product.variants[0]?.id ?? null);
      })
      .catch(() => setNotFound(true));
  }, [slug, pushRecentView]);

  const product = data?.product;
  const promo = bootstrap?.promo;
  const isFav = product ? favorites.includes(product.id) : false;

  // Agrupar variantes por tipo
  const variantGroups = useMemo(() => {
    if (!product) return [];
    const groups = new Map<string, typeof product.variants>();
    for (const v of product.variants) {
      if (!groups.has(v.kind)) groups.set(v.kind, []);
      groups.get(v.kind)!.push(v);
    }
    return Array.from(groups.entries());
  }, [product]);

  const selectedVariant = product?.variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = product ? product.price + (selectedVariant?.priceDelta ?? 0) : 0;
  const availableStock = selectedVariant ? selectedVariant.stock : (product?.stock ?? 0);
  const prepayPrice =
    product && promo?.inEffect && product.prepayEligible
      ? Math.round(unitPrice * (1 - promo.percent / 100))
      : null;
  const discountPct =
    product?.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : null;

  // Cotización de envío para la ciudad elegida (se guarda con clave de destino)
  const quoteKey = product && city ? `${product.id}|${city.departamento}|${city.ciudad}` : "";
  const [quoteInfo, setQuoteInfo] = useState<{ key: string; data: QuoteDTO } | null>(null);

  useEffect(() => {
    if (!product || !city) return;
    let cancelled = false;
    const key = `${product.id}|${city.departamento}|${city.ciudad}`;
    api
      .get<QuoteDTO>(`/api/checkout/quote?departamento=${encodeURIComponent(city.departamento)}&ciudad=${encodeURIComponent(city.ciudad)}&productId=${product.id}`)
      .then((data) => {
        if (!cancelled) setQuoteInfo({ key, data });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [product, city]);

  const quote = quoteInfo && quoteInfo.key === quoteKey ? quoteInfo.data : null;

  const handleAdd = async (goToCheckout = false) => {
    if (!product) return;
    if (product.hasVariants && !variantId) {
      toast.error("Elige una opción antes de continuar");
      return;
    }
    setAdding(true);
    const okAdd = await addToCart(product.id, variantId, quantity);
    setAdding(false);
    if (!okAdd) {
      toast.error("No se pudo añadir", { description: "Revisa el stock disponible." });
      return;
    }
    if (goToCheckout) {
      window.location.hash = "#/checkout";
    } else {
      toast.success("Añadido al carrito", { description: product.name });
    }
  };

  if (notFound) {
    return (
      <div className="text-center py-16">
        <h1 className="font-display text-2xl font-extrabold">Producto no encontrado</h1>
        <p className="text-sm text-muted-foreground mt-2">Puede que haya sido retirado de la tienda.</p>
        <a href="#/" className="inline-block mt-6 rounded-xl border-2 border-ink bg-primary text-primary-foreground px-6 py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop">
          Volver al inicio
        </a>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="aspect-square rounded-3xl shimmer" />
        <div className="space-y-4">
          <div className="h-6 w-1/3 rounded shimmer" />
          <div className="h-10 w-3/4 rounded shimmer" />
          <div className="h-8 w-1/3 rounded shimmer" />
          <div className="h-24 w-full rounded shimmer" />
          <div className="h-12 w-full rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Migas */}
      <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <a href="#/" className="hover:text-foreground hover:underline">Inicio</a>
        <ChevronRight className="w-3.5 h-3.5" />
        <a href={`#/c/${product.categorySlug}`} className="hover:text-foreground hover:underline">
          {product.categoryName}
        </a>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-semibold truncate max-w-48">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Galería */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-3xl card-pop bg-card overflow-hidden">
            <Image
              key={imgIndex}
              src={product.images[imgIndex] ?? "/images/placeholder-product.png"}
              alt={`${product.name} — imagen ${imgIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover animate-pop-in"
            />
            {discountPct != null && discountPct > 0 && (
              <span className="absolute top-3 left-3 sticker">-{discountPct}%</span>
            )}
            <button
              onClick={() => {
                if (!user) {
                  toast.info("Inicia sesión para guardar favoritos");
                  window.location.hash = "#/ingresar";
                  return;
                }
                toggleFavorite(product.id).catch(() => toast.error("No se pudo actualizar el favorito"));
              }}
              aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
              aria-pressed={isFav}
              className={cn(
                "absolute top-3 right-3 grid place-items-center w-11 h-11 rounded-full border-2 border-ink bg-card shadow-[3px_3px_0_var(--shadow-ink)] transition-transform active:scale-90",
                isFav && "bg-primary text-primary-foreground"
              )}
            >
              <Heart className={cn("w-5 h-5", isFav && "fill-current")} />
            </button>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  className={cn(
                    "relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all",
                    i === imgIndex ? "border-ink shadow-[3px_3px_0_var(--shadow-ink)]" : "border-ink/25 opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt="" fill sizes="80px" className="object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`#/buscar?q=${encodeURIComponent(product.brand)}`}
                className="text-xs font-extrabold uppercase tracking-wide text-primary hover:underline"
              >
                {product.brand}
              </a>
              {product.isNew && <span className="sticker-flat bg-amber">Nuevo</span>}
              {product.prepayEligible && promo?.inEffect && (
                <span className="sticker-flat bg-success text-success-foreground">
                  <BadgePercent className="w-3 h-3" /> 10% anticipado
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight mt-1.5">
              {product.name}
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
              <Store className="w-3.5 h-3.5" /> Vendido por <strong className="text-foreground">{product.seller}</strong>
            </p>
          </div>

          {/* Variantes */}
          {variantGroups.map(([kind, variants]) => (
            <div key={kind}>
              <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground mb-2">
                {kind}: <span className="text-foreground normal-case">{selectedVariant && selectedVariant.kind === kind ? selectedVariant.value : "elige"}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={v.stock <= 0}
                    className={cn(
                      "rounded-xl border-2 border-ink px-4 py-2 text-sm font-bold transition-all",
                      variantId === v.id
                        ? "bg-ink text-background shadow-[3px_3px_0_var(--shadow-ink)]"
                        : "bg-card hover:bg-muted shadow-[3px_3px_0_var(--shadow-ink)]",
                      v.stock <= 0 && "opacity-40 line-through cursor-not-allowed shadow-none"
                    )}
                  >
                    {v.value}
                    {v.priceDelta > 0 && <span className="ml-1 text-xs">(+{fmtCOP(v.priceDelta)})</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Tarjeta de compra */}
          <div className="rounded-3xl card-pop bg-card p-5 space-y-4">
            <div>
              {product.compareAtPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">{fmtCOP(product.compareAtPrice)}</span>
                  <span className="sticker">-{discountPct}%</span>
                </div>
              )}
              <p className="font-display text-3xl sm:text-4xl font-extrabold">{fmtCOP(unitPrice)}</p>
              {prepayPrice != null && (
                <div className="mt-2 rounded-xl border-2 border-success bg-success/10 p-3">
                  <p className="text-sm font-extrabold text-success flex items-center gap-1.5">
                    <BadgePercent className="w-4 h-4" /> {fmtCOP(prepayPrice)} pagando anticipado
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ahorras {fmtCOP(unitPrice - prepayPrice)} con pago anticipado ({promo?.percent}% sobre el producto).
                    El envío no entra en el descuento.
                  </p>
                </div>
              )}
            </div>

            {/* Stock */}
            {availableStock > 0 ? (
              <p className={cn("text-sm font-semibold", availableStock <= 5 ? "text-destructive" : "text-success")}>
                {availableStock <= 5 ? `¡Solo quedan ${availableStock} unidades!` : "Disponible en inventario"}
              </p>
            ) : (
              <p className="text-sm font-semibold text-destructive">Agotado</p>
            )}

            {/* Cantidad */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground">Cantidad:</span>
              <div className="flex items-center rounded-xl border-2 border-ink bg-card overflow-hidden shadow-[3px_3px_0_var(--shadow-ink)]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="grid place-items-center w-10 h-10 hover:bg-muted"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-display font-extrabold tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(Math.min(availableStock, 99), q + 1))}
                  disabled={quantity >= availableStock}
                  className="grid place-items-center w-10 h-10 hover:bg-muted disabled:opacity-40"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleAdd(false)}
                disabled={availableStock <= 0 || adding}
                className="rounded-xl border-2 border-ink bg-secondary py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop disabled:opacity-50 disabled:shadow-none"
              >
                Añadir al carrito
              </button>
              <button
                onClick={() => handleAdd(true)}
                disabled={availableStock <= 0 || adding}
                className="rounded-xl border-2 border-ink bg-primary text-primary-foreground py-3 text-sm font-extrabold shadow-[4px_4px_0_var(--shadow-ink)] press-pop disabled:opacity-50 disabled:shadow-none"
              >
                Comprar ahora
              </button>
            </div>

            {/* Comparación de modalidades */}
            <div className="grid sm:grid-cols-2 gap-2 pt-1">
              <div className="rounded-xl border-2 border-ink bg-success/10 p-3">
                <p className="text-xs font-extrabold uppercase flex items-center gap-1.5 text-success">
                  <CreditCard className="w-3.5 h-3.5" /> Opción A: pago anticipado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {prepayPrice != null
                    ? `Total de producto: ${fmtCOP(prepayPrice * quantity)} (ahorras ${fmtCOP((unitPrice - prepayPrice) * quantity)}).`
                    : "Este producto no aplica para el descuento anticipado."}
                </p>
              </div>
              <div className="rounded-xl border-2 border-ink bg-primary/10 p-3">
                <p className="text-xs font-extrabold uppercase flex items-center gap-1.5 text-primary">
                  <Banknote className="w-3.5 h-3.5" /> Opción B: contraentrega
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {product.codAvailable && quote?.codAvailable
                    ? `Paga ${fmtCOP(unitPrice * quantity)} al recibir en tu domicilio.`
                    : product.codAvailable
                      ? "Disponible según la cobertura de tu ciudad."
                      : "Este producto solo se vende con pago anticipado."}
                </p>
              </div>
            </div>
          </div>

          {/* Entrega estimada */}
          <div className="rounded-2xl border-2 border-ink bg-card p-4 space-y-2.5">
            <p className="text-sm font-extrabold flex items-center gap-1.5">
              <Truck className="w-4 h-4" /> Entrega a {city?.ciudad ?? "tu ciudad"}
              {!city && (
                <a href="#/categorias" className="ml-auto text-xs font-bold text-primary hover:underline">
                  Elige ciudad arriba ↑
                </a>
              )}
            </p>
            {city && quote && (
              quote.covered ? (
                <>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    Envío {fmtCOP(quote.price)} · llega entre {quote.etaMin} y {quote.etaMax} días hábiles
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contraentrega: {quote.codAvailable && product.codAvailable ? "disponible ✅" : "no disponible en este destino"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-destructive flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> {quote.reason}
                </p>
              )
            )}
          </div>

          {/* Garantías */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: ShieldCheck, label: "Compra protegida" },
              { icon: RotateCcw, label: "Devolución según ley" },
              { icon: Package, label: "Envío nacional" },
            ].map((g) => (
              <div key={g.label} className="rounded-xl border-2 border-ink/20 bg-card p-2.5">
                <g.icon className="w-5 h-5 mx-auto text-primary" />
                <p className="text-[0.65rem] font-bold mt-1 leading-tight">{g.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Descripción y características */}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-3xl card-pop bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold mb-3">Descripción</h2>
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{product.description}</p>
        </section>
        <section className="rounded-3xl card-pop bg-card p-5 sm:p-6">
          <h2 className="font-display text-lg font-extrabold mb-3">Características</h2>
          <dl className="divide-y divide-ink/10">
            {product.features.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-sm font-semibold text-muted-foreground">{k}</dt>
                <dd className="text-sm font-bold text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Políticas */}
      <section className="rounded-2xl border-2 border-ink/20 bg-card p-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="font-semibold">Condiciones:</span>
        <a href="#/legal/cambios" className="text-primary font-semibold hover:underline">Cambios y devoluciones</a>
        <a href="#/legal/envios" className="text-primary font-semibold hover:underline">Condiciones de envío</a>
        <a href="#/legal/sac" className="text-primary font-semibold hover:underline">Atención al cliente</a>
      </section>

      {/* Relacionados */}
      {data.related.length > 0 && (
        <section aria-label="Productos relacionados">
          <SectionTitle kicker="También te puede gustar">Productos relacionados</SectionTitle>
          <ProductRail products={data.related} />
        </section>
      )}
    </div>
  );
}
