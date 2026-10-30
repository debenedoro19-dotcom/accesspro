import { Compass, HeartHandshake, ShieldCheck, Globe2 } from "lucide-react";
import { Card, SectionHeading, Button, Badge } from "@/components/ui";
import { Reveal, CountUp } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10">
        <Reveal>
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent-600 uppercase">Our story</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-extrabold tracking-tight text-balance text-primary-900 sm:text-6xl">
            Skilled trades deserve premium demand. Homeowners deserve absolute trust.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
            AccessPro started with two frustrations: brilliant tradespeople losing hours to
            low-ball lead sites, and homeowners leaving work undone because nobody could be
            home to open the door. We built one system that fixes both — rigorous verification
            on one side, secure temporary access on the other.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            { v: 4, suffix: "", label: "live markets — US, Canada, UK, Australia" },
            { v: 92, suffix: "%+", label: "of every gig goes to the pro" },
            { v: 30, suffix: " min", label: "verification link lifetime — security by design" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <Card className="p-7">
                <p className="font-mono text-4xl font-bold text-primary-900"><CountUp value={s.v} suffix={s.suffix} /></p>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">{s.label}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <Reveal><SectionHeading eyebrow="What we believe" title="Principles we won't trade away" /></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              { icon: ShieldCheck, title: "Verification is the moat", body: "We'd rather grow slower with 100% verified supply than flood the marketplace with strangers. The badge has to mean something." },
              { icon: HeartHandshake, title: "Both sides of the door", body: "Pros get dignity, fair pay and instant payouts. Homeowners get accountability, logs and control. Neither side subsidises the other." },
              { icon: Compass, title: "Privacy by architecture", body: "The email-gated facial step, immediate template deletion, regional data handling — privacy isn't a policy page, it's how the system is built." },
              { icon: Globe2, title: "Local depth, global standard", body: "Gas Safe in the UK, Red Seal in Canada, CEC in Australia — we adapt to local licensing while holding one global bar for trust." },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.07}>
                <Card lift className="flex h-full gap-5 p-7">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-900"><v.icon className="h-6 w-6 text-accent-400" aria-hidden /></span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-primary-900">{v.title}</h3>
                    <p className="mt-2 leading-relaxed text-stone-600">{v.body}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10">
        <Reveal><SectionHeading center eyebrow="Leadership" title="Operators from trades, trust & fintech" /></Reveal>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            { name: "Ava Sterling", role: "CEO · ex-marketplace ops", init: "AS" },
            { name: "Daniel Osei", role: "CTO · identity systems", init: "DO" },
            { name: "Marta Kowalska", role: "Head of Trust & Safety", init: "MK" },
          ].map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <Card lift className="p-7 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 font-display text-xl font-extrabold text-accent-400">{p.init}</span>
                <p className="mt-4 font-display font-bold text-primary-900">{p.name}</p>
                <p className="mt-1 text-sm text-stone-500">{p.role}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.25}>
          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-primary-950 to-primary-800 p-8 text-white">
            <div>
              <Badge kind="verified" className="mb-3">Expanding 2026</Badge>
              <p className="font-display text-2xl font-bold">Ireland, New Zealand & select EU markets next.</p>
            </div>
            <Button href="/signup?role=provider&next=%2Fonboarding" variant="accent" size="lg">Join early</Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}