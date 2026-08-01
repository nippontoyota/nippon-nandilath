# IMPLEMENTATION PLAN: Nippon Toyota Onam Lucky Draw

## Phase 0 — Schema & Infrastructure (P0)

### 0.1 Add `excluded` boolean to Entry model
- `prisma/schema.prisma` — add `excluded Boolean @default(false)`
- `prisma/seed.ts` — update seed type
- Migration: `npx prisma migrate dev --name add_excluded_flag`

### 0.2 Fix phone normalization
- `src/app/actions/entry.ts` — normalize `phone` to `+91XXXXXXXXXX` before uniqueness check
- `src/schemas/entry.ts` — validate 10-digit Indian, strip +91 if user provides it
- Existing entries: run one-off migration script (or manual SQL)

### 0.3 Wire proxy as middleware
- Move `src/proxy.ts` → `src/middleware.ts`
- Next.js requires `src/middleware.ts` for edge middleware
- Verify middleware.ts exports `config` matcher for all routes

### 0.4 Fix flag display on entries page
- `src/app/admin/dashboard/entries/page.tsx` — `flag` is JSON stringified array for multi-flag entries; parse and render as badges
- Current: shows raw JSON string. Fix: `JSON.parse(entry.flag ?? '[]')`

## Phase 1 — Full Toyota Model/Colour Catalogue + Admin UI (P1)

### 1.1 Build Admin Colour Management Page
- New route: `src/app/admin/dashboard/models/page.tsx`
- Server action: `src/app/actions/models.ts` — CRUD operations
  - `getModels()` — all models with colours
  - `addModel(name)` + `addColour(modelId, name, hex?)`
  - `editColour(id, name, hex?)`
  - `deleteColour(id)` / `deleteModel(id)` (with guard if entries reference it)
- UI: table of models → expandable colour rows → inline add/edit/delete
- Sync model/colour dropdowns on entry form (branch page re-fetches on mount)

### 1.2 Fetch + Seed Full Toyota India Catalogue
Replace `prisma/seed.ts` with all 13 Toyota India models + colours:

| Model | Colours |
|-------|---------|
| **Fortuner** | Super White, Attitude Black, Graphite Grey, Phantom Brown, Pearl White, Bronze Mica, Sparkling Black Crystal Shine |
| **Innova Crysta** | Super White, Silver, Attitude Black, Graphite Grey, Champagne, Grey Metallic, White Pearl, Mica Brown |
| **Innova HyCross** | Platinum White Pearl, Midnight Black, Sparkling Black Crystal Shine, Mystic Bronze, Golden Bronze, Avant Garde Bronze, Carnival Amber, Tyrol Silver Gray, Cyan Kyanite |
| **Camry** | Attitude Black, Silver, Graphite Grey, Platinum White Pearl, Ruby Flare Red, Precious Metal |
| **Hilux** | Super White, Attitude Black, Graphite Grey, Silver, Orange Metallic |
| **Glanza** | Sportin Red, Gaming Grey, Sterling Silver, Sizzling Yellow, Cafe White, Nippon Blue, Entertainer Orange, Black |
| **Urban Cruiser Taisor** | Entertainer Orange, Sportin Red, Cafe White, Sterling Silver, Gaming Grey, Black |
| **Urban Cruiser HyRyder** | Sportin Red, Cafe White, Sterling Silver, Gaming Grey, Sprayed Teal, Blackish Agave, Black |
| **Urban Cruiser Ebella** | Cafe White, Entertainer Orange, Sportin Red, Sterling Silver, Gaming Grey, Black |
| **Legender** | Super White, Attitude Black, Graphite Grey, Phantom Brown, Pearl White, Bronze Mica |
| **Land Cruiser 300** | Super White, Attitude Black, Graphite Grey, Pearl White, Silky White, Dark Blue Mica, Dark Red Mica, Fine Silver |
| **Vellfire** | Super White, Attitude Black, Graphite Grey, Dark Blue Mica, Precious Bronze, Platinum White Pearl, Silver, Red Mica Metallic |
| **Land Cruiser Prado** | Super White, Attitude Black, Graphite Grey, Pearl White, Dark Blue Mica, Dark Red Mica, Fine Silver, Silky White |

