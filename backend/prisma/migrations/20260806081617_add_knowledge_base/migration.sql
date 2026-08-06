-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('NEW', 'REVIEWED', 'RESOLVED');

-- CreateTable
CREATE TABLE "appcentre_knowledge_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '',
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appcentre_knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appcentre_unanswered_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" "QuestionStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "articleId" TEXT,

    CONSTRAINT "appcentre_unanswered_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appcentre_unanswered_questions" ADD CONSTRAINT "appcentre_unanswered_questions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "appcentre_knowledge_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
