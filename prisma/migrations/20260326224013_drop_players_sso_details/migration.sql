/*
  Warnings:

  - You are about to drop the column `external_id` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `sso_provider` on the `players` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "players" DROP COLUMN "external_id",
DROP COLUMN "sso_provider";
