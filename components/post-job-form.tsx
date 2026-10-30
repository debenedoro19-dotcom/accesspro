"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, AlertCircle, Camera, MapPin, Clock } from "lucide-react";
import clsx from "clsx";
import { postJobAction } from "@/lib/actions";
import { REGIONS, ALL_CATEGORIES, money, isRegion } from "@/lib/regions";
import { Button, Field, inputCls, Card, Badge } from "@/components/ui";
import { CategoryIcon } from "@/components/gig-card";

const LOCKS = [
  { value: "yale", label: "Yale Access" },
  { value: "schlage", label: "Schlage Encode" },
  { value: "august", label: "August Home" },
  { value: "manual", label: "Universal keypad / lockbox" },
];

export function PostJobForm({ defaults }: {
  defaults: { region: string; city: string };
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("HVAC");
  const [urgency, setUrgency] = useState("standard");
  const [payMin, setPayMin] = useState(800);
  const [payMax, setPayMax] = useState(1500);
  const [region, setRegion] = useState<string>(isRegion(defaults.region) ? defaults.region : "US");
  const [needsAccess, setNeedsAccess] = useState(false);
  const [lockBrand, setLockBrand] = useState("yale");
  const [windowLabel, setWindowLabel] = useState("");
  const [photoName, setPhotoName] = useState("");

  function submit(fd: FormData) {
    setError(null);
    fd.set("needsAccess", needsAccess ? "on" : "off");
    fd.set("photoName", photoName);
    startTransition(async () => {
      const res = await postJobAction(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <Card className="p-6 sm:p-8">
        <form action={submit} className="space-y-5">
          <Field label="What needs doing?" required>
            <input name="title" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Emergency boiler repair – no hot water" className={inputCls} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Service type" required>
              <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Region">
              <select name="region" value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls}>
                {Object.values(REGIONS).map((r) => <option key={r.code} value={r.code}>{r.flag} {r.name}</option>)}
              </select>
            </Field>
            <Field label="City / area" required>
              <input name="city" required defaultValue={defaults.city} placeholder="Chicago · Lincoln Park" className={inputCls} />
            </Field>
            <Field label="Address" hint="approximate is fine — exact shown after acceptance">
              <input name="address" placeholder="2314 N Sheffield Ave" className={inputCls} />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-primary-900">Urgency</legend>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "standard", label: "Standard", cls: "border-primary-900 bg-primary-900 text-white" },
                { v: "urgent", label: "Urgent", cls: "border-orange-500 bg-orange-500 text-white" },
                { v: "emergency", label: "Emergency", cls: "border-rose-600 bg-rose-600 text-white" },
              ].map((u) => (
                <button type="button" key={u.v} aria-pressed={urgency === u.v}
                  onClick={() => setUrgency(u.v)}
                  className={clsx(
                    "h-11 rounded-xl border text-sm font-bold transition-all",
                    urgency === u.v ? u.cls + " shadow-card" : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
                  )}>
                  {u.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="urgency" value={urgency} />
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label={`Budget min (${REGIONS[region as keyof typeof REGIONS].currency})`} required>
              <input name="payMin" type="number" min={1} required value={payMin}
                onChange={(e) => setPayMin(Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Budget max" required>
              <input name="payMax" type="number" min={1} required value={payMax}
                onChange={(e) => setPayMax(Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Preferred window" required>
              <input name="window" required value={windowLabel} onChange={(e) => setWindowLabel(e.target.value)}
                placeholder="Tomorrow 1–5 PM" className={inputCls} />
            </Field>
          </div>

          <Field label="Notes for the pro">
            <textarea name="description" rows={3}
              placeholder="Access details, equipment model, what you've already tried…"
              className="w-full rounded-xl border border-stone-300 px-3.5 py-3 text-[15px] outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200" />
          </Field>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <Camera className="h-4.5 w-4.5 text-stone-400" aria-hidden />
            <span className="flex-1 text-sm font-semibold text-stone-600">
              {photoName ? `Photo attached: ${photoName}` : "Add a photo (optional)"}
            </span>
            <span className="text-xs font-bold text-accent-700">{photoName ? "Replace" : "Choose file"}</span>
            <input type="file" accept="image/*" className="sr-only"
              onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")} />
          </label>

          {/* Temporary access toggle */}
          <div className={clsx(
            "rounded-2xl border-2 p-5 transition-all",
            needsAccess ? "border-accent-400 bg-accent-50" : "border-stone-200 bg-white"
          )}>
            <label className="flex cursor-pointer items-start gap-4">
              <button type="button" role="switch" aria-checked={needsAccess}
                onClick={() => setNeedsAccess(!needsAccess)}
                className={clsx(
                  "relative mt-0.5 h-6.5 w-11.5 shrink-0 rounded-full transition-colors",
                  needsAccess ? "bg-accent-500" : "bg-stone-300"
                )}>
                <span className={clsx(
                  "absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow transition-all",
                  needsAccess ? "left-5.5" : "left-0.5"
                )} />
              </button>
              <span>
                <span className="flex items-center gap-2 font-display text-[15px] font-bold text-primary-900">
                  <KeyRound className="h-4.5 w-4.5 text-accent-600" aria-hidden />
                  I won't be home — generate temporary access for the pro
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-stone-500">
                  A unique, time-limited PIN is issued to the verified pro who accepts.
                  It auto-expires and every entry is logged.
                </span>
              </span>
            </label>
            {needsAccess && (
              <div className="animate-pop-in mt-4 pl-15.5">
                <Field label="Smart lock system">
                  <select name="lockBrand" value={lockBrand} onChange={(e) => setLockBrand(e.target.value)} className={inputCls}>
                    {LOCKS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </Field>
              </div>
            )}
            {!needsAccess && <input type="hidden" name="lockBrand" value="manual" />}
          </div>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-semibold text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {error}
            </p>
          )}

          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
            {pending && <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden />}
            Post job — notify verified pros
          </Button>
        </form>
      </Card>

      {/* Live preview */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <p className="mb-3 font-mono text-xs font-bold tracking-[0.2em] text-stone-400 uppercase">Live preview</p>
          <Card className="p-5">
            <div className="flex flex-wrap gap-1.5">
              {urgency === "emergency" && <Badge kind="emergency">Emergency</Badge>}
              {urgency === "urgent" && <Badge kind="urgent">Urgent</Badge>}
              {payMax >= 3000 ? <Badge kind="highticket">High ticket</Badge> : payMax >= 1500 ? <Badge kind="premium">Premium gig</Badge> : null}
            </div>
            <div className="mt-3 flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <CategoryIcon category={category} className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-[16px] leading-snug font-bold text-primary-900">
                  {title || "Your job title appears here"}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-stone-400">{category} · just now</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-[13px] font-medium text-stone-600">
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-stone-400" aria-hidden />{defaults.city || REGIONS[region as keyof typeof REGIONS].name}</p>
              <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-stone-400" aria-hidden />{windowLabel || "Flexible"}</p>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-stone-100 pt-4">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Est. pay</p>
                <p className="font-mono text-lg font-bold text-primary-900">
                  {money(region, payMin || 0)} – {money(region, payMax || 0)}
                </p>
              </div>
              {needsAccess && <Badge kind="access"><KeyRound className="h-3 w-3" aria-hidden />Temp access</Badge>}
            </div>
          </Card>
          <p className="mt-4 rounded-xl bg-primary-50 px-4 py-3 text-xs leading-relaxed text-primary-700">
            Higher budgets rank higher in verified pros' feeds. Emergency jobs page the nearest available pros first.
          </p>
        </div>
      </div>
    </div>
  );
}