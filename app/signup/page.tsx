import { redirect } from "next/navigation";
import { FileCheck, Mail, ScanFace } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage({ searchParams }: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const params = await searchParams;
  const initialRole = params.role === "homeowner" ? "homeowner" : "provider";
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : undefined;
  const user = await getSessionUser();
  if (user) {
    const roleSafeNext = next?.startsWith("/dashboard/post-job") && user.role !== "homeowner"
      ? undefined
      : next?.startsWith("/onboarding") && user.role !== "provider"
        ? undefined
        : next;
    redirect(user.role === "admin" ? "/admin" : roleSafeNext ?? (user.role === "provider" ? "/onboarding" : "/dashboard"));
  }
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
      <div className="hidden lg:block">
        <div className="rounded-3xl bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 p-10 text-white shadow-lift">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent-400 uppercase">Providers · verification path</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Verified once.<br />Trusted everywhere.</h1>
          <ol className="mt-8 space-y-5">
            {[
              { icon: FileCheck, step: "1", text: "Upload ID, insurance and trade credentials" },
              { icon: Mail, step: "2", text: "We email a secure, 30-minute verification link" },
              { icon: ScanFace, step: "3", text: "Complete the live facial check — badge unlocked" },
            ].map((f) => (
              <li key={f.step} className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 font-mono text-sm font-bold text-accent-400">
                  {f.step}
                </span>
                <span className="font-medium text-stone-200">{f.text}</span>
              </li>
            ))}
          </ol>
          <p className="mt-10 border-t border-white/10 pt-6 text-sm leading-relaxed text-stone-300">
            Privacy-first: facial templates are matched then immediately deleted.
            Documents are encrypted and handled per GDPR, CCPA & PIPEDA.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-primary-900">Create your account</h2>
        <p className="mt-2 mb-8 text-stone-500">Free to join. Providers keep 90%+ of every gig.</p>
        <AuthForm mode="signup" initialRole={initialRole} next={next} />
      </div>
    </div>
  );
}