# Security & Code Audit — Nippon Toyota Lucky Draw

> **Date:** 2026-07-27 | **Mode:** Plan-phase read-only
> **Scope:** Full source audit — security, privacy, correctness, completeness

---

## Severity Key

| Tag | Meaning |
|-----|---------|
| 🔴 CRITICAL | Exploitable, data breach risk, must fix before any commit |
| 🟠 HIGH | Significant risk, PII exposure, auth bypass |
| 🟡 MEDIUM | Defense-in-depth, configuration, missing validation |
| 🔵 LOW | Hygiene, hardening, edge cases |
| ⚪ INFO | Observation, future consideration |

---

## 1. Authentication & Authorization

### 🔴 [CRITICAL] Forgeable Admin Session Cookie

**File:** `src/app/actions/auth.ts`
**Vector:** Session cookie value is the plain string `"authenticated"`.
```ts
cookies().set("admin_session", "authenticated", { httpOnly: true, ... });
// isAuthenticated checks:
return session?.value === "authenticated";
```
**Impact:** Anyone who sets `document.cookie = "admin_session=authenticated"` gains admin access. No signing, no encryption, no rotation.
**Fix:** Use a signed JWT or Supabase Auth with session tokens. At minimum, sign the cookie with a secret using `jose` or `next/iron-session`.

### 🔴 [CRITICAL] Hardcoded Admin Password Fallback

**File:** `src/app/actions/auth.ts:8`
```ts
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "onam2026";
```
**Impact:** If `.env` is missing in any environment (staging, preview deploy), the password defaults to a known value. Anyone can log in.
**Fix:** Remove fallback. Throw error at startup if `ADMIN_PASSWORD` is not set:
```ts
if (!process.env.ADMIN_PASSWORD) throw new Error("ADMIN_PASSWORD not set");
```

### 🟡 [MEDIUM] No Middleware-Level Auth Enforcement

**File:** Missing `src/middleware.ts`
**Vector:** Admin protection relies entirely on the layout component checking `isAuthenticated()`. There is no edge-level middleware. If a future admin page is accidentally placed outside the layout, it will be unprotected.
**Fix:** Add `middleware.ts` that checks `admin_session` on all `/admin/*` routes and redirects to `/admin/login` if absent.

### 🟡 [MEDIUM] Login Has No CSRF Protection

**File:** `src/app/admin/login/page.tsx`
**Vector:** The login form uses a client-side `handleSubmit` that awaits `login(formData)`. Next.js Server Actions have built-in CSRF protection via the `__animatedId` header — but only when using `<form action={login}>`. This form uses `onSubmit` + `useActionState` import but doesn't actually use it (it's imported but unused).
**Fix:** Use `<form action={login}>` with a Submit button (progressive enhancement + built-in CSRF), or use a Server Action bound to the form.

### 🔵 [LOW] No Session Expiry Refresh

**File:** `src/app/actions/auth.ts:19`
**Vector:** Session maxAge is 1 day but never refreshed on activity. Admin session can expire while user is actively using the dashboard.
**Fix:** Slide expiration on each authenticated request via middleware or layout.

---

## 2. Data Exposure & Privacy

### 🟠 [HIGH] Admin Dashboard Exposes Full Phone Numbers and VINs

**File:** `src/app/admin/dashboard/page.tsx:74`
```tsx
<td>{winner.entry.phone}</td>
<td>{winner.entry.vin}</td>
```
**Impact:** Any authenticated admin can see raw PII (phone numbers) and VINs. VINs tie to vehicle ownership records. Full phone numbers are sensitive — SMS-based phishing attacks become possible.
**Fix:** Mask phone numbers in the dashboard (show last 4 digits). Expose raw data only on a per-entry detail page or CSV export behind explicit action. Add an audit log for data exports.

### 🟠 [HIGH] No Rate Limiting on Entry Viewing (Enumeration)

