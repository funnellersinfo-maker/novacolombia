"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BadgePercent,
  Briefcase,
  Car,
  Cpu,
  Dumbbell,
  Footprints,
  Gamepad2,
  Hammer,
  HeartPulse,
  PawPrint,
  Plane,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  Watch,
} from "lucide-react";
import { CATEGORIES, waLink } from "./data";

const ICONS: Record<string, LucideIcon> = {
  Cpu,
  Smartphone,
  Sofa,
  Shirt,
  Footprints,
  Sparkles,
  HeartPulse,
  Dumbbell,
  PawPrint,
  Baby,
  Gamepad2,
  Watch,
  Hammer,
  Briefcase,
  Plane,
  Car,
  ShoppingBasket,
  BadgePercent,
};

export function Categories() {
  const reduce = useReducedMotion();

  return (
    <section id="categorias" className="dots-bg scroll-mt-20 border-y-2 border-ink bg-secondary/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="sticker">18 categorías</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Un hub para todo lo tuyo
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            De la tecnología a la canasta del mercado. Toca una categoría y un asesor te
            envía el catálogo con precios por WhatsApp.
          </p>
        </motion.div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat, i) => {
            const Icon = ICONS[cat.icon] ?? ShoppingBasket;
            return (
              <motion.li
                key={cat.slug}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.4) }}
              >
                <a
                  href={waLink(
                    `Hola NOVA Colombia, quiero ver productos de la categoría "${cat.name}".`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-pop-sm hover-pop flex h-full flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center"
                  aria-label={`Ver productos de ${cat.name} por WhatsApp`}
                >
                  <span
                    className="grid size-12 place-items-center rounded-xl border-2 border-ink"
                    style={{ backgroundColor: `${cat.color}1f`, color: cat.color }}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-extrabold leading-tight">{cat.short}</span>
                  <span className="line-clamp-1 text-[11px] text-muted-foreground">
                    {cat.subs.slice(0, 2).join(" · ")}
                  </span>
                </a>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
