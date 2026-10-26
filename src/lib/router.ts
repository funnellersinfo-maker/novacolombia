"use client";

import { useEffect, useState, useCallback } from "react";

export type Route =
  | { name: "home" }
  | { name: "categorias" }
  | { name: "categoria"; slug: string; sub?: string }
  | { name: "producto"; slug: string }
  | { name: "buscar"; q: string; prepay?: boolean; deals?: boolean }
  | { name: "coleccion"; slug: string }
  | { name: "carrito" }
  | { name: "checkout" }
  | { name: "pedido"; number: string; isNew?: boolean }
  | { name: "seguimiento"; number?: string }
  | { name: "cuenta"; tab?: string }
  | { name: "ingresar" }
  | { name: "favoritos" }
  | { name: "legal"; slug: string }
  | { name: "admin"; section?: string };

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart] = raw.split("?");
  const params = new URLSearchParams(queryPart ?? "");
  const parts = pathPart.split("/").filter(Boolean);

  if (parts.length === 0) return { name: "home" };
  const [a, b] = parts;

  switch (a) {
    case "categorias":
      return { name: "categorias" };
    case "c":
      return b ? { name: "categoria", slug: b, sub: params.get("sub") ?? undefined } : { name: "categorias" };
    case "p":
      return b ? { name: "producto", slug: b } : { name: "home" };
    case "buscar":
      return {
        name: "buscar",
        q: params.get("q") ?? "",
        prepay: params.get("prepay") === "1",
        deals: params.get("deals") === "1",
      };
    case "coleccion":
      return b ? { name: "coleccion", slug: b } : { name: "home" };
    case "carrito":
      return { name: "carrito" };
    case "checkout":
      return { name: "checkout" };
    case "pedido":
      return b ? { name: "pedido", number: b, isNew: params.get("new") === "1" } : { name: "home" };
    case "seguimiento":
      return { name: "seguimiento", number: b };
    case "cuenta":
      return { name: "cuenta", tab: b };
    case "ingresar":
      return { name: "ingresar" };
    case "favoritos":
      return { name: "favoritos" };
    case "legal":
      return b ? { name: "legal", slug: b } : { name: "home" };
    case "admin":
      return { name: "admin", section: b };
    default:
      return { name: "home" };
  }
}

export function routeToPath(route: Route): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "categorias":
      return "#/categorias";
    case "categoria":
      return route.sub ? `#/c/${route.slug}?sub=${encodeURIComponent(route.sub)}` : `#/c/${route.slug}`;
    case "producto":
      return `#/p/${route.slug}`;
    case "buscar":
      return `#/buscar?q=${encodeURIComponent(route.q)}${route.prepay ? "&prepay=1" : ""}${route.deals ? "&deals=1" : ""}`;
    case "coleccion":
      return `#/coleccion/${route.slug}`;
    case "carrito":
      return "#/carrito";
    case "checkout":
      return "#/checkout";
    case "pedido":
      return `#/pedido/${route.number}${route.isNew ? "?new=1" : ""}`;
    case "seguimiento":
      return route.number ? `#/seguimiento/${route.number}` : "#/seguimiento";
    case "cuenta":
      return route.tab ? `#/cuenta/${route.tab}` : "#/cuenta";
    case "ingresar":
      return "#/ingresar";
    case "favoritos":
      return "#/favoritos";
    case "legal":
      return `#/legal/${route.slug}`;
    case "admin":
      return route.section ? `#/admin/${route.section}` : "#/admin";
  }
}

export function navigate(path: string) {
  if (window.location.hash === path) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = path;
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === "undefined" ? { name: "home" } : parseRoute(window.location.hash)
  );

  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const go = useCallback((path: string) => navigate(path), []);

  return { route, go };
}
