"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, ShieldCheck, Mail } from "lucide-react";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function UserMenu({ name, role }: { name: string; role: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Account menu"
        className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white py-1 pr-2 pl-1 transition-colors hover:border-primary-400">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-900 text-[11px] font-bold text-accent-400">
          {initials(name)}
        </span>
        <span className="hidden text-sm font-semibold text-primary-900 md:block">{name.split(" ")[0]}</span>
        <ChevronDown className="h-3.5 w-3.5 text-stone-400" aria-hidden />
      </button>
      {open && (
        <div className="animate-pop-in absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-stone-200 bg-white py-1.5 shadow-lift">
          <div className="border-b border-stone-100 px-4 py-2.5">
            <p className="text-sm font-bold text-primary-900">{name}</p>
            <p className="text-xs font-medium text-accent-600 capitalize">{role}</p>
          </div>
          <Link href={role === "admin" ? "/admin" : "/dashboard"} onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink hover:bg-primary-50">
            <LayoutDashboard className="h-4 w-4 text-stone-400" aria-hidden /> Dashboard
          </Link>
          <Link href="/dev/inbox" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink hover:bg-primary-50">
            <Mail className="h-4 w-4 text-stone-400" aria-hidden /> Demo mail inbox
          </Link>
          {role === "provider" && (
            <Link href="/trust-and-safety" onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink hover:bg-primary-50">
              <ShieldCheck className="h-4 w-4 text-stone-400" aria-hidden /> Verification & trust
            </Link>
          )}
          <form action={logoutAction}>
            <button type="submit"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50">
              <LogOut className="h-4 w-4" aria-hidden /> Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function MobileNav({ user, links }: {
  user: { name: string; role: string } | null;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-300 bg-white text-primary-900">
        {open ? <X className="h-4.5 w-4.5" aria-hidden /> : <Menu className="h-4.5 w-4.5" aria-hidden />}
      </button>
      {open && (
        <div className="animate-pop-in absolute top-16 right-0 left-0 z-50 border-b border-stone-200 bg-white px-4 pt-2 pb-5 shadow-lift">
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-semibold text-primary-900 hover:bg-primary-50">
                {n.label}
              </Link>
            ))}
            <Link href="/trust-and-safety" onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-[15px] font-semibold text-primary-900 hover:bg-primary-50">
              Trust & safety
            </Link>
            <Link href="/help" onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-[15px] font-semibold text-primary-900 hover:bg-primary-50">
              Help & FAQ
            </Link>
          </nav>
          <div className="mt-3 flex gap-2 border-t border-stone-100 pt-4">
            {user ? (
              <Button href={user.role === "admin" ? "/admin" : "/dashboard"} className="flex-1" onClick={() => setOpen(false)}>
                Open dashboard
              </Button>
            ) : (
              <>
                <Button href="/login" variant="secondary" className="flex-1">Log in</Button>
                <Button href="/signup" className="flex-1">Get started</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}