import { LifeBuoy, Mail, MessageSquare } from "lucide-react";
import { Faq } from "@/components/faq";
import { Card, SectionHeading, Button } from "@/components/ui";
import { Reveal } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Help & FAQ" };

const ITEMS = [
  { q: "Why haven't I seen the facial verification step?", a: "By design, the facial step only unlocks through the secure link we email after your documents pass automated checks. The link expires in 30 minutes. In this sandbox, all emails arrive in the Demo Mail Inbox — open it from your dashboard or the link below, then click “Open secure verification link”." },
  { q: "Who can accept my job?", a: "Only Fully Verified pros: government ID checked, liability insurance on file, regional trade credentials validated, and a live facial match completed. There is no way for an unverified account to accept work." },
  { q: "How does temporary access work without a smart lock?", a: "Choose “Universal keypad / lockbox” when posting. AccessPro generates a time-limited PIN you can program into any keypad or lockbox. The code lifecycle — issuance, entries, expiry, revocation — is tracked identically." },
  { q: "Which smart locks are supported?", a: "The integration layer ships with Yale Access, Schlage Encode and August adapters, plus the universal fallback. Because every vendor implements the same adapter interface, additional brands plug in without changing the marketplace." },
  { q: "What does AccessPro cost?", a: "Homeowners: free, always. Providers: Pro Standard is $0/month with an 8% completion fee; Pro Elite is $29/month with 5% fees, priority ranking and instant payouts. Verification is free." },
  { q: "When do pros get paid?", a: "The moment you confirm completion and leave your rating, the payout is released via Stripe Connect. Elite pros receive it instantly; Standard pros on a 2-day schedule." },
  { q: "What happens to my facial data?", a: "The liveness template is used once to match against your ID photo and is deleted immediately. Only a pass/fail result is retained. Documents are encrypted and purged 90 days after verification, per your region's framework (GDPR, CCPA, PIPEDA, APPs)." },
  { q: "Can I revoke a code mid-job?", a: "Yes — one tap in Temporary Access. Revocation propagates to the lock immediately and is recorded in the shared access log. You can also extend a window by 4 hours if work is running long." },
  { q: "Which regions are live?", a: "United States, Canada, United Kingdom and Australia, with currency, licensing labels and pay ranges adapting automatically. Ireland, New Zealand and select EU markets are next — switch regions from the header selector." },
  { q: "How are high-pay gigs ranked?", a: "A match score blends estimated pay potential, urgency, regional demand for the category, recency and distance. Fully Verified pros see the highest-scoring work first; emergency jobs page nearby pros immediately." },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 lg:px-10">
      <Reveal>
        <SectionHeading eyebrow="Help centre" title="Answers, before you even ask"
          body="Everything about verification, access codes, payouts and regions — in one place." />
      </Reveal>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px]">
        <Reveal delay={0.05}><Faq items={ITEMS} /></Reveal>
        <div className="space-y-5">
          <Reveal delay={0.1}>
            <Card className="p-6">
              <LifeBuoy className="h-7 w-7 text-accent-600" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-bold text-primary-900">Try the full flow in 3 minutes</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
                <li>Log in as the <strong>New pro</strong> demo account</li>
                <li>Submit documents in onboarding</li>
                <li>Open the magic link in the demo inbox</li>
                <li>Pass liveness → accept a premium gig</li>
              </ol>
              <Button href="/login" variant="accent" className="mt-5 w-full">Start the demo</Button>
            </Card>
          </Reveal>
          <Reveal delay={0.15}>
            <Card className="p-6">
              <Mail className="h-7 w-7 text-primary-400" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-bold text-primary-900">Demo mail inbox</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                All transactional email (verification links, access codes, notifications) is delivered here in the sandbox.
              </p>
              <Button href="/dev/inbox" variant="secondary" className="mt-4 w-full">Open inbox</Button>
            </Card>
          </Reveal>
          <Reveal delay={0.2}>
            <Card className="p-6">
              <MessageSquare className="h-7 w-7 text-primary-400" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-bold text-primary-900">Still stuck?</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                Support responds in under 4 business hours, 7 days a week, in every live region.
              </p>
              <p className="mt-3 font-mono text-sm font-bold text-primary-900">support@accesspro.demo</p>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}