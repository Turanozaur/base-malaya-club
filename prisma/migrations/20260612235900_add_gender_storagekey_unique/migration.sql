-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "url";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "gender" "Gender";

-- CreateIndex
CREATE UNIQUE INDEX "Media_storageKey_key" ON "Media"("storageKey");
