-- AlterTable
ALTER TABLE "appcentre_sites" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "approvedDomain" TEXT,
ADD COLUMN     "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "senderEmail" TEXT,
ADD COLUMN     "senderName" TEXT;
