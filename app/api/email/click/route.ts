import { NextResponse } from "next/server";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { track } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/** Simulates the recipient clicking the magic link inside their email client. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.redirect(new URL("/dev/inbox", req.url));
  const rows = await db.select().from(emails).where(eq(emails.id, id)).limit(1);
  const email = rows[0];
  if (!email) return NextResponse.redirect(new URL("/dev/inbox", req.url));
  await db.update(emails).set({ openedAt: new Date() })
    .where(and(eq(emails.id, id), isNull(emails.openedAt)));
  await track("email_opened");
  const target = email.token ? `/onboarding/facial?token=${email.token}` : "/dev/inbox";
  return NextResponse.redirect(new URL(target, req.url));
}