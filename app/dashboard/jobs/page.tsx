import { Briefcase, KeyRound, MapPin, Clock, Star } from "lucide-react";
import { db } from "@/db";
import { jobs, users, accessCodes, reviews } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { requireUser, getProviderProfile } from "@/lib/auth";
import { money, timeAgo, payRange } from "@/lib/regions";
import { codeStatus } from "@/lib/locks";
import { DashboardShell } from "@/components/dashboard-shell";
import { GigBadges, CategoryIcon } from "@/components/gig-card";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { Countdown } from "@/components/live-widgets";
import {
  StartJobButton, CompleteJobButton, CancelJobButton, AccessActions,
} from "@/components/job-buttons";
import type { Job } from "@/db/schema";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My jobs" };

function statusBadge(s: string) {
  switch (s) {
    case "open": return <Badge kind="neutral">Open</Badge>;
    case "accepted": return <Badge kind="premium">Accepted</Badge>;
    case "in_progress": return <Badge kind="urgent">In progress</Badge>;
    case "completed": return <Badge kind="verified">Completed</Badge>;
    default: return <Badge kind="neutral">Cancelled</Badge>;
  }
}

export default async function JobsPage() {
  const user = await requireUser();
  const isPro = user.role === "provider";
  const profile = isPro ? await getProviderProfile(user.id) : null;

  const rows = await db.select().from(jobs)
    .where(isPro ? eq(jobs.acceptedById, user.id) : eq(jobs.homeownerId, user.id))
    .orderBy(desc(jobs.createdAt));

  const jobIds = rows.map((j) => j.id);
  const codes = jobIds.length
    ? await db.select().from(accessCodes).where(inArray(accessCodes.jobId, jobIds))
    : [];
  const counterpartIds = Array.from(new Set(rows.map((j) => (isPro ? j.homeownerId : j.acceptedById)).filter(Boolean))) as string[];
  const counterparts = counterpartIds.length
    ? await db.select().from(users).where(inArray(users.id, counterpartIds))
    : [];
  const nameOf = (id: string | null) => counterparts.find((u) => u.id === id)?.name ?? "—";
  const myReviews = !isPro && jobIds.length
    ? await db.select().from(reviews).where(inArray(reviews.jobId, jobIds))
    : [];

  const active = rows.filter((j) => j.status === "accepted" || j.status === "in_progress");
  const openOnes = rows.filter((j) => j.status === "open");
  const history = rows.filter((j) => j.status === "completed" || j.status === "cancelled");

  function JobRow({ j }: { j: Job }) {
    const code = codes.find((c) => c.jobId === j.id && (codeStatus(c) === "active" || codeStatus(c) === "scheduled"));
    const review = myReviews.find((r) => r.jobId === j.id);
    return (
      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <CategoryIcon category={j.category} className="h-5.5 w-5.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[16px] font-bold text-primary-900">{j.title}</h3>
              {statusBadge(j.status)}
              <GigBadges job={j} />
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] font-medium text-stone-500">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden />{j.city}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden />{j.windowLabel}</span>
              <span>{isPro ? `Homeowner: ${nameOf(j.homeownerId)}` : j.acceptedById ? `Pro: ${nameOf(j.acceptedById)} ✓` : "Awaiting a verified pro"}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[15px] font-bold text-primary-900">
              {j.status === "completed" && j.payFinal ? money(j.region, j.payFinal) : payRange(j.region, j.payMin, j.payMax)}
            </p>
            <p className="text-[11px] font-semibold text-stone-400">
              {j.status === "completed" ? `paid · ${timeAgo(j.completedAt ?? j.createdAt)}` : "est. pay"}
            </p>
            {review && (
              <p className="mt-1 flex items-center justify-end gap-0.5 text-amber-400" aria-label={`${review.rating} stars`}>
                {Array.from({ length: review.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />)}
              </p>
            )}
          </div>
        </div>

        {code && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <KeyRound className="h-4.5 w-4.5 shrink-0 text-amber-600" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold tracking-widest text-amber-700 uppercase">{code.brand} · temporary code</p>
              <p className="font-mono text-xl font-bold tracking-[0.25em] text-primary-900">{code.code}</p>
            </div>
            <p className="text-xs font-semibold text-amber-700">
              expires in <Countdown until={code.validUntil.getTime()} className="font-mono" />
            </p>
            <AccessActions codeId={code.id} role={isPro ? "provider" : "homeowner"} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2.5">
          {isPro && j.status === "accepted" && <StartJobButton jobId={j.id} />}
          {isPro && j.needsAccess && !code && j.status !== "completed" && (
            <Button href="/dashboard/access-codes" variant="secondary" size="sm"><KeyRound className="h-4 w-4" aria-hidden /> View access history</Button>
          )}
          {!isPro && (j.status === "accepted" || j.status === "in_progress") && (
            <CompleteJobButton jobId={j.id} jobTitle={j.title} />
          )}
          {!isPro && j.status === "open" && <CancelJobButton jobId={j.id} />}
          {!isPro && j.needsAccess && (
            <Button href="/dashboard/access" variant="ghost" size="sm"><KeyRound className="h-4 w-4" aria-hidden /> Access log</Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <DashboardShell name={user.name} role={user.role} verification={profile?.verificationStatus}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl">My jobs</h1>
          <p className="mt-1 text-stone-500">
            {isPro ? "Accepted work, live access credentials and payout history." : "Track every job from posting to payout."}
          </p>
        </div>
        {isPro
          ? <Button href="/gigs" variant="accent" size="sm">Find more gigs</Button>
          : <Button href="/dashboard/post-job" variant="accent" size="sm">Post a job</Button>}
      </div>

      {rows.length === 0 && (
        <div className="mt-8">
          <EmptyState icon={Briefcase} title={isPro ? "No accepted jobs yet" : "You haven't posted a job yet"}
            body={isPro
              ? "Fully Verified pros get priority access to the highest-paying local gigs. Browse the marketplace to accept your first."
              : "Describe the work, set a budget, and toggle temporary access if you won't be home."}
            action={<Button href={isPro ? "/gigs" : "/dashboard/post-job"} variant="accent">{isPro ? "Browse high-pay gigs" : "Post a job"}</Button>} />
        </div>
      )}

      {active.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold text-primary-900">Active ({active.length})</h2>
          <div className="mt-3 space-y-4">{active.map((j) => <JobRow key={j.id} j={j} />)}</div>
        </section>
      )}
      {openOnes.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold text-primary-900">{isPro ? "Open" : "Waiting for pros"} ({openOnes.length})</h2>
          <div className="mt-3 space-y-4">{openOnes.map((j) => <JobRow key={j.id} j={j} />)}</div>
        </section>
      )}
      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold text-primary-900">History ({history.length})</h2>
          <div className="mt-3 space-y-4">{history.map((j) => <JobRow key={j.id} j={j} />)}</div>
        </section>
      )}
    </DashboardShell>
  );
}