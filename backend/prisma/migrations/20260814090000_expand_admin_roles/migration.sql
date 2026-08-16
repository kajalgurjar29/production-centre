-- AlterEnum
-- Expands AdminRole from 4 values to the 6 fixed MVP roles. Existing
-- SUPPORT/FINANCE rows are remapped to their closest equivalent
-- (SUPPORT -> MODERATOR, FINANCE -> FINANCE_ADMIN) as part of the type
-- conversion so this is safe to run even if such rows exist.
BEGIN;
CREATE TYPE "AdminRole_new" AS ENUM ('SUPER_ADMIN', 'ADMINISTRATOR', 'CONTENT_ADMIN', 'MODERATOR', 'FINANCE_ADMIN', 'READONLY_AUDITOR');
ALTER TABLE "appcentre_admin_users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "appcentre_admin_users" ALTER COLUMN "role" TYPE "AdminRole_new" USING (
  CASE "role"::text
    WHEN 'SUPPORT' THEN 'MODERATOR'
    WHEN 'FINANCE' THEN 'FINANCE_ADMIN'
    ELSE "role"::text
  END
)::"AdminRole_new";
ALTER TYPE "AdminRole" RENAME TO "AdminRole_old";
ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
DROP TYPE "AdminRole_old";
ALTER TABLE "appcentre_admin_users" ALTER COLUMN "role" SET DEFAULT 'READONLY_AUDITOR';
COMMIT;
