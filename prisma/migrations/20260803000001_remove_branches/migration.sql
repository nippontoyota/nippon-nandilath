-- Wipe campaign data and remove all branch-related schema.
-- Target: Nippon Toyota org-wide single QR / single winner.

DELETE FROM "winners";
DELETE FROM "whatsapp_logs";
DELETE FROM "entries";

-- Drop winner branch FKs / indexes
DROP INDEX IF EXISTS "winners_branchId_place_key";
DROP INDEX IF EXISTS "winners_branchId_idx";
ALTER TABLE "winners" DROP CONSTRAINT IF EXISTS "winners_branchId_fkey";
ALTER TABLE "winners" DROP COLUMN IF EXISTS "branchId";

-- At most one winner (place unique; place=1 used)
CREATE UNIQUE INDEX IF NOT EXISTS "winners_place_key" ON "winners"("place");

-- Drop entry branch FKs / indexes
DROP INDEX IF EXISTS "entries_branchId_idx";
DROP INDEX IF EXISTS "entries_branchId_flag_idx";
DROP INDEX IF EXISTS "entries_branchId_excluded_idx";
ALTER TABLE "entries" DROP CONSTRAINT IF EXISTS "entries_branchId_fkey";
ALTER TABLE "entries" DROP COLUMN IF EXISTS "branchId";

CREATE INDEX IF NOT EXISTS "entries_excluded_idx" ON "entries"("excluded");

DROP TABLE IF EXISTS "branches";
