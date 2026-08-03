# Remove branches — org-wide single QR & single winner

**Date:** 2026-08-03  
**Target DB:** Supabase project `ziypoxapyytysanjhkel`  
**Status:** Approved in brainstorming; awaiting user review of this spec

## Goal

Nippon Toyota uses **one QR** for the whole org (`/enter`). There are no showroom branches. The lucky draw has **exactly one winner** total.

Remove every branch concept from the database, admin UI, entry flow, draws, export, fraud, WhatsApp, seed, and realtime.

## Non-goals

- Visual polish of unrelated admin pages
- Changing Models CRUD
- Rewriting WhatsApp copy beyond dropping `branchName`
- Keeping historical per-branch winners (data is wiped)

## Data model

### Drop / change

| Change | Detail |
|--------|--------|
| Drop `Branch` | Remove model and `branches` table |
| `Entry` | Remove `branchId` FK and branch-related indexes |
| `Winner` | Remove `branchId`; keep `entryId` (unique); `place` remains but only `1` is used; add `@unique` on `place` so at most one winner |
| No Campaign table | “Draw completed” = a `Winner` row exists |

### Destructive production data (required)

1. `DELETE` all `winners`
2. `DELETE` all `entries` (and dependent `whatsapp_logs` as needed)
3. Drop FKs / `branchId` columns, then drop `branches`

Apply via Prisma migrate using `DIRECT_URL` against `ziypoxapyytysanjhkel` only.

## Product / UI

### Admin

- Remove Branches nav item and `/admin/dashboard/branches` (plus `BranchesClient`, create/delete branch actions)
- **Draw dashboard:** one “Run draw” card + **Universal QR** card (no branch grid)
- **Entries:** flat list (no group-by-branch)
- Realtime: stop listening to `branches`; keep entries/winners if still useful

### Public

- Keep `/enter` as the only entry URL
- Remove `/enter/[branchId]` legacy route
- Confirmation: drop `branchName`
- `/winners`: show the single winner (no branch grouping)
- `EntryForm` / `submitEntry`: no `branchId`

## Draw behavior

- `drawWinner()` takes no `branchId`
- Eligible: `excluded = false`, entry not already a winner
- Pick **one** random eligible entry → create `Winner` with `place = 1`
- If a winner already exists → reject (“draw already completed”)
- Concurrency: transaction + unique on `place`; treat unique violation as already drawn

## Downstream cleanups

- Fraud: remove `MULTI_BRANCH_PHONE` and other-branch checks
- Export CSV: drop Branch column and `?branch=` filter
- WhatsApp cron: stop including `branchName`
- Seed: no showrooms / no universal branch
- Smoke tests: drop branch assertions; align with one-winner draw
- Env: remove `DEFAULT_ENTRY_BRANCH_ID` usage from `entry-config`

## Deploy order

1. Apply destructive migration to Supabase `ziypoxapyytysanjhkel` (`DIRECT_URL`)
2. Deploy app code that no longer references branches
3. Redeploy Vercel production

## Success criteria

- [ ] No `branches` table; no `branchId` columns
- [ ] Entries and winners tables empty after migration (fresh campaign)
- [ ] Admin has no Branches page; QR lives on Draw dashboard
- [ ] Form submits without branch
- [ ] Draw produces exactly one org-wide winner and cannot be re-run
- [ ] Public `/winners` shows that one winner
