"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";

export function Countdown({ until, className }: { until: number; className?: string }) {
  const [left, setLeft] = useState(Math.max(0, until - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, until - Date.now())), 1000);
    return () => clearInterval(t);
  }, [until]);
  const h = Math.floor(left / 36e5);
  const m = Math.floor((left % 36e5) / 6e4);
  const s = Math.floor((left % 6e4) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className={className} suppressHydrationWarning>
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

export function LiveTicker({ items, dark }: { items: string[]; dark?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 3600);
    return () => clearInterval(t);
  }, [items.length]);
  return (
    <div className={`flex items-center gap-2.5 overflow-hidden text-[13px] font-medium ${dark ? "text-stone-300" : "text-stone-600"}`}>
      <Activity className={`h-4 w-4 shrink-0 ${dark ? "text-accent-400" : "text-accent-600"}`} aria-hidden />
      <div className="relative h-5 flex-1" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-x-0 truncate"
          >
            {items[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}