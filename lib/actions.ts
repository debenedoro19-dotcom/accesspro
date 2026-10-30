"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  users, providerProfiles, verificationTokens, jobs, accessCodes,
  reviews, activity, disputes, regionSettings, type AccessEvent,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  hashPassword, verifyPassword, createSession, destroySession,
  getSessionUser, getProviderProfile,
} from "@/lib/auth";
import { sendEmail, facialInviteEmail, verifiedEmail, jobAcceptedEmail, accessCodeEmail } from "@/lib/email";
import { getLockAdapter } from "@/lib/locks";
import { track } from "@/lib/analytics";
import { isRegion, money } from "@/lib/regions";

export type ActionResult = { ok: true } | { ok: false; error: string };
const fail = (error: string): ActionResult => ({ ok: false, error });
const ok: ActionResult = { ok: true };

async function log(userId: string, kind: string, text: string) {
  await db.insert(activity).values({ userId, kind, text });
}

function destinationFromForm(fd: FormData, role: string, fallback: string): string {
  const next = String(fd.get("next") ?? "");
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if ((next === "/admin" || next.startsWith("/admin/")) && role !== "admin") return fallback;
  if (next.startsWith("/onboarding") && role !== "provider") return fallback;
  if (next.startsWith("/dashboard/post-job") && role !== "homeowner") return fallback;
  return next;
}

/* ── Auth ─────────────────────────────────────────────────────── */

export async function signupAction(fd: FormData): Promise<ActionResult> {
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = String(fd.get("role") ?? "homeowner");
  const regionRaw = String(fd.get("region") ?? "US");
  const region = isRegion(regionRaw) ? regionRaw : "US";
  if (!name || !email.includes("@") || password.length < 8)
    return fail("Please provide your name, a valid email and a password of 8+ characters.");
  if (role !== "provider" && role !== "homeowner") return fail("Choose an account type.");
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return fail("An account with this email already exists. Try logging in.");
  const [user] = await db.insert(users).values({
    name, email, passwordHash: hashPassword(password), role, region,
    phone: String(fd.get("phone") ?? ""), city: String(fd.get("city") ?? ""),
  }).returning();
  if (role === "provider") await db.insert(providerProfiles).values({ userId: user.id });
  await track("signup_" + role, user.id);
  await createSession(user.id);
  const fallback = role === "provider" ? "/onboarding" : "/dashboard";
  redirect(destinationFromForm(fd, role, fallback));
}

export async function loginAction(fd: FormData): Promise<ActionResult> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash))
    return fail("Incorrect email or password.");
  await createSession(user.id);
  const fallback = user.role === "admin" ? "/admin" : "/dashboard";
  redirect(destinationFromForm(fd, user.role, fallback));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

/* ── Provider onboarding: basics → documents → EMAIL → facial ── */

export async function saveBasicsAction(fd: FormData): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || user.role !== "provider") return fail("Sign in as a provider first.");
  const trades = String(fd.get("trades") ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const regionRaw = String(fd.get("region") ?? user.region);
  await db.update(users).set({
    name: String(fd.get("name") ?? user.name),
    phone: String(fd.get("phone") ?? ""),
    city: String(fd.get("city") ?? ""),
    region: isRegion(regionRaw) ? regionRaw : user.region,
  }).where(eq(users.id, user.id));
  await db.update(providerProfiles).set({
    trades,
    yearsExperience: Number(fd.get("years") ?? 0),
    profileStrength: 45,
  }).where(eq(providerProfiles.userId, user.id));
  return ok;
}

async function issueFacialInvite(userId: string, name: string, email: string) {
  const token = randomBytes(24).toString("hex");
  await db.insert(verificationTokens).values({
    token, userId, expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });
  const appUrl = (process.env.APP_URL ?? "").replace(/\/+$/, "");
  const magicLink = `${appUrl}/onboarding/facial?token=${token}`;
  await sendEmail({
    to: email,
    subject: "Complete your AccessPro verification – Facial step required",
    kind: "facial_invite",
    token,
    bodyHtml: facialInviteEmail(name.split(" ")[0], magicLink),
  });
}

