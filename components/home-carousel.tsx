"use client";

import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 372, behavior: "smooth" });
  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-end gap-2">
        <button onClick={() => scroll(-1)} aria-label={`Scroll ${label} left`}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300 bg-white text-primary-900 transition-all hover:scale-105 hover:border-primary-400 hover:shadow-card">
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
        <button onClick={() => scroll(1)} aria-label={`Scroll ${label} right`}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300 bg-white text-primary-900 transition-all hover:scale-105 hover:border-primary-400 hover:shadow-card">
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2" role="list" aria-label={label}>
        {children}
      </div>
    </div>
  );
}