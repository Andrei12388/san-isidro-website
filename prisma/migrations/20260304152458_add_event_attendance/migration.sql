-- AlterTable
ALTER TABLE "events" ADD COLUMN     "isRegular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurrence" TEXT;

-- CreateTable
CREATE TABLE "event_attendance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "timeIn" TIMESTAMP(3) NOT NULL,
    "isPresent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_attendance_eventId_idx" ON "event_attendance"("eventId");

-- CreateIndex
CREATE INDEX "event_attendance_userId_idx" ON "event_attendance"("userId");

-- CreateIndex
CREATE INDEX "event_attendance_date_idx" ON "event_attendance"("date");

-- AddForeignKey
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
