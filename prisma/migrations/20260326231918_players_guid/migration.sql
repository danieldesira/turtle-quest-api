/*
  Warnings:

  - The required column `guid` was added to the `players` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "players" ADD COLUMN     "guid" UUID NOT NULL;
