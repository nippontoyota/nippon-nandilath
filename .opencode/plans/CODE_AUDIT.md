# Nippon Toyota Lucky Draw — Code Audit

> **Status:** Plan mode — read-only audit completed 2026-07-27
> **Scope:** All source files in `E:\Projects\NipponToyota\nippon-luckydraw`
> **Plan compliance:** IMPLEMENTATION_PLAN.md

---

## [CRITICAL] EntryForm.tsx — Broken Component

**File:** `src/components/forms/EntryForm.tsx`
**Evidence:** Line 10 reads `// ... skipping to onSubmit` — a placeholder comment instead of the component function declaration. The entire `export function EntryForm(...)` wrapper is missing.

**Symptoms:**
- `tsc --noEmit` yields: `error TS1128: Declaration or statement expected` at line 168,1
- Missing imports: `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Label`, `Input`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` (all used in JSX but not imported)
- Missing props: `{ branchId: string; branchName: string; models: ModelWithColours[] }` — `{branchName}`, `{models}`, `{colours}` referenced but never defined
- Missing `useState` for `loading` — `setLoading(true)` on line 12 references undefined
- Missing `useForm` setup — `form.handleSubmit`, `form.register`, `form.formState`, `form.watch`, `form.setValue` all referenced but `form` never declared
- Missing `selectedModelId` — used on line 114 to disable colour dropdown but never computed from `form.watch("modelId")`

**Fix:** Rewrite entire component with correct hooks, imports, props interface, and model/colour filtering logic per IMPLEMENTATION_PLAN.md §6.2–6.3.

---

## [HIGH] Entry Form UI — Missing Model/Colour Filtering

**File:** `src/components/forms/EntryForm.tsx`
**Issue:** JSX references `{models.map(...)}`, `{colours.map(...)}`, `disabled={!selectedModelId}` but none exist. Component needs to:
1. Accept `models` as prop (array with nested colours)
2. Derive `selectedModelId` from `form.watch("modelId")`
3. Derive `colours` by filtering: `models.find(m => m.id === selectedModelId)?.colours`
4. Reset `colourId` when `modelId` changes

---

## [HIGH] package.json — Incorrect Project Name

**File:** `package.json`
**Issue:** `"name": "temp_app"` — leftover from scaffolding.
**Fix:** Change to `"name": "nippon-luckydraw"`.

---

## [HIGH] submitEntry Action — Missing IP and User Agent Capture

**File:** `src/app/actions/entry.ts`
**Issue:** Entry schema defines `ip` and `userAgent` fields. `submitEntry` never captures them from request headers. This breaks `MULTI_PHONE_DEVICE` fraud detection (IMPLEMENTATION_PLAN.md §10.3).

**Fix:** Extract IP from `headers().get("x-forwarded-for")` and userAgent from `headers().get("user-agent")`, store in entry creation.

---

## [HIGH] submitEntry — Uses `alert()` for Error Feedback

**File:** `src/components/forms/EntryForm.tsx` line 16
**Issue:** `alert(result.error)` — blocks UX, doesn't integrate with form. Should show inline error.
**Fix:** Use `form.setError("root", ...)` or render error state in component.

---

## [MEDIUM] .gitignore — Blocks .env.example

**File:** `.gitignore` line 34
**Issue:** `env*` matches `.env.example`, preventing it from being committed.
**Spec reference:** IMPLEMENTATION_PLAN.md §4.4 — commit `.env.example` as documented template.
**Fix:** Change to explicit list:
```
.env
.env.local
.env.production
.env.*.local
```

---

## [MEDIUM] Package.json — Stale Dependencies

**File:** `package.json`
**Unused packages (leftover from Prisma v7 experiment):**
- `@prisma/adapter-libsql` — not used with Prisma v6
- `@libsql/client` — not used with Prisma v6
- `@types/better-sqlite3` — not used with Prisma v6
- `@base-ui/react` — shadcn transitive, not used in source
- `@supabase/supabase-js` — installed but unused (MVP uses cookie auth)
- `@upstash/redis` — installed but rate limiting not implemented

**Fix:** `npm uninstall @prisma/adapter-libsql @libsql/client @types/better-sqlite3 @base-ui/react`

---

## [MEDIUM] Missing Admin Pages Referenced in Sidebar

**File:** `src/app/admin/dashboard/layout.tsx` lines 28–38
**Issue:** Sidebar links to `/admin/dashboard/entries`, `/admin/dashboard/branches`, `/admin/dashboard/settings` — none exist. Will 404.

**Spec reference:** IMPLEMENTATION_PLAN.md §7.3–7.5
**Fix:** Create page files or remove sidebar links.

---

## [MEDIUM] Homepage — Next.js Boilerplate

**File:** `src/app/page.tsx`
**Issue:** Shows "To get started, edit the page.tsx file" with Vercel/Docs links.
**Fix:** Redirect to `/enter/some-branch`, show branded landing, or return 404.

---

## [MEDIUM] Confirmation QR Code — Wrong Content

**File:** `src/components/forms/ConfirmationScreen.tsx` line 20
**Issue:** QR encodes raw `entryId` (internal cuid). A customer scanning this gets nothing useful.
**Fix:** QR should encode full confirmation URL: `https://nippontoyota-onam.vercel.app/confirmation/${entryId}`.

