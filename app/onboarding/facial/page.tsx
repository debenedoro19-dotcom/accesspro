import Link from "next/link";
import { MailWarning, ShieldCheck } from "lucide-react";
import { db } from "@/db";
import { verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser, getProviderProfile } from "@/lib/auth";
import { FacialCapture } from "@/components/facial-capture";
import { Button, Card } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Facial verification" };

function Gate({ title, body, cta }: { title: string; body: string; cta?: { href: string; label: string } }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
      <Card className="p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <MailWarning className="h-7 w-7 text-amber-500" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-primary-900">{title}</h1>
        <p className="mt-2 leading-relaxed text-stone-500">{body}</p>
        <div className="mt-6 flex justify-center gap-3">
          {cta && <Button href={cta.href} variant="accent">{cta.label}</Button>}
          <Button href="/onboarding" variant="secondary">Back to onboarding</Button>
        </div>
      </Card>
    </div>
  );
}

export default async function FacialPage({ searchParams }: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token)
    return <Gate title="Email link required"
      body="For your security, the facial verification step can only be opened from the secure link we emailed you after your documents were approved."
      cta={{ href: "/dev/inbox", label: "Open demo inbox" }} />;

  const rows = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token)).limit(1);
  const vt = rows[0];
  if (!vt)
    return <Gate title="Invalid verification link" body="This link doesn't match any verification request. Request a fresh link from your onboarding page." />;
  if (vt.usedAt)
    return <Gate title="Link already used" body="This verification link has already been completed. If you believe this is an error, contact trust & safety." cta={{ href: "/dashboard", label: "Go to dashboard" }} />;
  if (vt.expiresAt < new Date())
    return <Gate title="Link expired" body="Secure links are valid for 30 minutes. Head back to onboarding and tap “Resend link” to get a fresh one." />;

  const user = await getSessionUser();
  if (!user)
    return <Gate title="Sign in to continue" body="Open this link while signed in to the account being verified." cta={{ href: `/login?next=${encodeURIComponent(`/onboarding/facial?token=${token}`)}`, label: "Log in" }} />;
  if (user.id !== vt.userId)
    return <Gate title="Wrong account" body="This link belongs to a different AccessPro account. Log out, then sign in to the account that requested verification." />;

  const profile = await getProviderProfile(user.id);
  if (profile?.verificationStatus === "fully_verified")
    return (
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <Card className="p-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-accent-500" aria-hidden />
          <h1 className="mt-4 font-display text-2xl font-extrabold text-primary-900">You're already Fully Verified</h1>
          <p className="mt-2 text-stone-500">Your badge is live and priority gigs are unlocked.</p>
          <Button href="/dashboard" variant="accent" className="mt-6">Go to dashboard</Button>
        </Card>
      </div>
    );

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent-600 uppercase">Final step · secure session</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-primary-900">Facial verification</h1>
        <p className="mt-2 text-stone-500">
          Hi {user.name.split(" ")[0]} — a quick liveness check, matched against your uploaded ID photo.
        </p>
      </div>
      <FacialCapture token={token} />
      <p className="mt-6 text-center text-xs text-stone-400">
        Protected by AccessPro Identity · <Link href="/trust-and-safety" className="font-semibold underline-offset-2 hover:underline">Privacy & retention policy</Link>
      </p>
    </div>
  );
}