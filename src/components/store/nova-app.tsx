"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { useRoute } from "@/lib/router";
import { useApp } from "@/store/app";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { Footer } from "./footer";
import { HomeView } from "./home-view";
import { CategoryHub } from "./category-hub";
import { BrowseView } from "./browse-view";
import { ProductView } from "./product-view";
import { CartView } from "./cart-view";
import { CheckoutView } from "./checkout-view";
import { OrderConfirmationView } from "./order-confirmation";
import { TrackView } from "./track-view";
import { AccountView } from "./account-view";
import { LegalView } from "./legal-view";
import { AdminApp } from "@/components/admin/admin-app";
import { Loader2 } from "lucide-react";

function View() {
  const { route } = useRoute();
  const { initialized } = useApp();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  if (!initialized) {
    return (
      <div className="grid place-items-center min-h-[60vh]" role="status" aria-label="Cargando tienda">
        <div className="text-center space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-primary mx-auto" />
          <p className="font-display font-extrabold text-lg">Cargando NOVA…</p>
        </div>
      </div>
    );
  }

  if (route.name === "admin") {
    return <AdminApp section={route.section} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main" className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-5 py-5 sm:py-8 pb-24 md:pb-8">
        {route.name === "home" && <HomeView />}
        {route.name === "categorias" && <CategoryHub />}
        {route.name === "categoria" && (
          <BrowseView key={`cat-${route.slug}`} mode="categoria" slug={route.slug} sub={route.sub} />
        )}
        {route.name === "buscar" && (
          <BrowseView key={`q-${route.q}-${route.prepay}-${route.deals}`} mode="buscar" q={route.q} prepay={route.prepay} deals={route.deals} />
        )}
        {route.name === "coleccion" && <BrowseView key={`col-${route.slug}`} mode="coleccion" slug={route.slug} />}
        {route.name === "producto" && <ProductView key={route.slug} slug={route.slug} />}
        {route.name === "carrito" && <CartView />}
        {route.name === "checkout" && <CheckoutView />}
        {route.name === "pedido" && <OrderConfirmationView key={route.number} number={route.number} isNew={route.isNew} />}
        {route.name === "seguimiento" && <TrackView number={route.number} />}
        {route.name === "cuenta" && <AccountView tab={route.tab ?? "pedidos"} />}
        {route.name === "ingresar" && <AccountView tab="pedidos" />}
        {route.name === "favoritos" && (
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-2xl font-extrabold mb-5">
              <span className="marker-title">Mis favoritos</span>
            </h1>
            <AccountView tab="favoritos" />
          </div>
        )}
        {route.name === "legal" && <LegalView key={route.slug} slug={route.slug} />}
      </main>
      <Footer />
      <BottomNav active={bottomActive(route.name)} />
    </div>
  );
}

function bottomActive(name: string): string {
  if (name === "home") return "home";
  if (name === "categorias" || name === "categoria" || name === "coleccion") return "categorias";
  if (name === "buscar") return "buscar";
  if (name === "carrito" || name === "checkout" || name === "pedido") return "carrito";
  if (["cuenta", "ingresar", "favoritos", "seguimiento"].includes(name)) return "cuenta";
  return "";
}

export function NovaApp() {
  const init = useApp((s) => s.init);
  useEffect(() => {
    void init();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <View />
    </ThemeProvider>
  );
}
