import { Star, BadgeCheck, Users } from "lucide-react";
import { db } from "@/db";
import { users, providerProfiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { regionOf, money } from "@/lib/regions";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, Badge, EmptyState, Button } from "@/components/ui";
import { InviteProButton } from "@/components/job-buttons";
import { CountUp } from "@/components/motion";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Find pros" };

export default async function ProsPage() {
  const user = await requireRole("homeowner");
  const region = regionOf(user.region);
  const rows = await db
    .select({ u: users, p: providerProfiles })
    .from(providerProfiles)
    .innerJoin(users, eq(users.id, providerProfiles.userId))
    .where(and(eq(providerProfiles.verificationStatus, "fully_verified"), eq(users.region, user.region)))
    .orderBy(desc(providerProfiles.rating));

  return (
    <DashboardShell name={user.name} role="homeowner">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl">
        Verified pros in {region.name}
      </h1>
      <p className="mt-1 text-stone-500">
        <CountUp value={rows.length} className="font-bold text-primary-900" /> fully verified professionals · every one ID-checked,
        insured and liveness-matched. Rates in {region.currency}.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Users} title="No verified pros in this region yet"
            body="Switch your account region or post a job — we notify pros as they complete verification." />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ u, p }) => (
            <Card key={u.id} lift className="group flex h-full flex-col p-5">
              <div className="flex items-center gap-3.5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-900 font-display text-[15px] font-extrabold text-accent-400">
                  {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-display font-bold text-primary-900">
                    <span className="truncate">{u.name}</span>
                    <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-accent-500 group-hover:animate-pulse-soft" aria-label="Fully verified" />
                  </p>
                  <p className="text-xs font-semibold text-stone-400">{u.city} · {p.yearsExperience} yrs</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-stone-600">{p.trades.join(" · ")}</p>
              <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-stone-500">{p.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge kind="verified" pulse>Fully Verified</Badge>
                {p.specialties.slice(0, 2).map((s) => <Badge key={s} kind="neutral">{s}</Badge>)}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                <p className="flex items-center gap-1 text-sm font-bold text-primary-900">
                  {p.rating.toFixed(1)} <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  <span className="font-medium text-stone-400">· {p.jobsCompleted} jobs</span>
                </p>
                <p className="font-mono text-sm font-bold text-primary-900">{money(u.region, p.hourlyRate)}<span className="text-xs text-stone-400">/hr</span></p>
              </div>
              <div className="mt-4">
                <InviteProButton proId={u.id} proName={u.name} />
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-8 flex justify-center">
        <Button href="/dashboard/post-job" variant="accent">Post a job to reach all {rows.length} pros</Button>
      </div>
    </DashboardShell>
  );
}