-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('ALL_USERS', 'ADVERTISERS', 'ADMINISTRATORS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "appcentre_notifications" (
    "id" TEXT NOT NULL,
    "audience" "NotificationAudience" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'SENT',
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "siteId" TEXT,
    "createdById" TEXT,

    CONSTRAINT "appcentre_notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appcentre_notifications" ADD CONSTRAINT "appcentre_notifications_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "appcentre_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appcentre_notifications" ADD CONSTRAINT "appcentre_notifications_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "appcentre_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
