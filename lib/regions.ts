export type RegionCode = "US" | "CA" | "UK" | "AU";

export type RegionConfig = {
  code: RegionCode;
  name: string;
  flag: string;
  currency: string;
  locale: string;
  licenseLabel: string;
  privacyLaw: string;
  featuredCategories: string[];
  demand: Record<string, number>;
};

const HOME_SERVICE_DEMAND: Record<string, number> = {
  "House Cleaning": 1.12,
  "Janitorial / Commercial Cleaning": 1.1,
  Housekeeping: 1.08,
  "Laundry & Organizing": 1.05,
  "Window Cleaning": 1.05,
  "Carpet / Upholstery Cleaning": 1.08,
  "Light Handyman + Cleaning": 1.1,
  "Senior / Care-related Light Home Help": 1.05,
  "EV Charger": 1.2,
};

export const REGIONS: Record<RegionCode, RegionConfig> = {
  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    locale: "en-US",
    licenseLabel: "State trade license",
    privacyLaw: "CCPA",
    featuredCategories: ["HVAC", "Electrical", "Smart Home", "Plumbing", "House Cleaning", "Janitorial / Commercial Cleaning"],
    demand: { HVAC: 1.3, Plumbing: 1.25, Electrical: 1.2, "Smart Home": 1.15, ...HOME_SERVICE_DEMAND },
  },
  CA: {
    code: "CA",
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    locale: "en-CA",
    licenseLabel: "Provincial ticket / Red Seal",
    privacyLaw: "PIPEDA",
    featuredCategories: ["HVAC", "Plumbing", "Electrical", "House Cleaning", "Carpet / Upholstery Cleaning"],
    demand: { HVAC: 1.3, Plumbing: 1.2, Electrical: 1.15, ...HOME_SERVICE_DEMAND },
  },
  UK: {
    code: "UK",
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    locale: "en-GB",
    licenseLabel: "Gas Safe / NICEIC registration",
    privacyLaw: "UK GDPR",
    featuredCategories: ["Boiler & Heating", "Electrical", "Roofing", "Housekeeping", "Janitorial / Commercial Cleaning"],
    demand: { "Boiler & Heating": 1.35, Electrical: 1.2, Roofing: 1.15, ...HOME_SERVICE_DEMAND },
  },
  AU: {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    locale: "en-AU",
    licenseLabel: "State electrical / QBCC licence",
    privacyLaw: "Privacy Act (APPs)",
    featuredCategories: ["Solar", "Electrical", "HVAC", "House Cleaning", "Janitorial / Commercial Cleaning"],
    demand: { Solar: 1.35, Electrical: 1.2, HVAC: 1.2, ...HOME_SERVICE_DEMAND },
  },
};

export const COMING_SOON = [
  { name: "Ireland", flag: "🇮🇪" },
  { name: "New Zealand", flag: "🇳🇿" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Germany", flag: "🇩🇪" },
];

export const ALL_CATEGORIES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Smart Home",
  "Boiler & Heating",
  "Roofing",
  "Solar",
  "EV Charger",
  "Carpentry",
  "House Cleaning",
  "Janitorial / Commercial Cleaning",
  "Housekeeping",
  "Laundry & Organizing",
  "Window Cleaning",
  "Carpet / Upholstery Cleaning",
  "Light Handyman + Cleaning",
  "Senior / Care-related Light Home Help",
];

export function isRegion(v: string | undefined | null): v is RegionCode {
  return v === "US" || v === "CA" || v === "UK" || v === "AU";
}

export function regionOf(v: string | undefined | null): RegionConfig {
  return REGIONS[isRegion(v) ? v : "US"];
}

export function money(region: string, value: number): string {
  const r = regionOf(region);
  return new Intl.NumberFormat(r.locale, {
    style: "currency",
    currency: r.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function payRange(region: string, min: number, max: number): string {
  return `${money(region, min)} – ${money(region, max)}`;
}

/** Marketplace ranking: pay potential, urgency, regional demand, recency, distance. */
export function gigScore(job: {
  payMax: number;
  urgency: string;
  category: string;
  region: string;
  distanceKm: number;
  createdAt: Date;
}): number {
  const r = regionOf(job.region);
  const pay = Math.min(job.payMax / 9000, 1) * 45;
  const urgency = job.urgency === "emergency" ? 25 : job.urgency === "urgent" ? 14 : 6;
  const demand = (r.demand[job.category] ?? 1) * 12;
  const ageHours = (Date.now() - new Date(job.createdAt).getTime()) / 36e5;
  const recency = Math.max(0, 10 - ageHours / 24);
  const distance = Math.max(0, 8 - job.distanceKm / 10);
  return Math.round((pay + urgency + demand + recency + distance) * 10) / 10;
}

export function timeAgo(d: Date | string): string {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}