"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { updateProfileAction } from "@/lib/actions";
import { ALL_CATEGORIES } from "@/lib/regions";
import { Button, Field, inputCls, Card } from "@/components/ui";

const SPECIALTIES = ["Emergency", "High-ticket", "Smart Home", "Solar", "EV charging", "Insurance work"];
const AVAILABILITY = ["Weekdays", "Weekdays + Sat", "Mon–Sat", "24/7 emergency", "Weekends only"];

export function ProfileForm({ initial, currency }: {
  initial: {
    city: string; phone: string; trades: string[]; hourlyRate: number; radiusKm: number;
    availability: string; bio: string; specialties: string[];
  };
  currency: string;
}) {
  const [trades, setTrades] = useState(initial.trades);
  const [radius, setRadius] = useState(initial.radiusKm);
  const [bio, setBio] = useState(initial.bio);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(fd: FormData) {
    setSaved(false);
    setError(null);
    fd.set("trades", trades.join(","));
    startTransition(async () => {
      const res = await updateProfileAction(fd);
      if (res.ok) setSaved(true);
      else setError(res.error);
    });
  }

  return (
    <Card className="p-6 sm:p-8">
      <form action={submit} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City">
            <input name="city" defaultValue={initial.city} className={inputCls} />
          </Field>
          <Field label="Phone">
            <input name="phone" defaultValue={initial.phone} className={inputCls} />
          </Field>
          <Field label={`Hourly rate (${currency})`} hint="Shown to homeowners">
            <input name="hourlyRate" type="number" min={0} defaultValue={initial.hourlyRate} className={inputCls} />
          </Field>
          <Field label="Availability">
            <select name="availability" defaultValue={initial.availability} className={inputCls}>
              {AVAILABILITY.map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
        </div>

        <Field label={`Service radius — ${radius} km`} hint="Premium gigs are matched inside this radius">
          <input type="range" name="radiusKm" min={5} max={150} step={5} value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full accent-accent-600" aria-label="Service radius in kilometres" />
        </Field>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-primary-900">Trades</legend>
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

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-primary-900">Specialties</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {SPECIALTIES.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm font-semibold text-stone-700 transition-colors has-checked:border-accent-400 has-checked:bg-accent-50">
                <input type="checkbox" name="specialties" value={s} defaultChecked={initial.specialties.includes(s)}
                  className="h-4 w-4 accent-accent-600" />
                {s}
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Bio" hint={`${bio.length}/400 · 40+ chars boosts profile strength`}>
          <textarea name="bio" rows={4} maxLength={400} value={bio} onChange={(e) => setBio(e.target.value)}
            placeholder="Master technician with 12 years across emergency HVAC and full-system installs…"
            className="w-full rounded-xl border border-stone-300 px-3.5 py-3 text-[15px] outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200" />
        </Field>

        {error && <p role="alert" className="text-sm font-semibold text-rose-600">{error}</p>}
        <div className="flex items-center gap-4">
          <Button type="submit" variant="accent" size="lg" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save profile
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-bold text-accent-700">
              <CheckCircle2 className="h-4.5 w-4.5" aria-hidden /> Saved — profile strength updated
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}