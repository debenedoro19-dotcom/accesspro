import Image from "next/image";
import {
  FileCheck, Mail, ScanFace, ShieldCheck, Search, Handshake, KeyRound, Timer, DoorOpen, Wallet, ArrowRight,
} from "lucide-react";
import { Button, Card, SectionHeading, Badge } from "@/components/ui";
import { Reveal } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 py-20 text-white">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <Reveal>
            <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent-400 uppercase">The AccessPro system</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Two journeys. One standard of trust.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-stone-300">
              Providers earn the badge once. Homeowners benefit from it every job.
              Temporary access bridges the gap when nobody's home.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10">
        <Reveal><SectionHeading eyebrow="Provider track" title="From signup to Fully Verified" /></Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
          <ol className="relative space-y-6 border-l-2 border-dashed border-stone-200 pl-8">
            {[
              { icon: FileCheck, title: "Profile & documents", body: "Trades, regions, experience — then government ID, liability insurance and your regional license. Automated checks run immediately and your status becomes “Documents Received – Facial Verification Pending”.", tag: "≈ 4 minutes" },
              { icon: Mail, title: "The email gate", body: "A secure magic link lands in your inbox: “Complete your AccessPro verification – Facial step required”. It expires in 30 minutes and works once. The facial step is never shown in the app without this link — a deliberate anti-hijack design.", tag: "30-minute link" },
              { icon: ScanFace, title: "Liveness + ID match", body: "Blink, turn, hold. Your live capture is matched to your ID photo with explicit consent. Facial templates are deleted the moment matching completes.", tag: "≈ 60 seconds" },
              { icon: ShieldCheck, title: "Fully Verified — you're live", body: "The badge appears on your profile and in search. Priority high-pay gigs unlock instantly, ranked by pay, urgency and regional demand.", tag: "Instant" },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <li className="relative">
                  <span className="absolute top-1 -left-[45px] flex h-8 w-8 items-center justify-center rounded-full bg-primary-900 ring-4 ring-surface">
                    <s.icon className="h-4 w-4 text-accent-400" aria-hidden />
                  </span>
                  <Card lift className="p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-lg font-bold text-primary-900">{s.title}</h3>
                      <Badge kind="neutral">{s.tag}</Badge>
                    </div>
                    <p className="mt-2 leading-relaxed text-stone-600">{s.body}</p>
                  </Card>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.15}>
            <div className="lg:sticky lg:top-24">
              <Image
                src="https://images.pexels.com/photos/20500461/pexels-photo-20500461.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                alt="A professional electrician working carefully on wiring"
                width={1200} height={627}
                className="rounded-2xl border border-stone-200 object-cover shadow-lift" />
              <Card className="mt-5 p-5">
                <p className="text-sm font-bold text-primary-900">Why the email gate?</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">
                  It proves the person completing liveness controls the registered inbox — the same
                  person who uploaded the ID. Stolen sessions can't finish verification.
                </p>
                <Button href="/signup?role=provider&next=%2Fonboarding" variant="accent" size="sm" className="mt-4 w-full">Start verification</Button>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <Reveal><SectionHeading eyebrow="Homeowner track" title="Post → accept → access → done" /></Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: Search, title: "Post with a budget", body: "Describe the work, set your window and budget range, attach photos. Toggle temporary access if you'll be out." },
              { icon: Handshake, title: "A verified pro accepts", body: "Only Fully Verified pros can accept. Higher-pay jobs surface first, so quality pros respond fast." },
              { icon: KeyRound, title: "Access, time-boxed", body: "A PIN named to your pro is generated for your lock system. You both see the live status and entry log." },
              { icon: Wallet, title: "Rate & auto-payout", body: "Confirm completion, leave stars, and Stripe releases payment. The access code expires itself." },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <Card lift className="h-full p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-50"><s.icon className="h-5.5 w-5.5 text-accent-600" aria-hidden /></span>
                  <h3 className="mt-4 font-display text-lg font-bold text-primary-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10">
        <Reveal><SectionHeading eyebrow="Access lifecycle" title="The life of a temporary code" center /></Reveal>
        <div className="mx-auto mt-12 flex max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {[
            { icon: KeyRound, label: "Issued", sub: "named to one pro" },
            { icon: Timer, label: "Active", sub: "window open" },
            { icon: DoorOpen, label: "Logged", sub: "every entry" },
            { icon: ShieldCheck, label: "Expired", sub: "auto, at window end" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="flex-1">
              <div className="flex items-center gap-3">
                <Card className="flex-1 p-4 text-center">
                  <s.icon className="mx-auto h-5 w-5 text-accent-600" aria-hidden />
                  <p className="mt-1.5 font-display text-sm font-bold text-primary-900">{s.label}</p>
                  <p className="text-[11px] font-medium text-stone-400">{s.sub}</p>
                </Card>
                {i < 3 && <ArrowRight className="hidden h-4 w-4 shrink-0 text-stone-300 sm:block" aria-hidden />}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-wrap justify-center gap-3.5">
            <Button href="/signup?role=provider&next=%2Fonboarding" variant="accent" size="lg">Join as a pro</Button>
            <Button href="/signup?role=homeowner&next=%2Fdashboard%2Fpost-job" variant="secondary" size="lg">Join as a homeowner</Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}