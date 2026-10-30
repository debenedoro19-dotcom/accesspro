import "server-only";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";

/** Lightweight funnel analytics (PostHog-style events, stored locally). */
export async function track(name: string, userId?: string | null) {
  try {
    await db.insert(analyticsEvents).values({ name, userId: userId ?? null });
  } catch {
    /* analytics must never break a flow */
  }
}