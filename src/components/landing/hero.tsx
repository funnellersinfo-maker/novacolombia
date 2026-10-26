"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, BadgePercent, HandCoins, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRUST = [
  { icon: BadgePercent, label: "Pago anticipado −10%" },
  { icon: HandCoins, label: "Contraentrega disponible" },
  { icon: Truck, label: "Envíos a toda Colombia" },
];

const TICKER_ITEMS = [
  "Envíos a toda Colombia",
  "Pago anticipado = 10% de descuento",
  "Contraentrega disponible",
  "18 categorías para explorar",
  "Precios en pesos colombianos",
  "Devoluciones según la ley",
];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="inicio" className="relative flex min-h-[88svh] items-center overflow-hidden">
      {/* Fondo + overlay para contraste */}
      <Image
        src="/images/hero-main.webp"
        alt="Personas celebrando compras en línea con cajas y bolsas a domicilio"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#241a12]/90 via-[#241a12]/60 to-[#241a12]/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticker mb-5"
        >
          Supertienda colombiana · Nueva generación
        </motion.span>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl font-display text-4xl font-extrabold leading-[1.05] text-[#faf3e9] sm:text-5xl lg:text-6xl"
        >
          Descubre tu próxima compra{" "}
          <span className="marker-title">favorita</span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 max-w-xl text-base font-medium text-[#faf3e9]/90 sm:text-lg"
        >
          Miles de productos con envío a toda Colombia y dos formas de pagar:{" "}
          <strong className="text-[#ffc838]">anticipado con 10% de descuento</strong> o{" "}
          <strong className="text-[#ffc838]">contraentrega</strong>. Tú eliges.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Button
            asChild
            size="lg"
            className="h-12 border-2 border-ink bg-primary px-7 text-base font-extrabold text-primary-foreground shadow-[4px_4px_0_var(--shadow-ink)] hover:bg-primary/90"
          >
            <a href="#productos">
              Explorar productos
              <ArrowDown className="size-5" aria-hidden="true" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-2 border-[#faf3e9] bg-transparent px-7 text-base font-extrabold text-[#faf3e9] shadow-[4px_4px_0_rgba(0,0,0,0.35)] hover:bg-[#faf3e9] hover:text-ink"
          >
            <a href="#como-funciona">Cómo funciona el 10%</a>
          </Button>
        </motion.div>

        <motion.ul
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-2.5"
          aria-label="Ventajas de comprar en NOVA Colombia"
        >
          {TRUST.map((t) => (
            <li
              key={t.label}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#faf3e9]/80 bg-[#241a12]/45 px-3.5 py-2 text-sm font-bold text-[#faf3e9] backdrop-blur-sm"
            >
              <t.icon className="size-4 text-[#ffc838]" aria-hidden="true" />
              {t.label}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

export function TickerStrip() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="overflow-hidden border-y-2 border-ink bg-amber py-2.5"
      aria-label="Beneficios de la tienda"
    >
      <div className="flex w-max animate-ticker items-center gap-8 pr-8">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            aria-hidden={i >= TICKER_ITEMS.length}
            className="flex items-center gap-8 whitespace-nowrap text-sm font-extrabold uppercase tracking-wide text-ink"
          >
            {item}
            <span aria-hidden="true" className="text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
