import { Mail, KeyRound, ShieldCheck, Briefcase, Inbox as InboxIcon, ArrowRight, Info } from "lucide-react";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { desc } from "drizzle-orm";
import { timeAgo } from "@/lib/regions";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Demo mail inbox" };

const kindMeta: Record<string, { label: string; icon: typeof Mail }> = {
  facial_invite: { label: "Facial invite", icon: Mail },
  access_code: { label: "Access code", icon: KeyRound },
  verified: { label: "Verified", icon: ShieldCheck },
  job_accepted: { label: "Job accepted", icon: Briefcase },
  welcome: { label: "Welcome", icon: Mail },
};

export default async function InboxPage() {
  const rows = await db.select().from(emails).orderBy(desc(emails.createdAt)).limit(50);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent-600 uppercase">Sandbox tooling</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-primary-900 sm:text-4xl">Demo mail inbox</h1>
      <p className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        Transactional email is simulated in this environment (Resend/Postmark in production).
        Every AccessPro message — including the <strong>facial verification magic link</strong> — lands here instantly.
      </p>

      <div className="mt-8 space-y-4">
        {rows.length === 0 && (
          <EmptyState icon={InboxIcon} title="No mail yet"
            body="Submit provider documents or accept a job with temporary access, and the emails will appear here."
            action={<Button href="/onboarding" variant="accent">Go to onboarding</Button>} />
        )}
        {rows.map((e) => {
          const meta = kindMeta[e.kind] ?? kindMeta.welcome;
          const Icon = meta.icon;
          return (
            <Card key={e.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-stone-100 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[15px] font-bold text-primary-900">{e.subject}</p>
                  <p className="text-xs font-medium text-stone-400">
                    To {e.toEmail} · {timeAgo(e.createdAt)}
                  </p>
                </div>
                <Badge kind={e.kind === "facial_invite" ? "premium" : e.kind === "verified" ? "verified" : "neutral"}>
                  {meta.label}
                </Badge>
                <span className={`flex items-center gap-1.5 text-[11px] font-bold ${e.openedAt ? "text-stone-400" : "text-accent-600"}`}>
                  <span className={`h-2 w-2 rounded-full ${e.openedAt ? "bg-stone-300" : "animate-pulse-soft bg-accent-500"}`} aria-hidden />
                  {e.openedAt ? "Opened" : "New"}
                </span>
              </div>
              <div className="px-5 py-4">
                {e.kind === "facial_invite" && (
                  <Button href={`/api/email/click?id=${e.id}`} variant="accent" className="mb-4 w-full sm:w-auto">
                    Open secure verification link <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                )}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-bold text-primary-700 select-none hover:underline">
                    View email content
                  </summary>
                  <div className="mt-3 overflow-hidden rounded-xl border border-stone-200"
                    dangerouslySetInnerHTML={{ __html: e.bodyHtml }} />
                </details>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}