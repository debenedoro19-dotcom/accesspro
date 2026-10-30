import { redirect } from "next/navigation";
import { ShieldCheck, KeyRound, TrendingUp } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const user = await getSessionUser();
  if (user) {
    const roleSafeNext = safeNext?.startsWith("/dashboard/post-job") && user.role !== "homeowner"
      ? undefined
      : safeNext?.startsWith("/onboarding") && user.role !== "provider"
        ? undefined
        : safeNext;
    redirect(user.role === "admin" ? "/admin" : roleSafeNext ?? "/dashboard");
  }
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
      <div className="hidden lg:block">
        <div className="rounded-3xl bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 p-10 text-white shadow-lift">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent-400 uppercase">Welcome back</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Your premium pipeline is waiting.</h1>
          <ul className="mt-8 space-y-5">
            {[
              { icon: TrendingUp, text: "Priority high-pay gigs, ranked for your region" },
              { icon: KeyRound, text: "Live temporary access codes with entry logs" },
              { icon: ShieldCheck, text: "Your Fully Verified badge, working for you" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <f.icon className="h-5 w-5 text-accent-400" aria-hidden />
                </span>
                <span className="font-medium text-stone-200">{f.text}</span>
              </li>
            ))}
          </ul>
          <blockquote className="mt-10 border-t border-white/10 pt-6 text-sm leading-relaxed text-stone-300">
            “First week on AccessPro I cleared $4,100. The badge does the selling for me.”
            <footer className="mt-2 font-bold text-white">Marcus R. · HVAC · Chicago</footer>
          </blockquote>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-primary-900">Log in</h2>
        <p className="mt-2 mb-8 text-stone-500">Providers, homeowners and admins — one secure door.</p>
        <AuthForm mode="login" next={safeNext} />
      </div>
    </div>
  );
}