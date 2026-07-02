/*
  Warnings:

  - You are about to drop the `verifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "verifications" DROP CONSTRAINT "verifications_user_id_fkey";

-- DropTable
DROP TABLE "verifications";

-- DropEnum
DROP TYPE "VerificationStatus";

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "VerificationType" NOT NULL,
    "code_hash" VARCHAR(255) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "last_sent_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_codes_expires_at_idx" ON "verification_codes"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "verification_codes_user_id_type_key" ON "verification_codes"("user_id", "type");

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
