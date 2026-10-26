"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BadgePercent,
  HandCoins,
  PackageCheck,
  ShoppingBasket,
  Wallet,
} from "lucide-react";
import { fmtCOP } from "./data";

const EXAMPLE_LIST_PRICE = 500000;

const STEPS = [
  {
    n: "1",
    icon: ShoppingBasket,
    title: "Elige tus productos",
    text: "Explora las 18 categorías y arma tu lista. Un asesor te confirma disponibilidad y precios al momento.",
  },
  {
    n: "2",
    icon: Wallet,
    title: "Escoge cómo pagar",
    text: "Anticipado con 10% de descuento, o contraentrega donde haya cobertura. Compara y decide sin presión.",
  },
  {
    n: "3",
    icon: PackageCheck,
    title: "Recibe en tu puerta",
    text: "Despachamos con las principales transportadoras y te informamos la guía para hacer seguimiento.",
  },
];

export function Benefits() {
  const reduce = useReducedMotion();

  return (
    <section id="como-funciona" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="sticker-flat border-ink bg-secondary text-secondary-foreground">
            Regla de la casa
          </span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Dos formas de pagar. <span className="marker-title">Tú eliges.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            La misma tienda, la misma garantía. La única diferencia es cuánto ahorras
            según cuándo pagas.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <motion.article
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="card-pop relative overflow-hidden rounded-2xl bg-card p-6 sm:p-8"
          >
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-10 size-40 rounded-full bg-success/15"
            />
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl border-2 border-ink bg-success text-success-foreground">
                <BadgePercent className="size-6" aria-hidden="true" />
              </span>
              <span className="sticker-flat border-ink bg-success text-sm text-success-foreground">
                Ahorra 10%
              </span>
            </div>
            <h3 className="mt-4 font-display text-2xl font-extrabold">
              Pago anticipado con 10% de descuento
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Paga tu pedido por adelantado y te descontamos el{" "}
              <strong className="text-success">10% sobre el subtotal de los productos
              elegibles</strong> (el envío no entra en el cálculo). El descuento se
              muestra antes de confirmar y desaparece si cambias a contraentrega. Sin
              letra pequeña.
            </p>
            <div className="mt-5 rounded-xl border-2 border-dashed border-success/50 bg-success/5 p-4">
              <p className="text-sm font-bold text-success">
                Ejemplo real de la regla:
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Productos por <s>{fmtCOP(EXAMPLE_LIST_PRICE)}</s> → pagas{" "}
                <strong className="text-foreground">{fmtCOP(EXAMPLE_LIST_PRICE * 0.9)}</strong>{" "}
                al anticipar el pago.
              </p>
            </div>
          </motion.article>

          <motion.article
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="card-pop relative overflow-hidden rounded-2xl bg-card p-6 sm:p-8"
          >
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-10 size-40 rounded-full bg-accent"
            />
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl border-2 border-ink bg-accent text-accent-foreground">
                <HandCoins className="size-6" aria-hidden="true" />
              </span>
              <span className="sticker-flat border-ink bg-card text-foreground">
                Paga al recibir
              </span>
            </div>
            <h3 className="mt-4 font-display text-2xl font-extrabold">
              Pago contraentrega
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              ¿Prefieres pagar cuando recibes? Elige contraentrega donde esté
              disponible (según tu ciudad y el producto). En esta modalidad{" "}
              <strong className="text-foreground">no aplica el descuento del 10%</strong>,
              pero la garantía, los cambios y las devoluciones son exactamente las
              mismas.
            </p>
            <div className="mt-5 rounded-xl border-2 border-dashed border-ink/20 bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Un asesor confirma la cobertura de tu zona y la disponibilidad del
                producto antes de generar el pedido. Nada se cobra sin tu aprobación.
              </p>
            </div>
          </motion.article>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.n}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="card-pop-sm relative rounded-2xl bg-card p-6"
            >
              <span
                aria-hidden="true"
                className="absolute -top-3 -left-3 grid size-9 place-items-center rounded-full border-2 border-ink bg-amber font-display text-base font-extrabold text-ink shadow-[2px_2px_0_var(--shadow-ink)]"
              >
                {step.n}
              </span>
              <step.icon className="size-8 text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-extrabold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
