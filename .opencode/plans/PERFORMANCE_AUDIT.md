# Performance, Latency & Error Audit — Nippon Toyota Lucky Draw

> **Audit date:** 2026-07-27 | **Mode:** Read-only analysis of every request path

---

## Summary

| Category | Issues Found | Impact |
|----------|-------------|--------|
| 🔴 Database query performance | 5 | Slow under load |
| 🟠 Server rendering | 3 | Waterfall requests, no streaming |
| 🔵 Client-side re-renders | 3 | Unnecessary CPU cycles |
| 🔵 Bundle size | 3 | Moderate, acceptable for MVP |
| 🟠 Error/edge-case handling | 4 | Race condition in draw, memory leak, redirect loop |
| 🔴 Caching strategy | 3 | Every page hits DB on every request |
| **Total** | **21** | |

---

## 1. Database Query Performance

### 🔴 Sequential Queries in Submission Path

**File:** `src/app/actions/entry.ts`
**Path:** `submitEntry` → `checkRateLimit` (sync) → `prisma.branch.findUnique` → `prisma.entry.findUnique` (phone) → `prisma.entry.findUnique` (VIN) → `assessEntry` (2 queries) → `prisma.$transaction` (2 writes)
**Count:** **5 sequential queries + 1 transaction** on every submission.
**Impact:** With SQLite, this is ~20ms total. With Postgres (Supabase) over network, this becomes 150-300ms of sequential latency.
**Fix:** Combine phone + VIN uniqueness into a single query: `prisma.entry.findMany({ where: { OR: [{ phone }, { vin }] } })`. Parallelize branch lookup with uniqueness check.

### 🔴 Missing Index on `Entry.ip`

**File:** `prisma/schema.prisma:59` — `ip String?`
**Query:** `src/lib/fraud.ts:36` — `prisma.entry.findMany({ where: { ip, createdAt: { gte: twoMinsAgo } } })`
**Scale:** Tablescan on `Entry` by `ip` column. With 10K+ entries, each fraud check scans all rows.
**Fix:** Add `@@index([ip])` to Entry model.

### 🔴 Missing Composite Index for Draw Query

**File:** `src/app/actions/draw.ts:27-33`
**Query:**
```ts
prisma.entry.findMany({
  where: { branchId, flag: null, winner: null }
});
```
**Impact:** Scans entries by `branchId` index, then filters `flag` and `winner` in memory.
**Fix:** Add `@@index([branchId, flag, winnerId])` — but `winner` is a relation, not a column. Actual filter is `winner: null` which translates to `winnerId IS NULL`. Add explicit `winnerId` field or index `[branchId, flag]`.

### 🟠 Missing Index on `Winner.branchId`

**File:** `prisma/schema.prisma:77`
**Query:** `prisma.winner.findMany({ where: { branchId } })` in draw.ts
**Impact:** Without index, table scan. With 10K winners across branches, slow.
**Fix:** Add `@@index([branchId])` to Winner model.

### 🟠 Missing Index on `Entry.createdAt`

**File:** `prisma/schema.prisma:63`
**Queries:** Fraud detection filters by `createdAt >= X`. Without index, scans all recent entries.
**Fix:** Add `@@index([createdAt])` or composite `@@index([branchId, createdAt])`.

---

## 2. Server Rendering & Data Fetching

### 🔴 All Pages Are Fully Dynamic — Zero Caching

**Files:**
- `src/app/enter/[slug]/page.tsx` — hits DB on every request
- `src/app/winners/page.tsx` — hits DB on every request
- `src/app/confirmation/[id]/page.tsx` — hits DB on every request
- `src/app/admin/dashboard/page.tsx` — hits DB on every request

**Impact:** Winners data changes once (when draw runs). Entry forms for a branch are identical until admin modifies models/colours. No caching means unnecessary DB load.
**Fix:**
- Winners page: `export const revalidate = 300` (revalidate every 5 min). Or use `generateStaticParams` + ISR.
- Models/colours list: cache in Redis or use Next.js `unstable_cache` with Prisma.
- Confirmation page: no cache (correct — one-time view).

### 🟠 Sequential Queries in EnterPage

**File:** `src/app/enter/[slug]/page.tsx:11-26`
```ts
const branch = await prisma.branch.findUnique(...);
// ... wait for branch ...
const modelsData = await prisma.model.findMany(...);
```
**Impact:** The model/colour query waits for the branch query. These are independent.
**Fix:** Run both queries in parallel:
```ts
const [branch, modelsData] = await Promise.all([
  prisma.branch.findUnique(...),
  prisma.model.findMany(...),
]);
```

### 🔵 No Loading or Error Boundaries

