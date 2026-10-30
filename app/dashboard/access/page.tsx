import { db } from "@/db";
import { accessCodes, jobs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { codeStatus } from "@/lib/locks";
import { DashboardShell } from "@/components/dashboard-shell";
import { AccessManager, type AccessRow } from "@/components/access-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Temporary access" };

export default async function HomeownerAccessPage() {
  const user = await requireRole("homeowner");
  const rows = await db
    .select({ code: accessCodes, jobTitle: jobs.title, pro: users.name })
    .from(accessCodes)
    .innerJoin(jobs, eq(jobs.id, accessCodes.jobId))
    .innerJoin(users, eq(users.id, accessCodes.providerId))
    .where(eq(accessCodes.homeownerId, user.id))
    .orderBy(desc(accessCodes.createdAt));

  const data: AccessRow[] = rows.map(({ code, jobTitle, pro }) => ({
    id: code.id, code: code.code, brand: code.brand, status: codeStatus(code),
    validUntil: code.validUntil.getTime(), validFrom: code.validFrom.getTime(),
    jobTitle, counterpart: pro, events: code.events,
  }));

  return (
    <DashboardShell name={user.name} role="homeowner">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl">Temporary access</h1>
      <p className="mt-1 mb-6 text-stone-500">
        Each code is named to one verified pro, time-windowed and auto-expiring. Extend or revoke instantly.
      </p>
      <AccessManager rows={data} role="homeowner" />
    </DashboardShell>
  );
}