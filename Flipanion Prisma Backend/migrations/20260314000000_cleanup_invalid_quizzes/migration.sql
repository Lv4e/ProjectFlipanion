WITH invalid_quizzes AS (
  SELECT q.id
  FROM "Quiz" q
  LEFT JOIN "Question" question ON question."quizId" = q.id
  GROUP BY q.id
  HAVING COUNT(question.id) < 2
),
invalid_questions AS (
  SELECT question.id
  FROM "Question" question
  INNER JOIN invalid_quizzes invalid_quiz ON invalid_quiz.id = question."quizId"
)
DELETE FROM "UserAnswer"
WHERE "questionId" IN (SELECT id FROM invalid_questions);

WITH invalid_quizzes AS (
  SELECT q.id
  FROM "Quiz" q
  LEFT JOIN "Question" question ON question."quizId" = q.id
  GROUP BY q.id
  HAVING COUNT(question.id) < 2
)
DELETE FROM "QuizAttempt"
WHERE "quizId" IN (SELECT id FROM invalid_quizzes);

WITH invalid_quizzes AS (
  SELECT q.id
  FROM "Quiz" q
  LEFT JOIN "Question" question ON question."quizId" = q.id
  GROUP BY q.id
  HAVING COUNT(question.id) < 2
)
DELETE FROM "Question"
WHERE "quizId" IN (SELECT id FROM invalid_quizzes);

WITH invalid_quizzes AS (
  SELECT q.id
  FROM "Quiz" q
  LEFT JOIN "Question" question ON question."quizId" = q.id
  GROUP BY q.id
  HAVING COUNT(question.id) < 2
)
DELETE FROM "Quiz"
WHERE id IN (SELECT id FROM invalid_quizzes);

UPDATE "UserStatistics" us
SET
  "answeredQuestions" = stats."answeredQuestions",
  "correctAnswers" = stats."correctAnswers"
FROM (
  SELECT
    us_inner.id,
    COALESCE(answer_counts."answeredQuestions", 0) AS "answeredQuestions",
    COALESCE(answer_counts."correctAnswers", 0) AS "correctAnswers"
  FROM "UserStatistics" us_inner
  LEFT JOIN (
    SELECT
      ua."userId",
      COUNT(*)::INTEGER AS "answeredQuestions",
      SUM(CASE WHEN ua."isCorrect" THEN 1 ELSE 0 END)::INTEGER AS "correctAnswers"
    FROM "UserAnswer" ua
    GROUP BY ua."userId"
  ) answer_counts ON answer_counts."userId" = us_inner."userId"
) stats
WHERE us.id = stats.id;

UPDATE "UserStatistics"
SET "streak" = 0;

WITH ordered_attempts AS (
  SELECT
    qa."userId",
    qa."percentage",
    SUM(
      CASE
        WHEN qa."percentage" <= 90 THEN 1
        ELSE 0
      END
    ) OVER (
      PARTITION BY qa."userId"
      ORDER BY qa."createdAt" DESC, qa.id DESC
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS failure_count
  FROM "QuizAttempt" qa
  WHERE qa."pointsAwarded" = true
),
current_streaks AS (
  SELECT
    oa."userId",
    COUNT(*)::INTEGER AS streak
  FROM ordered_attempts oa
  WHERE oa."percentage" > 90
    AND oa.failure_count = 0
  GROUP BY oa."userId"
)
UPDATE "UserStatistics" us
SET "streak" = current_streaks.streak
FROM current_streaks
WHERE us."userId" = current_streaks."userId";