Total: 13 models, ~90 colours.

## Phase 2 — Exclusions, Flags, Export (P2)

### 2.1 Exclude Toggle on Entries Page
- `src/app/admin/dashboard/entries/page.tsx` — add toggle per entry row
- Server action: `toggleExclude(entryId)` — flips `excluded` boolean
- Visual: grey out excluded rows, badge "Excluded"

### 2.2 Flag Notification System
- Badge counter on admin nav (supabase realtime subscription)
- In-app toast on flag creation (poll Supabase realtime `flag` column changes)
- Graceful degradation: poll fallback if Supabase not configured

### 2.3 XLSX Export
- `src/app/admin/dashboard/entries/page.tsx` — "Export XLSX" button
- Lib: use `xlsx` npm package (or `exceljs`)
- Columns: Name, Phone, Model, Colour, VIN, Branch, Flagged, Excluded, Created At
- Winners export: same on draw page
- Server action generates buffer, returns downloadable response

## Phase 3 — Spinning Wheel Draw + Re-run (P3)

### 3.1 Wheel Spin Component
- New component: `src/components/draw/SpinningWheel.tsx`
- Client component — takes eligible entries array
- Renders canvas/SVG spinning wheel with names on segments
- 3 sequential spins: 1st → 2nd → 3rd
- Confetti burst (confetti lib) after each reveal
- Source: inspired by wheelofnames.com

### 3.2 Update Draw Server Action
- `src/app/actions/draw.ts`
- Query: `excluded: false` (not `flag: null`)
- Atomic lock via status field on `Branch` (PENDING→DRAWING)
- Re-run support: if winners exist for branch, prompt confirmation → delete old winners → redraw
- Draw returns subset of eligible entries (exclude flagged but not excluded)

### 3.3 Integrate Wheel into Dashboard
- Replace existing DrawControls (placeholder) with wheel component
- Draw button starts wheel sequence
- After all 3 reveals, winners persist to DB

## Phase 4 — WhatsApp Notifications (P4)

### 4.1 Winner Notification Trigger
- After draw persists winners, enqueue WhatsAppLog for each winner
- Template: "Congratulations {name}! You won {position} prize in {branch} Onam Lucky Draw!"

### 4.2 DoubleTick Integration
- Replace mock double-tick with actual API call
- Respect rate limits (queue + delays)
- Update WhatsAppLog status on callback/success/failure

## Phase 5 — Public Winners Page (P5 — if not already built)
*(Check: already seeded — verify)*

- Verify `src/app/winners/page.tsx` works with new schema
- Medal icons + branch grouping
- Register page link at bottom

## Phase 6 — UI/UX Polish via /impeccable (P6)

### 6.1 Run /impeccable skill on:
- **Entry form** — festive theme: Kerala mural patterns, Onam flower (Pookalam) background, gold accents
- **Admin dashboard** — efficient table layouts, loading skeletons, responsive sidebar
- **Draw wheel** — smooth CSS animations, gold/red/green segment colors, confetti timing
- **Confirmation screen** — confetti, QR code, entry card with Toyota branding
- **Mobile** — touch-friendly filters, bottom nav instead of sidebar on small screens

### 6.2 Visual Direction
- Elephant motif (found in FestiveElements.tsx — Toyota emblem)
- Nilavilakku (traditional lamp) animation
- Gold (#C9A94E) + Deep Green (#1B5E20) + White palette
- Pookalam (flower carpet) background pattern
- Smooth page transitions (View Transitions API if browser supports)

## Phase 7 — Hardening & Verify (P7)

### 7.1 Sanity Checks
- `npx prisma validate`
- `npm run build` — no TypeScript or lint errors
- Test entry submission flow end-to-end
- Test draw + wheel animation
- Test admin CRUD (branches, models, colours)

### 7.2 Edge Cases
- Duplicate phone across branches → re-check fraud detection triggers
- Zero eligible entries → disable draw button + message
- Supabase realtime offline → graceful deg to polling
- VIN uniqueness cross-branch → still enforced

## Execution Order (Sequential)

```
P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7
```
Each phase ships independently. No parallel tracks. Each phase = PR.