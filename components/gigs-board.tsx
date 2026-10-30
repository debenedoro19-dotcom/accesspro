"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ShieldCheck, Lock, SlidersHorizontal, CheckCircle2, SearchX } from "lucide-react";
import clsx from "clsx";
import type { Job } from "@/db/schema";
import { gigScore, REGIONS, type RegionCode } from "@/lib/regions";
import { acceptJobAction } from "@/lib/actions";
import { GigCard, CategoryIcon } from "@/components/gig-card";
import { Button, Skeleton, EmptyState, inputCls } from "@/components/ui";

export type Viewer = { loggedIn: boolean; role: string | null; verified: boolean };

type Sort = "match" | "pay" | "new" | "close";
const SORTS: { value: Sort; label: string }[] = [
  { value: "match", label: "Best match" },
  { value: "pay", label: "Highest potential pay" },
  { value: "new", label: "Newest" },
  { value: "close", label: "Closest" },
];

export function GigsBoard({ jobs, regionCode, viewer }: {
  jobs: Job[]; regionCode: RegionCode; viewer: Viewer;
}) {
  const router = useRouter();
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState<Sort>("match");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [, startTransition] = useTransition();

  const region = REGIONS[regionCode];
  const cats = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.category)))],
    [jobs]
  );

  // Branded skeleton flash whenever filters change — perceptible feedback.
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(t);
  }, [cat, sort, emergencyOnly, regionCode]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    let list = jobs.filter((j) => !accepted.has(j.id));
    if (cat !== "All") list = list.filter((j) => j.category === cat);
    if (emergencyOnly) list = list.filter((j) => j.urgency === "emergency");
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter((j) => (j.title + j.city + j.category).toLowerCase().includes(needle));
    }
    const sorted = [...list];
    if (sort === "match") sorted.sort((a, b) => gigScore(b) - gigScore(a));
    if (sort === "pay") sorted.sort((a, b) => b.payMax - a.payMax);
    if (sort === "new") sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "close") sorted.sort((a, b) => a.distanceKm - b.distanceKm);
    return sorted;
  }, [jobs, cat, sort, emergencyOnly, q, accepted]);

  async function accept(jobId: string) {
    setPendingId(jobId);
    const res = await acceptJobAction(jobId);
    setPendingId(null);
    if (res.ok) {
      setAccepted((s) => new Set(s).add(jobId));
      setToast({ msg: "Gig accepted! Access details are in your dashboard.", ok: true });
      startTransition(() => router.refresh());
    } else {
      setToast({ msg: res.error, ok: false });
    }
  }

  function actionFor(job: Job) {
    if (!viewer.loggedIn)
      return <Button href="/login?next=%2Fgigs" size="sm" className="w-full">Log in to accept</Button>;
    if (viewer.role === "provider" && viewer.verified)
      return (
        <Button variant="accent" size="sm" className="w-full" onClick={() => accept(job.id)}
          disabled={pendingId === job.id}>
          {pendingId === job.id ? "Accepting…" : "Accept gig"}
        </Button>
      );
    if (viewer.role === "provider")
      return (
        <Button href="/onboarding" variant="secondary" size="sm" className="w-full">
          <Lock className="h-3.5 w-3.5" aria-hidden /> Get verified to accept
        </Button>
      );
    if (viewer.role === "homeowner")
      return (
        <Button href="/dashboard/post-job" variant="secondary" size="sm" className="w-full">
          Post a similar job
        </Button>
      );
    if (viewer.role === "admin")
      return <Button href="/admin" variant="secondary" size="sm" className="w-full">Open admin console</Button>;
    return <Button href="/signup?role=provider&next=%2Fonboarding" variant="secondary" size="sm" className="w-full">Create a provider account</Button>;
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${region.name} gigs…`} aria-label="Search gigs"
              className={clsx(inputCls, "pl-10")} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-primary-900">
            <SlidersHorizontal className="h-4 w-4 text-stone-400" aria-hidden />
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
              className="h-11 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-primary-900 outline-none focus:border-accent-500">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <button onClick={() => setEmergencyOnly(!emergencyOnly)} aria-pressed={emergencyOnly}
            className={clsx(
              "flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition-all",
              emergencyOnly
                ? "border-rose-300 bg-rose-50 text-rose-700 shadow-card"
                : "border-stone-300 bg-white text-stone-600 hover:border-rose-300"
            )}>
            <span className={clsx("h-2 w-2 rounded-full", emergencyOnly ? "animate-pulse-soft bg-rose-500" : "bg-stone-300")} aria-hidden />
            Emergency only
          </button>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={clsx(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all",
                cat === c
                  ? "border-primary-900 bg-primary-900 text-white shadow-card"
                  : "border-stone-300 bg-white text-stone-600 hover:border-primary-400"
              )}>
              {c !== "All" && <CategoryIcon category={c} className="h-3.5 w-3.5" />}
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results meta */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-500" aria-live="polite">
          {loading ? "Refreshing gigs…" : `${filtered.length} ${filtered.length === 1 ? "gig" : "gigs"} · ${region.flag} ${region.name}`}
        </p>
        <p className="flex items-center gap-1.5 text-xs font-bold text-accent-700">
          <ShieldCheck className="h-4 w-4" aria-hidden /> Only Fully Verified pros can accept
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex gap-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-24" /></div>
              <Skeleton className="mt-4 h-6 w-4/5" />
              <Skeleton className="mt-2 h-4 w-2/5" />
              <Skeleton className="mt-5 h-4 w-3/5" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <Skeleton className="mt-5 h-9 w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-5">
          <EmptyState icon={SearchX} title="No gigs match those filters"
            body={accepted.size > 0
              ? "Nice work — you've cleared the matching gigs. New premium jobs drop throughout the day."
              : "Try widening the category, turning off emergency-only, or switching region from the header."}
            action={<Button variant="secondary" onClick={() => { setCat("All"); setEmergencyOnly(false); setQ(""); }}>Reset filters</Button>} />
        </div>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <GigCard key={job.id} job={job} score={gigScore(job)} action={actionFor(job)} />
          ))}
        </div>
      )}

      {accepted.size > 0 && (
        <div className="mt-8 flex justify-center">
          <Link href="/dashboard/jobs" className="inline-flex items-center gap-2 rounded-xl bg-accent-50 px-5 py-3 text-sm font-bold text-accent-700 transition-all hover:bg-accent-100">
            <CheckCircle2 className="h-4.5 w-4.5" aria-hidden />
            {accepted.size} accepted — view jobs & access codes →
          </Link>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div role="status" className={clsx(
          "animate-pop-in fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border px-5 py-4 text-sm font-semibold shadow-lift",
          toast.ok ? "border-accent-200 bg-white text-accent-700" : "border-rose-200 bg-white text-rose-700"
        )}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}