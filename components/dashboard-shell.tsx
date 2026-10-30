"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Wallet, KeyRound, UserCircle2, PlusSquare,
  Users, ShieldCheck, Mail, ShieldAlert, type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { Badge } from "@/components/ui";
import type { ReactNode } from "react";

type Item = { href: string; label: string; icon: LucideIcon };

const PROVIDER: Item[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/jobs", label: "My jobs", icon: Briefcase },
  { href: "/dashboard/earnings", label: "Earnings", icon: Wallet },
  { href: "/dashboard/access-codes", label: "Access codes", icon: KeyRound },
  { href: "/dashboard/profile", label: "Profile & rates", icon: UserCircle2 },
];

const HOMEOWNER: Item[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/jobs", label: "My jobs", icon: Briefcase },
  { href: "/dashboard/post-job", label: "Post a job", icon: PlusSquare },
  { href: "/dashboard/access", label: "Temporary access", icon: KeyRound },
  { href: "/dashboard/pros", label: "Find pros", icon: Users },
];

export function DashboardShell({ name, role, verification, children }: {
  name: string;
  role: string;
  verification?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const items = role === "provider" ? PROVIDER : role === "admin"
    ? [{ href: "/admin", label: "Admin console", icon: ShieldAlert }]
    : HOMEOWNER;

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[236px_1fr]">
        <aside>
          <div className="lg:sticky lg:top-24">
            <div className="hidden lg:block">
              <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">Signed in</p>
              <p className="mt-1 font-display text-lg font-bold text-primary-900">{name}</p>
              <div className="mt-1.5">
                {role === "provider" && verification === "fully_verified" && <Badge kind="verified" pulse>Fully Verified</Badge>}
                {role === "provider" && verification === "facial_pending" && <Badge kind="premium">Facial pending</Badge>}
                {role === "provider" && verification === "unverified" && <Badge kind="neutral">Unverified</Badge>}
                {role === "homeowner" && <Badge kind="charcoal">Homeowner</Badge>}
                {role === "admin" && <Badge kind="charcoal">Admin</Badge>}
              </div>
            </div>
            <nav aria-label="Dashboard" className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto lg:mt-6 lg:flex-col">
              {items.map((it) => {
                const active = pathname === it.href;
                return (
                  <Link key={it.href} href={it.href} aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
                      active
                        ? "bg-primary-900 text-white shadow-card"
                        : "text-stone-600 hover:bg-white hover:text-primary-900 hover:shadow-card"
                    )}>
                    <it.icon className={clsx("h-4.5 w-4.5", active ? "text-accent-400" : "text-stone-400")} aria-hidden />
                    {it.label}
                  </Link>
                );
              })}
              <Link href="/dev/inbox"
                className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-white hover:text-primary-900 hover:shadow-card">
                <Mail className="h-4.5 w-4.5 text-stone-400" aria-hidden /> Demo inbox
              </Link>
              <Link href="/trust-and-safety"
                className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-white hover:text-primary-900 hover:shadow-card">
                <ShieldCheck className="h-4.5 w-4.5 text-stone-400" aria-hidden /> Trust & safety
              </Link>
            </nav>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}