/*
  Warnings:

  - You are about to drop the column `sso_platform` on the `players` table. All the data in the column will be lost.
  - Added the required column `sso_provider` to the `players` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "players" DROP COLUMN "sso_platform",
ADD COLUMN     "sso_provider" VARCHAR NOT NULL;
