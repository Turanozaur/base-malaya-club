-- AlterTable
ALTER TABLE "User" ADD COLUMN "showBirthDatePublicly" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "personalDataConsentAt" TIMESTAMP(3);
