"use client";

import { useState } from "react";
import { KeyRound, DoorOpen, ShieldX, Timer, FilePlus2, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { Card, Badge, EmptyState, Button } from "@/components/ui";
import { Countdown, LiveTicker } from "@/components/live-widgets";
import { AccessActions } from "@/components/job-buttons";

export type AccessRow = {
  id: string;
  code: string;
  brand: string;
  status: "scheduled" | "active" | "expired" | "revoked";
  validUntil: number;
  validFrom: number;
  jobTitle: string;
  counterpart: string;
  events: { at: string; type: string; label: string }[];
};

const FILTERS = ["All", "Live", "Expired", "Revoked"] as const;

export function AccessManager({ rows, role }: { rows: AccessRow[]; role: "provider" | "homeowner" }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const live = rows.filter((r) => r.status === "active" || r.status === "scheduled");
  const shown = rows.filter((r) =>
    filter === "All" ? true
      : filter === "Live" ? r.status === "active" || r.status === "scheduled"
      : filter === "Expired" ? r.status === "expired"
      : r.status === "revoked");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
            className={clsx(
              "rounded-full border px-4 py-1.5 text-[13px] font-bold transition-all",
              filter === f ? "border-primary-900 bg-primary-900 text-white" : "border-stone-300 bg-white text-stone-600 hover:border-primary-400"
            )}>
            {f} {f === "Live" && live.length > 0 && <span className="ml-1 text-accent-400">({live.length})</span>}
          </button>
        ))}
        <div className="ml-auto hidden min-w-0 flex-1 sm:block sm:max-w-xs">
          <LiveTicker items={[
            "All entries are identity-matched and logged",
            "Codes auto-expire — no manual cleanup needed",
            "Revocation propagates to the lock instantly",
          ]} />
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={KeyRound} title={rows.length === 0 ? "No access codes yet" : "Nothing in this filter"}
            body={role === "provider"
              ? "When you accept a job where the homeowner won't be home, a time-limited code appears here automatically."
              : "Toggle “I won't be home” when posting a job — a unique code is generated the moment a verified pro accepts."}
            action={<Button href={role === "provider" ? "/gigs" : "/dashboard/post-job"} variant="accent">
              {role === "provider" ? "Browse gigs" : "Post a job"}
            </Button>} />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {shown.map((r) => {
            const isLive = r.status === "active" || r.status === "scheduled";
            return (
              <Card key={r.id} className={clsx("overflow-hidden", isLive && "border-accent-200")}>
                <div className={clsx("p-5", isLive ? "bg-primary-950 text-white" : "bg-stone-50")}>
                  <div className="flex items-center justify-between gap-3">
                    <p className={clsx("flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase", isLive ? "text-stone-400" : "text-stone-500")}>
                      <KeyRound className={clsx("h-3.5 w-3.5", isLive ? "text-accent-400" : "text-stone-400")} aria-hidden />
                      {r.brand} · temporary PIN
                    </p>
                    {r.status === "active" && <Badge kind="verified" pulse>Live</Badge>}
                    {r.status === "scheduled" && <Badge kind="access">Scheduled</Badge>}
                    {r.status === "expired" && <Badge kind="neutral"><Timer className="h-3 w-3" aria-hidden />Expired</Badge>}
                    {r.status === "revoked" && <Badge kind="emergency"><ShieldX className="h-3 w-3" aria-hidden />Revoked</Badge>}
                  </div>
                  <p className={clsx(
                    "mt-3 font-mono text-4xl font-bold tracking-[0.3em]",
                    isLive ? "text-accent-400" : "text-stone-400 line-through decoration-2"
                  )}>
                    {r.code}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className={clsx("min-w-0 truncate text-[13px] font-semibold", isLive ? "text-stone-300" : "text-stone-500")}>
                      {r.jobTitle}
                    </p>
                    {isLive && (
                      <p className="text-xs font-semibold text-stone-300">
                        expires <Countdown until={r.validUntil} className="font-mono text-accent-400" />
                      </p>
                    )}
                  </div>
                  <p className={clsx("mt-1 text-xs", isLive ? "text-stone-400" : "text-stone-400")}>
                    {role === "provider" ? `Homeowner: ${r.counterpart}` : `Issued to: ${r.counterpart} · Fully Verified ✓`}
                  </p>
                </div>
                <div className="p-5">
                  {isLive && <AccessActions codeId={r.id} role={role} />}
                  <p className="mt-4 text-[11px] font-bold tracking-widest text-stone-400 uppercase">Access log</p>
                  <ol className="mt-2.5 max-h-44 space-y-2.5 overflow-y-auto pr-1">
                    {[...r.events].reverse().map((ev, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px]">
                        {ev.type === "entry" ? <DoorOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-600" aria-hidden />
                          : ev.type === "revoked" ? <ShieldX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" aria-hidden />
                          : ev.type === "expired" ? <Timer className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden />
                          : ev.type === "created" ? <FilePlus2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                          : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" aria-hidden />}
                        <span className="min-w-0 flex-1 font-medium text-stone-600">{ev.label}</span>
                        <span className="shrink-0 font-mono text-[11px] text-stone-400">
                          {new Date(ev.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}