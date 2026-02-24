/*
  Warnings:

  - You are about to drop the column `user_id` on the `votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profile_id,post_id]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Made the column `created_at` on table `posts` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `profile_id` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."votes" DROP CONSTRAINT "votes_user_id_users_id_fk";

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "created_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "user_id",
ADD COLUMN     "profile_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "votes_profile_id_post_id_key" ON "votes"("profile_id", "post_id");

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