**File:** `src/app/confirmation/[id]/page.tsx`
**Vector:** Confirmation URLs use cuid IDs (`ch72gsb320000udocl0fqrca2`). While not sequential, an attacker can enumerate entries if they discover the ID pattern. No rate limiting on this route.
**Fix:** Add rate limiting on `/confirmation/[id]`. Consider adding a signed token to the URL: `/confirmation/[id]?t=...`.

### 🟡 [MEDIUM] Confirmation Page Has No Access Control

**File:** `src/app/confirmation/[id]/page.tsx`
**Vector:** Anyone who knows the entry ID can view the confirmation (name, branch, model, colour, VIN). No auth check.
**Impact:** If an attacker enumerates IDs, they can collect (name, phone, VIN) pairs.
**Fix:** Require the phone number as a query param to view: `/confirmation/[id]?phone=XXXX`. Or use a short-lived signed token.

### 🟡 [MEDIUM] Entry ID Used in URL Instead of Obfuscated Token

**File:** `src/app/actions/entry.ts:66`
```ts
return { id: entry.id }; // entry.id is a cuid
```
**Impact:** The database-internal ID is exposed in the URL. For SQLite with cuid, this is random but still an internal implementation detail.
**Fix:** Use a separate public ID (`publicId: nanoid(12)`) for URLs, keep `id` internal.

### 🔵 [LOW] Winners Page Exposes Full Names

**File:** `src/app/winners/page.tsx:67`
```tsx
<p>{winner.entry.name}</p>
```
**Impact:** Full names are public. In India, the name alone can be used for social engineering (especially with branch association).
**Fix:** Show first name + initial only: `winner.entry.name.split(" ")[0] + " " + winner.entry.name.split(" ")[1]?.[0] + "."`.

---

## 3. Input Validation & Injection

### 🟡 [MEDIUM] Honeypot Uses CSS `hidden` Class

**File:** `src/components/forms/EntryForm.tsx:84`
```tsx
<input type="text" {...form.register("honeypot")} className="hidden" tabIndex={-1} autoComplete="off" />
```
**Vector:** The honeypot uses Tailwind's `.hidden` class (`display: none`). Sophisticated bots fill fields that are visually hidden but present in DOM.
**Fix:** Position off-screen instead: `className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none"`. Or add `aria-hidden="true"` to the container.

### ⚪ [INFO] XSS Protected by React's Auto-Escaping

**Files:** All TSX files render user data via `{variable}` — React JSX auto-escapes by default. No `dangerouslySetInnerHTML` usage found. **Safe by default.**

### ⚪ [INFO] SQL Injection Protected by Prisma

All queries use Prisma ORM with parameterized queries. No raw SQL found. **Safe by default.**

### ⚪ [INFO] VIN and Phone Validation is Strict

**File:** `src/schemas/entry.ts`
- VIN: `/^[A-HJ-NPR-Z0-9]{17}$/` — excludes I,O,Q, exactly 17 chars
- Phone: `/^[6-9]\d{9}$/` — valid Indian mobile prefix
**Good.** No injection possible through these fields.

---

## 4. Output Encoding & HTML Injection

### 🟡 [MEDIUM] Admin-Controlled Branch/Model Names Rendered Without Sanitization

**Vector:** Branch names, model names, and colour names come from the database (admin-managed). If an admin adds a branch named `<script>alert(1)</script>`, it would render as HTML.
**Impact:** Low risk since admin would need to be malicious to themselves, but if an attacker gains admin access, they could inject XSS into the public-facing form (`/enter/[slug]`).
**Fix:** Not a priority fix, but add a `stripHtml()` utility for any admin-managed content rendered on public pages.

---

## 5. Session & Cookie Security

### 🟠 [HIGH] Session Cookie Missing `sameSite` Attribute

