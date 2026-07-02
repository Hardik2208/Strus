/*
  Warnings:

  - You are about to drop the column `expires_at` on the `verification_codes` table. All the data in the column will be lost.
  - You are about to drop the column `last_sent_at` on the `verification_codes` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "verification_codes_expires_at_idx";

-- AlterTable
ALTER TABLE "verification_codes" DROP COLUMN "expires_at",
DROP COLUMN "last_sent_at";

-- CreateIndex
CREATE INDEX "verification_codes_user_id_idx" ON "verification_codes"("user_id");