**Files:** Missing `loading.tsx` and `error.tsx` in `/enter/[slug]`, `/winners`, `/confirmation/[id]`, `/admin/dashboard`
**Impact:** If a query takes 2+ seconds (cold start on Vercel serverless), user sees blank page. If query throws, user sees Next.js default error (white screen with stack in dev).
**Fix:** Add `loading.tsx` with skeleton UI per route group. Add `error.tsx` with branded error message and retry button.

---

## 3. Client-Side Performance

### 🔵 QR Code Generated on Every Confirmation Render

**File:** `src/components/forms/ConfirmationScreen.tsx:27-39`
**Issue:** `QRCode.toDataURL()` runs on every mount. A 200px QR at default error correction takes ~300-500ms on mobile.
**Impact:** Adds 0.5s of JavaScript execution time. Blocks main thread.
**Fix:** Generate QR server-side and pass as `data:` URL prop. Or use a Web Worker. Or memoize the generation.

### 🔵 useEffect Cleanup Missing

**File:** `src/components/forms/ConfirmationScreen.tsx:27-39`
**Issue:** If component unmounts before `QRCode.toDataURL()` resolves, the callback fires on unmounted component (React 19 strict mode will warn/warn in dev).
**Fix:**
```ts
useEffect(() => {
  let cancelled = false;
  QRCode.toDataURL(url).then(url => { if (!cancelled) setQrCode(url); });
  return () => { cancelled = true; };
}, [entryId]);
```

### 🔵 EntryForm Re-renders on Every Keystroke

**File:** `src/components/forms/EntryForm.tsx:51`
```ts
const selectedModelId = form.watch("modelId");
const selectedModel = models.find(...);
const availableColours = ...;
```
**Issue:** `form.watch("modelId")` subscribes to all form changes. Every keystroke in any field triggers re-execution of `find()` on the models array and a re-render.
**Impact:** ~8 models × ~5 colours = negligible. Not a real perf issue — but worth noting for scaling.
**Fix:** Use `useWatch({ name: "modelId" })` with explicit control, or split into sub-component.

---

## 4. Bundle Size

### 🟡 `@base-ui/react` ~50KB gzipped

**File:** `package.json`
**Usage:** Button (line 2 of button.tsx), Input (line 2 of input.tsx), Select (line 4 of select.tsx), Toast (line 4 of toast.tsx)
**Impact:** Full component library for 4 basic UI elements. In 2026, `@base-ui` is the standard Radix replacement for shadcn — acceptable.
**Fix:** No action needed. Standard for shadcn base-nova style.

### 🔵 Unused SVGs in `public/`

**Files:** `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`
**Impact:** 3.3KB total. Not served to users unless referenced. But Next.js doesn't auto-serve from `public/` unless explicitly fetched.
**Fix:** Delete unused SVGs to keep project clean.

### 🔵 Zod v4 + Resolvers Bundle

**Impact:** Zod v4 (~12KB gzipped) + `@hookform/resolvers` (~3KB) + `react-hook-form` (~10KB) = ~25KB form validation stack. Standard and expected.

---

## 5. Error & Edge-Case Handling

### 🟠 Race Condition in Draw Winner

**File:** `src/app/actions/draw.ts:14-63`
**Issue:** `drawWinner` checks existing winners (line 14), then creates winners (line 49). Between these two, if two admin dashboards click "Draw" simultaneously:
1. Request A checks → 0 winners → proceeds
2. Request B checks → 0 winners → proceeds
3. Request A creates 3 winners
4. Request B creates 3 winners (DUPLICATE — `@@unique([branchId, place])` violation)

The `@@unique` constraint will prevent actual duplicates by throwing a Prisma error, but the user sees "error occurred" instead of "already drawn".
**Fix:** Move the existing-winner check inside the transaction. Or use `prisma.branch.update({ where: { id, drawStatus: "PENDING" }, data: { drawStatus: "DRAWING" } })` as an atomic lock.

### 🟠 Redirect Loop on Malformed Cookie

**File:** `src/app/admin/dashboard/layout.tsx:11-13`
**Path:** User visits `/admin/dashboard` with cookie `admin_session=invalid_jwt` → `decrypt` returns null → `isAuthenticated` returns false → `redirect("/admin/login")` → login page → user logs in again → works.
**Issue:** If `decrypt()` throws instead of returning null, the layout crashes. Currently `decrypt` catches everything and returns null — safe.
**Edge case:** If someone manually edits the cookie to a non-JWT value, they get redirected to login. This is correct behavior.

### 🔵 No `error.tsx` Boundaries

**Files:** Missing `src/app/error.tsx`, `src/app/enter/error.tsx`, `src/app/admin/error.tsx`
**Issue:** Any unhandled Promise rejection or DB timeout shows Next.js default error page (minimal branding).
**Fix:** Add route-group-level `error.tsx`.

