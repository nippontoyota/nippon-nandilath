-- Add composite indexes for fraud check queries (camelCase columns match Prisma schema)
CREATE INDEX IF NOT EXISTS "entries_phone_createdAt_idx" ON "entries" ("phone", "createdAt");
CREATE INDEX IF NOT EXISTS "entries_ip_createdAt_idx" ON "entries" ("ip", "createdAt");
