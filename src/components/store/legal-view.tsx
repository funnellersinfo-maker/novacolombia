"use client";

import { useEffect, useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { api } from "@/lib/client-api";
import ReactMarkdown from "react-markdown";
import { useApp } from "@/store/app";

export function LegalView({ slug }: { slug: string }) {
  const { bootstrap } = useApp();
  const [doc, setDoc] = useState<{ title: string; body: string } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ doc: { title: string; body: string } }>(`/api/legal/${slug}`)
      .then((r) => {
        if (!cancelled) setDoc(r.doc);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const legal = bootstrap?.legalSlugs ?? [];

  return (
    <div className="max-w-4xl mx-auto grid lg:grid-cols-[240px_1fr] gap-6 items-start">
      <nav aria-label="Documentos legales" className="rounded-2xl card-pop bg-card p-3">
        <p className="text-xs font-extrabold uppercase text-muted-foreground px-2 mb-2">Información legal</p>
        <ul className="space-y-1">
          {legal.map((l) => (
            <li key={l.slug}>
              <a
                href={`#/legal/${l.slug}`}
                className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  l.slug === slug ? "bg-ink text-background" : "hover:bg-muted"
                }`}
              >
                {l.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <article className="rounded-3xl card-pop bg-card p-6 sm:p-8">
        {error ? (
          <p className="text-sm text-muted-foreground">Documento no encontrado.</p>
        ) : !doc ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-accent border-2 border-ink">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold">{doc.title}</h1>
            </div>
            <div className="prose-legal text-sm leading-relaxed space-y-3 [&_strong]:font-extrabold [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_li]:text-foreground/85">
              <ReactMarkdown>{doc.body}</ReactMarkdown>
            </div>
            <p className="mt-6 text-xs text-muted-foreground border-t border-ink/15 pt-4">
              Última actualización de este texto editable: desde el panel administrativo. Los documentos
              legales deben revisarse con un profesional antes del lanzamiento comercial.
            </p>
          </>
        )}
      </article>
    </div>
  );
}
