import Link from "next/link";
import { cookies } from "next/headers";
import { ShieldCheck } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { regionOf } from "@/lib/regions";
import { RegionSelect } from "@/components/region-select";
import { UserMenu, MobileNav } from "@/components/nav-client";
import { Button } from "@/components/ui";

const NAV = [
  { href: "/gigs", label: "Browse gigs" },
  { href: "/for-providers", label: "For providers" },
  { href: "/for-homeowners", label: "For homeowners" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

export async function Header() {
  const user = await getSessionUser();
  const jar = await cookies();
  const region = regionOf(jar.get("ap_region")?.value);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-8xl items-center gap-6 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label="AccessPro home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-900 shadow-card">
            <ShieldCheck className="h-5 w-5 text-accent-400" aria-hidden />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-primary-900">
            Access<span className="text-accent-600">Pro</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-primary-50 hover:text-primary-900">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <RegionSelect current={region.code} />
          {user ? (
            <UserMenu name={user.name} role={user.role} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button href="/login" variant="ghost" size="sm">Log in</Button>
              <Button href="/signup" variant="primary" size="sm">Get started</Button>
            </div>
          )}
          <MobileNav user={user ? { name: user.name, role: user.role } : null} links={NAV} />
        </div>
      </div>
    </header>
  );
}