-- CreateEnum
CREATE TYPE "AiLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "appcentre_ai_assistant_leads" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "sessionId" TEXT,
    "status" "AiLeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "siteId" TEXT,

    CONSTRAINT "appcentre_ai_assistant_leads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appcentre_ai_assistant_leads" ADD CONSTRAINT "appcentre_ai_assistant_leads_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "appcentre_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
