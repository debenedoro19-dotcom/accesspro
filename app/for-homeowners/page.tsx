import Image from "next/image";
import {
  ArrowRight, ShieldCheck, KeyRound, Timer, Eye, FileCheck, Sparkles, BellRing, Star,
} from "lucide-react";
import { Button, Card, SectionHeading, Badge } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { Reveal } from "@/components/motion";
import { Countdown } from "@/components/live-widgets";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "For homeowners" };

export default async function ForHomeownersPage() {
  const user = await getSessionUser();
  const postJobHref = user?.role === "homeowner"
    ? "/dashboard/post-job"
    : user
      ? "/dashboard"
      : "/signup?role=homeowner&next=%2Fdashboard%2Fpost-job";
  return (
    <div>
      <section className="mx-auto grid max-w-8xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-10 lg:py-24">
        <Reveal>
          <Badge kind="verified" className="mb-5">Every pro fully verified</Badge>
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-balance text-primary-900 sm:text-6xl">
            The best pro in your area.<br />
            <span className="text-accent-600">Even when you're not home.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
            Post the job, pick your window, and let a rigorously vetted professional handle it —
            with a temporary smart-lock code that expires the moment the work is done.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Button href={postJobHref} variant="accent" size="lg">Post your first job <ArrowRight className="h-4.5 w-4.5" aria-hidden /></Button>
            <Button href="/trust-and-safety" variant="secondary" size="lg">How we vet pros</Button>
          </div>
          <p className="mt-5 text-sm font-semibold text-stone-400">Free for homeowners · no subscription, no call-out markups</p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="relative">
            <Image
              src="https://images.pexels.com/photos/6689288/pexels-photo-6689288.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
              alt="A hand opening a smart-lock door with a digital access panel"
              width={1200} height={627} priority
              className="rounded-2xl border border-stone-200 object-cover shadow-lift" />
            <div className="absolute -bottom-6 left-4 rounded-2xl bg-primary-950 p-4 text-white shadow-lift sm:left-8">
              <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase">Live code · Marcus R.</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.3em] text-accent-400">483926</p>
              <p className="mt-1 text-[11px] text-stone-400">expires in <Countdown until={Date.now() + 4 * 36e5} className="font-mono text-accent-400" /></p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <Reveal><SectionHeading eyebrow="The flow" title="Four steps. Zero waiting around." /></Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileCheck, n: "1", title: "Post the job", body: "Service, window, budget, photos — and toggle “I won't be home”." },
              { icon: BellRing, n: "2", title: "Verified pros accept", body: "Only Fully Verified pros can take your job. You're notified instantly." },
              { icon: KeyRound, n: "3", title: "Temporary code issued", body: "A unique PIN named to your pro, valid only for your window." },
              { icon: Star, n: "4", title: "Rate & release", body: "Confirm completion, leave a review, payout releases automatically." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <Card lift className="h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-900"><s.icon className="h-5.5 w-5.5 text-accent-400" aria-hidden /></span>
                    <span className="font-mono text-2xl font-bold text-stone-200">{s.n}</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-primary-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="Access you control" title="Your keys never change hands"
              body="Temporary access is credential-based, not key-based. Nothing to copy, nothing to lose, nothing to return." />
            <ul className="mt-8 space-y-4">
              {[
                { icon: Timer, text: "Codes live only inside your chosen window — then self-destruct" },
                { icon: Eye, text: "Watch a shared entry log: who, when, which door" },
                { icon: ShieldCheck, text: "Revoke instantly from your phone; the lock updates in real time" },
                { icon: Sparkles, text: "Works with Yale, Schlage, August — or a simple keypad lockbox" },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50"><f.icon className="h-4.5 w-4.5 text-accent-600" aria-hidden /></span>
                  <span className="pt-1.5 font-medium text-stone-700">{f.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl bg-gradient-to-br from-primary-950 to-primary-800 p-8 text-white shadow-lift">
              <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent-400 uppercase">Peace of mind, itemised</p>
              <ul className="mt-6 space-y-5">
                {[
                  ["Identity", "Government ID + live facial match"],
                  ["Cover", "Liability insurance verified & on file"],
                  ["Credential", "Regional licensing checked (Gas Safe, NICEIC, state/provincial)"],
                  ["Accountability", "Every job rated; every entry logged"],
                ].map(([k, v]) => (
                  <li key={k} className="flex gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <span className="w-28 shrink-0 font-mono text-xs font-bold text-stone-400 uppercase">{k}</span>
                    <span className="text-sm font-medium text-stone-200">{v}</span>
                  </li>
                ))}
              </ul>
              <Button href={postJobHref} variant="accent" className="mt-8 w-full" size="lg">Get started free</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}