-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HomepageBlockKey" AS ENUM ('HERO', 'FEATURED', 'TESTIMONIALS', 'CTA');

-- CreateTable
CREATE TABLE "appcentre_news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishAt" TIMESTAMP(3),
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT,

    CONSTRAINT "appcentre_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appcentre_homepage_blocks" (
    "id" TEXT NOT NULL,
    "key" "HomepageBlockKey" NOT NULL,
    "headline" TEXT,
    "subtext" TEXT,
    "ctaLabel" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT NOT NULL,

    CONSTRAINT "appcentre_homepage_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appcentre_homepage_blocks_siteId_key_key" ON "appcentre_homepage_blocks"("siteId", "key");

-- AddForeignKey
ALTER TABLE "appcentre_news" ADD CONSTRAINT "appcentre_news_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "appcentre_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appcentre_homepage_blocks" ADD CONSTRAINT "appcentre_homepage_blocks_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "appcentre_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
