-- AlterTable
ALTER TABLE "appcentre_reviews" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reportCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'AI Transformation';