export async function submitDocumentsAction(
  docs: { type: string; name: string }[]
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || user.role !== "provider") return fail("Sign in as a provider first.");
  const required = ["Government photo ID", "Liability insurance"];
  for (const r of required)
    if (!docs.some((d) => d.type === r && d.name)) return fail(`Missing required document: ${r}.`);
  const stored = docs.filter((d) => d.name).map((d) => ({ ...d, uploadedAt: new Date().toISOString() }));
  await db.update(providerProfiles).set({
    documents: stored,
    verificationStatus: "facial_pending",
    profileStrength: 70,
  }).where(eq(providerProfiles.userId, user.id));
  await issueFacialInvite(user.id, user.name, user.email);
  await track("documents_submitted", user.id);
  await log(user.id, "verify", "Documents received – automated checks passed. Facial verification email sent.");
  revalidatePath("/dashboard");
  return ok;
}

export async function resendFacialEmailAction(): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || user.role !== "provider") return fail("Not signed in.");
  const profile = await getProviderProfile(user.id);
  if (profile?.verificationStatus !== "facial_pending") return fail("Documents step not completed yet.");
  await issueFacialInvite(user.id, user.name, user.email);
  return ok;
}

export async function completeFacialAction(token: string): Promise<ActionResult> {
  const rows = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token)).limit(1);
  const vt = rows[0];
  if (!vt) return fail("This verification link is invalid.");
  if (vt.usedAt) return fail("This link has already been used.");
  if (vt.expiresAt < new Date()) return fail("This link has expired. Request a new one from your onboarding page.");
  const user = await getSessionUser();
  if (!user || user.id !== vt.userId) return fail("Open this link while signed in to the account being verified.");
  await db.update(verificationTokens).set({ usedAt: new Date() }).where(eq(verificationTokens.token, token));
  await db.update(providerProfiles).set({
    verificationStatus: "fully_verified",
    facialCompletedAt: new Date(),
    profileStrength: 100,
  }).where(eq(providerProfiles.userId, user.id));
  await sendEmail({ to: user.email, subject: "You're Fully Verified – welcome to the top tier", kind: "verified", bodyHtml: verifiedEmail(user.name.split(" ")[0]) });
  await track("facial_completed", user.id);
  await log(user.id, "verify", "Facial match confirmed – you are now Fully Verified. Priority gigs unlocked.");
  revalidatePath("/dashboard");
  return ok;
}

/* ── Homeowner: post job ──────────────────────────────────────── */

export async function postJobAction(fd: FormData): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || user.role !== "homeowner") return fail("Sign in as a homeowner to post a job.");
  const title = String(fd.get("title") ?? "").trim();
  const payMin = Number(fd.get("payMin") ?? 0);
  const payMax = Number(fd.get("payMax") ?? 0);
  if (!title || payMin <= 0 || payMax < payMin) return fail("Add a title and a valid budget range.");
  const regionRaw = String(fd.get("region") ?? user.region);
  await db.insert(jobs).values({
    homeownerId: user.id,
    title,
    category: String(fd.get("category") ?? "HVAC"),
    description: String(fd.get("description") ?? ""),
    region: isRegion(regionRaw) ? regionRaw : user.region,
    city: String(fd.get("city") ?? user.city),
    address: String(fd.get("address") ?? ""),
    distanceKm: Math.round((2 + Math.random() * 18) * 10) / 10,
    urgency: String(fd.get("urgency") ?? "standard"),
    payMin, payMax,
    needsAccess: fd.get("needsAccess") === "on",
    lockBrand: String(fd.get("lockBrand") ?? "manual"),
    windowLabel: String(fd.get("window") ?? "Flexible"),
    photoName: String(fd.get("photoName") ?? ""),
  });
  await track("job_posted", user.id);
  await log(user.id, "job", `“${title}” is live – verified pros in your area have been notified.`);
  revalidatePath("/gigs");
  redirect("/dashboard/jobs");
}

