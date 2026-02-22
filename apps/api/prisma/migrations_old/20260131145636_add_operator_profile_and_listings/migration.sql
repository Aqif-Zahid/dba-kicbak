/*
  Warnings:

  - You are about to drop the `third_party_clients` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OperatorVerificationStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED', 'BYPASSED');

-- CreateEnum
CREATE TYPE "OperatorOnboardingStatus" AS ENUM ('BUSINESS_INFO', 'LISTING_INPUT', 'VERIFICATION', 'IMPORT_REVIEW', 'OFFER_SETUP', 'COMPLETE');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('HOTEL', 'STR', 'RESORT');

-- DropForeignKey
ALTER TABLE "public"."third_party_clients" DROP CONSTRAINT "third_party_clients_user_id_fkey";

-- DropTable
DROP TABLE "public"."third_party_clients";

-- CreateTable
CREATE TABLE "operator_profiles" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "operator_name" TEXT NOT NULL,
    "ota_urls" JSONB DEFAULT '[]',
    "direct_booking_urls" JSONB DEFAULT '[]',
    "verification_status" "OperatorVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_at" TIMESTAMP(3),
    "trusted_by_partner" BOOLEAN DEFAULT false,
    "partner_ref" TEXT,
    "onboarding_status" "OperatorOnboardingStatus" NOT NULL DEFAULT 'BUSINESS_INFO',
    "onboarding_completed" BOOLEAN DEFAULT false,
    "imported_listings" JSONB DEFAULT '[]',
    "last_import_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" SERIAL NOT NULL,
    "operator_profile_id" INTEGER NOT NULL,
    "mapping_id" INTEGER,
    "platform_listing_id" TEXT,
    "supplier_listing_id" TEXT,
    "supplier" TEXT NOT NULL,
    "listing_name" TEXT NOT NULL,
    "listing_type" "ListingType",
    "rating" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city_code" TEXT,
    "city_name" TEXT,
    "state_name" TEXT,
    "country_name" TEXT,
    "country_code" TEXT,
    "postal_code" TEXT,
    "lat" TEXT,
    "lon" TEXT,
    "phones" JSONB DEFAULT '[]',
    "emails" JSONB DEFAULT '[]',
    "images" JSONB DEFAULT '[]',
    "description" JSONB,
    "listing_facilities" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operator_profiles_profile_id_unique" ON "operator_profiles"("profile_id");

-- AddForeignKey
ALTER TABLE "operator_profiles" ADD CONSTRAINT "operator_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_operator_profile_id_fkey" FOREIGN KEY ("operator_profile_id") REFERENCES "operator_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
