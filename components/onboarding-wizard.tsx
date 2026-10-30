"use client";

import { useState, useTransition } from "react";
import {
  FileCheck, Mail, CheckCircle2, Upload, AlertCircle, Loader2, Clock, RefreshCw, Inbox, ShieldCheck,
} from "lucide-react";
import clsx from "clsx";
import { saveBasicsAction, submitDocumentsAction, resendFacialEmailAction } from "@/lib/actions";
import { REGIONS, isRegion } from "@/lib/regions";
import { ALL_CATEGORIES } from "@/lib/regions";
import { Button, Field, inputCls, Progress, Card, Badge } from "@/components/ui";

type Initial = {
  name: string; phone: string; city: string; region: string; email: string;
  trades: string[]; years: number; status: string; reviewNote: string;
};

const STEPS = ["Profile", "Documents", "Email verification"];

export function OnboardingWizard({ initial }: { initial: Initial }) {
  const startStep = initial.status === "facial_pending" ? 2 : 0;
  const [step, setStep] = useState(startStep);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [trades, setTrades] = useState<string[]>(initial.trades);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [resent, setResent] = useState(false);

  const region = REGIONS[isRegion(initial.region) ? initial.region : "US"];
  const docTypes = [
    { type: "Government photo ID", hint: "Front + back where applicable", required: true },
    { type: "Liability insurance", hint: "Certificate of currency", required: true },
    { type: region.licenseLabel, hint: "If required in your region", required: false },
    { type: "Portfolio images", hint: "Optional — boosts profile strength", required: false },
  ];

  function saveBasics(fd: FormData) {
    setError(null);
    fd.set("trades", trades.join(","));
    startTransition(async () => {
      const res = await saveBasicsAction(fd);
      if (res.ok) setStep(1);
      else setError(res.error);
    });
  }

  function submitDocs() {
    setError(null);
    startTransition(async () => {
      const res = await submitDocumentsAction(
        Object.entries(docs).map(([type, name]) => ({ type, name }))
      );
      if (res.ok) setStep(2);
      else setError(res.error);
    });
  }

  function resend() {
    startTransition(async () => {
      const res = await resendFacialEmailAction();
      if (res.ok) setResent(true);
      else setError(res.error);
    });
  }

  const progress = step === 0 ? 20 : step === 1 ? 45 : 70;

  return (
    <div>
      <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent-600 uppercase">Provider onboarding</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-primary-900 sm:text-4xl">
        {step === 2 ? "Documents received" : "Get Fully Verified"}
      </h1>

      {/* Progress header */}
      <div className="mt-8">
        <div className="flex justify-between text-xs font-bold">
          {STEPS.map((s, i) => (
            <span key={s} className={clsx(
              "flex items-center gap-1.5",
              i < step ? "text-accent-600" : i === step ? "text-primary-900" : "text-stone-400"
            )}>
              {i < step ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <span className="font-mono">{i + 1}</span>}
              {s}
            </span>
          ))}
        </div>
        <Progress value={progress} className="mt-2.5" />
        <p className="mt-2 text-xs font-semibold text-stone-500">
          {step === 2 ? "Documents submitted – next: facial verification (via secure email link)" : `Step ${step + 1} of 3 · profile strength ${progress}%`}
        </p>
      </div>

      {initial.reviewNote && step < 2 && (
        <p className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {initial.reviewNote}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {error}
        </p>
      )}

      {/* STEP 1 — basics */}
      {step === 0 && (
        <Card className="mt-8 p-6 sm:p-8">
          <form action={saveBasics} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" required>
                <input name="name" defaultValue={initial.name} required className={inputCls} />
              </Field>
              <Field label="Phone" required>
                <input name="phone" defaultValue={initial.phone} required placeholder="+44 20 7946 0000" className={inputCls} />
              </Field>
              <Field label="Primary city" required>
                <input name="city" defaultValue={initial.city} required placeholder="London" className={inputCls} />
              </Field>
              <Field label="Region">
                <select name="region" defaultValue={region.code} className={inputCls}>
                  {Object.values(REGIONS).map((r) => <option key={r.code} value={r.code}>{r.flag} {r.name}</option>)}
                </select>
              </Field>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-primary-900">Primary trade(s) <span className="text-rose-500">*</span></legend>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((t) => (
                  <button type="button" key={t} aria-pressed={trades.includes(t)}
                    onClick={() => setTrades((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])}
                    className={clsx(
                      "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all",
                      trades.includes(t)
                        ? "border-accent-500 bg-accent-50 text-accent-700"
                        : "border-stone-300 bg-white text-stone-600 hover:border-primary-400"
                    )}>
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <Field label="Years of experience" required>
              <input name="years" type="number" min={0} max={60} defaultValue={initial.years || 5} required className={inputCls} />
            </Field>
            <Button type="submit" className="w-full" size="lg" disabled={pending || trades.length === 0}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Continue to documents
            </Button>
          </form>
        </Card>
      )}

      {/* STEP 2 — documents */}
      {step === 1 && (
        <Card className="mt-8 p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-stone-600">
            Upload clear photos or PDFs. Documents are encrypted at rest, reviewed by our verification
            partner, and handled under <strong>{region.privacyLaw}</strong>.
          </p>
          <div className="mt-6 space-y-4">
            {docTypes.map((d) => (
              <label key={d.type} className={clsx(
                "flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition-all hover:border-accent-400",
                docs[d.type] ? "border-accent-400 bg-accent-50" : "border-stone-300 bg-stone-50"
              )}>
                <span className={clsx(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  docs[d.type] ? "bg-accent-500 text-white" : "bg-white text-stone-400 shadow-card"
                )}>
                  {docs[d.type] ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <Upload className="h-5 w-5" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-bold text-primary-900">
                    {d.type} {d.required && <span className="text-rose-500">*</span>}
                  </span>
                  <span className="block truncate text-xs text-stone-500">
                    {docs[d.type] ? `Attached: ${docs[d.type]}` : d.hint}
                  </span>
                </span>
                <span className="text-xs font-bold text-accent-700">{docs[d.type] ? "Replace" : "Choose file"}</span>
                <input type="file" className="sr-only" accept="image/*,.pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setDocs((cur) => ({ ...cur, [d.type]: f.name }));
                  }} />
              </label>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
            <Button className="flex-1" size="lg" onClick={submitDocs} disabled={pending}>
              {pending ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Running automated checks…</>) : (<><FileCheck className="h-4.5 w-4.5" aria-hidden /> Submit documents</>)}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3 — email-gated facial (never shown inline) */}
      {step === 2 && (
        <Card className="mt-8 overflow-hidden">
          <div className="bg-gradient-to-br from-primary-950 to-primary-800 p-6 text-white sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/20">
                <Mail className="h-6 w-6 text-accent-400" aria-hidden />
              </span>
              <div>
                <p className="font-display text-xl font-bold">Facial verification pending</p>
                <p className="text-sm text-stone-300">Status: Documents Received – Facial Verification Pending</p>
              </div>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="leading-relaxed text-stone-600">
              Your documents passed initial automated checks. We've emailed a <strong>secure, 30-minute
              magic link</strong> to <strong className="text-primary-900">{initial.email}</strong>:
            </p>
            <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 font-mono text-[13px] font-semibold text-primary-900">
              Subject: Complete your AccessPro verification – Facial step required
            </p>
            <p className="mt-4 flex items-start gap-2 text-sm text-stone-500">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden />
              The facial step is only accessible from that email link — it never appears in this wizard.
              This protects your identity from session hijacking.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/dev/inbox" variant="accent" size="lg" className="flex-1">
                <Inbox className="h-4.5 w-4.5" aria-hidden /> Open demo mail inbox
              </Button>
              <Button variant="secondary" size="lg" onClick={resend} disabled={pending}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
                {resent ? "Sent again ✓" : "Resend link"}
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" aria-hidden />
              Sandbox note: email delivery is simulated — every message lands in the demo inbox instantly.
            </div>
            <div className="mt-4 flex justify-center">
              <Badge kind="verified">Next: Fully Verified badge + priority gigs</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}