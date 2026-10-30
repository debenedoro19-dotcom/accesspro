import Image from "next/image";
import { cookies } from "next/headers";
import {
  ArrowRight, TrendingUp, ShieldCheck, KeyRound, Wallet, FileCheck, Mail, ScanFace, Zap,
} from "lucide-react";
import { regionOf, money } from "@/lib/regions";
import { getSessionUser, getProviderProfile } from "@/lib/auth";
import { Button, Card, SectionHeading, Badge } from "@/components/ui";
import { Reveal, CountUp } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "For providers" };

export default async function ForProvidersPage() {
  const jar = await cookies();
  const region = regionOf(jar.get("ap_region")?.value);
  const user = await getSessionUser();
  const profile = user?.role === "provider" ? await getProviderProfile(user.id) : null;
  const providerStartHref = user?.role === "provider"
    ? profile?.verificationStatus === "fully_verified" ? "/dashboard" : "/onboarding"
    : user
      ? "/dashboard"
      : "/signup?role=provider&next=%2Fonboarding";
  const rates: Record<string, [string, number, number][]> = {
    US: [["Emergency HVAC", 1800, 3200], ["Panel upgrades", 2400, 4500], ["Smart-home installs", 900, 1600]],
    CA: [["Furnace replacement", 1200, 2600], ["Heat pump systems", 3800, 6500], ["Rough-in plumbing", 900, 1700]],
    UK: [["Boiler swaps", 1900, 3200], ["Full rewires", 3200, 5200], ["Emergency roofing", 450, 900]],
    AU: [["Solar + battery", 5500, 8900], ["Switchboard upgrades", 1400, 2400], ["Ducted A/C", 4200, 7000]],
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 text-white">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-8xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-10">
          <Reveal>
            <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent-400 uppercase">For service providers</p>
            <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Stop chasing leads.<br />Start choosing gigs.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-300">
              AccessPro connects verified trades and professional home-service providers with
              fair-paying local work — from high-ticket installs to recurring cleaning and care-adjacent home help.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Button href={providerStartHref} variant="accent" size="lg">Apply & get verified <ArrowRight className="h-4.5 w-4.5" aria-hidden /></Button>
              <Button href="/gigs" size="lg" className="border border-white/25 bg-white/10 text-white shadow-none hover:bg-white/20">See live pay rates</Button>
            </div>
            <dl className="mt-10 flex gap-10 border-t border-white/10 pt-6">
              <div><dt className="text-xs text-stone-400 uppercase">Avg. pay uplift</dt><dd className="font-mono text-3xl font-bold text-accent-400"><CountUp value={2.4} decimals={1} suffix="×" /></dd></div>
              <div><dt className="text-xs text-stone-400 uppercase">Lead fees</dt><dd className="font-mono text-3xl font-bold">$0</dd></div>
              <div><dt className="text-xs text-stone-400 uppercase">You keep</dt><dd className="font-mono text-3xl font-bold text-accent-400"><CountUp value={92} suffix="%+" /></dd></div>
            </dl>
          </Reveal>
          <Reveal delay={0.15}>
            <Image
              src="https://images.pexels.com/photos/7647233/pexels-photo-7647233.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
              alt="A verified electrician smiling while working on an outlet"
              width={1200} height={627} priority
              className="rounded-2xl border border-white/10 object-cover shadow-lift" />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10">
        <Reveal><SectionHeading eyebrow="Why top pros switch" title="Built for skill, priced for skill" /></Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[
            { icon: TrendingUp, title: "Highest-pay-first ranking", body: "Gigs are scored by pay potential, urgency and regional demand — the best work finds you before the tyre-kickers do." },
            { icon: ShieldCheck, title: "A badge that closes deals", body: "Rigorous ID, insurance, licensing and liveness checks mean homeowners say yes faster, at your rate." },
            { icon: KeyRound, title: "No more waiting for keys", body: "Time-limited smart-lock access lets you start while they're at work. Every entry logged, every code named to you." },
            { icon: Wallet, title: "Instant payout release", body: "Homeowner confirms completion → Stripe Connect releases your payout. No chasing invoices, no net-60." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <Card lift className="flex h-full gap-5 p-7">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-900">
                  <f.icon className="h-6 w-6 text-accent-400" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-primary-900">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-stone-600">{f.body}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <Reveal><SectionHeading eyebrow={`${region.flag} ${region.name} rates`} title={`What premium gigs pay in ${region.name}`}
            body={`Live ranges from the marketplace, in ${region.currency}. ${region.licenseLabel} required where applicable.`} /></Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {(rates[region.code] ?? rates.US).map(([label, min, max], i) => (
              <Reveal key={label} delay={i * 0.08}>
                <Card lift className="p-6">
                  <Badge kind="premium">Premium gig</Badge>
                  <p className="mt-3 font-display text-lg font-bold text-primary-900">{label}</p>
                  <p className="mt-2 font-mono text-2xl font-bold text-accent-600">{money(region.code, min)}–{money(region.code, max)}</p>
                  <p className="mt-1 text-xs font-semibold text-stone-400">typical completed range</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10">
        <Reveal><SectionHeading eyebrow="Verification path" title="Verified in three moves"
          body="Rigorous, privacy-respecting, and finished in about six minutes." /></Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: FileCheck, n: "01", title: "Documents", body: "Government ID, liability insurance, and your regional trade credential. Automated checks run instantly." },
            { icon: Mail, n: "02", title: "Secure email link", body: "We email a 30-minute magic link. The facial step never appears in the app without it — that's deliberate." },
            { icon: ScanFace, n: "03", title: "Live facial match", body: "A quick liveness check matched to your ID photo. Templates deleted immediately after matching." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <Card className="h-full p-7">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50"><s.icon className="h-6 w-6 text-accent-600" aria-hidden /></span>
                  <span className="font-mono text-sm font-bold text-stone-300">{s.n}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-primary-900">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-stone-600">{s.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-primary-950 to-primary-800 p-8 text-white">
            <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-accent-400" aria-hidden />
              <p className="font-display text-2xl font-bold">Your region's best gigs are one verification away.</p>
            </div>
            <Button href={providerStartHref} variant="accent" size="lg">Start now <ArrowRight className="h-4.5 w-4.5" aria-hidden /></Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}