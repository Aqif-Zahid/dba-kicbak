/*
  Warnings:

  - You are about to drop the column `client_secret_b64` on the `third_party_clients` table. All the data in the column will be lost.
  - You are about to drop the `api_clients` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `client_secret_hash` to the `third_party_clients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "third_party_clients" DROP COLUMN "client_secret_b64",
ADD COLUMN     "client_secret_hash" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."api_clients";
