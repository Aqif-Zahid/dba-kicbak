/*
  Warnings:

  - You are about to drop the column `email` on the `password_reset_otp` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `password_reset_otp` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."password_reset_otp_email_expires_at_idx";

-- AlterTable
ALTER TABLE "password_reset_otp" DROP COLUMN "email",
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "password_reset_otp_user_id_expires_at_idx" ON "password_reset_otp"("user_id", "expires_at");

-- AddForeignKey
ALTER TABLE "password_reset_otp" ADD CONSTRAINT "password_reset_otp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
