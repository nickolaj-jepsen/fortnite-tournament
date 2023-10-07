/*
  Warnings:

  - You are about to drop the column `tournamentId` on the `Score` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_tournamentId_fkey";

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "tournamentId";
