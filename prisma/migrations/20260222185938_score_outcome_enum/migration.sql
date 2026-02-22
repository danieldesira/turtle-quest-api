/*
  Warnings:

  - You are about to drop the column `outcome_id` on the `scores` table. All the data in the column will be lost.
  - You are about to drop the `outcomes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `outcome` to the `scores` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OutcomeType" AS ENUM ('WIN', 'LOSS');

-- DropForeignKey
ALTER TABLE "scores" DROP CONSTRAINT "score_outcomes_fk";

-- AlterTable
ALTER TABLE "scores" DROP COLUMN "outcome_id",
ADD COLUMN     "outcome" "OutcomeType" NOT NULL;

-- DropTable
DROP TABLE "outcomes";
