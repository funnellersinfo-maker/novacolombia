"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { PRODUCTS, fmtCOP, prepayPrice, waLink, type Product } from "./data";

function productMessage(p: Product): string {
  const lines = [
    `Hola NOVA Colombia, me interesa este producto:`,
    ``,
    `• ${p.name} — ${fmtCOP(p.price)}`,
  ];
  if (p.prepayEligible) {
    lines.push(`  (Pagando anticipado: ${fmtCOP(prepayPrice(p.price))} con el 10% de descuento)`);
  }
  lines.push(``, `¿Me ayudan a confirmar disponibilidad y envío?`);
  return lines.join("\n");
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const reduce = useReducedMotion();
  const anticipado = prepayPrice(product.price);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min((index % 4) * 0.06, 0.3) }}
      className="card-pop hover-pop flex flex-col overflow-hidden rounded-2xl bg-card"
    >
      <div className="relative aspect-square overflow-hidden border-b-2 border-ink bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        {product.isNew && (
          <span className="sticker absolute left-3 top-3">Nuevo</span>
        )}
        {product.prepayEligible && (
          <span className="sticker-flat absolute right-3 top-3 border-ink bg-success text-success-foreground">
            −10% anticipado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>
        <h3 className="font-display text-base font-extrabold leading-snug">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-auto pt-3">
          {product.prepayEligible ? (
            <div className="flex flex-wrap items-end gap-x-2 gap-y-0.5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-success">
                  Pagando anticipado
                </p>
                <p className="font-display text-2xl font-extrabold leading-tight text-success">
                  {fmtCOP(anticipado)}
                </p>
              </div>
              <p className="pb-1 text-sm font-medium text-muted-foreground line-through">
                {fmtCOP(product.price)}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-display text-2xl font-extrabold leading-tight">
                {fmtCOP(product.price)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Producto de canasta: no aplica descuento anticipado
              </p>
            </div>
          )}
        </div>

        <a
          href={waLink(productMessage(product))}
          target="_blank"
          rel="noopener noreferrer"
          className="press-pop mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-success text-sm font-extrabold text-success-foreground shadow-[3px_3px_0_var(--shadow-ink)] transition-colors hover:bg-success/90"
          aria-label={`Pedir ${product.name} por WhatsApp`}
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Pedir por WhatsApp
        </a>
      </div>
    </motion.article>
  );
}

export function Products() {
  const reduce = useReducedMotion();

  return (
    <section id="productos" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="sticker">Selección de la casa</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Productos destacados
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Una muestra de nuestro catálogo. Pide el tuyo por WhatsApp y un asesor
            confirma pago, envío y entrega.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          * El descuento del 10% por pago anticipado aplica sobre el subtotal de
          productos elegibles y no incluye el envío. Precios en pesos colombianos (COP).
        </p>
      </div>
    </section>
  );
}