**File:** `src/app/actions/auth.ts:15-19`
```ts
cookies().set("admin_session", "authenticated", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24,
});
```
**Impact:** No `sameSite` attribute means default is `Lax` in modern browsers, which is acceptable. But explicitly set it for clarity and future-proofing.
**Fix:** Add `sameSite: "lax"`.

### 🟡 [MEDIUM] `secure` Flag Disabled in Development

Same file as above. In dev (localhost via Vercel preview uses HTTPS), the cookie is sent over plain HTTP. Acceptable for dev but should be documented.

---

## 6. Security Headers & Server Config

### 🟠 [HIGH] No Security Headers Configured

**File:** `next.config.ts`
```ts
const nextConfig: NextConfig = { /* empty */ };
```
**Missing headers:**
| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Prevents XSS, data injection |
| `X-Frame-Options: DENY` | Prevents clickjacking |
| `X-Content-Type-Options: nosniff` | Prevents MIME sniffing |
| `Referrer-Policy: strict-origin-when-cross-origin` | Controls referrer leakage |
| `Permissions-Policy` | Restricts browser API access |
| `Strict-Transport-Security` | Enforces HTTPS |

**Fix:**
```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};
```

### 🟡 [MEDIUM] No CSP Header

**Impact:** Without CSP, if XSS is achieved, the attacker can exfiltrate data freely.
**Fix:** Start with a restrictive CSP and relax as needed:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';
```

---

## 7. Dependency & Build Security

### 🟡 [MEDIUM] `shadcn` Package in Runtime Dependencies

**File:** `package.json`
```json
"dependencies": { "shadcn": "^4.15.0", ... }
```
**Impact:** `shadcn` CLI package is installed as a runtime dependency. It should be a devDependency. Adds unnecessary weight and potential attack surface to production builds.
**Fix:** Move to `devDependencies`.

### 🟡 [MEDIUM] Zod v4 Compatibility Risk

**File:** `package.json` — `"zod": "^4.4.3"`
**Impact:** The plan specifies Zod. `@hookform/resolvers` bundles Zod v3 peer dependency. Zod v4 has breaking changes (`safeParse` still exists but types may differ). This could cause runtime errors.
**Fix:** Pin to `zod@^3.23` or verify full compatibility with `@hookform/resolvers`.

### 🔵 [LOW] `@base-ui/react` Dependency

**File:** `package.json` — `"@base-ui/react": "^1.6.0"`
**Impact:** This is a newer library (replaces Radix in shadcn base-nova). It's working currently but has a smaller community and may have undiscovered security issues.
**Fix:** Keep but monitor for updates. Consider pinning the version.

### 🔵 [LOW] No `npm audit` in CI

**File:** Missing from `eslint.config.mjs` and any CI config
**Impact:** Known vulnerabilities in dependencies won't be caught.
**Fix:** Add `npm audit --audit-level=high` to CI pipeline.

---

## 8. Infrastructure & Deployment

### 🟠 [HIGH] SQLite in Production (When Migrating to Postgres)

**Vector:** Currently using SQLite (`file:./dev.db`). Deployment to Vercel will lose all data on each deployment (ephemeral filesystem).
**Impact:** Zero data persistence in production.
**Fix:** Switch to Supabase (Postgres) before production deployment. Ensure `DATABASE_URL` points to Supabase in production environment.

### 🟡 [MEDIUM] No Database Backup Strategy

**Impact:** If database is corrupted or data is accidentally deleted, entries and winners are unrecoverable.
**Fix:** Enable Supabase point-in-time recovery for production. Document backup schedule.

### 🟡 [MEDIUM] No Data Retention / Deletion Policy

**Impact:** Entry data (PII) is stored indefinitely. No mechanism for data deletion if requested by a customer.
**Fix:** Add a data retention policy (e.g., delete entries 90 days after draw completes). Add admin action to delete an entry and all associated data.

### 🔵 [LOW] Environment Variable Fallbacks in Code

**Files:** `src/app/actions/auth.ts:7-8`
```ts
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nippontoyota.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "onam2026";
```
**Impact:** Fallbacks create a false sense of security. If the env var isn't set, the app silently uses defaults.
**Fix:** Throw on missing required env vars. Validate at startup.

---

## 9. Fraud Prevention (Missing Features)

### 🟠 [HIGH] No Rate Limiting on Entry Submission

**File:** Missing `src/lib/rate-limit.ts`
**Vector:** An attacker can submit thousands of entries in seconds, filling the database with spam.
**Fix:** Implement rate limiting (5/IP/min, 1/phone/10min) using Upstash Redis or in-memory Map for MVP. Reject early before DB write.

### 🟠 [HIGH] No Fraud Detection Logic

**File:** Missing `src/lib/fraud.ts`
**Vector:** Four flag conditions defined in spec (§10.3) — none implemented:
- Same phone, different branches within 5 min → `MULTI_BRANCH_PHONE`
- Name is placeholder text → `SUSPICIOUS_NAME`
- Same IP, different phones within 2 min → `MULTI_PHONE_DEVICE`
- VIN has repeated/sequential pattern → `SUSPICIOUS_VIN`
**Fix:** Implement `assessEntry()` that checks all 4 before saving.

### 🟡 [MEDIUM] No CAPTCHA on Entry Form

**Vector:** Only a CSS-based honeypot stands between the form and bots.
**Fix:** The spec explicitly chose not to use CAPTCHA (§5.1): *"CAPTCHA is not used on the customer-facing form, as it adds friction."* Acceptable if rate limiting + honeypot are robust. But honeypot alone is insufficient.

---

## 10. Missing Features (Plan Compliance)

### 🟠 [HIGH] WhatsApp Confirmation Not Implemented

**Files:** Missing `src/lib/doubletick.ts` and WhatsApp queue
**Spec reference:** §8 — WhatsApp confirmation via DoubleTick with retry queue.
**Vector:** Customers receive no confirmation of their entry. Loss of trust.
**Fix:** Implement `sendWhatsAppMessage()`, create `WhatsAppLog` entry on submission, implement retry cron.

### 🟡 [MEDIUM] Draw Action Doesn't Update `drawStatus`

**File:** `src/app/actions/draw.ts`
**Vector:** Draws winners but never sets `Branch.drawStatus = "COMPLETED"`. The branch stays `PENDING` perpetually.
**Fix:** After drawing all 3 winners, update `Branch.drawStatus`.

### 🔵 [LOW] Draw Function Draws One at a Time (Not Atomic)

**File:** `src/app/actions/draw.ts`
**Vector:** `drawWinner()` draws one winner for one place. Requires 3 separate calls. Not atomic — if the second call fails, the branch is in an inconsistent state.
**Fix:** Create `runFullDraw(branchId)` that selects 3 winners in a single Prisma transaction.

### 🔵 [LOW] Seed Script Uses Standalone PrismaClient

**File:** `prisma/seed.ts:3`
```ts
const prisma = new PrismaClient(); // standalone, not from @/lib/prisma
```
**Fix:** Import from `@/lib/prisma` for consistency.

---

## 11. Code Correctness

### 🟡 [MEDIUM] `useActionState` Imported but Unused

**File:** `src/app/admin/login/page.tsx:3`
```ts
import { useActionState, useEffect, useState } from "react";
```
`useActionState` and `useEffect` are imported but never used. This is dead code.
**Fix:** Remove unused imports.

### 🟡 [MEDIUM] EntryForm Redirect Uses `window.location.href`

**File:** `src/components/forms/EntryForm.tsx:63`
```ts
window.location.href = `/confirmation/${result.id}`;
```
**Vector:** Hard redirect loses form state on error. If `result.id` is undefined (edge case), user is redirected to `/confirmation/undefined`.
**Fix:** Use `useRouter().push()` from `next/navigation`. Guard against missing `id`.

### 🔵 [LOW] Layout Metadata Still Shows "Create Next App"

**File:** `src/app/layout.tsx:16-17`
```ts
title: "Create Next App",
description: "Generated by create next app",
```
**Fix:** Change to `"Nippon Toyota Onam Lucky Draw"`.

### 🔵 [LOW] No `loading` or `error` States on Admin Dashboard

**File:** `src/app/admin/dashboard/page.tsx`
**Vector:** This is an async server component — if DB query fails, it throws an unhandled error (Next.js error boundary catches it, but UX is poor).
**Fix:** Wrap in `try/catch` and render helpful message, or use `error.tsx` boundary file.

---

## 12. Git & Repository Hygiene

### 🟠 [HIGH] SQLite Database File in Git History Risk

**File:** `prisma/dev.db` exists but `.gitignore` now has `dev.db` — **but no commits exist yet**.
**Fix:** Before first commit, verify `dev.db` is properly gitignored. After commit, scrub if needed.

### 🟡 [MEDIUM] Design Inspiration Files in Project Root

**File:** `design_inspiration/` — contains reference designs from ZIP.
**Fix:** Exclude from git (add to `.gitignore`) before first commit.

### 🟡 [MEDIUM] Agent/IDE Config Files Clutter Root

**Files:** `.agents/`, `.claude/`, `.windsurf/`, `.qodo/`
**Fix:** Add to `.gitignore` or move to user home directory.

### 🔵 [LOW] No `.nvmrc` or `.node-version`

**File:** Missing
**Fix:** Add `.nvmrc` with `20` to ensure consistent Node version across environments.

---

## 13. Dependency Vulnerability Summary

| Package | Version | Risk |
|---------|---------|------|
| `next` | 16.2.12 | Latest, unknown CVEs |
| `zod` | ^4.4.3 | Compatibility with `@hookform/resolvers` |
| `@base-ui/react` | ^1.6.0 | New library, small community |
| `shadcn` | ^4.15.0 | Should be devDependency |
| `tailwindcss` | ^4 | Tailwind v4 ecosystem maturity |
| `prisma` | ^6.4.1 | Stable, well-audited |

**No known critical vulnerabilities in direct dependencies.** Run `npm audit` before production deployment.

---

## Fix Priority Matrix

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| P0 | Forgeable admin cookie (sign or Supabase) | 1-2d | 🔴 CRITICAL |
| P0 | Hardcoded password fallback | 10min | 🔴 CRITICAL |
| P1 | Security headers (next.config.ts) | 30min | 🟠 HIGH |
| P1 | Rate limiting on submission | 1d | 🟠 HIGH |
| P1 | Fraud detection | 1d | 🟠 HIGH |
| P1 | Admin dashboard PII masking | 1h | 🟠 HIGH |
| P1 | WhatsApp confirmation | 2d | 🟠 HIGH |
| P2 | DB migration SQLite → Postgres | 1d | 🟠 HIGH |
| P2 | CSP header | 30min | 🟡 MEDIUM |
| P2 | CSRF protection on login form | 15min | 🟡 MEDIUM |
| P2 | Honeypot improvement (off-screen) | 5min | 🟡 MEDIUM |
| P2 | Entry URL obfuscation (nanoid) | 30min | 🟡 MEDIUM |
| P2 | `shadcn` → devDependencies | 2min | 🟡 MEDIUM |
| P3 | Middleware for admin routes | 30min | 🔵 LOW |
| P3 | Layout title fix | 1min | 🔵 LOW |
| P3 | Unused import cleanup | 2min | 🔵 LOW |
| P3 | `.nvmrc` + `.gitignore` cleanup | 10min | 🔵 LOW |
| P3 | Draw function atomic transaction | 1h | 🔵 LOW |

---

**Next action:** Fix P0 before any commit. Then P1 in order. P2 and P3 can follow.
