-- AlterTable
ALTER TABLE "events" ADD COLUMN     "locationLatitude" DOUBLE PRECISION,
ADD COLUMN     "locationLongitude" DOUBLE PRECISION,
ADD COLUMN     "locationRadius" DOUBLE PRECISION DEFAULT 100;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "faceDescriptor" TEXT;
