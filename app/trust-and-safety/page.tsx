import {
  FileCheck, Landmark, BadgeCheck, ScanFace, ShieldCheck, Lock, Eye, Scale, Server, Trash2,
} from "lucide-react";
import { Card, SectionHeading, Badge, Button } from "@/components/ui";
import { Reveal } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Trust & safety" };

export default function TrustPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 py-20 text-white">
        <div className="hero-grid absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <Reveal>
            <Badge kind="verified" className="mb-5">The badge, explained</Badge>
            <h1 className="max-w-3xl font-display text-5xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Trust is the product.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-300">
              Every Fully Verified pro passes four independent checks. Every check is
              privacy-respecting, regionally compliant, and designed to protect both sides of the door.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: FileCheck, title: "1 · Government photo ID", body: "Passport or driving licence, front and back where applicable. Document authenticity and expiry are checked automatically, then spot-reviewed by our verification team." },
            { icon: Landmark, title: "2 · Liability insurance", body: "A current certificate of liability cover is required and kept on file. Homeowners can request proof before work begins." },
            { icon: BadgeCheck, title: "3 · Trade credentials", body: "Region-specific: state licenses (US), provincial tickets / Red Seal (CA), Gas Safe & NICEIC (UK), QBCC / electrical licences (AU). We validate against the issuing register." },
            { icon: ScanFace, title: "4 · Live facial match", body: "An email-gated liveness check (blink + head movement) matched against the uploaded ID photo. The email gate proves inbox control, blocking session-hijack attempts." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.07}>
              <Card lift className="h-full p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-900"><c.icon className="h-6 w-6 text-accent-400" aria-hidden /></span>
                <h2 className="mt-4 font-display text-xl font-bold text-primary-900">{c.title}</h2>
                <p className="mt-2 leading-relaxed text-stone-600">{c.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-10">
          <Reveal><SectionHeading eyebrow="Privacy & retention" title="Your data, handled by region"
            body="We collect the minimum, retain it the minimum, and tell you exactly what happens to it." /></Reveal>
          <Reveal delay={0.1}>
            <Card className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-bold tracking-widest text-stone-500 uppercase">
                    <th className="px-5 py-3.5">Data</th>
                    <th className="px-5 py-3.5">Purpose</th>
                    <th className="px-5 py-3.5">Retention</th>
                    <th className="px-5 py-3.5">Frameworks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[
                    ["Facial template", "One-time liveness match", "Deleted immediately after matching", "GDPR · UK GDPR · CCPA · PIPEDA · APPs"],
                    ["ID documents", "Identity & authenticity checks", "Encrypted; purged 90 days after verification", "GDPR Art. 5(1)(e) · CCPA §1798.105"],
                    ["Insurance & license", "Ongoing eligibility", "While account active + 12 months", "Regional trade regulations"],
                    ["Access logs", "Security & dispute evidence", "12 months, then anonymised", "Legitimate interest / security"],
                    ["Liveness result", "Proof of check (pass/fail only)", "Account lifetime", "Audit requirement"],
                  ].map((row) => (
                    <tr key={row[0]}>
                      <td className="px-5 py-4 font-bold text-primary-900">{row[0]}</td>
                      <td className="px-5 py-4 text-stone-600">{row[1]}</td>
                      <td className="px-5 py-4 text-stone-600">{row[2]}</td>
                      <td className="px-5 py-4 font-mono text-xs text-stone-500">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { icon: Lock, title: "Encrypted end-to-end", body: "Documents encrypted in transit and at rest; access restricted to the verification team." },
              { icon: Trash2, title: "Right to erasure", body: "Delete your account and we purge personal data on the regional statutory schedule." },
              { icon: Server, title: "Regional processing", body: "UK/EU data stays in-region; Canadian data under PIPEDA-compliant processors." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <Card className="h-full p-6">
                  <f.icon className="h-6 w-6 text-accent-600" aria-hidden />
                  <h3 className="mt-3 font-display font-bold text-primary-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{f.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-8xl px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="When things go wrong" title="Real humans. Real resolutions."
              body="Flagged verifications go to manual review. Job disputes get a dedicated case manager with access to the full entry log, messages and photos." />
            <ul className="mt-7 space-y-3.5">
              {[
                { icon: Eye, text: "Median first response on disputes: under 4 business hours" },
                { icon: Scale, text: "Payouts held in escrow until completion is confirmed" },
                { icon: ShieldCheck, text: "Repeat-offender pros are permanently removed — badge integrity first" },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" aria-hidden />
                  <span className="font-medium text-stone-700">{f.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl bg-gradient-to-br from-primary-950 to-primary-800 p-8 text-center text-white shadow-lift">
              <ShieldCheck className="mx-auto h-12 w-12 text-accent-400" aria-hidden />
              <p className="mt-4 font-display text-2xl font-extrabold">100% of accepted jobs</p>
              <p className="mt-1 text-stone-300">are performed by Fully Verified professionals. No exceptions, no “pending” pros.</p>
              <Button href="/help" variant="accent" className="mt-6">Read the FAQ</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}