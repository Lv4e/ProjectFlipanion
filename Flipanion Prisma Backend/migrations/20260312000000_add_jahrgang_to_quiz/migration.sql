-- AlterTable: add jahrgang column with default 1 for existing rows
ALTER TABLE "Quiz" ADD COLUMN "jahrgang" INTEGER NOT NULL DEFAULT 1;

-- Set all existing quizzes to Jahrgang 1
UPDATE "Quiz" SET "jahrgang" = 1 WHERE "jahrgang" IS NULL;

-- Remove the default so future inserts must specify jahrgang explicitly
ALTER TABLE "Quiz" ALTER COLUMN "jahrgang" DROP DEFAULT;

-- Add check constraint to ensure jahrgang is between 1 and 5
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_jahrgang_check" CHECK ("jahrgang" >= 1 AND "jahrgang" <= 5);
