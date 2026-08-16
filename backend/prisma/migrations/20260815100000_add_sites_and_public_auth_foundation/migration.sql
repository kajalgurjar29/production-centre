-- CreateEnum
CREATE TYPE "UserTitle" AS ENUM ('ALHAJA', 'ALHAJI', 'CHIEF', 'DR', 'ENGR', 'LADY', 'MALAM', 'MISS', 'MR', 'MRS', 'MS', 'PROF', 'PST', 'REV', 'SIR');

-- AlterTable
ALTER TABLE "appcentre_users" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "displayPictureUrl" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "otpCodeHash" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "otpVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sex" TEXT,
ADD COLUMN     "surname" TEXT,
ADD COLUMN     "title" "UserTitle";

-- AlterTable
ALTER TABLE "appcentre_adverts" ADD COLUMN     "siteId" TEXT;

-- AlterTable
ALTER TABLE "appcentre_reviews" ADD COLUMN     "siteId" TEXT;

-- AlterTable
ALTER TABLE "appcentre_contact_enquiries" ADD COLUMN     "siteId" TEXT;

-- AlterTable
ALTER TABLE "appcentre_knowledge_articles" ADD COLUMN     "siteId" TEXT;

-- AlterTable
ALTER TABLE "appcentre_unanswered_questions" ADD COLUMN     "siteId" TEXT;

-- CreateTable
CREATE TABLE "appcentre_sites" (
    "id" TEXT NOT NULL,
    "siteKey" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL,
    "logoUrl" TEXT,
    "contactEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reviewsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "aiHelpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "advertsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "newsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appcentre_sites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appcentre_sites_siteKey_key" ON "appcentre_sites"("siteKey");

-- AddForeignKey
ALTER TABLE "appcentre_adverts" ADD CONSTRAINT "appcentre_adverts_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "appcentre_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appcentre_reviews" ADD CONSTRAINT "appcentre_reviews_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "appcentre_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appcentre_contact_enquiries" ADD CONSTRAINT "appcentre_contact_enquiries_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "appcentre_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appcentre_knowledge_articles" ADD CONSTRAINT "appcentre_knowledge_articles_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "appcentre_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appcentre_unanswered_questions" ADD CONSTRAINT "appcentre_unanswered_questions_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "appcentre_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

