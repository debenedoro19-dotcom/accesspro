import { CheckCircle2, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { Button, Card, SectionHeading, Badge } from "@/components/ui";
import { Reveal } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <Reveal>
        <SectionHeading center eyebrow="Pricing" title="Simple. Aligned with your success."
          body="Homeowners never pay platform fees. Providers pay only when they earn — no lead fees, ever." />
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-[1fr_1.15fr_1fr] lg:items-stretch">
        <Reveal delay={0.05}>
          <Card className="flex h-full flex-col p-7">
            <p className="font-display text-lg font-bold text-primary-900">Homeowner</p>
            <p className="mt-3 font-display text-5xl font-extrabold text-primary-900">Free</p>
            <p className="mt-1 text-sm font-semibold text-stone-400">forever, every region</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-600">
              {["Unlimited job posts", "Skilled trades + home-service pros", "Temporary access codes included", "Entry logs & live status", "Dispute resolution support"].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent-500" aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <Button href="/signup?role=homeowner&next=%2Fdashboard%2Fpost-job" variant="secondary" className="mt-7 w-full">Post a job</Button>
          </Card>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative flex h-full flex-col rounded-2xl bg-gradient-to-br from-primary-950 to-primary-800 p-7 text-white shadow-lift">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2"><Badge kind="premium" className="shadow-card">Most popular</Badge></span>
            <p className="flex items-center gap-2 font-display text-lg font-bold"><Zap className="h-5 w-5 text-accent-400" aria-hidden /> Pro Elite</p>
            <p className="mt-3 font-display text-5xl font-extrabold">$29<span className="text-xl font-bold text-stone-400">/mo</span></p>
            <p className="mt-1 text-sm font-semibold text-stone-400">+ 5% per completed gig</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-200">
              {["Priority placement in gig matching", "First look at high-ticket & emergency work", "Instant Stripe payouts (no 2-day hold)", "Featured Fully Verified profile", "Multi-region gig access", "Dedicated support line"].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent-400" aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <Button href="/signup?role=provider&next=%2Fonboarding" variant="accent" size="lg" className="mt-7 w-full">Go Elite <ArrowRight className="h-4.5 w-4.5" aria-hidden /></Button>
          </div>
        </Reveal>

        <Reveal delay={0.19}>
          <Card className="flex h-full flex-col p-7">
            <p className="font-display text-lg font-bold text-primary-900">Pro Standard</p>
            <p className="mt-3 font-display text-5xl font-extrabold text-primary-900">$0<span className="text-xl font-bold text-stone-400">/mo</span></p>
            <p className="mt-1 text-sm font-semibold text-stone-400">8% per completed gig</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-stone-600">
              {["Full marketplace access once verified", "Standard gig ranking", "2-day payout schedule", "Temporary access credentials", "Profile & reviews"].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent-500" aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <Button href="/signup?role=provider&next=%2Fonboarding" variant="secondary" className="mt-7 w-full">Start free</Button>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.25}>
        <div className="mx-auto mt-14 flex max-w-3xl items-start gap-4 rounded-2xl border border-accent-200 bg-accent-50 p-6">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-accent-600" aria-hidden />
          <div>
            <p className="font-display font-bold text-primary-900">The AccessPro guarantee</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              Verification is always free. If a job is cancelled before work starts, nobody pays a cent.
              Fees are charged only on completed, homeowner-confirmed work — our incentives stay aligned with yours.
              Prices shown in USD; regional equivalents apply automatically at checkout.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}