---

## [MEDIUM] ConfirmationScreen — Missing Branch Details

**File:** `src/components/forms/ConfirmationScreen.tsx`
**Issue:** Props `{ entryId, name }` insufficient. Per spec §6.5, show branch name, model/colour, VIN, announcement date.
**Fix:** Pass full entry + branch data to component.

---

## [MEDIUM] DATABASE_URL Path Ambiguity

**Files:** `.env`, `prisma/schema.prisma`
**Issue:** `DATABASE_URL="file:./dev.db"` — resolves to project root. Both `./dev.db` and `prisma/dev.db` exist on disk.
**Fix:** Pick one. Recommended: `DATABASE_URL="file:./prisma/dev.db"` or add root `dev.db` to `.gitignore`.

---

## [MEDIUM] Branch ID Stored Client-Side (Tamperable)

**File:** `src/components/forms/EntryForm.tsx` line 44
**Issue:** `<input type="hidden" {...form.register("branchId")} />` — branchId set by server could be modified client-side.
**Fix:** Remove `branchId` from form; server action derives branch from slug/params.

---

## [LOW] Admin Auth — Cookie-Based MVP Too Simple

**File:** `src/app/actions/auth.ts`
**Issue:** Hardcoded admin email/password. Cookie `admin_session=authenticated` is trivially forged.
**Spec reference:** IMPLEMENTATION_PLAN.md §7.1 — Supabase Auth with email restriction.
**Fix:** Implement Supabase Auth or use signed/encrypted session cookie.

---

## [LOW] Draw Function Draws One Winner at a Time

**File:** `src/app/actions/draw.ts`
**Issue:** `drawWinner(branchId, place)` draws 1 winner for 1 place. Spec §9 says all 3 winners in one transaction with Fisher-Yates shuffle.
**Fix:** Create `runDraw(branchId)` that selects 3 winners in a single transaction.

---

## [LOW] No Middleware for Admin Route Protection

**File:** Missing `src/middleware.ts`
**Issue:** No edge-level middleware to reject unauthenticated admin requests early.
**Spec reference:** IMPLEMENTATION_PLAN.md §7.1
**Fix:** Add `middleware.ts` checking `admin_session` cookie.

---

## [LOW] No Rate Limiting Implemented

**File:** Missing `src/lib/rate-limit.ts`
**Spec reference:** IMPLEMENTATION_PLAN.md §10.1 — 5 submissions/IP/min, 1 submission/phone/10 min.
**Fix:** Implement with Upstash Redis (already installed) or in-memory Map for MVP.

---

## [LOW] No Fraud Detection Logic

**File:** Missing `src/lib/fraud.ts`
**Spec reference:** IMPLEMENTATION_PLAN.md §10.3 — 4 flag conditions: MULTI_BRANCH_PHONE, SUSPICIOUS_NAME, MULTI_PHONE_DEVICE, SUSPICIOUS_VIN.
**Fix:** Implement `assessEntry()` returning `{ flag: FlagType | null, reason: string | null }`.

---

## [LOW] No WhatsApp/Retry Queue

**Files:** Missing `src/lib/doubletick.ts` and WhatsAppLog usage
**Spec reference:** IMPLEMENTATION_PLAN.md §8
**Fix:** On entry creation, insert into `WhatsAppLog` with `PENDING`. Implement retry cron.

---

## [LOW] Admin Draw Controls — Doesn't Update Branch drawStatus

**File:** `src/app/actions/draw.ts`
**Issue:** Branch model has `drawStatus` field but draw action never updates it.
**Fix:** After 3rd winner, update `Branch.drawStatus = "COMPLETED"`.

---

## [LOW] Seed Script — Direct PrismaClient Instead of Singleton

**File:** `prisma/seed.ts`
**Issue:** Uses `new PrismaClient()` directly instead of singleton from `@/lib/prisma`.
**Fix:** Import from `@/lib/prisma` for consistency.

---

## [LOW] design_inspiration/ in Project Root

**File:** `design_inspiration/`
**Issue:** Design reference files from ZIP should not be in production repo.
**Fix:** Move to `.docs/` or add to `.gitignore`.

---

## [LOW] IDE Config Files in Root

**Files:** `.claude/`, `.windsurf/`, `.agents/`, `.qodo/`
**Issue:** Individual developer tooling configuration in project root.
**Fix:** Move to user home directory or add to `.gitignore`.

---

## [LOW] Tailwind v4 — shadcn/ui Compatibility Risk

**File:** `src/app/globals.css`
**Issue:** Uses `@import "tailwindcss"` (v4 syntax). shadcn/ui `base-nova` designed for Tailwind v3.
**Fix:** Verify all shadcn components render. Pin `tailwindcss@3` if issues.

---

## Summary

| Severity | Count | Action |
|----------|-------|--------|
| CRITICAL | 1 | Broken file — must rewrite |
| HIGH | 4 | Missing logic, incorrect behavior |
| MEDIUM | 8 | Plan deviations, missing features |
| LOW | 9 | Edge cases, cleanup, polish |

**Total: 22 issues found before first commit.**

No commits exist yet — ideal time to fix. Prioritize CRITICAL → HIGH → MEDIUM before adding new features.
