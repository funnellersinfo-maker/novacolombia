"use client";

import { NovaLogo } from "./brand";
import { useApp } from "@/store/app";
import { Mail, Phone } from "lucide-react";

export function Footer() {
  const { bootstrap } = useApp();
  const brand = bootstrap?.brand;
  const legal = bootstrap?.legalSlugs ?? [];
  const categories = (bootstrap?.categories ?? []).filter((c) => !c.special).slice(0, 6);

  const legalLabels: Record<string, string> = {
    terminos: "Términos y condiciones",
    privacidad: "Política de privacidad",
    datos: "Tratamiento de datos",
    cambios: "Cambios y devoluciones",
    envios: "Condiciones de envío",
    vendedor: "Información del vendedor",
    sac: "Atención y reclamaciones",
  };

  return (
    <footer className="mt-auto bg-ink text-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="[&_span]:text-background">
            <NovaLogo />
          </div>
          <p className="mt-3 text-sm text-background/70 max-w-xs">
            {brand?.tagline ?? "Descubre, compra, disfruta"}. Supertienda colombiana con envíos
            nacionales y dos formas de pagar: contraentrega o anticipado con 10% de descuento.
          </p>
          <p className="mt-3 text-xs text-background/50">
            {brand?.name ?? "NOVA Colombia"} es un nombre comercial provisional.
          </p>
        </div>

        <div>
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider mb-3">Categorías</h3>
          <ul className="space-y-1.5 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <a href={`#/c/${c.slug}`} className="text-background/75 hover:text-amber transition-colors">
                  {c.name}
                </a>
              </li>
            ))}
            <li>
              <a href="#/categorias" className="font-bold text-amber hover:underline">
                Ver todas →
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider mb-3">Ayuda</h3>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a href="#/seguimiento" className="text-background/75 hover:text-amber transition-colors">
                Seguimiento de pedidos
              </a>
            </li>
            {legal.map((l) => (
              <li key={l.slug}>
                <a href={`#/legal/${l.slug}`} className="text-background/75 hover:text-amber transition-colors">
                  {legalLabels[l.slug] ?? l.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider mb-3">Contacto</h3>
          <ul className="space-y-2 text-sm text-background/75">
            {brand?.supportEmail && (
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" /> {brand.supportEmail}
              </li>
            )}
            {brand?.supportPhone && (
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" /> {brand.supportPhone}
              </li>
            )}
          </ul>
          <div className="mt-4 rounded-xl border-2 border-background/25 p-3 text-xs text-background/70">
            <p className="font-bold text-background/90 mb-1">Modalidades de pago</p>
            Pago contraentrega (según cobertura) y pago anticipado con 10% de descuento en
            productos elegibles. Los medios de pago electrónicos se activan al conectar el
            proveedor de pagos (actualmente en modo pruebas).
          </div>
        </div>
      </div>
      <div className="border-t border-background/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-background/55">
          <p>© {new Date().getFullYear()} {brand?.name ?? "NOVA Colombia"} — {brand?.domain}</p>
          <p>Hecho con 💛 en Colombia · Precios en COP</p>
        </div>
      </div>
    </footer>
  );
}
