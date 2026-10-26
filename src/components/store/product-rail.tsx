"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./product-card";
import type { ProductDTO } from "@/lib/types";

export function ProductRail({ products }: { products: ProductDTO[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <div className="relative group/rail">
      <div
        ref={ref}
        className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1 -mx-1 px-1"
      >
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[46%] xs:w-[42%] sm:w-[31%] md:w-[23%] lg:w-[19%] xl:w-[15.5%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll(-1)}
        aria-label="Anterior"
        className="hidden md:grid absolute -left-4 top-1/3 place-items-center w-10 h-10 rounded-full card-pop-sm bg-card opacity-0 group-hover/rail:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Siguiente"
        className="hidden md:grid absolute -right-4 top-1/3 place-items-center w-10 h-10 rounded-full card-pop-sm bg-card opacity-0 group-hover/rail:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
