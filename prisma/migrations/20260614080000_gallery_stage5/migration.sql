-- AlterTable
ALTER TABLE "ObjectMedia" ADD COLUMN     "showInGallery" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "showInMembersDirectory" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "EventPhotographer" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventPhotographer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventPhotographer_userId_idx" ON "EventPhotographer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventPhotographer_eventId_userId_key" ON "EventPhotographer"("eventId", "userId");

-- CreateIndex
CREATE INDEX "ObjectMedia_showInGallery_idx" ON "ObjectMedia"("showInGallery");

-- AddForeignKey
ALTER TABLE "EventPhotographer" ADD CONSTRAINT "EventPhotographer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPhotographer" ADD CONSTRAINT "EventPhotographer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

