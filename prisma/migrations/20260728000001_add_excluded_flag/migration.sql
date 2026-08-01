-- AddExcludedFlagToEntry
ALTER TABLE "entries" ADD COLUMN "excluded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex for draw eligibility queries
CREATE INDEX "entries_branchId_excluded_idx" ON "entries"("branchId", "excluded");