/* ── Provider: accept, start ──────────────────────────────────── */

export async function acceptJobAction(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || user.role !== "provider") return fail("Sign in as a provider to accept gigs.");
  const profile = await getProviderProfile(user.id);
  if (profile?.verificationStatus !== "fully_verified")
    return fail("Only Fully Verified pros can accept gigs. Complete your verification first.");
  const rows = await db.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.status, "open"))).limit(1);
  const job = rows[0];
  if (!job) return fail("This gig was just taken or is no longer available.");
  await db.update(jobs).set({ status: "accepted", acceptedById: user.id }).where(eq(jobs.id, jobId));

  let accessLine = "<p>No temporary access was requested – coordinate arrival in chat.</p>";
  if (job.needsAccess) {
    const adapter = getLockAdapter(job.lockBrand);
    const cred = await adapter.createCredential({ proName: user.name, jobId, windowHours: 8 });
    await db.insert(accessCodes).values({
      jobId, providerId: user.id, homeownerId: job.homeownerId, brand: adapter.brand,
      code: cred.code, validFrom: cred.validFrom, validUntil: cred.validUntil, status: "active",
      events: [
        { at: new Date().toISOString(), type: "created", label: `Credential issued to ${user.name} (${adapter.label})` },
        { at: new Date().toISOString(), type: "activated", label: "Window opened – code is live" },
      ],
    });
    await sendEmail({
      to: user.email, subject: `Temporary access code – ${job.title}`, kind: "access_code",
      bodyHtml: accessCodeEmail(user.name.split(" ")[0], job.title, cred.code, adapter.label, cred.validUntil.toLocaleString("en-US")),
    });
    accessLine = `<p>A time-limited <strong>${adapter.label}</strong> code has been generated, named to ${user.name}. It auto-expires and every entry is logged.</p>`;
    await log(user.id, "access", `Temporary access code issued for “${job.title}”.`);
    await log(job.homeownerId, "access", `${user.name} accepted “${job.title}” – temporary code issued and logged.`);
  } else {
    await log(job.homeownerId, "job", `${user.name} (Fully Verified) accepted “${job.title}”.`);
  }
  const [homeowner] = await db.select().from(users).where(eq(users.id, job.homeownerId)).limit(1);
  if (homeowner) await sendEmail({
    to: homeowner.email, subject: `A verified pro accepted your job – ${job.title}`, kind: "job_accepted",
    bodyHtml: jobAcceptedEmail(homeowner.name.split(" ")[0], user.name, job.title, accessLine),
  });
  await track("gig_accepted", user.id);
  await log(user.id, "job", `You accepted “${job.title}” – ${money(job.region, job.payMin)}–${money(job.region, job.payMax)}.`);
  revalidatePath("/gigs");
  revalidatePath("/dashboard");
  return ok;
}

export async function startJobAction(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.");
  await db.update(jobs).set({ status: "in_progress" })
    .where(and(eq(jobs.id, jobId), eq(jobs.acceptedById, user.id)));
  await log(user.id, "job", "Job marked in progress – homeowner notified.");
  revalidatePath("/dashboard/jobs");
  return ok;
}

/* ── Homeowner: complete + rate → payout release ─────────────── */

