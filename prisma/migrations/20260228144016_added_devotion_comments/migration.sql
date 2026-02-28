-- CreateTable
CREATE TABLE "devotion_comments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "devotionId" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devotion_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "devotion_comments_devotionId_idx" ON "devotion_comments"("devotionId");

-- CreateIndex
CREATE INDEX "devotion_comments_userId_idx" ON "devotion_comments"("userId");

-- AddForeignKey
ALTER TABLE "devotion_comments" ADD CONSTRAINT "devotion_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devotion_comments" ADD CONSTRAINT "devotion_comments_devotionId_fkey" FOREIGN KEY ("devotionId") REFERENCES "devotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
