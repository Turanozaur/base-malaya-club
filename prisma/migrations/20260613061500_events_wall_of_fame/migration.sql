-- AlterTable
ALTER TABLE "Event" ADD COLUMN "schedule" TEXT,
ADD COLUMN "schedulePublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "summaryPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "wallOfFamePublic" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN "eventPhotoKey" TEXT,
ADD COLUMN "profileSnapshot" JSONB;
