"use client";

import { cn } from "@/lib/utils";
import { icons } from "@/lib/category-icons";

export function NovaLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <a
      href="#/"
      aria-label="Inicio NOVA Colombia"
      className={cn("flex items-center gap-2 group select-none", className)}
    >
      <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-primary border-2 border-ink shadow-[3px_3px_0_var(--shadow-ink)] group-hover:-translate-y-0.5 transition-transform">
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
          <path d="M6 19 L12 5 L18 19 L14.6 19 L12 12.6 L9.4 19 Z" fill="var(--amber)" />
          <circle cx="18.2" cy="6.8" r="2.1" fill="#fff" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display font-extrabold text-xl leading-none tracking-tight">
          NOVA
          <span className="block text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Colombia
          </span>
        </span>
      )}
    </a>
  );
}

export function SectionTitle({
  children,
  kicker,
  action,
}: {
  children: React.ReactNode;
  kicker?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div>
        {kicker && (
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1">{kicker}</p>
        )}
        <h2 className="font-display text-xl sm:text-2xl font-extrabold">
          <span className="marker-title">{children}</span>
        </h2>
      </div>
      {action}
    </div>
  );
}

export function CategoryIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = icons[name] ?? icons.Tag;
  return <Icon className={className} style={style} />;
}