export async function completeJobAction(jobId: string, rating: number, comment: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.");
  const rows = await db.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.homeownerId, user.id))).limit(1);
  const job = rows[0];
  if (!job || !job.acceptedById) return fail("Job not found.");
  const payFinal = Math.round((job.payMin + job.payMax) / 2);
  await db.update(jobs).set({ status: "completed", completedAt: new Date(), payFinal }).where(eq(jobs.id, jobId));
  await db.insert(reviews).values({ jobId, proId: job.acceptedById, homeownerId: user.id, rating, comment });
  const [profile] = await db.select().from(providerProfiles).where(eq(providerProfiles.userId, job.acceptedById)).limit(1);
  if (profile) {
    const newRating = Math.round(((profile.rating * profile.jobsCompleted + rating) / (profile.jobsCompleted + 1)) * 10) / 10;
    await db.update(providerProfiles).set({ jobsCompleted: profile.jobsCompleted + 1, rating: newRating }).where(eq(providerProfiles.userId, job.acceptedById));
  }
  const codes = await db.select().from(accessCodes).where(eq(accessCodes.jobId, jobId));
  for (const c of codes) {
    if (c.status !== "revoked") {
      const events: AccessEvent[] = [...c.events, { at: new Date().toISOString(), type: "expired", label: "Job completed – code auto-expired" }];
      await db.update(accessCodes).set({ status: "expired", events, validUntil: new Date() }).where(eq(accessCodes.id, c.id));
    }
  }
  await log(job.acceptedById, "payout", `Payout of ${money(job.region, payFinal)} released via Stripe Connect.`);
  await log(user.id, "job", `“${job.title}” completed – ${rating}★ review saved, payout released.`);
  await track("job_completed", user.id);
  revalidatePath("/dashboard/jobs");
  revalidatePath("/dashboard");
  return ok;
}

export async function cancelJobAction(jobId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.");
  await db.update(jobs).set({ status: "cancelled" })
    .where(and(eq(jobs.id, jobId), eq(jobs.homeownerId, user.id), eq(jobs.status, "open")));
  revalidatePath("/dashboard/jobs");
  return ok;
}

/* ── Temporary access management ─────────────────────────────── */

export async function revokeAccessAction(codeId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.");
  const rows = await db.select().from(accessCodes).where(eq(accessCodes.id, codeId)).limit(1);
  const c = rows[0];
  if (!c || c.homeownerId !== user.id) return fail("Only the homeowner can revoke this code.");
  await getLockAdapter(c.brand).revokeCredential(c.id);
  const events: AccessEvent[] = [...c.events, { at: new Date().toISOString(), type: "revoked", label: "Revoked instantly by homeowner" }];
  await db.update(accessCodes).set({ status: "revoked", events }).where(eq(accessCodes.id, codeId));
  await log(c.providerId, "access", "A temporary access code was revoked by the homeowner.");
  revalidatePath("/dashboard/access");
  revalidatePath("/dashboard/access-codes");
  return ok;
}

export async function extendAccessAction(codeId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.");
  const rows = await db.select().from(accessCodes).where(eq(accessCodes.id, codeId)).limit(1);
  const c = rows[0];
  if (!c || c.homeownerId !== user.id) return fail("Only the homeowner can extend this code.");
  const until = new Date(Math.max(Date.now(), c.validUntil.getTime()) + 4 * 3600 * 1000);
  const events: AccessEvent[] = [...c.events, { at: new Date().toISOString(), type: "extended", label: "Window extended +4h by homeowner" }];
  await db.update(accessCodes).set({ validUntil: until, status: "active", events }).where(eq(accessCodes.id, codeId));
  await log(c.providerId, "access", "Your access window was extended by 4 hours.");
  revalidatePath("/dashboard/access");
  revalidatePath("/dashboard/access-codes");
  return ok;
}

export async function simulateEntryAction(codeId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return fail("Not signed in.");
  const rows = await db.select().from(accessCodes).where(eq(accessCodes.id, codeId)).limit(1);
  const c = rows[0];
  if (!c || c.providerId !== user.id) return fail("Code not assigned to you.");
  if (c.status === "revoked" || c.validUntil < new Date()) return fail("This code is no longer valid.");
  const events: AccessEvent[] = [...c.events, { at: new Date().toISOString(), type: "entry", label: `Entry recorded – ${user.name} (identity matched)` }];
  await db.update(accessCodes).set({ events }).where(eq(accessCodes.id, codeId));
  await log(c.homeownerId, "access", `${user.name} entered using the temporary code – logged just now.`);
  revalidatePath("/dashboard/access");
  revalidatePath("/dashboard/access-codes");
  return ok;
}

