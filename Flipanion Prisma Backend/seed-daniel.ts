import { PrismaClient } from "./client/client.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Daniel quiz seed...");

  // Subject upsert
  const subject = await prisma.subject.upsert({
    where: { name: "Allgemeinwissen" },
    update: {},
    create: {
      name: "Allgemeinwissen",
      description: "Allgemeinwissen – verschiedene Themen",
    },
  });

  // Quiz ggf. löschen (idempotent seeden)
  const existingQuiz = await prisma.quiz.findFirst({
    where: { title: "Daniel" },
    select: { id: true },
  });

  if (existingQuiz) {
    await prisma.question.deleteMany({ where: { quizId: existingQuiz.id } });
    await prisma.quiz.delete({ where: { id: existingQuiz.id } });
    console.log("🗑️ Existing Daniel quiz removed.");
  }

  // Quiz erstellen
  const quiz = await prisma.quiz.create({
    data: {
      title: "Daniel",
      description: "Probe-Quiz von Daniel",
      subjectId: subject.id,
    },
  });

  const questions = [
    {
      questionText: "Was ist die Hauptstadt von Österreich?",
      answerText1: "Graz",
      answerText2: "Wien",
      answerText3: "Salzburg",
      answerText4: "Linz",
      correctAnswer: "Wien",
    },
    {
      questionText: "Welche Programmiersprache wird für Webseiten verwendet?",
      answerText1: "Python",
      answerText2: "C++",
      answerText3: "JavaScript",
      answerText4: "Java",
      correctAnswer: "JavaScript",
    },
    {
      questionText: "Was ergibt 7 × 8?",
      answerText1: "54",
      answerText2: "56",
      answerText3: "58",
      answerText4: "64",
      correctAnswer: "56",
    },
    {
      questionText: "Welches Element hat das chemische Symbol 'O'?",
      answerText1: "Gold",
      answerText2: "Osmium",
      answerText3: "Sauerstoff",
      answerText4: "Ozon",
      correctAnswer: "Sauerstoff",
    },
    {
      questionText: "In welchem Jahr wurde das Internet erfunden?",
      answerText1: "1969",
      answerText2: "1985",
      answerText3: "1991",
      answerText4: "2000",
      correctAnswer: "1969",
    },
    {
      questionText: "Welcher Planet ist der größte im Sonnensystem?",
      answerText1: "Saturn",
      answerText2: "Jupiter",
      answerText3: "Neptun",
      answerText4: "Uranus",
      correctAnswer: "Jupiter",
    },
    {
      questionText: "Was ist HTML?",
      answerText1: "Eine Programmiersprache",
      answerText2: "Eine Auszeichnungssprache",
      answerText3: "Ein Betriebssystem",
      answerText4: "Eine Datenbank",
      correctAnswer: "Eine Auszeichnungssprache",
    },
    {
      questionText: "Wie viele Bundesländer hat Österreich?",
      answerText1: "7",
      answerText2: "8",
      answerText3: "9",
      answerText4: "10",
      correctAnswer: "9",
    },
    {
      questionText: "Was bedeutet CPU?",
      answerText1: "Central Processing Unit",
      answerText2: "Computer Personal Unit",
      answerText3: "Central Program Utility",
      answerText4: "Core Processing Unit",
      correctAnswer: "Central Processing Unit",
    },
    {
      questionText: "Welche Farbe entsteht aus Blau und Gelb?",
      answerText1: "Rot",
      answerText2: "Grün",
      answerText3: "Orange",
      answerText4: "Lila",
      correctAnswer: "Grün",
    },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: { ...q, quizId: quiz.id },
    });
  }

  console.log("✅ Daniel Quiz successfully seeded with 10 questions.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    Deno.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
