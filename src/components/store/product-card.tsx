"use client";

import Image from "next/image";
import { Heart, Plus, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { fmtCOP } from "@/lib/format";
import { useApp } from "@/store/app";
import type { ProductDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  compact = false,
  className,
}: {
  product: ProductDTO;
  compact?: boolean;
  className?: string;
}) {
  const { addToCart, toggleFavorite, favorites, user, cartPending, bootstrap } = useApp();
  const [added, setAdded] = useState(false);
  const isFav = favorites.includes(product.id);
  const outOfStock = product.stock <= 0 && !product.hasVariants;
  const promo = bootstrap?.promo;
  const prepayPrice = promo?.inEffect && product.prepayEligible
    ? Math.round(product.price * (1 - promo.percent / 100))
    : null;
  const discountPct = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : null;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.hasVariants) {
      window.location.hash = `#/p/${product.slug}`;
      return;
    }
    const okAdd = await addToCart(product.id, null, 1);
    if (okAdd) {
      setAdded(true);
      toast.success("Añadido al carrito", { description: product.name });
      setTimeout(() => setAdded(false), 1300);
    } else {
      toast.error("No se pudo añadir", { description: "Revisa el stock disponible." });
    }
  };

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info("Inicia sesión para guardar favoritos");
      window.location.hash = "#/ingresar";
      return;
    }
    try {
      await toggleFavorite(product.id);
    } catch {
      toast.error("No se pudo actualizar el favorito");
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl card-pop bg-card overflow-hidden hover-pop",
        className
      )}
    >
      <a
        href={`#/p/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-muted"
        aria-label={`Ver ${product.name}`}
      >
        <Image
          src={product.images[0] ?? "/images/placeholder-product.png"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {discountPct != null && discountPct > 0 && (
            <span className="sticker">-{discountPct}%</span>
          )}
          {product.isNew && <span className="sticker-flat bg-amber">Nuevo</span>}
        </div>
        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <span className="sticker-flat bg-card px-3 py-1">Agotado</span>
          </div>
        )}
      </a>

      <button
        onClick={handleFav}
        aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
        aria-pressed={isFav}
        className={cn(
          "absolute top-2 right-2 z-10 grid place-items-center w-9 h-9 rounded-full border-2 border-ink bg-card shadow-[2px_2px_0_var(--shadow-ink)] transition-transform active:scale-90",
          isFav && "bg-primary text-white"
        )}
      >
        <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
      </button>

      <div className="flex flex-col flex-1 p-3 gap-1">
        <p className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground truncate">
          {product.brand || product.categoryName}
        </p>
        <a
          href={`#/p/${product.slug}`}
          className="text-sm font-semibold leading-snug line-clamp-2 hover:underline underline-offset-2 decoration-2"
        >
          {product.name}
        </a>

        <div className="mt-auto pt-1.5">
          {product.compareAtPrice && (
            <p className="text-xs text-muted-foreground line-through">{fmtCOP(product.compareAtPrice)}</p>
          )}
          <p className="font-display text-lg font-extrabold leading-tight">{fmtCOP(product.price)}</p>
          {prepayPrice != null && (
            <p className="text-xs font-bold text-success mt-0.5">
              {fmtCOP(prepayPrice)} pagando anticipado
            </p>
          )}
          {product.stock > 0 && product.stock <= 5 && !product.hasVariants && (
            <p className="text-[0.68rem] font-semibold text-destructive mt-0.5">¡Últimas {product.stock} unidades!</p>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock || cartPending === product.id}
          aria-label={product.hasVariants ? "Elegir variante" : "Añadir al carrito"}
          className={cn(
            "mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-ink px-3 py-2 text-sm font-extrabold",
            "bg-primary text-primary-foreground shadow-[3px_3px_0_var(--shadow-ink)] press-pop",
            "disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed",
            added && "bg-success"
          )}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Añadido
            </>
          ) : product.hasVariants ? (
            "Elegir opciones"
          ) : (
            <>
              <Plus className="w-4 h-4" /> Añadir
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl card-pop bg-card overflow-hidden">
      <div className="aspect-square shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-1/3 rounded shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-2/3 rounded shimmer" />
        <div className="h-6 w-1/2 rounded shimmer mt-3" />
        <div className="h-9 w-full rounded-xl shimmer mt-2" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, loading }: { products: ProductDTO[]; loading?: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
      {loading &&
        Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)}
    </div>
  );
}
