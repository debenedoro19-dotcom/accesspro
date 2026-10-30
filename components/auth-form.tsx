"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Wrench, Home, ShieldCheck, AlertCircle, Loader2, Zap } from "lucide-react";
import clsx from "clsx";
import { loginAction, signupAction } from "@/lib/actions";
import { REGIONS } from "@/lib/regions";
import { Button, Field, inputCls } from "@/components/ui";

const DEMOS = [
  { label: "Verified pro", email: "pro@accesspro.demo", desc: "Marcus · Fully Verified" },
  { label: "New pro", email: "pending@accesspro.demo", desc: "Priya · start verification" },
  { label: "Homeowner", email: "home@accesspro.demo", desc: "Dana · jobs & access" },
  { label: "Admin", email: "admin@accesspro.demo", desc: "Trust & safety queue" },
];

export function AuthForm({ mode, initialRole = "provider", next }: {
  mode: "login" | "signup";
  initialRole?: "provider" | "homeowner";
  next?: string;
}) {
  const [role, setRole] = useState<"provider" | "homeowner">(initialRole);
  const [region, setRegion] = useState("US");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nextRole = next?.startsWith("/dashboard/post-job") ? "homeowner" : "provider";
  const signupHref = next
    ? `/signup?role=${nextRole}&next=${encodeURIComponent(next)}`
    : "/signup";
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  function submit(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const res = mode === "login" ? await loginAction(fd) : await signupAction(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  function demo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo1234");
    const fd = new FormData();
    fd.set("email", demoEmail);
    fd.set("password", "demo1234");
    if (next) fd.set("next", next);
    submit(fd);
  }

  return (
    <div>
      <form action={submit} className="space-y-4">
        <input type="hidden" name="next" value={next ?? ""} />
        {mode === "signup" && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-primary-900">I am a…</legend>
            <div className="grid grid-cols-2 gap-3">
              {([
                { v: "provider", icon: Wrench, title: "Service Provider", sub: "Skilled trade, want premium gigs" },
                { v: "homeowner", icon: Home, title: "Homeowner", sub: "Need a vetted pro I can trust" },
              ] as const).map((r) => (
                <button type="button" key={r.v} onClick={() => setRole(r.v)} aria-pressed={role === r.v}
                  className={clsx(
                    "rounded-2xl border-2 p-4 text-left transition-all",
                    role === r.v ? "border-accent-500 bg-accent-50 shadow-glow" : "border-stone-200 bg-white hover:border-stone-300"
                  )}>
                  <r.icon className={clsx("h-5 w-5", role === r.v ? "text-accent-600" : "text-stone-400")} aria-hidden />
                  <p className="mt-2 text-sm font-bold text-primary-900">{r.title}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{r.sub}</p>
                </button>
              ))}
            </div>
            <input type="hidden" name="role" value={role} />
          </fieldset>
        )}

        {mode === "signup" && (
          <Field label="Full name" required>
            <input name="name" required autoComplete="name" placeholder="Jordan Meyer" className={inputCls} />
          </Field>
        )}
        <Field label="Email" required>
          <input name="email" type="email" required autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
        </Field>
        <Field label="Password" hint={mode === "signup" ? "8+ characters" : undefined} required>
          <input name="password" type="password" required autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
        </Field>
        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" hint="optional">
              <input name="phone" type="tel" autoComplete="tel" placeholder="+1 312 555 0100" className={inputCls} />
            </Field>
            <Field label="Region">
              <select name="region" value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls}>
                {Object.values(REGIONS).map((r) => (
                  <option key={r.code} value={r.code}>{r.flag} {r.name}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-semibold text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {error}
          </p>
        )}

        <Button type="submit" variant="accent" className="w-full" size="lg" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {mode === "login" ? "Log in" : role === "provider" ? "Create pro account → verify" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-stone-500">
        {mode === "login" ? (
          <>New to AccessPro? <Link href={signupHref} className="font-bold text-accent-700 hover:underline">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href={loginHref} className="font-bold text-accent-700 hover:underline">Log in</Link></>
        )}
      </p>

      {mode === "login" && (
        <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold tracking-widest text-stone-400 uppercase">
            <Zap className="h-3.5 w-3.5" aria-hidden /> One-tap demo accounts
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DEMOS.map((d) => (
              <button key={d.email} onClick={() => demo(d.email)} disabled={pending}
                className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left transition-all hover:border-accent-400 hover:shadow-card disabled:opacity-50">
                <p className="flex items-center gap-1 text-[13px] font-bold text-primary-900">
                  {d.label} {d.label === "Verified pro" && <ShieldCheck className="h-3.5 w-3.5 text-accent-600" aria-hidden />}
                </p>
                <p className="text-[11px] text-stone-500">{d.desc}</p>
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] text-stone-400">All demo passwords: <code className="font-mono font-bold">demo1234</code></p>
        </div>
      )}
    </div>
  );
}