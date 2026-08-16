-- AlterEnum
ALTER TYPE "EnquiryStatus" ADD VALUE 'CLOSED';

-- AlterTable: ContactEnquiry gets a sequential reference number
CREATE SEQUENCE "appcentre_contact_enquiries_sequenceNumber_seq" AS INTEGER;
ALTER TABLE "appcentre_contact_enquiries" ADD COLUMN "sequenceNumber" INTEGER NOT NULL DEFAULT nextval('"appcentre_contact_enquiries_sequenceNumber_seq"');
ALTER SEQUENCE "appcentre_contact_enquiries_sequenceNumber_seq" OWNED BY "appcentre_contact_enquiries"."sequenceNumber";

-- AlterTable: Review gets a sequential reference number
CREATE SEQUENCE "appcentre_reviews_sequenceNumber_seq" AS INTEGER;
ALTER TABLE "appcentre_reviews" ADD COLUMN "sequenceNumber" INTEGER NOT NULL DEFAULT nextval('"appcentre_reviews_sequenceNumber_seq"');
ALTER SEQUENCE "appcentre_reviews_sequenceNumber_seq" OWNED BY "appcentre_reviews"."sequenceNumber";

-- AlterEnum: ReviewStatus moves from PUBLISHED/REPORTED/REMOVED to a real
-- moderation gate (PENDING/APPROVED/REJECTED/HIDDEN). Existing rows are
-- mapped rather than dropped: previously-published/reported reviews stay
-- publicly visible (APPROVED) since they were already live; removed reviews
-- become HIDDEN, the closest equivalent.
ALTER TYPE "ReviewStatus" RENAME TO "ReviewStatus_old";
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');
ALTER TABLE "appcentre_reviews" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appcentre_reviews" ALTER COLUMN "status" TYPE "ReviewStatus" USING (
  CASE "status"::text
    WHEN 'PUBLISHED' THEN 'APPROVED'
    WHEN 'REPORTED' THEN 'APPROVED'
    WHEN 'REMOVED' THEN 'HIDDEN'
    ELSE 'PENDING'
  END
)::"ReviewStatus";
ALTER TABLE "appcentre_reviews" ALTER COLUMN "status" SET DEFAULT 'PENDING';
DROP TYPE "ReviewStatus_old";
