import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import {
  ShieldCheck, FileCheck, ScanFace, KeyRound, ArrowRight, Star, Lock,
  BadgeCheck, Timer, Landmark, Camera, Search, Handshake,
} from "lucide-react";
import { db } from "@/db";
import { jobs, providerProfiles, users } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { regionOf, gigScore, money } from "@/lib/regions";
import { getSessionUser } from "@/lib/auth";
import { Button, Badge, Card, SectionHeading } from "@/components/ui";
import { Reveal, CountUp, LiveDot } from "@/components/motion";
import { Countdown, LiveTicker } from "@/components/live-widgets";
import { Carousel } from "@/components/home-carousel";
import { GigCard } from "@/components/gig-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const jar = await cookies();
  const region = regionOf(jar.get("ap_region")?.value);
  const user = await getSessionUser();

  const [{ count: proCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(providerProfiles)
    .where(eq(providerProfiles.verificationStatus, "fully_verified"));
  const [{ count: openCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobs).where(eq(jobs.status, "open"));
  const [{ done }] = await db
    .select({ done: sql<number>`coalesce(sum(${providerProfiles.jobsCompleted}),0)::int` })
    .from(providerProfiles);

  const regionJobs = await db
    .select().from(jobs)
    .where(and(eq(jobs.region, region.code), eq(jobs.status, "open")))
    .orderBy(desc(jobs.createdAt)).limit(24);
  const ranked = regionJobs
    .map((j) => ({ job: j, score: gigScore(j) }))
    .sort((a, b) => b.score - a.score);
  const topGigs = ranked.slice(0, 12);
  const avgTop = topGigs.length
    ? Math.round(topGigs.reduce((s, g) => s + g.job.payMax, 0) / topGigs.length)
    : 2500;
  const postJobHref = user?.role === "homeowner"
    ? "/dashboard/post-job"
    : user
      ? "/dashboard"
      : "/signup?role=homeowner&next=%2Fdashboard%2Fpost-job";
  const providerStartHref = user?.role === "provider"
    ? "/onboarding"
    : user
      ? "/dashboard"
      : "/signup?role=provider&next=%2Fonboarding";
  const featuredGigHref = user?.role === "provider"
    ? "/gigs"
    : user?.role === "homeowner"
      ? "/dashboard/post-job"
      : "/signup?role=provider&next=%2Fgigs";

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 text-white">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-accent-500/15 blur-[120px]" aria-hidden />
        <div className="relative mx-auto grid max-w-8xl gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-10 lg:pt-24 lg:pb-28">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[13px] font-semibold text-stone-200">
                <LiveDot /> LIVE · {region.flag} {region.name} marketplace
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-[68px] lg:leading-[1.04]">
                Verified trades.<br />
                Premium pay.<br />
                <span className="text-accent-400">Keys optional.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-300">
                AccessPro connects rigorously vetted tradespeople and home-service pros with
                high-quality local gigs — and gives homeowners secure, time-limited smart-lock
                access when they can't be there.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <Button href={user?.role === "provider" ? "/dashboard" : "/gigs"} variant="accent" size="lg">
                  Find high-pay gigs <ArrowRight className="h-4.5 w-4.5" aria-hidden />
                </Button>
                <Button href="/for-homeowners" size="lg" className="border border-white/25 bg-white/10 text-white shadow-none hover:bg-white/20">
                  Hire a verified pro
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-7">
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-stone-400 uppercase">Verified pros</dt>
                  <dd className="mt-1 font-mono text-3xl font-bold text-white"><CountUp value={proCount} /></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-stone-400 uppercase">Open local gigs</dt>
                  <dd className="mt-1 font-mono text-3xl font-bold text-accent-400"><CountUp value={openCount} /></dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold tracking-wide text-stone-400 uppercase">Avg. top gig</dt>
                  <dd className="mt-1 font-mono text-3xl font-bold text-white">
                    <CountUp value={avgTop} prefix={money(region.code, 0).replace(/[\d.,\s]/g, "")} />
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          {/* Live product panel */}
          <Reveal delay={0.2} className="relative hidden lg:block">
            <div className="animate-float space-y-5">
              <div className="group rounded-2xl border border-white/12 bg-white/[0.07] p-5 shadow-lift backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Badge kind="emergency" pulse>Emergency</Badge>
                  <Badge kind="highticket">High ticket</Badge>
                  <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-accent-400">
                    <LiveDot /> JUST POSTED
                  </span>
                </div>
                <p className="mt-3 font-display text-lg font-bold">Emergency HVAC – compressor failure</p>
                <p className="mt-1 text-sm text-stone-300">Chicago · Lincoln Park · Today 4–8 PM</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-mono text-2xl font-bold text-accent-400">$1,800–$3,200</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 px-3 py-1 text-xs font-bold text-accent-300">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Verified pros only
                  </span>
                </div>
              </div>
              <div className="ml-10 rounded-2xl border border-white/12 bg-primary-950/80 p-5 shadow-lift backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-stone-400 uppercase">
                    <KeyRound className="h-3.5 w-3.5 text-accent-400" aria-hidden /> Temporary access · Yale
                  </p>
                  <span className="text-[11px] font-semibold text-stone-400">
                    expires <Countdown until={Date.now() + 5 * 36e5} className="font-mono text-accent-400" />
                  </span>
                </div>
                <p className="mt-3 font-mono text-4xl font-bold tracking-[0.35em] text-white">483926</p>
                <div className="mt-3 flex items-center justify-between text-xs text-stone-400">
                  <span>Bound to Marcus R. · Fully Verified ✓</span>
                  <span className="flex items-center gap-1"><Lock className="h-3 w-3" aria-hidden /> Entry logged</span>
                </div>
              </div>
              <div className="mr-16 rounded-2xl border border-white/12 bg-white/[0.07] px-5 py-4 backdrop-blur-md">
                <LiveTicker dark items={[
                  "Sofia D. accepted a $1,450 smart-home gig in Austin",
                  "Emma W. verified — Gas Safe + liveness matched",
                  "Access code auto-expired after job completion in London",
                  "Jack N. paid out A$7,150 for a solar install",
                ]} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────── */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-10">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
              <p className="font-mono text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">
                Every pro passes 4 checks
              </p>
              {[
                { icon: FileCheck, label: "Government ID verified" },
                { icon: Landmark, label: "Liability insurance on file" },
                { icon: BadgeCheck, label: region.licenseLabel },
                { icon: ScanFace, label: "Live facial match" },
              ].map((t) => (
                <span key={t.label} className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                  <t.icon className="h-4.5 w-4.5 text-accent-600" aria-hidden /> {t.label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <Reveal>
          <SectionHeading eyebrow="How it works" title="Three steps between you and better work"
            body="No bidding wars. No strangers with keys. Just verified skill, matched to premium demand." />
        </Reveal>
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div className="absolute top-12 right-[16%] left-[16%] hidden border-t-2 border-dashed border-stone-200 md:block" aria-hidden />
          {[
            { n: "01", icon: ScanFace, title: "Verify once, rigorously", body: "ID, insurance and licensing — then a live facial check via a secure email link. Facial templates are never retained." },
            { n: "02", icon: Search, title: "Match to premium gigs", body: "Our ranking surfaces the highest-pay, most urgent work in your region first. Fully Verified pros get priority acceptance." },
            { n: "03", icon: Handshake, title: "Work, access, get paid", body: "Time-limited smart-lock codes let pros in while you're out. Completion triggers instant payout release via Stripe." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <Card lift className="relative h-full p-7">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-900">
                    <s.icon className="h-6 w-6 text-accent-400" aria-hidden />
                  </span>
                  <span className="font-mono text-sm font-bold text-stone-300">{s.n}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-primary-900">{s.title}</h3>
                <p className="mt-2.5 leading-relaxed text-stone-600">{s.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HIGH-PAY GIGS CAROUSEL ───────────────────────────── */}
      <section className="border-y border-stone-200 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <SectionHeading eyebrow={`${region.flag} ${region.name} · live now`}
                title="Local work, ranked by potential"
                body={`Premium trades and trusted home services, scored on pay, urgency and regional demand. Currency and licensing adapt for ${region.name}.`} />
            </Reveal>
            <Reveal delay={0.1}>
              <Button href="/gigs" variant="secondary">
                Browse all {openCount} gigs <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Reveal>
          </div>
          <Reveal delay={0.15} className="mt-10">
            <Carousel label="High-pay gigs">
              {topGigs.map(({ job, score }) => (
                <div key={job.id} className="w-[340px] shrink-0 snap-start sm:w-[352px]" role="listitem">
                  <GigCard job={job} score={score}
                    action={
                      <Button href={featuredGigHref} variant="primary" size="sm" className="w-full">
                        {user?.role === "provider" ? "View & accept" : user?.role === "homeowner" ? "Post a similar job" : "Join to explore gigs"}
                      </Button>
                    } />
                </div>
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* ── TEMPORARY ACCESS SHOWCASE ────────────────────────── */}
      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <Image
                src="https://images.pexels.com/photos/6682880/pexels-photo-6682880.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"
                alt="A person entering a time-limited code on a smart keypad"
                width={1200} height={627}
                className="rounded-2xl border border-stone-200 object-cover shadow-lift"
              />
              <div className="absolute -right-4 -bottom-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-lift sm:-right-6">
                <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Access log</p>
                <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-primary-900">
                  <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden /> 14:02 — Entry · Marcus R.
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-stone-500">
                  <span className="h-2 w-2 rounded-full bg-stone-300" aria-hidden /> 17:41 — Code auto-expired
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading eyebrow="Secure temporary access" title="Not home? Your pro still gets in. Safely."
              body="When a job is accepted, AccessPro issues a credential named to that specific pro — time-windowed, auto-expiring, and logged entry by entry." />
            <ul className="mt-8 space-y-4">
              {[
                { icon: KeyRound, text: "Unique PIN or digital credential per job, per pro" },
                { icon: Timer, text: "Auto-expires at window end — extend or revoke in one tap" },
                { icon: Lock, text: "Works with Yale, Schlage, August — or a simple lockbox" },
                { icon: Camera, text: "Every entry recorded in a shared, tamper-evident log" },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50">
                    <f.icon className="h-4.5 w-4.5 text-accent-600" aria-hidden />
                  </span>
                  <span className="pt-1.5 font-medium text-stone-700">{f.text}</span>
                </li>
              ))}
            </ul>
            <Button href="/for-homeowners" variant="primary" className="mt-8">
              See homeowner flow <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ── TESTIMONIALS + STATS ─────────────────────────────── */}
      <section className="bg-primary-950 py-20 text-white lg:py-24">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <Reveal>
            <SectionHeading dark eyebrow="Trusted on both sides" title="The numbers behind the badge" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: 2.4, suffix: "×", d: 1, label: "higher average pay vs. open marketplaces" },
              { v: 38, suffix: " min", d: 0, label: "median emergency response time" },
              { v: 100, suffix: "%", d: 0, label: "of pros ID + liveness verified" },
              { v: done, suffix: "+", d: 0, label: "premium jobs completed to date" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
                  <p className="font-mono text-4xl font-bold text-accent-400">
                    <CountUp value={s.v} suffix={s.suffix} decimals={s.d} />
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-300">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { quote: "I stopped chasing $90 callouts. My first week on AccessPro I cleared $4,100 — and the access codes mean I never wait around for homeowners.", name: "Marcus Reed", role: "HVAC & Plumbing · Chicago, US" },
              { quote: "A fully verified engineer swapped our boiler while we were at work. The code expired itself at 6 PM. I watched the entry log from my phone.", name: "Oliver Hart", role: "Homeowner · London, UK" },
              { quote: "The verification is genuinely rigorous — and that's the point. Clients here trust the badge, and the pay reflects it.", name: "Jack Nguyen", role: "Solar & Electrical · Sydney, AU" },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <figure className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-7">
                  <div className="flex gap-1 text-accent-400" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" aria-hidden />)}
                  </div>
                  <blockquote className="mt-4 flex-1 leading-relaxed text-stone-200">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 border-t border-white/10 pt-4">
                    <p className="flex items-center gap-2 font-display font-bold">
                      {t.name} <BadgeCheck className="h-4 w-4 text-accent-400" aria-label="Verified" />
                    </p>
                    <p className="text-sm text-stone-400">{t.role}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 to-primary-700 py-20 text-white">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <Reveal>
              <div className="max-w-xl">
                <h2 className="font-display text-4xl font-extrabold tracking-tight text-balance">
                  Join the top tier of local trades.
                </h2>
                <p className="mt-3 text-lg text-stone-300">
                  Get verified once. Unlock premium demand across the US, Canada, UK and Australia.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-3.5">
                <Button href={providerStartHref} variant="accent" size="lg">
                  Apply as a pro <ArrowRight className="h-4.5 w-4.5" aria-hidden />
                </Button>
                <Button href={postJobHref} size="lg" className="border border-white/25 bg-white/10 text-white shadow-none hover:bg-white/20">
                  Post a job
                </Button>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <p className="mt-8 text-sm text-stone-400">
              Free to join · Providers keep 90%+ of every gig · <Link href="/pricing" className="font-semibold text-accent-400 underline-offset-4 hover:underline">See pricing</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}