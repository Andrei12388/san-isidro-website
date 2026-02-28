-- CreateTable
CREATE TABLE "devotion_likes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "devotionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devotion_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devotion_likes_userId_devotionId_key" ON "devotion_likes"("userId", "devotionId");

-- AddForeignKey
ALTER TABLE "devotion_likes" ADD CONSTRAINT "devotion_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devotion_likes" ADD CONSTRAINT "devotion_likes_devotionId_fkey" FOREIGN KEY ("devotionId") REFERENCES "devotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
