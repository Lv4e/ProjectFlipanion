import { PrismaClient } from "./client/client.ts";
import { load } from "jsr:@std/dotenv";

// Load environment variables from .env file
await load({ export: true });

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...");

    // Create Math Subject
    const mathSubject = await prisma.subject.create({
        data: {
            name: "Mathematik",
            description: "Mathematische Fragen und Aufgaben",
        },
    });

    console.log("✅ Created Math subject");

    // Create Math Quiz
    const mathQuiz = await prisma.quiz.create({
        data: {
            title: "Grundrechenarten Quiz",
            description: "Ein Quiz über Addition, Subtraktion, Multiplikation und Division",
            subjectId: mathSubject.id,
        },
    });

    console.log("✅ Created Math quiz");

    // Create Math Questions
    await prisma.question.createMany({
        data: [
            {
                questionText: "Was ist 15 + 27?",
                answerText1: "42",
                answerText2: "41",
                answerText3: "43",
                answerText4: "40",
                correctAnswer: "42",
                quizId: mathQuiz.id,
            },
            {
                questionText: "Was ist 8 × 7?",
                answerText1: "54",
                answerText2: "56",
                answerText3: "58",
                answerText4: "52",
                correctAnswer: "56",
                quizId: mathQuiz.id,
            },
            {
                questionText: "Was ist 144 ÷ 12?",
                answerText1: "10",
                answerText2: "11",
                answerText3: "12",
                answerText4: "13",
                correctAnswer: "12",
                quizId: mathQuiz.id,
            },
            {
                questionText: "Was ist 50 - 23?",
                answerText1: "25",
                answerText2: "26",
                answerText3: "27",
                answerText4: "28",
                correctAnswer: "27",
                quizId: mathQuiz.id,
            },
            {
                questionText: "Was ist 9²?",
                answerText1: "18",
                answerText2: "72",
                answerText3: "81",
                answerText4: "90",
                correctAnswer: "81",
                quizId: mathQuiz.id,
            },
            {
                questionText: "Was ist die Quadratwurzel aus 64?",
                answerText1: "6",
                answerText2: "7",
                answerText3: "8",
                answerText4: "9",
                correctAnswer: "8",
                quizId: mathQuiz.id,
            },
            {
                questionText: "Was ist 15% von 200?",
                answerText1: "25",
                answerText2: "30",
                answerText3: "35",
                answerText4: "40",
                correctAnswer: "30",
                quizId: mathQuiz.id,
            },
            {
                questionText: "Was ist 3/4 + 1/4?",
                answerText1: "1/2",
                answerText2: "3/4",
                answerText3: "1",
                answerText4: "4/8",
                correctAnswer: "1",
                quizId: mathQuiz.id,
            },
            {
                questionText: "Was ist 2³?",
                answerText1: "6",
                answerText2: "8",
                answerText3: "9",
                answerText4: "12",
                correctAnswer: "8",
                quizId: mathQuiz.id,
            },
            {
                questionText: "Was ist der Umfang eines Rechtecks mit Länge 10 und Breite 5?",
                answerText1: "25",
                answerText2: "30",
                answerText3: "35",
                answerText4: "50",
                correctAnswer: "30",
                quizId: mathQuiz.id,
            },
        ],
    });

    console.log("✅ Created 10 Math questions");

    // Create a demo user
    const demoUser = await prisma.user.create({
        data: {
            email: "demo@example.com",
            passwordHash: "hashed_password_here",
            name: "Demo User",
        },
    });

    console.log("✅ Created demo user");

    // Create points entry for demo user
    await prisma.points.create({
        data: {
            userId: demoUser.id,
            subjectId: mathSubject.id,
            points: 0,
        },
    });

    // Create user statistics
    await prisma.userStatistics.create({
        data: {
            userId: demoUser.id,
            answeredQuestions: 0,
            correctAnswers: 0,
        },
    });

    console.log("✅ Created user statistics and points");

    console.log("🎉 Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Error during seed:", e);
        Deno.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
