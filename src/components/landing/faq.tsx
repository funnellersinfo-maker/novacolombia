"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "./data";

export function Faq() {
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="scroll-mt-20 border-y-2 border-ink bg-secondary/40 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="sticker">Sin letra pequeña</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Lo que más nos preguntan antes de comprar.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10"
        >
          <Accordion
            type="single"
            collapsible
            className="card-pop rounded-2xl bg-card px-5"
          >
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`faq-${i}`}
                className={i === FAQS.length - 1 ? "border-b-0" : undefined}
              >
                <AccordionTrigger className="gap-3 py-5 text-left font-display text-base font-extrabold hover:no-underline sm:text-lg">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
