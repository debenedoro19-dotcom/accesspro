import { ShieldCheck, Star } from "lucide-react";
import { requireRole, getProviderProfile } from "@/lib/auth";
import { regionOf } from "@/lib/regions";
import { DashboardShell } from "@/components/dashboard-shell";
import { ProfileForm } from "@/components/profile-form";
import { Card, Badge, Progress, Button } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile & rates" };

export default async function ProfilePage() {
  const user = await requireRole("provider");
  const profile = await getProviderProfile(user.id);
  const region = regionOf(user.region);
  const verified = profile?.verificationStatus === "fully_verified";

  return (
    <DashboardShell name={user.name} role="provider" verification={profile?.verificationStatus}>
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary-900 sm:text-3xl">Profile & rates</h1>
      <p className="mt-1 text-stone-500">This is what homeowners see when you accept their job.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <ProfileForm
          currency={region.currency}
          initial={{
            city: user.city, phone: user.phone,
            trades: profile?.trades ?? [], hourlyRate: profile?.hourlyRate ?? 0,
            radiusKm: profile?.radiusKm ?? 40, availability: profile?.availability ?? "Weekdays",
            bio: profile?.bio ?? "", specialties: profile?.specialties ?? [],
          }} />
        <div className="space-y-5">
          <Card className="p-5 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-900 font-display text-xl font-extrabold text-accent-400">
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </span>
            <p className="mt-3 font-display text-lg font-bold text-primary-900">{user.name}</p>
            <p className="text-sm text-stone-500">{profile?.trades.join(" · ") || "Add your trades"} · {user.city}</p>
            <div className="mt-3 flex justify-center">
              {verified
                ? <Badge kind="verified" pulse>Fully Verified</Badge>
                : <Badge kind="premium">Verification in progress</Badge>}
            </div>
            <p className="mt-3 flex items-center justify-center gap-1 text-sm font-bold text-primary-900">
              {(profile?.rating ?? 5).toFixed(1)} <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              <span className="font-medium text-stone-400">· {profile?.jobsCompleted ?? 0} jobs</span>
            </p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary-900">Profile strength</p>
              <span className="font-mono text-sm font-bold text-accent-600">{profile?.profileStrength ?? 0}%</span>
            </div>
            <Progress value={profile?.profileStrength ?? 0} className="mt-3" />
            <ul className="mt-4 space-y-2 text-xs leading-relaxed text-stone-500">
              <li>• Complete verification for +35%</li>
              <li>• Bio over 40 characters +10%</li>
              <li>• Specialties & multi-trade +20%</li>
            </ul>
          </Card>
          {!verified && (
            <Card className="p-5">
              <ShieldCheck className="h-6 w-6 text-accent-600" aria-hidden />
              <p className="mt-2 text-sm font-bold text-primary-900">Finish verification</p>
              <p className="mt-1 text-xs text-stone-500">Only Fully Verified pros can accept premium gigs.</p>
              <Button href="/onboarding" variant="accent" size="sm" className="mt-3 w-full">Continue</Button>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}