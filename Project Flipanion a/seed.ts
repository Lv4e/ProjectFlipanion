import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...");

    // Create Subjects
    const mathSubject = await prisma.subject.create({
        data: {
            name: "Mathematik",
            description: "Mathematische Fragen und Aufgaben",
        },
    });

    const englishSubject = await prisma.subject.create({
        data: {
            name: "Englisch",
            description: "Englische Vokabeln und Grammatik",
        },
    });

    console.log("✅ Created subjects");

    // Create Questions for Math
    await prisma.question.createMany({
        data: [
            {
                questionText: "Was ist 5 + 3?",
                answerText1: "6",
                answerText2: "8",
                answerText3: "7",
                answerText4: "9",
                correctAnswer: "8",
                subjectId: mathSubject.id,
            },
            {
                questionText: "Was ist 12 × 4?",
                answerText1: "42",
                answerText2: "48",
                answerText3: "52",
                answerText4: "44",
                correctAnswer: "48",
                subjectId: mathSubject.id,
            },
        ],
    });

    // Create Questions for English
    await prisma.question.createMany({
        data: [
            {
                questionText: "What is 'Haus' in English?",
                answerText1: "Home",
                answerText2: "House",
                answerText3: "Building",
                answerText4: "Room",
                correctAnswer: "House",
                subjectId: englishSubject.id,
            },
            {
                questionText: "What is the past tense of 'go'?",
                answerText1: "goed",
                answerText2: "went",
                answerText3: "gone",
                answerText4: "going",
                correctAnswer: "went",
                subjectId: englishSubject.id,
            },
        ],
    });

    console.log("✅ Created questions");

    // Create a test user
    const user = await prisma.user.create({
        data: {
            email: "test@example.com",
            passwordHash: "hashed_password_here",
            name: "Test User",
        },
    });

    console.log("✅ Created test user");

    // Create user statistics
    await prisma.userStatistics.create({
        data: {
            userId: user.id,
            answeredQuestions: 0,
            correctAnswers: 0,
        },
    });

    // Create points for user
    await prisma.points.createMany({
        data: [
            {
                userId: user.id,
                subjectId: mathSubject.id,
                points: 0,
            },
            {
                userId: user.id,
                subjectId: englishSubject.id,
                points: 0,
            },
        ],
    });

    console.log("✅ Created user statistics and points");
    console.log("🎉 Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Error during seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
