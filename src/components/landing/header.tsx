"use client";

import { useState } from "react";
import { Menu, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SITE, waLink } from "./data";

const NAV = [
  { href: "#inicio", label: "Inicio" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#categorias", label: "Categorías" },
  { href: "#productos", label: "Productos" },
  { href: "#faq", label: "Preguntas" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <a href="#inicio" className="flex items-center gap-2.5" aria-label="NOVA Colombia — inicio">
          <span className="grid size-9 place-items-center rounded-xl border-2 border-ink bg-primary text-primary-foreground shadow-[3px_3px_0_var(--shadow-ink)]">
            <Zap className="size-5" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-extrabold leading-none">
            NOVA
            <span className="ml-1.5 align-middle text-xs font-bold uppercase tracking-widest text-primary">
              Colombia
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-bold text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className="hidden bg-success text-success-foreground shadow-[3px_3px_0_var(--shadow-ink)] hover:bg-success/90 sm:inline-flex"
          >
            <a
              href={waLink("Hola NOVA Colombia, quiero hacer un pedido.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Pedir por WhatsApp
            </a>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-ink md:hidden"
                aria-label="Abrir menú de navegación"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-2 border-ink bg-background p-0">
              <SheetHeader className="border-b-2 border-ink p-4">
                <SheetTitle className="font-display text-lg font-extrabold">
                  NOVA Colombia
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Menú de navegación móvil
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4" aria-label="Navegación móvil">
                {NAV.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-bold hover:bg-secondary"
                  >
                    {item.label}
                  </a>
                ))}
                <Button
                  asChild
                  className="mt-3 bg-success text-success-foreground shadow-[3px_3px_0_var(--shadow-ink)] hover:bg-success/90"
                >
                  <a
                    href={waLink("Hola NOVA Colombia, quiero hacer un pedido.")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Pedir por WhatsApp
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