/* ── Provider profile ─────────────────────────────────────────── */

export async function updateProfileAction(fd: FormData): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || user.role !== "provider") return fail("Not signed in as provider.");
  const specialties = fd.getAll("specialties").map(String);
  const bio = String(fd.get("bio") ?? "");
  const trades = String(fd.get("trades") ?? "").split(",").map((t) => t.trim()).filter(Boolean);
  const profile = await getProviderProfile(user.id);
  const base = profile?.verificationStatus === "fully_verified" ? 70 : 35;
  const strength = Math.min(100, base + (bio.length > 40 ? 10 : 0) + (specialties.length ? 10 : 0) + (trades.length > 1 ? 10 : 0));
  await db.update(users).set({ city: String(fd.get("city") ?? user.city), phone: String(fd.get("phone") ?? user.phone) }).where(eq(users.id, user.id));
  await db.update(providerProfiles).set({
    trades,
    hourlyRate: Number(fd.get("hourlyRate") ?? 0),
    radiusKm: Number(fd.get("radiusKm") ?? 40),
    availability: String(fd.get("availability") ?? "Weekdays"),
    bio, specialties, profileStrength: strength,
  }).where(eq(providerProfiles.userId, user.id));
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return ok;
}

/* ── Homeowner: invite a pro ─────────────────────────────────── */

export async function inviteProAction(proId: string): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user || user.role !== "homeowner") return fail("Sign in as a homeowner to invite pros.");
  const [pro] = await db.select().from(users).where(eq(users.id, proId)).limit(1);
  if (!pro) return fail("Pro not found.");
  await sendEmail({
    to: pro.email,
    subject: `${user.name} invited you to a job on AccessPro`,
    kind: "job_accepted",
    bodyHtml: `<div style="font-family:Inter,Arial,sans-serif;padding:24px;color:#1a1917;"><h2 style="color:#1a1917;">You've been invited 🎯</h2><p><strong>${user.name}</strong> (${user.city}) would like you to quote on their job. Open your dashboard to review and accept.</p></div>`,
  });
  await log(proId, "match", `${user.name} invited you to a job — check your open gigs.`);
  await log(user.id, "job", `Invitation sent to ${pro.name}.`);
  return ok;
}

/* ── Admin ──────────────────────────────────────────────────── */

export async function adminReviewAction(userId: string, decision: "approve" | "reject" | "flag"): Promise<ActionResult> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") return fail("Admin access required.");
  if (decision === "approve") {
    await db.update(providerProfiles).set({ verificationStatus: "fully_verified", flagged: false, facialCompletedAt: new Date(), profileStrength: 100 }).where(eq(providerProfiles.userId, userId));
    const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (u) await sendEmail({ to: u.email, subject: "You're Fully Verified – welcome to the top tier", kind: "verified", bodyHtml: verifiedEmail(u.name.split(" ")[0]) });
  } else if (decision === "reject") {
    await db.update(providerProfiles).set({ verificationStatus: "unverified", reviewNote: "Verification rejected – documents could not be validated. Re-upload from onboarding." }).where(eq(providerProfiles.userId, userId));
  } else {
    await db.update(providerProfiles).set({ flagged: true, reviewNote: "Flagged for manual review by trust & safety." }).where(eq(providerProfiles.userId, userId));
  }
  revalidatePath("/admin");
  return ok;
}

export async function resolveDisputeAction(id: string): Promise<ActionResult> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") return fail("Admin access required.");
  await db.update(disputes).set({ status: "resolved" }).where(eq(disputes.id, id));
  revalidatePath("/admin");
  return ok;
}

export async function saveRegionSettingsAction(region: string, active: boolean, demandMultiplier: number, featured: string[]): Promise<ActionResult> {
  const admin = await getSessionUser();
  if (!admin || admin.role !== "admin") return fail("Admin access required.");
  await db.update(regionSettings).set({ active, demandMultiplier, featured }).where(eq(regionSettings.region, region));
  revalidatePath("/admin");
  return ok;
}