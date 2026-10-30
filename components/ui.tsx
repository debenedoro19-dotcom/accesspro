import Link from "next/link";
import clsx from "clsx";
import {
  ShieldCheck, Sparkles, Zap, Gem, AlertTriangle, type LucideIcon,
} from "lucide-react";
import type { ReactNode, ButtonHTMLAttributes } from "react";

/* ── Buttons ──────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "success" | "danger" | "white";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary-900 text-white hover:bg-primary-800 shadow-card",
  accent: "bg-accent-500 text-white hover:bg-accent-600 shadow-card",
  secondary: "border border-stone-300 bg-white text-primary-900 hover:border-primary-400 hover:bg-primary-50",
  ghost: "text-primary-700 hover:bg-primary-50",
  success: "bg-accent-50 text-accent-700 border border-accent-200 hover:bg-accent-100",
  danger: "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
  white: "bg-white text-primary-900 hover:bg-primary-50 shadow-card",
};

export function Button({
  variant = "primary", size = "md", href, className, children, onClick, ...rest
}: {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = clsx(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200",
    "hover:scale-[1.02] hover:shadow-lift active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "h-9 px-3.5 text-sm" : size === "lg" ? "h-13 px-7 text-base" : "h-11 px-5 text-[15px]",
    buttonStyles[variant],
    className
  );
  if (href)
    return (
      <Link href={href} className={cls} onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}>
        {children}
      </Link>
    );
  return <button className={cls} onClick={onClick} {...rest}>{children}</button>;
}

/* ── Badges ───────────────────────────────────────────────────── */

type BadgeKind = "verified" | "premium" | "emergency" | "urgent" | "highticket" | "neutral" | "charcoal" | "access";

const badgeMeta: Record<BadgeKind, { cls: string; icon?: LucideIcon }> = {
  verified: { cls: "bg-accent-50 text-accent-800 border-accent-200", icon: ShieldCheck },
  premium: { cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Sparkles },
  emergency: { cls: "bg-rose-50 text-rose-700 border-rose-200", icon: AlertTriangle },
  urgent: { cls: "bg-orange-50 text-orange-700 border-orange-200", icon: Zap },
  highticket: { cls: "bg-violet-50 text-violet-700 border-violet-200", icon: Gem },
  neutral: { cls: "bg-stone-100 text-stone-600 border-stone-200" },
  charcoal: { cls: "bg-primary-900 text-white border-primary-700" },
  access: { cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

export function Badge({ kind = "neutral", children, pulse, className }: {
  kind?: BadgeKind; children: ReactNode; pulse?: boolean; className?: string;
}) {
  const meta = badgeMeta[kind];
  const Icon = meta.icon;
  return (
    <span className={clsx(
      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
      meta.cls, pulse && "group-hover:animate-pulse-soft", className
    )}>
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {children}
    </span>
  );
}

/* ── Cards, layout, stats ─────────────────────────────────────── */

export function Card({ children, className, lift }: { children: ReactNode; className?: string; lift?: boolean }) {
  return (
    <div className={clsx(
      "rounded-2xl border border-stone-200 bg-white shadow-card",
      lift && "transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
      className
    )}>
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, body, dark, center }: {
  eyebrow?: string; title: string; body?: string; dark?: boolean; center?: boolean;
}) {
  return (
    <div className={clsx("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-3 font-mono text-xs font-bold tracking-[0.2em] text-accent-600 uppercase">{eyebrow}</p>
      )}
      <h2 className={clsx(
        "font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl",
        dark ? "text-white" : "text-primary-900"
      )}>{title}</h2>
      {body && <p className={clsx("mt-4 text-lg leading-relaxed", dark ? "text-stone-300" : "text-stone-600")}>{body}</p>}
    </div>
  );
}

export function Stat({ label, value, sub, icon: Icon }: {
  label: string; value: ReactNode; sub?: string; icon?: LucideIcon;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-stone-500">{label}</p>
        {Icon && <Icon className="h-4.5 w-4.5 text-accent-600" aria-hidden />}
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-primary-900">{value}</p>
      {sub && <p className="mt-1 text-xs font-medium text-stone-500">{sub}</p>}
    </Card>
  );
}

/* ── Forms ────────────────────────────────────────────────────── */

export const inputCls =
  "h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-[15px] text-ink placeholder:text-stone-400 transition-colors focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none";

export function Field({ label, hint, children, required }: {
  label: string; hint?: string; children: ReactNode; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-primary-900">
        <span>{label}{required && <span className="ml-0.5 text-rose-500">*</span>}</span>
        {hint && <span className="text-xs font-normal text-stone-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full bg-stone-200", className)}
      role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400 transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: {
  icon: LucideIcon; title: string; body: string; action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
        <Icon className="h-7 w-7 text-primary-400" aria-hidden />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold text-primary-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-stone-500">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton rounded-xl", className)} aria-hidden />;
}