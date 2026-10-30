import { redirect } from "next/navigation";
import { requireRole, getProviderProfile } from "@/lib/auth";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Provider onboarding" };

export default async function OnboardingPage() {
  const user = await requireRole("provider");
  const profile = await getProviderProfile(user.id);
  if (!profile) redirect("/dashboard");
  if (profile.verificationStatus === "fully_verified") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <OnboardingWizard
        initial={{
          name: user.name,
          phone: user.phone,
          city: user.city,
          region: user.region,
          email: user.email,
          trades: profile.trades,
          years: profile.yearsExperience,
          status: profile.verificationStatus,
          reviewNote: profile.reviewNote,
        }}
      />
    </div>
  );
}