/*
  Warnings:

  - Made the column `player_id` on table `scores` required. This step will fail if there are existing NULL values in that column.
  - Made the column `duration` on table `scores` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "scores" ALTER COLUMN "player_id" SET NOT NULL,
ALTER COLUMN "duration" SET NOT NULL;
