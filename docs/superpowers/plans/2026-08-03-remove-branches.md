# Implementation plan — remove branches

Spec: `docs/superpowers/specs/2026-08-03-remove-branches-design.md`

## Steps

1. **Schema + migration** — Drop `Branch`; strip `branchId` from Entry/Winner; `Winner.place` unique; destructive wipe of winners/entries/whatsapp_logs then branches.
2. **Config / fraud / schemas** — Remove `DEFAULT_ENTRY_BRANCH_ID`; drop multi-branch fraud; zod `branchId`.
3. **Actions** — Slim `submitEntry`; rewrite `drawWinner` (1 winner); delete branch CRUD from `admin.ts`.
4. **Admin UI** — Delete branches page/components; Draw page = QR + single draw card; flatten entries; nav; realtime.
5. **Public** — EntryForm/enter page; delete `/enter/[branchId]`; confirmation; `/winners`.
6. **API / seed / smoke** — Export, WhatsApp cron, seed, smoke-test.
7. **Migrate prod DB** (`ziypoxapyytysanjhkel` via DIRECT_URL) + redeploy Vercel.

## Verify

- `npx prisma validate` / migrate succeeds
- Local or smoke: submit entry without branch; draw once; second draw fails
- `/admin/dashboard/branches` → 404; QR on draw page
