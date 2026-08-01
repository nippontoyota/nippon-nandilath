# Nippon Toyota Onam Lucky Draw — Implementation Plan

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Phase 1 — Foundation & Infrastructure](#4-phase-1--foundation--infrastructure)
5. [Phase 2 — Database Schema & Models](#5-phase-2--database-schema--models)
6. [Phase 3 — Customer Entry Form](#6-phase-3--customer-entry-form)
7. [Phase 4 — Admin Panel](#7-phase-4--admin-panel)
8. [Phase 5 — WhatsApp Integration](#8-phase-5--whatsapp-integration)
9. [Phase 6 — Winner Selection & Announcement](#9-phase-6--winner-selection--announcement)
10. [Phase 7 — Anti-Fraud & Rate Limiting](#10-phase-7--anti-fraud--rate-limiting)
11. [Phase 8 — Deployment & DevOps](#11-phase-8--deployment--devops)
12. [Security Checklist](#12-security-checklist)
13. [Git Hygiene & Branching Strategy](#13-git-hygiene--branching-strategy)
14. [Never-Commit Rules](#14-never-commit-rules)

---

## 1. Project Overview

Branch-wise Onam lucky draw for Nippon Toyota. Each branch gets a unique QR code. Customers scan → fill a short form (name, phone, model, colour, VIN) → receive WhatsApp confirmation. Each branch selects 3 winners (1st, 2nd, 3rd) at random. One entry per phone number across all branches.

### Key Constraints

- **Phone uniqueness** — one entry per phone number globally
- **VIN uniqueness** — one entry per VIN globally
- **Mobile-first** — form opens in WhatsApp/Instagram in-app browser
- **No free-text model/colour** — admin-managed dropdowns only
- **Offline-resilient entry** — WhatsApp failure never drops an entry

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend & Backend | **Next.js 14 (App Router)** | Single codebase, server actions, API routes, Vercel-native |
| Database | **Supabase (Postgres)** | Managed Postgres, row-level security, real-time, auth |
| ORM | **Prisma** | Type-safe, migrations, studio for admin queries |
| UI | **Tailwind CSS + shadcn/ui** | Rapid development, brand theming, accessible |
| Admin Auth | **Supabase Auth** | Email-restricted, magic link or password |
| QR Generation | **qrcode** npm | Server-side generation, PNG/SVG output |
| WhatsApp | **DoubleTick API** | Existing Nippon Toyota account, REST API |
| Rate Limiting | **Upstash Redis** (or DB counter) | Serverless-friendly, low latency |
| Validation | **Zod** | Shared schemas between client + server |
| Deployment | **Vercel** | Zero-config, preview deployments, env management |

---

## 3. Project Structure

```
nippon-toyota-luckydraw/
├── .github/
│   └── workflows/          # CI/CD pipelines
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data (branches, models, colours)
├── public/
│   ├── logo.svg            # Nippon Toyota brand assets
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (public)/       # Public-facing routes
│   │   │   ├── enter/
│   │   │   │   └── [slug]/ # Per-branch entry form
│   │   │   ├── confirmation/
│   │   │   │   └── [id]/   # Post-submission confirmation
│   │   │   └── winners/    # Public winner listing (optional)
│   │   ├── (admin)/        # Admin routes (auth-gated)
│   │   │   ├── admin/
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── branches/
│   │   │   │   ├── catalogue/
│   │   │   │   ├── submissions/
│   │   │   │   ├── draw/
│   │   │   │   └── winners/
│   │   ├── api/            # API routes (server actions fallback)
│   │   │   ├── submit/
│   │   │   ├── qr/[slug]/
│   │   │   └── doubletick-webhook/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── forms/
│   │   │   ├── EntryForm.tsx
│   │   │   └── ConfirmationScreen.tsx
│   │   ├── admin/
│   │   │   ├── BranchTable.tsx
│   │   │   ├── SubmissionsTable.tsx
│   │   │   ├── DrawControls.tsx
│   │   │   └── WinnerDisplay.tsx
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── QRCodeDisplay.tsx
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── supabase.ts     # Supabase admin/client helpers
│   │   ├── doubletick.ts   # DoubleTick API wrapper
│   │   ├── rate-limit.ts   # Rate limiting logic
│   │   ├── fraud.ts        # Fraud detection helpers
│   │   └── utils.ts        # Shared utilities
│   ├── schemas/
│   │   ├── entry.ts        # Zod schema for entry form
│   │   └── admin.ts        # Zod schema for admin forms
│   ├── hooks/
│   │   ├── useEntryForm.ts
│   │   └── useAdmin.ts
│   └── styles/
│       └── brand.css       # Nippon Toyota brand tokens
├── .env.local               # Local env (gitignored)
├── .env.example             # Documented template (committed)
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── IMPLEMENTATION_PLAN.md
```

---

## 4. Phase 1 — Foundation & Infrastructure

### 4.1 Initialize Project

```bash
npx create-next-app@latest nippon-luckydraw --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 4.2 Install Core Dependencies

```bash
# Prisma + Supabase
npm install prisma @prisma/client @supabase/supabase-js

# UI
npx shadcn@latest init
npx shadcn@latest add button card form input label select table toast

# Validation
npm install zod

# QR generation
npm install qrcode
npm install -D @types/qrcode

# Rate limiting
npm install @upstash/redis

# Utilities
npm install uuid date-fns
```

### 4.3 Environment Variables

**`.env.example`** (committed to repo):

```env
# Database
DATABASE_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
SUPABASE_SERVICE_ROLE_KEY="xxx"

# DoubleTick (WhatsApp)
DOUBLETICK_API_KEY="dbt-xxx"
DOUBLETICK_API_URL="https://api.doubletick.io/v1"
DOUBLETICK_WEBHOOK_SECRET="whsec_xxx"

# Upstash (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Admin
ADMIN_ALLOWED_EMAILS="admin@nippontoyota.com,staff@nippontoyota.com"
```

### 4.4 GitIgnore

**`.gitignore`** — MUST include at minimum:

```gitignore
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.production
.env.*.local

# Next.js
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Prisma
prisma/migrations/              # Generated; commit only if you want migration history
# prisma/migrations/            # UNCOMMENT IF you prefer to generate migrations at deploy time

# Logs
*.log
npm-debug.log*

# Uploads (if any)
public/uploads/

# Test coverage
coverage/
```

> ⚠ **NEVER commit `.env` files to version control.** Use `.env.example` as the committed template. Rotate any key that has ever been committed.

---

## 5. Phase 2 — Database Schema & Models

### 5.1 `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum DrawStatus {
  PENDING
  COMPLETED
}

model Branch {
  id        String   @id @default(cuid())
  name      String
  location  String?
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  entries    Entry[]
  winners    Winner[]
  drawStatus DrawStatus @default(PENDING)

  @@map("branches")
}

model Model {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())

  colours Colour[]
  entries Entry[]

  @@map("models")
}

model Colour {
  id        String   @id @default(cuid())
  name      String
  modelId   String
  model     Model    @relation(fields: [modelId], references: [id])

  @@unique([modelId, name])
  @@map("colours")
}

model Entry {
  id         String   @id @default(cuid())
  name       String
  phone      String   @unique
  phoneRaw   String   // Original for admin reference
  modelId    String
  model      Model    @relation(fields: [modelId], references: [id])
  colourId   String
  colour     Colour   @relation(fields: [colourId], references: [id])
  vin        String   @unique
  branchId   String
  branch     Branch   @relation(fields: [branchId], references: [id])
  ip         String?
  userAgent  String?
  flag       FlagType?
  flagReason String?
  createdAt  DateTime @default(now())

  @@index([phone])
  @@index([vin])
  @@index([branchId])
  @@map("entries")
}

model Winner {
  id        String   @id @default(cuid())
  entryId   String   @unique
  entry     Entry    @relation(fields: [entryId], references: [id])
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id])
  place     Int      // 1, 2, or 3
  createdAt DateTime @default(now())

  @@unique([branchId, place])
  @@map("winners")
}

model WhatsAppLog {
  id        String   @id @default(cuid())
  entryId   String
  status    String   // PENDING, SENT, FAILED
  error     String?
  retries   Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@map("whatsapp_logs")
}

enum FlagType {
  MULTI_BRANCH_PHONE
  SUSPICIOUS_NAME
  MULTI_PHONE_DEVICE
  SUSPICIOUS_VIN
}
```

### 5.2 Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5.3 Seed Data

Create `prisma/seed.ts` with initial branch list, Toyota models, and their colour options.

---

## 6. Phase 3 — Customer Entry Form

### 6.1 Route: `/enter/[slug]`

- Read `slug` from params → lookup Branch in DB
- Return 404 if branch not found or draw already completed
- Render `EntryForm` component

### 6.2 EntryForm Component

- Fields: Name, Phone, Model (dropdown), Colour (dropdown, filtered by model), VIN
- **Mobile-first** — full-width inputs, large tap targets, no horizontal scroll
- VIN input: auto-uppercase, max 17 chars, real-time character filtering
- Phone input: Indian format mask (`+91 XXXXX XXXXX`)

### 6.3 Zod Schema (`src/schemas/entry.ts`)

```typescript
import { z } from "zod";

const VIN_CHARSET = /^[A-HJ-NPR-Z0-9]{17}$/;

export const entrySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "Only letters and spaces allowed"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  modelId: z.string().min(1, "Select a model"),
  colourId: z.string().min(1, "Select a colour"),
  vin: z
    .string()
    .length(17, "VIN must be exactly 17 characters")
    .regex(VIN_CHARSET, "VIN contains invalid characters"),
  branchId: z.string(),
  honeypot: z.string().max(0), // Hidden field, must be empty
});

export type EntryInput = z.infer<typeof entrySchema>;
```

### 6.4 Server Action: `submitEntry`

1. Parse & validate with Zod (server-side)
2. Check honeypot — reject if filled
3. Check rate limit (IP-based)
4. Check duplicate phone in DB → return `DUPLICATE_PHONE` error
5. Check duplicate VIN in DB → return `DUPLICATE_VIN` error
6. Run fraud detection checks → set flag if triggered
7. Insert entry into DB
8. Enqueue WhatsApp message (insert into `WhatsAppLog`)
9. Return success with entry ID

### 6.5 Confirmation Screen

- Display branch name, customer name, phone, model/colour, VIN
- "You'll receive a WhatsApp confirmation shortly" message
- "When winners will be announced" note from branch config

---

## 7. Phase 4 — Admin Panel

### 7.1 Authentication (Supabase Auth)

- Magic link or password auth
- Restrict to `ADMIN_ALLOWED_EMAILS` via RLS or middleware check
- Admin routes protected by middleware (`src/middleware.ts`)

### 7.2 Dashboard

- **Stats cards:** Total entries, entries per branch, flagged entries, draws completed
- **Quick actions:** Go to branches, catalogue, draw

### 7.3 Branch Management

- **CRUD table:** Name, location, slug, entry count
- **Slug auto-generation** from branch name (kebab-case)
- **QR Code:** Button per row → generates QR code for `https://nippontoyota-onam.vercel.app/enter/{slug}`
- **Download:** PNG and SVG formats

### 7.4 Model/Colour Catalogue

- **Model list:** Add/edit/delete models
- **Colour list:** Per model, add/edit/delete colours
- Changes are immediate — dropdowns on entry form reflect updates without redeployment

### 7.5 Submissions View

- **Table:** All entries across all branches (or filtered by branch)
- **Columns:** Name, phone, model, colour, VIN, branch, flagged, timestamp
- **Features:** Search (name, phone, VIN), filter by branch, filter flagged only, export CSV
- **Flagged entries:** Badge with reason, action button to exclude from draw

### 7.6 Winner Selection (Draw)

- Per-branch draw button (disabled if already completed)
- Modal: "Select 3 winners from {branch} ({count} entries)?" → confirm
- Server action:
  1. Verify branch draw status = PENDING
  2. Fetch all non-excluded entries for branch
  3. Randomly select (Fisher-Yates shuffle)
  4. Assign 1st, 2nd, 3rd place
  5. Update branch status to COMPLETED
- **Edge case:** If fewer than 3 entries — still draw with available count
- **Edge case:** If 0 entries — show notification, don't create draw

### 7.7 Winner Display

- Per-branch winner cards (1st/2nd/3rd)
- Show name, phone (masked), model/colour
- Option to publish publicly
- Option to trigger WhatsApp broadcast to winners

---

## 8. Phase 5 — WhatsApp Integration

### 8.1 DoubleTick Client (`src/lib/doubletick.ts`)

```typescript
interface DoubleTickPayload {
  to: string;       // +91XXXXXXXXXX
  template: string;
  params: Record<string, string>;
}

export async function sendWhatsAppMessage(payload: DoubleTickPayload) {
  // POST to DoubleTick API
  // Handle rate limits, auth errors
}
```

### 8.2 Message Queue (DB-backed)

- On entry submission: insert row in `WhatsAppLog` with status `PENDING`
- **Cron job / serverless function** (Vercel Cron): poll `WhatsAppLog` where `status = PENDING` and `retries < 5`
- Send via DoubleTick API
- On success: update status to `SENT`
- On failure: increment retries, log error
- Backoff: exponential (1min, 5min, 15min, 1hr, 6hr)

### 8.3 Message Content

```
🛞 *Nippon Toyota — Onam Lucky Draw Entry Confirmed*

Branch: {branchName}
Name: {name}
Phone: {phone}
Model: {model}
Colour: {colour}
VIN: {vin}

Winners will be announced on {announcementDate}.

Good luck! 🎉
```

### 8.4 Webhook (Optional)

- DoubleTick delivery receipts → update log status
- Endpoint: `/api/doubletick-webhook`

---

## 9. Phase 6 — Winner Selection & Announcement

### 9.1 Draw Algorithm

- Fetch all entries for branch where `excluded = false`
- Fisher-Yates shuffle
- Assign places: index 0 → 1st, index 1 → 2nd, index 2 → 3rd
- Transactionally insert winners and update branch status

### 9.2 Public Winner Page (Optional)

- Route: `/winners` or `/winners/[slug]`
- Display published winners per branch
- No authentication required

### 9.3 Winner WhatsApp Notification

- After draw completes, admin can trigger winner notification
- Sends personalised message to each winner via DoubleTick
- Queued same as confirmation messages

---

## 10. Phase 7 — Anti-Fraud & Rate Limiting

### 10.1 Rate Limiting (`src/lib/rate-limit.ts`)

- **Per IP:** 5 submissions per minute
- **Per phone:** 1 submission per 10 minutes (prevent rapid retry after rejection)
- Implementation: Upstash Redis (`sliding window`) or DB counter

### 10.2 Honeypot Field

- Hidden input field `honeypot` in form (CSS: `display: none !important`)
- Server rejects submission if field is non-empty
- Bot detection — no human will fill it

### 10.3 Flag Conditions (`src/lib/fraud.ts`)

| Condition | Flag | Detection |
|-----------|------|-----------|
| Same phone, different branches within 5 min | `MULTI_BRANCH_PHONE` | Check entries by phone in last 5 min |
| Name is "test", single char, or repeated chars | `SUSPICIOUS_NAME` | Regex check |
| Same IP, different phones within 2 min | `MULTI_PHONE_DEVICE` | Query entries by IP in last 2 min |
| VIN has repeated/sequential pattern | `SUSPICIOUS_VIN` | Regex: `(.)\1{4,}` or `0123456789`-like |

### 10.4 Admin Review

- Flagged entries shown in admin panel with badge + reason
- Admin can toggle `excluded` flag to remove from draw pool
- No automatic exclusion — entries remain eligible by default

---

## 11. Phase 8 — Deployment & DevOps

### 11.1 Vercel Deployment

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard (all `.env` values)
3. Configure domain: `nippontoyota-onam.vercel.app`
4. Enable **Preview Deployments** for PR branches
5. Add Vercel Cron Jobs for WhatsApp retry queue

### 11.2 Supabase Setup

1. Create project on supabase.com
2. Run Prisma migrations against production DB
3. Enable Row Level Security (RLS) on tables
4. Apply migrations in CI via `prisma migrate deploy`

### 11.3 GitHub Actions CI (`./github/workflows/ci.yml`)

```yaml
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx tsc --noEmit

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

### 11.4 Branching Strategy

```
main            # Production — auto-deploys to Vercel
├── develop     # Staging — preview deployment
├── feat/       # Feature branches
├── fix/        # Bugfix branches
└── chore/      # Config, deps, CI changes
```

---

## 12. Security Checklist

- [ ] **No secrets in code** — all keys/URLs in environment variables
- [ ] **Input validation** — Zod schemas on both client and server
- [ ] **SQL injection** — prevented by Prisma parameterised queries
- [ ] **CSRF** — Next.js Server Actions include anti-CSRF tokens
- [ ] **Rate limiting** — IP-based, phone-based, Redis-backed
- [ ] **Honeypot field** — hidden field against bots
- [ ] **Supabase RLS** — restrict admin data access
- [ ] **HTTPS only** — enforced by Vercel
- [ ] **Admin auth** — email-restricted Supabase Auth
- [ ] **Phone normalisation** — strip `+91`, store `+91XXXXXXXXXX` consistently
- [ ] **VIN sanitisation** — uppercase, strip I/O/Q, length check
- [ ] **No sensitive data in URLs** — entry IDs are non-sequential (cuid)
- [ ] **Webhook verification** — validate DoubleTick webhook signatures
- [ ] **Dependency auditing** — `npm audit` in CI

---

## 13. Git Hygiene & Branching Strategy

### Branch Naming

```
feat/entry-form
fix/duplicate-phone-handling
chore/update-deps
```

### Commit Style

Use conventional commits:

```
feat: add customer entry form with Zod validation
fix: handle DoubleTick API timeout with retry queue
chore: update Prisma schema with winner model
docs: add API documentation for submit endpoint
```

### Workflow

1. Create feature branch from `develop`
2. Implement + test locally
3. Push → GitHub → CI runs lint/typecheck/build
4. Create PR → review → squash-merge to `develop`
5. Release: merge `develop` → `main` → auto-deploy

### What NOT to Commit

See [Section 14 — Never-Commit Rules](#14-never-commit-rules)

---

## 14. Never-Commit Rules

| ❌ Never Commit | Why | What To Do Instead |
|----------------|-----|-------------------|
| `.env`, `.env.local`, `.env.*.local` | Exposes DB creds, API keys, secrets | Commit `.env.example` with placeholder values |
| `node_modules/` | Bloats repo, platform-specific | Add to `.gitignore` |
| `.next/`, `out/`, `build/` | Build artifacts | Add to `.gitignore` |
| `prisma/migrations/` (in some workflows) | Generated files | Decide: commit or generate at deploy — be consistent |
| `*.log`, `npm-debug.log*` | Debug logs, may contain data | Add to `.gitignore` |
| `coverage/` | Test output | Add to `.gitignore` |
| `public/uploads/` | User-uploaded content (if any) | Add to `.gitignore` |
| IDE config (`.vscode/`, `.idea/`) | Personal preferences | Add to `.gitignore`; share only `.vscode/extensions.json` if team-standard |
| **Documentation files** this file is an exception | No docs — `IMPLEMENTATION_PLAN.md`, `*.md` docs, `DESIGN.md` | **Exclude from `.gitignore` is debated.** Decision: **DO commit docs** — they help the team. But if repo policy bans docs, add `*.md` to `.gitignore` except `README.md`. |
| API keys, passwords, tokens in code | Security breach | Use environment variables |
| Large binary files (>1MB) | Bloats git history | Use Git LFS or external storage |
| `next.config.js` with embedded secrets | Secret exposure | Keep config clean, secrets in env vars |
| Test data with PII | Privacy violation | Use mock/fake data in tests |

### Recommended `.gitignore` (full template above in §4.4)

> **Decision required:** Will your team commit `prisma/migrations/`?
> - **YES** (recommended): Enables `prisma migrate deploy` in CI without generating migrations at build time.
> - **NO**: Run `prisma migrate dev` during deploy. Riskier, but avoids migration files in repo.

---

## Quick Reference — Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npx prisma studio        # Open Prisma Studio (GUI DB browser)
npx prisma migrate dev   # Create migration after schema change
npx prisma generate      # Regenerate Prisma client

# Production build
npm run build            # Build for production
npm run start            # Start production server

# Lint & typecheck
npm run lint
npx tsc --noEmit

# Deploy migration (Vercel)
npx prisma migrate deploy

# Seed
npx prisma db seed
```

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|-------------|
| P1 — Foundation | 0.5 day | None |
| P2 — Schema | 0.5 day | P1 |
| P3 — Entry Form | 2 days | P2 |
| P4 — Admin Panel | 3 days | P2 |
| P5 — WhatsApp | 1.5 days | P2, P3 |
| P6 — Winner Draw | 1 day | P2, P4 |
| P7 — Anti-Fraud | 1 day | P2, P3 |
| P8 — Deployment | 0.5 day | P1–P7 |

**Total: ~10 days** for a single developer working full-time.

---

*This plan is a living document — update as scope, constraints, or decisions change.*
