import "server-only";
import { db } from "@/db";
import { emails } from "@/db/schema";

/**
 * Transactional email. In production this pipes to Resend/Postmark;
 * in the sandbox every message is delivered to the Demo Mail inbox
 * (/dev/inbox) so the full email-gated flow is testable end-to-end.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  kind: string;
  bodyHtml: string;
  token?: string;
}) {
  await db.insert(emails).values({
    toEmail: opts.to,
    subject: opts.subject,
    kind: opts.kind,
    bodyHtml: opts.bodyHtml,
    token: opts.token ?? "",
  });
}

function shell(headline: string, inner: string): string {
  return `
  <div style="background:#faf9f7;padding:32px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8e5df;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1a1917,#3a3835);padding:28px 32px;">
        <div style="color:#f59e0b;font-weight:800;letter-spacing:0.08em;font-size:13px;">◆ ACCESSPRO</div>
        <h1 style="color:#ffffff;font-size:22px;margin:12px 0 0;line-height:1.3;">${headline}</h1>
      </div>
      <div style="padding:28px 32px;color:#1a1917;font-size:15px;line-height:1.65;">${inner}</div>
      <div style="padding:18px 32px;border-top:1px solid #e8e5df;color:#64748b;font-size:12px;">
        AccessPro · Verified trades, premium pay · This link is personal — never share it.
      </div>
    </div>
  </div>`;
}

export function facialInviteEmail(name: string, link: string): string {
  return shell(
    "Complete your AccessPro verification – Facial step required",
    `<p>Hi ${name},</p>
     <p>Your documents have been received and passed initial automated checks. One final step remains: a <strong>live facial verification</strong> matched against your uploaded photo ID.</p>
     <p style="margin:24px 0;">
       <a href="${link}" style="background:#f59e0b;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:10px;display:inline-block;">Start facial verification →</a>
     </p>
     <p style="color:#64748b;font-size:13px;">This secure link expires in <strong>30 minutes</strong> and can be used once. If it expires, request a new one from your onboarding page.</p>
     <p style="color:#64748b;font-size:13px;">Privacy: your liveness check is processed to confirm identity only. Facial templates are deleted immediately after matching, per our regional retention policy.</p>`
  );
}

export function verifiedEmail(name: string): string {
  return shell(
    `You're Fully Verified, ${name} 🎉`,
    `<p>Your identity, insurance and credentials are confirmed. The <strong style="color:#f59e0b;">Fully Verified</strong> badge is now live on your profile.</p>
     <p>Priority high-pay gigs in your region are unlocked — head to your dashboard to accept your first premium job.</p>`
  );
}

export function jobAcceptedEmail(homeowner: string, pro: string, jobTitle: string, accessLine: string): string {
  return shell(
    "A verified pro accepted your job",
    `<p>Hi ${homeowner},</p>
     <p><strong>${pro}</strong> (Fully Verified ✓) accepted <strong>${jobTitle}</strong>.</p>
     ${accessLine}
     <p>You can track live status, the access log and messages from your dashboard.</p>`
  );
}

export function accessCodeEmail(pro: string, jobTitle: string, code: string, brand: string, until: string): string {
  return shell(
    "Your temporary access code",
    `<p>Hi ${pro},</p>
     <p>A time-limited entry credential has been issued for <strong>${jobTitle}</strong>.</p>
     <div style="background:#1a1917;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
       <div style="color:#94a3b8;font-size:12px;letter-spacing:0.15em;">${brand.toUpperCase()} · TEMPORARY PIN</div>
       <div style="color:#f59e0b;font-size:34px;font-weight:800;letter-spacing:0.3em;font-family:monospace;">${code}</div>
       <div style="color:#94a3b8;font-size:12px;">Auto-expires ${until}</div>
     </div>
     <p style="color:#64748b;font-size:13px;">Every entry is logged and visible to the homeowner. The code is bound to your verified identity and cannot be transferred.</p>`
  );
}