### 🔵 Rate Limiter Resets on Cold Start

**File:** `src/app/actions/entry.ts:10-11`
```ts
const ipRequests = new Map<string, { count: number; expiresAt: number }>();
```
**Issue:** On Vercel serverless, maps are lost on cold start. A new instance starts fresh every ~5 minutes of inactivity. Rate limiting effectively doesn't work for burst attacks.
**Fix:** Move to Upstash Redis (already was in original dependency list) or use Supabase DB-backed counter.

---

## 6. Caching Strategy

| Page | Current | Should Be | Because |
|------|---------|-----------|---------|
| `/enter/[slug]` | Dynamic, every request | **ISR with 60s revalidate** | Models/colours change only via admin. Branch data static |
| `/winners` | Dynamic, every request | **ISR with 300s revalidate** | Winners change only when draw runs (rare) |
| `/confirmation/[id]` | Dynamic, every request | **Dynamic (correct)** | One-time per-user view |
| `/admin/dashboard` | Dynamic, every request | **Dynamic (correct)** | Admin needs fresh data |

**Fix for enter/[slug]:** `export const revalidate = 60` in the page file. Models/colours cached for 1 min. Stale OK since this is an entry form, not trading data.

**Fix for winners:** `export const revalidate = 300` — winners page is public, rarely changes, 5-min stale is fine.

---

## 7. Simplified Request Path

### `/enter/[slug]` (Customer form page)

```
Request → EnterPage (RSC)
           ├── await branch.findUnique({ slug })        ← sequential, could parallelize
           ├── await model.findMany({ include: colours }) ←
           └── Render EntryForm (client component)
                 └── bundle: react-hook-form + zod + resolvers + @base-ui + lucide
```

### `/confirmation/[id]` (Post-submit page)

```
Request → ConfirmationPage (RSC)
           ├── await entry.findUnique({ include: [branch, model, colour] })
           └── Render ConfirmationScreen (client component)
                 ├── useEffect → QRCode.toDataURL (300-500ms blocking)
                 └── Display entry data
```

### `submitEntry` (Server Action)

```
Client POST → submitEntry
              ├── Zod parse (0.1ms)
              ├── checkRateLimit (Map, 0.01ms)
              ├── prisma.branch.findUnique({ slug })      ← 1st DB query
              ├── prisma.entry.findUnique({ phone })      ← 2nd DB query
              ├── prisma.entry.findUnique({ vin })        ← 3rd DB query
              ├── assessEntry():
              │     ├── prisma.entry.findMany({ phone })  ← 4th DB query
              │     └── prisma.entry.findMany({ ip })     ← 5th DB query
              └── prisma.$transaction():
                    ├── tx.entry.create()                 ← 1st write
                    └── tx.whatsAppLog.create()           ← 2nd write
```

**Total: 5 queries + 2 writes per submission.** With SQLite: ~25ms. With Postgres over network: ~200-400ms.

---

## Priority Fix Matrix

| # | Severity | Issue | Fix | Effort |
|---|----------|-------|-----|--------|
| 1 | 🔴 | Race condition in draw.ts | Move winner check inside transaction or use atomic `drawStatus` lock | 30min |
| 2 | 🔴 | Missing index on `Entry.ip` | `@@index([ip])` | 5min |
| 3 | 🔴 | Missing composite index for draw query | `@@index([branchId, flag])` | 5min |
| 4 | 🔴 | No caching on winners/enter pages | `revalidate = 300` / `revalidate = 60` | 5min |
| 5 | 🟠 | 5 sequential DB queries in submission | Combine phone+vin uniqueness, parallelize branch query | 30min |
| 6 | 🟠 | Sequential queries in EnterPage | `Promise.all` for branch + models | 5min |
| 7 | 🟠 | QR code blocks main thread | Server-side QR generation or Web Worker | 1h |
| 8 | 🟠 | Rate limiter resets on cold start | Use Upstash Redis or DB counter | 1h |
| 9 | 🔵 | Missing `error.tsx` and `loading.tsx` | Add per-route error/loading boundaries | 30min |
| 10 | 🔵 | Missing index on Winner.branchId | `@@index([branchId])` | 5min |
| 11 | 🔵 | QR useEffect cleanup | Add abort/cancel flag | 5min |
| 12 | 🔵 | Unused SVG files in public/ | Delete 5 files | 1min |

---

## Verdict

**Perf & error readiness: 7/10.** The app works correctly and won't crash, but has a real race condition in the draw action (mitigated by DB constraint, not logic). Under production load with Supabase/Postgres, the 5 sequential queries per submission will add 200-400ms latency. Caching is entirely absent — every page is a full DB hit.

**Fix top 4 items** before production launch:
1. Draw race condition
2. Missing indexes
3. Caching on winners page
4. Parallelize enter page queries
