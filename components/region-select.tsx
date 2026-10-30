"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe, Check } from "lucide-react";
import { REGIONS, COMING_SOON, type RegionCode } from "@/lib/regions";
import clsx from "clsx";

export function RegionSelect({ current, dark }: { current: RegionCode; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (code: RegionCode) => {
    document.cookie = `ap_region=${code};path=/;max-age=31536000;samesite=lax`;
    setOpen(false);
    router.refresh();
  };

  const r = REGIONS[current];
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Region: ${r.name}. Change region`}
        className={clsx(
          "flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-sm font-semibold transition-colors",
          dark
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-stone-300 bg-white text-primary-900 hover:border-primary-400"
        )}
      >
        <Globe className="h-3.5 w-3.5 opacity-60" aria-hidden />
        <span aria-hidden>{r.flag}</span>
        <span>{r.code}</span>
        <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div role="listbox" aria-label="Select region"
          className="animate-pop-in absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lift">
          <p className="px-4 pt-3 pb-1 text-[11px] font-bold tracking-widest text-stone-400 uppercase">Live markets</p>
          {Object.values(REGIONS).map((region) => (
            <button key={region.code} role="option" aria-selected={region.code === current}
              onClick={() => pick(region.code)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-ink hover:bg-primary-50">
              <span className="text-lg" aria-hidden>{region.flag}</span>
              <span className="flex-1">
                {region.name}
                <span className="block text-[11px] font-normal text-stone-400">{region.currency} · {region.licenseLabel}</span>
              </span>
              {region.code === current && <Check className="h-4 w-4 text-accent-600" aria-hidden />}
            </button>
          ))}
          <p className="border-t border-stone-100 px-4 pt-3 pb-1 text-[11px] font-bold tracking-widest text-stone-400 uppercase">Coming soon</p>
          <div className="flex flex-wrap gap-1.5 px-4 pt-1 pb-4">
            {COMING_SOON.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500">
                <span aria-hidden>{c.flag}</span>{c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}