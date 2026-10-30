import { Wallet, TrendingUp, Clock, Landmark, CheckCircle2 } from "lucide-react";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireRole, getProviderProfile } from "@/lib/auth";
import { money, regionOf } from "@/lib/regions";
import { DashboardShell } from "@/components/dashboard-shell";
import { EarningsChart } from "@/components/earnings-chart";
import { Card, Stat, Badge } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const user = await requireRole("provider");
  const profile = await getProviderProfile(user.id);
  const region = regionOf(user.region);

  const completed = await db.select().from(jobs)
    .where(and(eq(jobs.acceptedById, user.id), eq(jobs.status, "completed")))
    .orderBy(desc(jobs.completedAt));
  const pending = await db.select().from(jobs)
    .where(and(eq(jobs.acceptedById, user.id), eq(jobs.status, "in_progress")));

  const lifetime = completed.reduce((s, j) => s + (j.payFinal ?? 0), 0);
  const pendingSum = pending.reduce((s, j) => s + Math.round((j.payMin + j.payMax) / 2), 0);
  const month = completed
    .filter((j) => j.completedAt && j.completedAt > new Date(Date.now() - 30 * 864e5))
    .reduce((s, j) => s + (j.payFinal ?? 0), 0);

  // Six weekly buckets
  const labels: string[] = [];
  const values: number[] = [];
  for (let w = 5; w >= 0; w--) {
    const end = new Date(Date.now() - w * 7 * 864e5);
    const start = new Date(end.getTime() - 7 * 864e5);
    labels.push(start.toLocaleDateString(region.locale, { month: "short", day: "numeric" }));
    values.push(completed
      .filter((j) => j.completedAt && j.completedAt > start && j.completedAt <= end)
      .reduce((s, j) => s + (j.payFinal ?? 0), 0));
  }

  return (
    <DashboardShell name={user.name} role="provider" verification={profile?.verificationStatus}>
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl">Earnings</h1>
      <p className="mt-1 text-stone-500">Payouts release automatically when homeowners confirm completion.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Lifetime released" icon={Wallet} value={money(user.region, lifetime)} sub={`${completed.length} completed jobs`} />
        <Stat label="Last 30 days" icon={TrendingUp} value={money(user.region, month)} sub={region.currency} />
        <Stat label="Pending clearance" icon={Clock} value={money(user.region, pendingSum)} sub={`${pending.length} job(s) in progress`} />
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-primary-900">Weekly earnings — last 6 weeks</h2>
          <Badge kind="verified">Stripe Connect · connected</Badge>
        </div>
        <div className="mt-5">
          <EarningsChart labels={labels} values={values} currency={region.currency} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <div className="border-b border-stone-100 px-6 py-4">
            <h2 className="font-display text-lg font-bold text-primary-900">Payout history</h2>
          </div>
          {completed.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-stone-400">Completed jobs and payouts will appear here.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {completed.map((j) => (
                <li key={j.id} className="flex items-center gap-4 px-6 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50">
                    <CheckCircle2 className="h-4.5 w-4.5 text-accent-600" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-primary-900">{j.title}</p>
                    <p className="text-xs font-medium text-stone-400">
                      {j.completedAt?.toLocaleDateString(region.locale, { month: "short", day: "numeric", year: "numeric" })} · {j.category}
                    </p>
                  </div>
                  <p className="font-mono text-[15px] font-bold text-primary-900">{money(j.region, j.payFinal ?? 0)}</p>
                  <Badge kind="verified">Released</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="h-fit p-6">
          <Landmark className="h-7 w-7 text-primary-400" aria-hidden />
          <h3 className="mt-3 font-display font-bold text-primary-900">Payout account</h3>
          <p className="mt-1 text-sm text-stone-500">Stripe Connect · acct_••••4821</p>
          <ul className="mt-4 space-y-2.5 text-sm text-stone-600">
            <li className="flex justify-between"><span>Schedule</span><strong className="text-primary-900">Instant on completion</strong></li>
            <li className="flex justify-between"><span>Platform fee</span><strong className="text-primary-900">8%</strong></li>
            <li className="flex justify-between"><span>Currency</span><strong className="text-primary-900">{region.currency}</strong></li>
          </ul>
          <p className="mt-4 rounded-xl bg-stone-50 px-3.5 py-2.5 text-xs leading-relaxed text-stone-500">
            Sandbox mode: payouts are simulated. Production wires Stripe Connect onboarding + transfers.
          </p>
        </Card>
      </div>
    </DashboardShell>
  );
}