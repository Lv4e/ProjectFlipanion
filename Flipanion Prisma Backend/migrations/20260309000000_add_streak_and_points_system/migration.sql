-- AlterTable: Add streak column to UserStatistics
ALTER TABLE "UserStatistics" ADD COLUMN "streak" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Add percentage and pointsAwarded columns to QuizAttempt
ALTER TABLE "QuizAttempt" ADD COLUMN "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "QuizAttempt" ADD COLUMN "pointsAwarded" BOOLEAN NOT NULL DEFAULT true;
