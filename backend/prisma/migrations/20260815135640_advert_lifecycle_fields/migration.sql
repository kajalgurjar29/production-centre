-- AlterTable
ALTER TABLE "appcentre_adverts" ADD COLUMN     "aiReviewNote" TEXT,
ADD COLUMN     "croppedImageUrl" TEXT,
ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reportCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sequenceNumber" SERIAL NOT NULL,
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "totalCost" DECIMAL(10,2);
