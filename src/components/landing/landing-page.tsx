"use client";

import { Header } from "./header";
import { Hero, TickerStrip } from "./hero";
import { Benefits } from "./benefits";
import { Categories } from "./categories";
import { Products } from "./products";
import { Faq } from "./faq";
import { Contact } from "./contact";
import { Footer } from "./footer";
import { FloatingActions } from "./floating";

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col overflow-x-clip bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <TickerStrip />
        <Benefits />
        <Categories />
        <Products />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
