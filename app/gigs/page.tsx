import { cookies } from "next/headers";
import { db } from "@/db";
import { jobs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { regionOf } from "@/lib/regions";
import { getSessionUser, getProviderProfile } from "@/lib/auth";
import { LiveDot } from "@/components/motion";
import { GigsBoard, type Viewer } from "@/components/gigs-board";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Browse local service gigs" };

export default async function GigsPage() {
  const jar = await cookies();
  const region = regionOf(jar.get("ap_region")?.value);
  const user = await getSessionUser();
  const profile = user?.role === "provider" ? await getProviderProfile(user.id) : null;

  const rows = await db
    .select().from(jobs)
    .where(and(eq(jobs.region, region.code), eq(jobs.status, "open")))
    .orderBy(desc(jobs.createdAt));

  const viewer: Viewer = {
    loggedIn: !!user,
    role: user?.role ?? null,
    verified: profile?.verificationStatus === "fully_verified",
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-14 text-white">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <p className="flex items-center gap-2.5 font-mono text-xs font-bold tracking-[0.2em] text-accent-400 uppercase">
            <LiveDot /> Live marketplace
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Local service gigs in {region.name}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-stone-300">
            {rows.length} open {rows.length === 1 ? "gig" : "gigs"} across premium trades, cleaning and home services · pay in {region.currency} · {region.licenseLabel} required where applicable.
            Switch markets from the region selector above.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-8xl px-4 py-10 sm:px-6 lg:px-10">
        <GigsBoard jobs={rows} regionCode={region.code} viewer={viewer} />
      </section>
    </div>
  );
}