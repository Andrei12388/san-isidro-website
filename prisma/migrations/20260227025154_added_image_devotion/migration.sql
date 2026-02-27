/*
  Warnings:

  - Added the required column `image` to the `devotions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "devotions" ADD COLUMN     "image" TEXT NOT NULL;
