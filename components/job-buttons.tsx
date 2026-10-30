"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Star, PlayCircle, Ban, TimerReset, DoorOpen, X, Send, CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import {
  acceptJobAction, startJobAction, completeJobAction, cancelJobAction,
  revokeAccessAction, extendAccessAction, simulateEntryAction, inviteProAction,
  type ActionResult,
} from "@/lib/actions";
import { Button } from "@/components/ui";

function useAct(fn: () => Promise<ActionResult>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const run = () =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        setMsg({ text: "Done ✓", ok: true });
        router.refresh();
      } else {
        setMsg({ text: res.error, ok: false });
      }
    });
  return { pending, msg, run };
}

function Msg({ msg }: { msg: { text: string; ok: boolean } | null }) {
  if (!msg) return null;
  return (
    <p role="status" className={clsx("mt-1.5 text-xs font-semibold", msg.ok ? "text-accent-700" : "text-rose-600")}>
      {msg.text}
    </p>
  );
}

export function AcceptGigButton({ jobId }: { jobId: string }) {
  const { pending, msg, run } = useAct(() => acceptJobAction(jobId));
  return (
    <div>
      <Button variant="accent" size="sm" className="w-full" onClick={run} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {pending ? "Accepting…" : "Accept gig"}
      </Button>
      <Msg msg={msg} />
    </div>
  );
}

export function StartJobButton({ jobId }: { jobId: string }) {
  const { pending, msg, run } = useAct(() => startJobAction(jobId));
  return (
    <div>
      <Button variant="primary" size="sm" onClick={run} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <PlayCircle className="h-4 w-4" aria-hidden />}
        Mark in progress
      </Button>
      <Msg msg={msg} />
    </div>
  );
}

export function CancelJobButton({ jobId }: { jobId: string }) {
  const { pending, msg, run } = useAct(() => cancelJobAction(jobId));
  return (
    <div>
      <Button variant="ghost" size="sm" onClick={run} disabled={pending} className="text-rose-600 hover:bg-rose-50">
        <Ban className="h-4 w-4" aria-hidden /> Cancel
      </Button>
      <Msg msg={msg} />
    </div>
  );
}

export function CompleteJobButton({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    const res = await completeJobAction(jobId, rating, comment);
    setPending(false);
    if (res.ok) {
      setOpen(false);
      router.refresh();
    } else setError(res.error);
  }

  return (
    <>
      <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
        <CheckCircle2 className="h-4 w-4" aria-hidden /> Complete & rate
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Complete job">
          <div className="animate-pop-in w-full max-w-md rounded-2xl bg-white p-6 shadow-lift">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-primary-900">Complete this job</h3>
                <p className="mt-1 text-sm text-stone-500">{jobTitle}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <p className="mt-5 text-sm font-semibold text-primary-900">Rate your pro</p>
            <div className="mt-2 flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} aria-label={`${s} star${s > 1 ? "s" : ""}`}
                  className="transition-transform hover:scale-110">
                  <Star className={clsx("h-8 w-8", s <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300")} aria-hidden />
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
              placeholder="How did it go? (visible on the pro's profile)"
              className="mt-4 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200" />
            <p className="mt-3 rounded-xl bg-accent-50 px-3.5 py-2.5 text-xs font-semibold text-accent-700">
              Confirming releases the payout via Stripe Connect and expires any temporary access codes.
            </p>
            {error && <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p>}
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Not yet</Button>
              <Button variant="accent" className="flex-1" onClick={confirm} disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Release payout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AccessActions({ codeId, role }: { codeId: string; role: "provider" | "homeowner" }) {
  const revoke = useAct(() => revokeAccessAction(codeId));
  const extend = useAct(() => extendAccessAction(codeId));
  const entry = useAct(() => simulateEntryAction(codeId));
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {role === "provider" ? (
          <Button variant="primary" size="sm" onClick={entry.run} disabled={entry.pending}>
            {entry.pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <DoorOpen className="h-4 w-4" aria-hidden />}
            Use code · log entry
          </Button>
        ) : (
          <>
            <Button variant="secondary" size="sm" onClick={extend.run} disabled={extend.pending}>
              {extend.pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <TimerReset className="h-4 w-4" aria-hidden />}
              Extend +4h
            </Button>
            <Button variant="danger" size="sm" onClick={revoke.run} disabled={revoke.pending}>
              {revoke.pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Ban className="h-4 w-4" aria-hidden />}
              Revoke now
            </Button>
          </>
        )}
      </div>
      <Msg msg={entry.msg ?? extend.msg ?? revoke.msg} />
    </div>
  );
}

export function InviteProButton({ proId, proName }: { proId: string; proName: string }) {
  const { pending, msg, run } = useAct(() => inviteProAction(proId));
  return (
    <div>
      <Button variant="secondary" size="sm" className="w-full" onClick={run} disabled={pending || !!msg?.ok}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {msg?.ok ? `Invited ${proName.split(" ")[0]} ✓` : "Invite to a job"}
      </Button>
      {msg && !msg.ok && <Msg msg={msg} />}
    </div>
  );
}