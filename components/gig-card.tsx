import {
  MapPin, Clock, KeyRound, FileBadge, Flame, Wrench, Zap, Cpu, Home, Sun, Hammer, Thermometer,
  Sparkles, Building2, Shirt, PanelsTopLeft, Sofa, HeartHandshake, PlugZap, type LucideIcon,
} from "lucide-react";
import type { Job } from "@/db/schema";
import { payRange, regionOf, timeAgo, type RegionCode } from "@/lib/regions";
import { Badge, Card } from "@/components/ui";
import type { ReactNode } from "react";

const catIcons: Record<string, LucideIcon> = {
  HVAC: Thermometer, Plumbing: Wrench, Electrical: Zap, "Smart Home": Cpu,
  "Boiler & Heating": Flame, Roofing: Home, Solar: Sun, Carpentry: Hammer,
  "EV Charger": PlugZap, "House Cleaning": Sparkles,
  "Janitorial / Commercial Cleaning": Building2, Housekeeping: Home,
  "Laundry & Organizing": Shirt, "Window Cleaning": PanelsTopLeft,
  "Carpet / Upholstery Cleaning": Sofa, "Light Handyman + Cleaning": Wrench,
  "Senior / Care-related Light Home Help": HeartHandshake,
};

export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = catIcons[category] ?? Wrench;
  return <Icon className={className} aria-hidden />;
}

export function distanceLabel(region: string, km: number): string {
  if (region === "US" || region === "UK") return `${(km * 0.621371).toFixed(1)} mi`;
  return `${km.toFixed(1)} km`;
}

export function GigBadges({ job }: { job: Job }) {
  return (
    <>
      {job.urgency === "emergency" && <Badge kind="emergency" pulse>Emergency</Badge>}
      {job.urgency === "urgent" && <Badge kind="urgent">Urgent</Badge>}
      {job.payMax >= 3000 && <Badge kind="highticket">High ticket</Badge>}
      {job.payMax >= 1500 && job.payMax < 3000 && <Badge kind="premium">Premium gig</Badge>}
    </>
  );
}

export function GigCard({ job, action, score, className }: {
  job: Job; action?: ReactNode; score?: number; className?: string;
}) {
  const region = regionOf(job.region);
  return (
    <Card lift className={`group flex h-full flex-col p-5 ${className ?? ""}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <GigBadges job={job} />
        {score !== undefined && (
          <span className="ml-auto font-mono text-[11px] font-bold text-stone-400" title="Match score (pay · urgency · demand · distance)">
            ⚡ {score.toFixed(0)}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <CategoryIcon category={job.category} className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-[17px] leading-snug font-bold text-primary-900">{job.title}</h3>
          <p className="mt-0.5 text-xs font-semibold text-stone-400">{job.category} · {timeAgo(job.createdAt)}</p>
        </div>
      </div>
      <div className="mt-4 space-y-1.5 text-[13px] font-medium text-stone-600">
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-stone-400" aria-hidden />
          {job.city} · {distanceLabel(job.region, job.distanceKm)}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-stone-400" aria-hidden />
          {job.windowLabel}
        </p>
        <p className="flex items-center gap-2">
          <FileBadge className="h-3.5 w-3.5 text-stone-400" aria-hidden />
          {region.licenseLabel}
        </p>
      </div>
      <div className="mt-4 flex items-end justify-between border-t border-stone-100 pt-4">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-stone-400 uppercase">Est. pay</p>
          <p className="font-mono text-lg font-bold tracking-tight text-primary-900">
            {payRange(job.region, job.payMin, job.payMax)}
          </p>
        </div>
        {job.needsAccess && (
          <Badge kind="access"><KeyRound className="h-3 w-3" aria-hidden />Temp access</Badge>
        )}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

export function regionForJob(job: Job): RegionCode {
  return regionOf(job.region).code;
}