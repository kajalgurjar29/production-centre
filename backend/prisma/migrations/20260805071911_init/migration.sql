-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMINISTRATOR', 'MODERATOR', 'SUPPORT', 'FINANCE');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AdvertStatus" AS ENUM ('DRAFT', 'PAYMENT_REQUIRED', 'PENDING_REVIEW', 'AMENDMENTS_REQUIRED', 'APPROVED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'REMOVED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PUBLISHED', 'REPORTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED');

-- CreateTable
CREATE TABLE "appcentre_admin_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'SUPPORT',
    "status" "AdminStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appcentre_admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appcentre_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appcentre_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appcentre_adverts" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "status" "AdvertStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "advertiserId" TEXT NOT NULL,

    CONSTRAINT "appcentre_adverts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appcentre_payments" (
    "id" TEXT NOT NULL,
    "transactionRef" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "provider" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "advertId" TEXT NOT NULL,

    CONSTRAINT "appcentre_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appcentre_reviews" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "topic" TEXT,
    "details" TEXT,
    "country" TEXT,
    "city" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appcentre_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appcentre_contact_enquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appcentre_contact_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appcentre_audit_log" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,

    CONSTRAINT "appcentre_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appcentre_admin_users_email_key" ON "appcentre_admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "appcentre_users_email_key" ON "appcentre_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "appcentre_adverts_reference_key" ON "appcentre_adverts"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "appcentre_payments_transactionRef_key" ON "appcentre_payments"("transactionRef");

-- AddForeignKey
ALTER TABLE "appcentre_adverts" ADD CONSTRAINT "appcentre_adverts_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "appcentre_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appcentre_payments" ADD CONSTRAINT "appcentre_payments_advertId_fkey" FOREIGN KEY ("advertId") REFERENCES "appcentre_adverts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appcentre_audit_log" ADD CONSTRAINT "appcentre_audit_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "appcentre_admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
