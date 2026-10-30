import { requireRole } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { PostJobForm } from "@/components/post-job-form";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post a job" };

export default async function PostJobPage() {
  const user = await requireRole("homeowner");
  return (
    <DashboardShell name={user.name} role="homeowner">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl">Post a job</h1>
      <p className="mt-1 mb-6 text-stone-500">
        Only Fully Verified pros will see and accept your job. High-pay listings rank first.
      </p>
      <PostJobForm defaults={{ region: user.region, city: user.city }} />
    </DashboardShell>
  );
}