-- CreateTable
CREATE TABLE "ministries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ministries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministry_members" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ministryId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "role" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ministry_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministry_trainings" (
    "id" SERIAL NOT NULL,
    "ministryId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ministry_trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministry_training_completions" (
    "id" SERIAL NOT NULL,
    "ministryMemberId" INTEGER NOT NULL,
    "trainingId" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ministry_training_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ministries_name_key" ON "ministries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ministry_members_userId_ministryId_key" ON "ministry_members"("userId", "ministryId");

-- CreateIndex
CREATE UNIQUE INDEX "ministry_training_completions_ministryMemberId_trainingId_key" ON "ministry_training_completions"("ministryMemberId", "trainingId");

-- AddForeignKey
ALTER TABLE "ministry_members" ADD CONSTRAINT "ministry_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_members" ADD CONSTRAINT "ministry_members_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "ministries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_trainings" ADD CONSTRAINT "ministry_trainings_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "ministries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_training_completions" ADD CONSTRAINT "ministry_training_completions_ministryMemberId_fkey" FOREIGN KEY ("ministryMemberId") REFERENCES "ministry_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ministry_training_completions" ADD CONSTRAINT "ministry_training_completions_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "ministry_trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
