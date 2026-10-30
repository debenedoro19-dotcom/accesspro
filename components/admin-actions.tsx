"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Flag, XCircle, Loader2, Save } from "lucide-react";
import { adminReviewAction, resolveDisputeAction, saveRegionSettingsAction } from "@/lib/actions";
import { Button } from "@/components/ui";

export function ReviewButtons({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const act = (decision: "approve" | "flag" | "reject") =>
    startTransition(async () => {
      await adminReviewAction(userId, decision);
      router.refresh();
    });
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="accent" size="sm" onClick={() => act("approve")} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />} Approve
      </Button>
      <Button variant="secondary" size="sm" onClick={() => act("flag")} disabled={pending}>
        <Flag className="h-4 w-4" aria-hidden /> Flag
      </Button>
      <Button variant="danger" size="sm" onClick={() => act("reject")} disabled={pending}>
        <XCircle className="h-4 w-4" aria-hidden /> Reject
      </Button>
    </div>
  );
}

export function ResolveButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="secondary" size="sm" disabled={pending}
      onClick={() => startTransition(async () => { await resolveDisputeAction(id); router.refresh(); })}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
      Mark resolved
    </Button>
  );
}

export function RegionEditor({ rows }: {
  rows: { region: string; active: boolean; demandMultiplier: number; featured: string[] }[];
}) {
  const router = useRouter();
  const [state, setState] = useState(rows);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function save(i: number) {
    const r = state[i];
    setSavingId(r.region);
    await saveRegionSettingsAction(r.region, r.active, r.demandMultiplier, r.featured);
    setSavingId(null);
    setSavedId(r.region);
    setTimeout(() => setSavedId(null), 2000);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
            <th className="px-4 py-3">Region</th>
            <th className="px-4 py-3">Live</th>
            <th className="px-4 py-3">Demand ×</th>
            <th className="px-4 py-3">Featured categories</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {state.map((r, i) => (
            <tr key={r.region} className="border-b border-stone-100">
              <td className="px-4 py-3 font-mono font-bold text-primary-900">{r.region}</td>
              <td className="px-4 py-3">
                <input type="checkbox" checked={r.active} aria-label={`${r.region} active`}
                  onChange={(e) => setState((s) => s.map((x, j) => j === i ? { ...x, active: e.target.checked } : x))}
                  className="h-4.5 w-4.5 accent-accent-600" />
              </td>
              <td className="px-4 py-3">
                <input type="number" step={0.05} min={0.5} max={2} value={r.demandMultiplier}
                  aria-label={`${r.region} demand multiplier`}
                  onChange={(e) => setState((s) => s.map((x, j) => j === i ? { ...x, demandMultiplier: Number(e.target.value) } : x))}
                  className="h-9 w-20 rounded-lg border border-stone-300 px-2 font-mono text-sm outline-none focus:border-accent-500" />
              </td>
              <td className="px-4 py-3">
                <input value={r.featured.join(", ")} aria-label={`${r.region} featured categories`}
                  onChange={(e) => setState((s) => s.map((x, j) => j === i ? { ...x, featured: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) } : x))}
                  className="h-9 w-full min-w-48 rounded-lg border border-stone-300 px-2.5 text-sm outline-none focus:border-accent-500" />
              </td>
              <td className="px-4 py-3 text-right">
                <Button variant="secondary" size="sm" onClick={() => save(i)} disabled={savingId === r.region}>
                  {savingId === r.region ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                  {savedId === r.region ? "Saved ✓" : "Save"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}