import { ShieldAlert, Scale, Globe2, FileCheck, Mail, ScanFace, Flag } from "lucide-react";
import { db } from "@/db";
import { users, providerProfiles, disputes, regionSettings, analyticsEvents } from "@/db/schema";
import { eq, or, ne, desc, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { timeAgo, regionOf } from "@/lib/regions";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, Stat, Badge, Progress, EmptyState } from "@/components/ui";
import { ReviewButtons, ResolveButton, RegionEditor } from "@/components/admin-actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin console" };

export default async function AdminPage() {
  const admin = await requireRole("admin");

  const queue = await db
    .select({ u: users, p: providerProfiles })
    .from(providerProfiles)
    .innerJoin(users, eq(users.id, providerProfiles.userId))
    .where(or(ne(providerProfiles.verificationStatus, "fully_verified"), eq(providerProfiles.flagged, true)))
    .orderBy(desc(users.createdAt));

  const openDisputes = await db.select().from(disputes).orderBy(desc(disputes.createdAt));
  const regions = await db.select().from(regionSettings);
  const funnelRows = await db
    .select({ name: analyticsEvents.name, count: sql<number>`count(*)::int` })
    .from(analyticsEvents).groupBy(analyticsEvents.name);
  const count = (n: string) => funnelRows.find((f) => f.name === n)?.count ?? 0;
  const docs = count("documents_submitted");
  const opened = count("email_opened");
  const facial = count("facial_completed");
  const openCount = openDisputes.filter((d) => d.status === "open").length;

  const funnel = [
    { label: "Documents submitted", icon: FileCheck, value: docs, pct: 100 },
    { label: "Email link opened", icon: Mail, value: opened, pct: docs ? Math.round((opened / docs) * 100) : 0 },
    { label: "Facial completed", icon: ScanFace, value: facial, pct: docs ? Math.round((facial / docs) * 100) : 0 },
  ];

  return (
    <DashboardShell name={admin.name} role="admin">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-900">
          <ShieldAlert className="h-5.5 w-5.5 text-accent-400" aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl">Trust & safety console</h1>
          <p className="text-sm text-stone-500">Verification review · disputes · region configuration</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Awaiting review" icon={FileCheck} value={queue.length} sub="Pending or flagged providers" />
        <Stat label="Open disputes" icon={Scale} value={openCount} sub={`${openDisputes.length} total`} />
        <Stat label="Doc → facial completion" icon={ScanFace}
          value={`${docs ? Math.round((facial / docs) * 100) : 0}%`} sub="Verification funnel health" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Verification queue */}
        <section>
          <h2 className="font-display text-lg font-bold text-primary-900">Verification queue</h2>
          <div className="mt-3 space-y-4">
            {queue.length === 0 && (
              <EmptyState icon={FileCheck} title="Queue is clear"
                body="New provider submissions appear here after their documents pass automated checks." />
            )}
            {queue.map(({ u, p }) => (
              <Card key={u.id} className="p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-900 font-display text-sm font-extrabold text-accent-400">
                    {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-display font-bold text-primary-900">
                      {u.name}
                      {p.flagged && <Badge kind="emergency"><Flag className="h-3 w-3" aria-hidden />Flagged</Badge>}
                      <Badge kind={p.verificationStatus === "facial_pending" ? "premium" : "neutral"}>
                        {p.verificationStatus.replace("_", " ")}
                      </Badge>
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-stone-400">
                      {u.email} · {regionOf(u.region).flag} {u.region} · {p.trades.join(", ") || "no trades yet"} · joined {timeAgo(u.createdAt)}
                    </p>
                    {p.reviewNote && <p className="mt-2 text-xs font-semibold text-amber-700">{p.reviewNote}</p>}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.documents.length === 0 && <span className="text-xs font-medium text-stone-400">No documents uploaded yet</span>}
                      {p.documents.map((d) => (
                        <span key={d.type} className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
                          📎 {d.type}: <span className="font-mono">{d.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <ReviewButtons userId={u.id} />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          {/* Funnel */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-primary-900">Verification funnel</h2>
            <p className="mt-1 text-xs text-stone-400">Documents → email → facial completion</p>
            <div className="mt-4 space-y-4">
              {funnel.map((f) => (
                <div key={f.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold text-stone-600">
                      <f.icon className="h-4 w-4 text-stone-400" aria-hidden /> {f.label}
                    </span>
                    <span className="font-mono font-bold text-primary-900">{f.value} <span className="text-xs text-stone-400">({f.pct}%)</span></span>
                  </div>
                  <Progress value={f.pct} className="mt-1.5" />
                </div>
              ))}
            </div>
          </Card>

          {/* Disputes */}
          <Card className="p-5">
            <h2 className="font-display font-bold text-primary-900">Disputes</h2>
            <div className="mt-3 space-y-4">
              {openDisputes.length === 0 && <p className="text-sm text-stone-400">No disputes on record.</p>}
              {openDisputes.map((d) => (
                <div key={d.id} className="rounded-xl border border-stone-200 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-primary-900">{d.subject}</p>
                    <Badge kind={d.status === "open" ? "urgent" : "verified"}>{d.status}</Badge>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">{d.detail}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-400">{d.region} · {timeAgo(d.createdAt)}</span>
                    {d.status === "open" && <ResolveButton id={d.id} />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Region config */}
      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-stone-100 px-5 py-4">
          <Globe2 className="h-5 w-5 text-primary-400" aria-hidden />
          <h2 className="font-display font-bold text-primary-900">Region configuration</h2>
          <span className="ml-auto text-xs font-semibold text-stone-400">Demand multipliers feed gig ranking</span>
        </div>
        <RegionEditor rows={regions.map((r) => ({ region: r.region, active: r.active, demandMultiplier: r.demandMultiplier, featured: r.featured }))} />
      </Card>
    </DashboardShell>
  );
}