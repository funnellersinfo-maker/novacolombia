"use client";

import type { ReactNode } from "react";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Send, Twitter, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LEGAL_DOCS, SITE, type LegalDoc } from "./data";

const SOCIAL_ICONS: Record<string, typeof Instagram> = {
  Instagram,
  Facebook,
  TikTok: Send,
  X: Twitter,
};

/** Renderiza el cuerpo del legal con **negritas** y listas "- " simples. */
function LegalBody({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/);
  const renderInline = (text: string): ReactNode[] => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-extrabold text-foreground">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.trim().slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="leading-relaxed">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}

function LegalDialog({ doc }: { doc: LegalDoc }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full rounded-lg px-2 py-1.5 text-left text-sm font-semibold text-[#faf3e9]/80 transition-colors hover:bg-white/10 hover:text-[#faf3e9]">
          {doc.title}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto border-2 border-ink bg-card p-6 sm:max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl font-extrabold">
            {doc.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Documento legal de NOVA Colombia
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 text-sm text-muted-foreground sm:text-base">
          <LegalBody body={doc.body} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

const FOOTER_CATEGORIES = [
  "Tecnología",
  "Celulares",
  "Hogar",
  "Moda",
  "Deportes",
  "Mascotas",
  "Bebés",
  "Ofertas",
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-2 border-ink bg-ink text-[#faf3e9]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl border-2 border-[#faf3e9] bg-primary">
              <Zap className="size-5 text-primary-foreground" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-extrabold">
              NOVA
              <span className="ml-1.5 align-middle text-xs font-bold uppercase tracking-widest text-[#ffc838]">
                Colombia
              </span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#faf3e9]/75">
            {SITE.tagline}. Supertienda online de nueva generación con dos formas de
            pagar y envíos a todo el país.
          </p>
          <ul className="mt-5 flex gap-2" aria-label="Redes sociales">
            {SITE.socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.name] ?? Instagram;
              return (
                <li key={social.name}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`NOVA Colombia en ${social.name}`}
                    className="grid size-10 place-items-center rounded-xl border-2 border-[#faf3e9]/60 text-[#faf3e9]/80 transition-colors hover:border-[#ffc838] hover:bg-[#ffc838] hover:text-ink"
                  >
                    <Icon className="size-4.5" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label="Contacto">
          <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-[#ffc838]">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-[#ffc838]" aria-hidden="true" />
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:underline">
                {SITE.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-[#ffc838]" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className="break-all hover:underline">
                <span className="break-all">{SITE.email}</span>
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#ffc838]" aria-hidden="true" />
              <span>{SITE.address}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-[#ffc838]" aria-hidden="true" />
              <span className="whitespace-pre-line">{SITE.hours}</span>
            </li>
          </ul>
        </nav>

        <nav aria-label="Categorías principales">
          <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-[#ffc838]">
            Categorías
          </h3>
          <ul className="mt-4 space-y-1">
            {FOOTER_CATEGORIES.map((cat) => (
              <li key={cat}>
                <a
                  href="#categorias"
                  className="rounded-lg px-2 py-1.5 text-sm font-semibold text-[#faf3e9]/80 transition-colors hover:bg-white/10 hover:text-[#faf3e9]"
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Información legal">
          <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-[#ffc838]">
            Legal
          </h3>
          <ul className="mt-4 space-y-1">
            {LEGAL_DOCS.map((doc) => (
              <li key={doc.slug}>
                <LegalDialog doc={doc} />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-[#faf3e9]/60 sm:flex-row sm:text-left">
          <p>© {year} {SITE.name}. Todos los derechos reservados.</p>
          <p>Hecho en Colombia · Sitio en configuración: algunos datos de contacto son provisionales.</p>
        </div>
      </div>
    </footer>
  );
}
