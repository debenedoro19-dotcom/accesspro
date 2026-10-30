import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const cols = [
  {
    title: "Marketplace",
    links: [
      { href: "/gigs", label: "Browse high-pay gigs" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/help", label: "Help & FAQ" },
    ],
  },
  {
    title: "For you",
    links: [
      { href: "/for-providers", label: "Service providers" },
      { href: "/for-homeowners", label: "Homeowners" },
      { href: "/signup", label: "Create account" },
      { href: "/dev/inbox", label: "Demo mail inbox" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About AccessPro" },
      { href: "/trust-and-safety", label: "Trust & safety" },
      { href: "/login", label: "Log in" },
      { href: "/admin", label: "Admin (internal)" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-primary-800 bg-primary-950 text-stone-300">
      <div className="mx-auto max-w-8xl px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-800">
                <ShieldCheck className="h-5 w-5 text-accent-400" aria-hidden />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                Access<span className="text-accent-400">Pro</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
              The premium marketplace for verified local trades — with secure,
              time-limited home access when you're not there.
            </p>
            <p className="mt-5 flex items-center gap-1.5" aria-label="Live regions: US, Canada, UK, Australia">
              {["US", "CA", "UK", "AU"].map((r) => (
                <span key={r} className="rounded-md border border-primary-700 bg-primary-800 px-2 py-0.5 font-mono text-[11px] font-bold text-stone-300">{r}</span>
              ))}
              <span className="ml-1 text-xs font-medium text-stone-500">+ IE, NZ & EU soon</span>
            </p>
          </div>
          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h3 className="font-mono text-xs font-bold tracking-[0.2em] text-stone-500 uppercase">{c.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm font-medium text-stone-300 transition-colors hover:text-accent-400">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-primary-800 pt-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AccessPro Inc. Verified trades. Premium pay. Zero friction.</p>
          <p>Privacy-first identity checks · GDPR · UK GDPR · CCPA · PIPEDA · APPs</p>
        </div>
      </div>
    </footer>
  );
}