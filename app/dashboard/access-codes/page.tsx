import { db } from "@/db";
import { accessCodes, jobs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireRole, getProviderProfile } from "@/lib/auth";
import { codeStatus } from "@/lib/locks";
import { DashboardShell } from "@/components/dashboard-shell";
import { AccessManager, type AccessRow } from "@/components/access-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Access codes" };

export default async function ProviderAccessPage() {
  const user = await requireRole("provider");
  const profile = await getProviderProfile(user.id);
  const rows = await db
    .select({ code: accessCodes, jobTitle: jobs.title, owner: users.name })
    .from(accessCodes)
    .innerJoin(jobs, eq(jobs.id, accessCodes.jobId))
    .innerJoin(users, eq(users.id, accessCodes.homeownerId))
    .where(eq(accessCodes.providerId, user.id))
    .orderBy(desc(accessCodes.createdAt));

  const data: AccessRow[] = rows.map(({ code, jobTitle, owner }) => ({
    id: code.id, code: code.code, brand: code.brand, status: codeStatus(code),
    validUntil: code.validUntil.getTime(), validFrom: code.validFrom.getTime(),
    jobTitle, counterpart: owner, events: code.events,
  }));

  return (
    <DashboardShell name={user.name} role="provider" verification={profile?.verificationStatus}>
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl">Access codes</h1>
      <p className="mt-1 mb-6 text-stone-500">
        Time-limited credentials issued to your verified identity. Every use is logged for the homeowner.
      </p>
      <AccessManager rows={data} role="provider" />
    </DashboardShell>
  );
}