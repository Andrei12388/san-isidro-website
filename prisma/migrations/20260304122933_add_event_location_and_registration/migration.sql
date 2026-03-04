-- AlterTable
ALTER TABLE "events" ADD COLUMN     "allowRegistration" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT NOT NULL DEFAULT 'TBD';
