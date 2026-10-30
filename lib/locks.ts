import "server-only";
import { randomInt } from "crypto";

/**
 * Temporary-access integration layer.
 * Every smart-lock vendor implements SmartLockAdapter so Yale, Schlage,
 * August (or a manual keypad fallback) can be plugged in without touching
 * marketplace logic. In this MVP the adapters simulate vendor APIs.
 */
export type CredentialRequest = {
  proName: string;
  jobId: string;
  windowHours: number;
};

export type Credential = {
  code: string;
  validFrom: Date;
  validUntil: Date;
  externalRef: string;
};

export interface SmartLockAdapter {
  brand: string;
  label: string;
  createCredential(req: CredentialRequest): Promise<Credential>;
  revokeCredential(externalRef: string): Promise<void>;
}

function pin(): string {
  return String(randomInt(100000, 999999));
}

function windowFor(hours: number) {
  const validFrom = new Date();
  const validUntil = new Date(Date.now() + hours * 3600 * 1000);
  return { validFrom, validUntil };
}

class SimulatedAdapter implements SmartLockAdapter {
  constructor(public brand: string, public label: string) {}
  async createCredential(req: CredentialRequest): Promise<Credential> {
    return {
      code: pin(),
      ...windowFor(req.windowHours),
      externalRef: `${this.brand}_${req.jobId.slice(0, 8)}_${pin()}`,
    };
  }
  async revokeCredential(_externalRef: string): Promise<void> {
    /* vendor API call would happen here */
  }
}

const adapters: Record<string, SmartLockAdapter> = {
  yale: new SimulatedAdapter("yale", "Yale Access"),
  schlage: new SimulatedAdapter("schlage", "Schlage Encode"),
  august: new SimulatedAdapter("august", "August Home"),
  manual: new SimulatedAdapter("manual", "Universal keypad / lockbox"),
};

export const LOCK_BRANDS = Object.values(adapters).map((a) => ({
  value: a.brand,
  label: a.label,
}));

export function getLockAdapter(brand: string): SmartLockAdapter {
  return adapters[brand] ?? adapters.manual;
}

export function codeStatus(code: {
  status: string;
  validFrom: Date;
  validUntil: Date;
}): "scheduled" | "active" | "expired" | "revoked" {
  if (code.status === "revoked") return "revoked";
  const now = Date.now();
  if (now > new Date(code.validUntil).getTime()) return "expired";
  if (now >= new Date(code.validFrom).getTime()) return "active";
  return "scheduled";
}