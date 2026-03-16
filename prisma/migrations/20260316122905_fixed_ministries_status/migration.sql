/*
  Warnings:

  - The `status` column on the `ministry_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `completionStatus` column on the `trainings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MinistryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "ministry_members" DROP COLUMN "status",
ADD COLUMN     "status" "MinistryStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "trainings" DROP COLUMN "completionStatus",
ADD COLUMN     "completionStatus" "MinistryStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "ministry_members_ministryId_idx" ON "ministry_members"("ministryId");

-- CreateIndex
CREATE INDEX "ministry_members_userId_idx" ON "ministry_members"("userId");

-- CreateIndex
CREATE INDEX "ministry_members_status_idx" ON "ministry_members"("status");

-- CreateIndex
CREATE INDEX "ministry_training_completions_ministryMemberId_idx" ON "ministry_training_completions"("ministryMemberId");

-- CreateIndex
CREATE INDEX "ministry_training_completions_trainingId_idx" ON "ministry_training_completions"("trainingId");
