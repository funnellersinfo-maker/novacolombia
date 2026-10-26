"use client";

import { Home, LayoutGrid, Search, ShoppingCart, User as UserIcon } from "lucide-react";
import { useApp } from "@/store/app";
import { cn } from "@/lib/utils";

export function BottomNav({ active }: { active: string }) {
  const { cart } = useApp();
  const itemCount = cart?.itemCount ?? 0;

  const items = [
    { id: "home", href: "#/", label: "Inicio", icon: Home },
    { id: "categorias", href: "#/categorias", label: "Categorías", icon: LayoutGrid },
    { id: "buscar", href: "#/buscar", label: "Buscar", icon: Search },
    { id: "carrito", href: "#/carrito", label: "Carrito", icon: ShoppingCart, badge: itemCount },
    { id: "cuenta", href: "#/cuenta", label: "Cuenta", icon: UserIcon },
  ];

  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/97 backdrop-blur border-t-2 border-ink"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 text-[0.62rem] font-bold uppercase tracking-wide transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative">
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.6]")} />
                {item.badge != null && item.badge > 0 && (
                  <span
                    key={item.badge}
                    className="absolute -top-1.5 -right-2 grid place-items-center min-w-4 h-4 px-1 rounded-full bg-amber text-ink text-[0.58rem] font-extrabold border border-ink animate-badge"
                  >
                    {item.badge}
                  </span>
                )}
              </span>
              {item.label}
              {isActive && <span className="absolute top-0 inset-x-5 h-0.5 rounded-full bg-primary" />}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
