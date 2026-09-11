-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "visibleMembers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visiblePublic" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: existing live events stay visible (matches previous behaviour)
UPDATE "Event"
SET "visiblePublic" = true, "visibleMembers" = true
WHERE "status" IN ('PUBLISHED', 'COMPLETED');
