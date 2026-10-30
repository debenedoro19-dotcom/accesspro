# AccessPro — Verified Trades. Premium Pay. Keys Optional.

Premium verified-trades marketplace with secure, time-limited home access.
Live markets: **US · Canada · UK · Australia** (currency, licensing labels and pay ranges adapt by region). The seed now provides **34 open local jobs** across all four regions, including HVAC, plumbing, electrical, roofing, EV chargers, house cleaning, commercial janitorial, housekeeping, laundry, windows, carpet/upholstery, light handyman work, and non-clinical senior home help.

## Stack

- **Next.js (App Router) + TypeScript**, Tailwind CSS v4 (fully tokenized), Framer Motion, lucide-react, Chart.js
- **PostgreSQL + Drizzle ORM** (`src/db/schema.ts`), session-cookie auth (scrypt-hashed passwords)
- Server Actions for every mutation (`src/lib/actions.ts`)
- Simulated adapters for third parties, each behind a clean interface:
  - **Email** → demo outbox at `/dev/inbox` (swap for Resend/Postmark in `src/lib/email.ts`)
  - **Smart locks** → `SmartLockAdapter` registry (Yale / Schlage / August / universal) in `src/lib/locks.ts`
  - **Identity/facial** → liveness simulation with camera attempt in `src/components/facial-capture.tsx` (swap for Persona/Veriff)
  - **Payments** → payout release simulated on completion (swap for Stripe Connect)
  - **Analytics** → funnel events table (swap for PostHog)

## Demo accounts (password `demo1234`)

| Account | Email | Purpose |
| --- | --- | --- |
| Verified pro | `pro@accesspro.demo` | Full provider dashboard, live access code, earnings |
| New pro | `pending@accesspro.demo` | Walk the exact verification flow |
| Homeowner | `home@accesspro.demo` | Jobs, temporary access management |
| Admin | `admin@accesspro.demo` | Verification queue, disputes, region config |

## The exact verification sequence

1. Sign up as provider → basics → document upload (ID, insurance, license, optional portfolio).
2. Status becomes **“Documents Received – Facial Verification Pending”**; an email is sent with subject
   **“Complete your AccessPro verification – Facial step required”** containing a **30-minute, single-use magic link**.
3. The facial step at `/onboarding/facial?token=…` is **only** reachable via that link (never inside the wizard).
   Consent → liveness steps → ID match → **Fully Verified** → confetti → dashboard: *“You're live — priority high-pay gigs are now visible.”*

## Design tokens (`src/app/globals.css` → `@theme`)

- `primary-50…950` warm charcoal scale (`primary-900 = #2C2A28`, `primary-950 = #1A1917`)
- `accent-50…900` warm amber scale (`accent-500 = #F59E0B`)
- `surface #FAF9F7`, elevated surface `#FFFFFF`, ink `#1A1917`, `container-8xl 88rem`
- Shadows use warm charcoal alpha; amber glow provides a quiet premium highlight.
- Fonts: **Geist** (display, tight tracking) · **Inter** (body) · **JetBrains Mono** (counters, PINs, data)
- Shadows: `shadow-card`, `shadow-lift`, `shadow-glow` · Motion: `animate-pulse-soft`, `animate-scan`, `animate-float`, `animate-shimmer`, `animate-pop-in`

## Component library (`src/components/ui.tsx` + friends)

`Button` (7 variants, hover scale+shadow) · `Badge` (verified/premium/emergency/urgent/highticket/access…) ·
`Card` (rounded-2xl, 1px border, hover lift) · `Field`/`inputCls` · `Progress` · `Stat` · `EmptyState` · `Skeleton` ·
`Reveal`/`CountUp`/`LiveDot` (motion) · `Countdown`/`LiveTicker` (live widgets) · `GigCard` · `DashboardShell` · `AccessManager`.

## Production environment variables

`DATABASE_URL` · `APP_URL` · `RESEND_API_KEY` · `STRIPE_SECRET_KEY` / `STRIPE_CONNECT_WEBHOOK_SECRET` ·
`PERSONA_API_KEY` · `MAPBOX_TOKEN` · `PUSHER_APP_ID` / `NEXT_PUBLIC_PUSHER_KEY` · `POSTHOG_KEY`.
All secrets are read server-side via `process.env`; deploy on Vercel with the Postgres add-on (Neon/Supabase).

## Local development

```bash
npm install
npx drizzle-kit push   # apply schema
npm run dev            # seed runs automatically on first request
```