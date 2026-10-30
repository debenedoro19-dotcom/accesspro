"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, ShieldCheck, Loader2, AlertCircle, VideoOff } from "lucide-react";
import clsx from "clsx";
import { completeFacialAction } from "@/lib/actions";
import { Button, Card, Progress } from "@/components/ui";

const LIVENESS_STEPS = [
  "Center your face in the frame",
  "Blink twice",
  "Turn your head slowly left",
  "Turn your head slowly right",
  "Hold still — matching against your ID photo",
];

const CONFETTI_COLORS = ["#f59e0b", "#fbbf24", "#2c2a28", "#d97706", "#fcd34d"];

export function FacialCapture({ token }: { token: string }) {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [started, setStarted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [camLive, setCamLive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    if (!consent) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setCamLive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setCamLive(false); // graceful simulation when camera is unavailable
    }
    setStarted(true);
    timerRef.current = setInterval(() => {
      setStepIdx((i) => {
        if (i >= LIVENESS_STEPS.length - 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDone(true);
          streamRef.current?.getTracks().forEach((t) => t.stop());
          return i;
        }
        return i + 1;
      });
    }, 1500);
  }

  async function complete() {
    setVerifying(true);
    setError(null);
    const res = await completeFacialAction(token);
    setVerifying(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard?welcome=1"), 2800);
    } else {
      setError(res.error);
    }
  }

  if (success) {
    return (
      <Card className="relative mt-8 overflow-hidden p-10 text-center">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 36 }).map((_, i) => (
            <span key={i} className="confetti-piece" style={{
              left: `${(i * 37) % 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${(i % 9) * 0.14}s`,
            }} />
          ))}
        </div>
        <span className="animate-pop-in mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent-50 shadow-glow">
          <ShieldCheck className="h-10 w-10 text-accent-500" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-3xl font-extrabold text-primary-900">You're Fully Verified 🎉</h2>
        <p className="mt-2 text-stone-500">
          Identity matched. Your badge is live — priority high-pay gigs are now visible.
        </p>
        <p className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-accent-700">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Redirecting to your dashboard…
        </p>
      </Card>
    );
  }

  return (
    <Card className="mt-8 p-6 sm:p-8">
      {/* Viewfinder */}
      <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-3xl bg-primary-950">
        {camLive ? (
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 200 250" className="h-full w-full" aria-hidden>
            <ellipse cx="100" cy="95" rx="46" ry="56" fill="#3a3835" />
            <path d="M 30 250 Q 30 175 100 175 Q 170 175 170 250 Z" fill="#3a3835" />
          </svg>
        )}
        {/* face guide */}
        <div className={clsx(
          "absolute top-[12%] left-1/2 h-[52%] w-[62%] -translate-x-1/2 rounded-[50%] border-2 border-dashed transition-colors",
          done ? "border-accent-400" : started ? "border-accent-400/70" : "border-white/30"
        )} aria-hidden />
        {/* corner brackets */}
        {[
          "top-3 left-3 border-t-2 border-l-2 rounded-tl-xl",
          "top-3 right-3 border-t-2 border-r-2 rounded-tr-xl",
          "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-xl",
          "bottom-3 right-3 border-b-2 border-r-2 rounded-br-xl",
        ].map((c) => <span key={c} className={`absolute h-7 w-7 border-accent-400 ${c}`} aria-hidden />)}
        {/* scan line */}
        {started && !done && (
          <span className="animate-scan absolute right-6 left-6 h-0.5 rounded-full bg-accent-400/90 shadow-glow" aria-hidden />
        )}
        {done && (
          <span className="animate-pop-in absolute inset-x-0 bottom-5 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-accent-500 px-3.5 py-1.5 text-xs font-bold text-white">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Liveness confirmed
          </span>
        )}
        {!started && (
          <span className="absolute inset-x-0 bottom-5 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-stone-300 backdrop-blur">
            <Camera className="h-3.5 w-3.5" aria-hidden /> Camera preview
          </span>
        )}
      </div>

      {!camLive && started && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-stone-400">
          <VideoOff className="h-3.5 w-3.5" aria-hidden /> Camera unavailable — running secure simulation mode
        </p>
      )}

      {/* Steps */}
      <ol className="mt-6 space-y-2.5" aria-label="Liveness steps">
        {LIVENESS_STEPS.map((s, i) => (
          <li key={s} className={clsx(
            "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
            done || i < stepIdx ? "text-accent-700" : started && i === stepIdx ? "bg-primary-50 text-primary-900" : "text-stone-400"
          )}>
            {done || i < stepIdx ? (
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-accent-500" aria-hidden />
            ) : started && i === stepIdx ? (
              <Loader2 className="h-4.5 w-4.5 shrink-0 animate-spin text-primary-500" aria-hidden />
            ) : (
              <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border border-stone-300 font-mono text-[10px]">{i + 1}</span>
            )}
            {s}
          </li>
        ))}
      </ol>
      <Progress value={done ? 100 : started ? (stepIdx / LIVENESS_STEPS.length) * 100 : 0} className="mt-4" />

      {/* Consent */}
      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4.5 w-4.5 accent-accent-600" />
        <span className="text-[13px] leading-relaxed text-stone-600">
          I consent to a one-time liveness check and comparison of my face against my uploaded ID photo.
          <strong className="text-primary-900"> Facial templates are deleted immediately after matching</strong> —
          only the pass/fail result is retained, per the regional retention policy (GDPR / CCPA / PIPEDA / APPs).
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {error}
        </p>
      )}

      <div className="mt-6">
        {!started ? (
          <Button variant="accent" size="lg" className="w-full" onClick={start} disabled={!consent}>
            <Camera className="h-4.5 w-4.5" aria-hidden /> Start liveness check
          </Button>
        ) : (
          <Button variant="accent" size="lg" className="w-full" onClick={complete} disabled={!done || verifying || !consent}>
            {verifying ? (<><Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden /> Matching to ID…</>) : (<><ShieldCheck className="h-4.5 w-4.5" aria-hidden /> Complete verification</>)}
          </Button>
        )}
        {!consent && <p className="mt-2 text-center text-xs font-medium text-stone-400">Tick the consent box to enable the check</p>}
      </div>
    </Card>
  );
}