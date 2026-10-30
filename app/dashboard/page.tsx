import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Wallet, TrendingUp, Star, Briefcase, KeyRound, ArrowRight, ShieldCheck,
  Mail, Rocket, Activity as ActivityIcon, PlusSquare, Users, Lock, CalendarClock,
} from "lucide-react";
import { db } from "@/db";
import { jobs, activity, accessCodes, providerProfiles, users } from "@/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { requireUser, getProviderProfile } from "@/lib/auth";
import { gigScore, money, timeAgo, regionOf } from "@/lib/regions";
import { codeStatus } from "@/lib/locks";
import { DashboardShell } from "@/components/dashboard-shell";
import { GigCard } from "@/components/gig-card";
import { AcceptGigButton } from "@/components/job-buttons";
import { Button, Card, Stat, Badge, Progress, EmptyState } from "@/components/ui";
import { LiveDot, CountUp } from "@/components/motion";
import { Countdown } from "@/components/live-widgets";

export const dynamic = "force-dynamic";

function ActivityFeed({ rows }: { rows: { id: string; kind: string; text: string; createdAt: Date }[] }) {
  return (
    <Card className="p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-primary-900">
        <LiveDot /> Live activity
      </p>
      <ul className="mt-4 space-y-4">
        {rows.length === 0 && <li className="text-sm text-stone-400">Activity will appear here in real time.</li>}
        {rows.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50">
              {a.kind === "access" ? <KeyRound className="h-3.5 w-3.5 text-amber-600" aria-hidden />
                : a.kind === "payout" ? <Wallet className="h-3.5 w-3.5 text-accent-600" aria-hidden />
                : a.kind === "verify" ? <ShieldCheck className="h-3.5 w-3.5 text-accent-600" aria-hidden />
                : <ActivityIcon className="h-3.5 w-3.5 text-primary-500" aria-hidden />}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] leading-snug font-medium text-stone-700">{a.text}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-stone-400">{timeAgo(a.createdAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default async function DashboardPage({ searchParams }: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  const { welcome } = await searchParams;
  const region = regionOf(user.region);
  const feed = await db.select().from(activity).where(eq(activity.userId, user.id)).orderBy(desc(activity.createdAt)).limit(7);

  /* ── PROVIDER ─────────────────────────────────────────────── */
  if (user.role === "provider") {
    const profile = await getProviderProfile(user.id);
    const verified = profile?.verificationStatus === "fully_verified";
    const completed = await db.select().from(jobs)
      .where(and(eq(jobs.acceptedById, user.id), eq(jobs.status, "completed")));
    const lifetime = completed.reduce((s, j) => s + (j.payFinal ?? 0), 0);
    const week = completed.filter((j) => j.completedAt && j.completedAt > new Date(Date.now() - 7 * 864e5))
      .reduce((s, j) => s + (j.payFinal ?? 0), 0);
    const open = await db.select().from(jobs)
      .where(and(eq(jobs.region, user.region), eq(jobs.status, "open")))
      .orderBy(desc(jobs.createdAt)).limit(24);
    const recommended = open.map((j) => ({ j, s: gigScore(j) })).sort((a, b) => b.s - a.s).slice(0, 4);
    const [{ count: codeCount }] = await db.select({ count: sql<number>`count(*)::int` })
      .from(accessCodes).where(and(eq(accessCodes.providerId, user.id), eq(accessCodes.status, "active")));

    return (
      <DashboardShell name={user.name} role="provider" verification={profile?.verificationStatus}>
        {/* Verification banner */}
        {verified ? (
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-gradient-to-r from-primary-950 to-primary-800 p-5 text-white shadow-lift">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/20">
              {welcome ? <Rocket className="h-5.5 w-5.5 text-accent-400" aria-hidden /> : <ShieldCheck className="h-5.5 w-5.5 text-accent-400" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-bold">
                {welcome ? "You're live — priority high-pay gigs are now visible 🎉" : "You're live — priority high-pay gigs are visible"}
              </p>
              <p className="text-sm text-stone-300">Fully Verified · {region.name} · {codeCount} active access {codeCount === 1 ? "code" : "codes"}</p>
            </div>
            <Button href="/gigs" variant="accent" size="sm">Browse gigs <ArrowRight className="h-4 w-4" aria-hidden /></Button>
          </div>
        ) : profile?.verificationStatus === "facial_pending" ? (
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <Mail className="h-8 w-8 shrink-0 text-amber-500" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-amber-900">Documents received — facial verification pending</p>
              <p className="text-sm text-amber-700">Open the secure link we emailed to finish verification and unlock gig acceptance.</p>
            </div>
            <Button href="/dev/inbox" size="sm" className="bg-amber-500 hover:bg-amber-600">Open email link</Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary-200 bg-primary-50 p-5">
            <Lock className="h-8 w-8 shrink-0 text-primary-500" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-primary-900">Get Fully Verified to accept premium gigs</p>
              <p className="text-sm text-primary-600">ID + insurance + license, then a facial check via secure email link. ~6 minutes.</p>
            </div>
            <Button href="/onboarding" variant="accent" size="sm">Start verification</Button>
          </div>
        )}

        {/* Earnings summary */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Lifetime earnings" icon={Wallet} value={money(user.region, lifetime)} sub="Released via Stripe Connect" />
          <Stat label="Last 7 days" icon={TrendingUp} value={money(user.region, week)} sub={`${completed.length} jobs all-time`} />
          <Stat label="Jobs completed" icon={Briefcase} value={<CountUp value={profile?.jobsCompleted ?? 0} />} sub="Across all regions" />
          <Stat label="Rating" icon={Star} value={<span>{(profile?.rating ?? 5).toFixed(1)} <span className="text-lg text-amber-400">★</span></span>} sub="Homeowner reviews" />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-primary-900">
                <LiveDot /> Recommended high-pay gigs
              </h2>
              <Link href="/gigs" className="text-sm font-bold text-accent-700 hover:underline">View all →</Link>
            </div>
            <p className="mt-1 text-sm text-stone-500">Ranked by pay potential, urgency and {region.name} demand.</p>
            {recommended.length === 0 ? (
              <div className="mt-4">
                <EmptyState icon={Briefcase} title="No open gigs in your region right now"
                  body="New premium jobs drop throughout the day. Try another market from the region selector." />
              </div>
            ) : (
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {recommended.map(({ j, s }) => (
                  <GigCard key={j.id} job={j} score={s}
                    action={verified
                      ? <AcceptGigButton jobId={j.id} />
                      : <Button href="/onboarding" variant="secondary" size="sm" className="w-full"><Lock className="h-3.5 w-3.5" aria-hidden /> Verify to accept</Button>} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-primary-900">Profile strength</p>
                <span className="font-mono text-sm font-bold text-accent-600">{profile?.profileStrength ?? 0}%</span>
              </div>
              <Progress value={profile?.profileStrength ?? 0} className="mt-3" />
              <p className="mt-2.5 text-xs leading-relaxed text-stone-500">
                Stronger profiles win 2.1× more high-ticket work. Add specialties, a bio and multi-trade coverage.
              </p>
              <Button href="/dashboard/profile" variant="secondary" size="sm" className="mt-4 w-full">Improve profile</Button>
            </Card>
            <Card className="p-5">
              <p className="text-sm font-bold text-primary-900">Quick actions</p>
              <div className="mt-3 space-y-2">
                {[
                  { href: "/dashboard/profile", icon: CalendarClock, label: "Update availability & rates" },
                  { href: "/dashboard/access-codes", icon: KeyRound, label: `View access codes (${codeCount} live)` },
                  { href: "/dashboard/earnings", icon: Wallet, label: "Earnings & payouts" },
                ].map((a) => (
                  <Link key={a.href} href={a.href}
                    className="flex items-center gap-2.5 rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm font-semibold text-stone-700 transition-all hover:border-accent-400 hover:bg-accent-50 hover:text-accent-700">
                    <a.icon className="h-4 w-4 text-stone-400" aria-hidden /> {a.label}
                  </Link>
                ))}
              </div>
            </Card>
            <ActivityFeed rows={feed} />
          </div>
        </div>
      </DashboardShell>
    );
  }

  /* ── HOMEOWNER ────────────────────────────────────────────── */
  const myJobs = await db.select().from(jobs).where(eq(jobs.homeownerId, user.id)).orderBy(desc(jobs.createdAt));
  const jobIds = myJobs.map((j) => j.id);
  const codes = jobIds.length
    ? await db.select().from(accessCodes).where(inArray(accessCodes.jobId, jobIds)).orderBy(desc(accessCodes.createdAt))
    : [];
  const liveCodes = codes.filter((c) => codeStatus(c) === "active" || codeStatus(c) === "scheduled");
  const openCount = myJobs.filter((j) => j.status === "open").length;
  const activeCount = myJobs.filter((j) => j.status === "accepted" || j.status === "in_progress").length;
  const doneCount = myJobs.filter((j) => j.status === "completed").length;
  const [{ count: prosNearby }] = await db.select({ count: sql<number>`count(*)::int` })
    .from(providerProfiles)
    .innerJoin(users, eq(providerProfiles.userId, users.id))
    .where(and(eq(providerProfiles.verificationStatus, "fully_verified"), eq(users.region, user.region)));

  return (
    <DashboardShell name={user.name} role="homeowner">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-stone-500">{region.flag} {region.name} · your home, protected by verified access.</p>
        </div>
        <Button href="/dashboard/post-job" variant="accent"><PlusSquare className="h-4.5 w-4.5" aria-hidden /> Post a job</Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open jobs" icon={Briefcase} value={openCount} sub="Visible to verified pros" />
        <Stat label="In progress" icon={ActivityIcon} value={activeCount} sub="Accepted or underway" />
        <Stat label="Live access codes" icon={KeyRound} value={liveCodes.length} sub="Auto-expiring credentials" />
        <Stat label="Completed" icon={ShieldCheck} value={doneCount} sub="Payouts released" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-primary-900">Recent jobs</h2>
            <Link href="/dashboard/jobs" className="text-sm font-bold text-accent-700 hover:underline">Manage all →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {myJobs.length === 0 && (
              <EmptyState icon={Briefcase} title="No jobs yet"
                body="Post your first job and fully verified pros in your area will be notified instantly."
                action={<Button href="/dashboard/post-job" variant="accent">Post a job</Button>} />
            )}
            {myJobs.slice(0, 5).map((j) => (
              <Card key={j.id} lift className="flex flex-wrap items-center gap-4 p-4.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-bold text-primary-900">{j.title}</p>
                  <p className="mt-0.5 text-xs font-semibold text-stone-400">{j.category} · {j.windowLabel} · {timeAgo(j.createdAt)}</p>
                </div>
                <span className="font-mono text-sm font-bold text-primary-900">{money(j.region, j.payMin)}–{money(j.region, j.payMax)}</span>
                <Badge kind={j.status === "open" ? "neutral" : j.status === "completed" ? "verified" : j.status === "cancelled" ? "neutral" : "premium"}>
                  {j.status.replace("_", " ")}
                </Badge>
              </Card>
            ))}
          </div>

          {liveCodes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2.5 font-display text-xl font-bold text-primary-900"><LiveDot /> Live temporary access</h2>
                <Link href="/dashboard/access" className="text-sm font-bold text-accent-700 hover:underline">Manage →</Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {liveCodes.slice(0, 2).map((c) => {
                  const job = myJobs.find((j) => j.id === c.jobId);
                  return (
                    <Card key={c.id} className="bg-primary-950 p-5 text-white">
                      <p className="text-[11px] font-bold tracking-[0.18em] text-stone-400 uppercase">{c.brand} · temporary PIN</p>
                      <p className="mt-2 font-mono text-3xl font-bold tracking-[0.3em] text-accent-400">{c.code}</p>
                      <p className="mt-2 truncate text-xs text-stone-400">{job?.title}</p>
                      <p className="mt-1 text-xs font-semibold text-stone-300">
                        expires in <Countdown until={c.validUntil.getTime()} className="font-mono text-accent-400" />
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary-950 to-primary-800 p-5 text-white">
              <Users className="h-7 w-7 text-accent-400" aria-hidden />
              <p className="mt-3 font-display text-2xl font-extrabold"><CountUp value={prosNearby} /> verified pros</p>
              <p className="text-sm text-stone-300">ready in {region.name}</p>
            </div>
            <div className="p-5">
              <Button href="/dashboard/pros" variant="secondary" size="sm" className="w-full">Browse & invite pros</Button>
            </div>
          </Card>
          <ActivityFeed rows={feed} />
        </div>
      </div>
    </DashboardShell>
  );
}