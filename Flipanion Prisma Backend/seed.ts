import { PrismaClient } from "./client/client.ts";
import { load } from "jsr:@std/dotenv";

await load({ export: true });

const prisma = new PrismaClient();

// Punkte-Logik (kannst du ändern)
const POINTS_PER_CORRECT = 10;

// Hilfsfunktionen
function pickTwoDistinct<T>(arr: T[]): [T, T] {
    if (arr.length < 2) throw new Error("Need at least 2 items to pick two distinct.");
    const i = Math.floor(Math.random() * arr.length);
    let j = Math.floor(Math.random() * arr.length);
    while (j === i) j = Math.floor(Math.random() * arr.length);
    return [arr[i], arr[j]];
}

function pickWrongAnswer(question: any): string {
    const options = [question.answerText1, question.answerText2, question.answerText3, question.answerText4].filter(Boolean);
    const wrong = options.filter((o) => o !== question.correctAnswer);
    if (wrong.length === 0) return question.correctAnswer; // fallback
    return wrong[Math.floor(Math.random() * wrong.length)];
}

async function main() {
    console.log("🌱 Seeding user answers, points, and statistics...");

    // 1) Daten holen
    const users = await prisma.user.findMany();
    if (users.length === 0) {
        console.log("ℹ️ No users found. Create users first.");
        return;
    }

    const quizzes = await prisma.quiz.findMany({
        include: {
            subject: true,
            questions: true, // falls Relation in Prisma so heißt
        },
    });

    if (quizzes.length < 2) {
        console.log("ℹ️ Need at least 2 quizzes to assign per user.");
        return;
    }

    // 2) Für jeden User: 2 Quizzes machen
    for (const user of users) {
        const [qz1, qz2] = pickTwoDistinct(quizzes);

        // Optional: vorhandene UserAnswers für diese zwei Quizzes löschen,
        // damit du das Seed wiederholt ausführen kannst, ohne Duplikate.
        // (Wenn du NICHT löschen willst, kommentiere den Block aus.)
        await prisma.userAnswer.deleteMany({
            where: {
                userId: user.id,
                question: {
                    quizId: { in: [qz1.id, qz2.id] },
                },
            },
        });

        // Statistik-Zähler für diesen Seed-Lauf
        let answeredTotal = 0;
        let correctTotal = 0;

        // Punkte pro Subject aufsummieren (weil 2 Quizzes evtl. unterschiedliche Subjects haben)
        const pointsBySubjectId = new Map<number, number>();

        const selectedQuizzes = [qz1, qz2];

        for (const quiz of selectedQuizzes) {
            const questions = quiz.questions ?? [];
            if (questions.length === 0) continue;

            // Entscheide „wie viele richtig“ (du wolltest, dass ich entscheide)
            // Beispiel: 40%–90% richtig, abhängig von Quiz-Größe
            const minCorrect = Math.max(1, Math.floor(questions.length * 0.4));
            const maxCorrect = Math.max(minCorrect, Math.floor(questions.length * 0.9));
            const correctCountTarget = minCorrect + Math.floor(Math.random() * (maxCorrect - minCorrect + 1));

            // Welche Fragen sind korrekt?
            const indices = questions.map((_, idx) => idx);
            // shuffle
            for (let k = indices.length - 1; k > 0; k--) {
                const r = Math.floor(Math.random() * (k + 1));
                [indices[k], indices[r]] = [indices[r], indices[k]];
            }
            const correctSet = new Set(indices.slice(0, correctCountTarget));

            // UserAnswers erzeugen
            for (let idx = 0; idx < questions.length; idx++) {
                const question = questions[idx];
                const isCorrect = correctSet.has(idx);

                const selectedAnswer = isCorrect ? question.correctAnswer : pickWrongAnswer(question);

                // HIER: Annahme über dein Prisma Model "UserAnswer"
                await prisma.userAnswer.create({
                    data: {
                        userId: user.id,
                        questionId: question.id,
                        selectedAnswer, // falls bei dir anders heißt: z.B. answerText / chosenAnswer
                        isCorrect,      // falls bei dir anders heißt: correct / wasCorrect
                    },
                });

                answeredTotal += 1;
                if (isCorrect) correctTotal += 1;
            }

            // Punkte auf Subject buchen
            const subjectId = quiz.subjectId;
            const earned = correctCountTarget * POINTS_PER_CORRECT;
            pointsBySubjectId.set(subjectId, (pointsBySubjectId.get(subjectId) ?? 0) + earned);
        }

        // 3) Points updaten/anlegen (pro Subject)
        for (const [subjectId, earnedPoints] of pointsBySubjectId.entries()) {
            // Falls (userId, subjectId) unique ist, wäre upsert ideal.
            // Ohne Schema-Änderung machen wir findFirst + create/update.
            const existing = await prisma.points.findFirst({
                where: {
                    userId: user.id,
                    subjectId,
                },
            });

            if (!existing) {
                await prisma.points.create({
                    data: {
                        userId: user.id,
                        subjectId,
                        points: earnedPoints,
                    },
                });
            } else {
                await prisma.points.update({
                    where: { id: existing.id },
                    data: {
                        points: existing.points + earnedPoints,
                    },
                });
            }
        }

        // 4) UserStatistics updaten/anlegen
        const existingStats = await prisma.userStatistics.findFirst({
            where: { userId: user.id },
        });

        if (!existingStats) {
            await prisma.userStatistics.create({
                data: {
                    userId: user.id,
                    answeredQuestions: answeredTotal,
                    correctAnswers: correctTotal,
                },
            });
        } else {
            await prisma.userStatistics.update({
                where: { id: existingStats.id },
                data: {
                    answeredQuestions: existingStats.answeredQuestions + answeredTotal,
                    correctAnswers: existingStats.correctAnswers + correctTotal,
                },
            });
        }

        console.log(
            `✅ User ${user.email ?? user.id}: answered=${answeredTotal}, correct=${correctTotal}, quizzes=[${qz1.title}, ${qz2.title}]`,
        );
    }

    console.log("🎉 Finished seeding user answers, points, and statistics!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        Deno.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
