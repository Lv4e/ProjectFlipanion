import { PrismaClient } from "./client/client.ts";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CSS seed...");

  // Subject upsert
  const subject = await prisma.subject.upsert({
    where: { name: "CSS" },
    update: {},
    create: {
      name: "CSS",
      description: "Cascading Style Sheets – Layout & Styling",
    },
  });

  // Quiz ggf. löschen (idempotent seeden)
  const existingQuiz = await prisma.quiz.findFirst({
    where: { title: "CSS Grundlagen & Layout" },
    select: { id: true },
  });

  if (existingQuiz) {
    await prisma.question.deleteMany({ where: { quizId: existingQuiz.id } });
    await prisma.quiz.delete({ where: { id: existingQuiz.id } });
    console.log("🗑️ Existing CSS quiz removed.");
  }

  // Quiz erstellen
  const quiz = await prisma.quiz.create({
    data: {
      title: "CSS Grundlagen & Layout",
      description: "Single Choice Test zu CSS",
      subjectId: subject.id,
    },
  });

  const questions = [
    {
      questionText: "Wofür steht CSS?",
      answerText1: "Computer Style System",
      answerText2: "Cascading Style Sheets",
      answerText3: "Creative Styling Syntax",
      answerText4: "Color Style Structure",
      correctAnswer: "Cascading Style Sheets",
    },
    {
      questionText: "Welche Eigenschaft ändert die Textfarbe?",
      answerText1: "font-color",
      answerText2: "text-color",
      answerText3: "color",
      answerText4: "text-style",
      correctAnswer: "color",
    },
    {
      questionText: "Was bewirkt display: none?",
      answerText1: "Element wird transparent",
      answerText2: "Element wird komplett aus dem Layout entfernt",
      answerText3: "Element bleibt sichtbar",
      answerText4: "Element wird zentriert",
      correctAnswer: "Element wird komplett aus dem Layout entfernt",
    },
    {
      questionText:
        "Welche Einheit ist relativ zur Schriftgröße des Elternelements?",
      answerText1: "px",
      answerText2: "em",
      answerText3: "cm",
      answerText4: "pt",
      correctAnswer: "em",
    },
    {
      questionText: "Wie aktiviert man Flexbox?",
      answerText1: "display: grid",
      answerText2: "position: flex",
      answerText3: "display: flex",
      answerText4: "flex: true",
      correctAnswer: "display: flex",
    },
    {
      questionText: "Welche Eigenschaft definiert Außenabstand?",
      answerText1: "padding",
      answerText2: "margin",
      answerText3: "border",
      answerText4: "spacing",
      correctAnswer: "margin",
    },
    {
      questionText: "Was macht position: fixed?",
      answerText1: "Relativ zum Elternelement",
      answerText2: "Fixiert am Viewport",
      answerText3: "Automatische Zentrierung",
      answerText4: "Element wird verborgen",
      correctAnswer: "Fixiert am Viewport",
    },
    {
      questionText: "Wie definiert man eine CSS-Klasse?",
      answerText1: "#name",
      answerText2: ".name",
      answerText3: "@name",
      answerText4: "*name",
      correctAnswer: ".name",
    },
    {
      questionText: "Welche Eigenschaft fügt Schatten hinzu?",
      answerText1: "shadow",
      answerText2: "element-shadow",
      answerText3: "box-shadow",
      answerText4: "border-shadow",
      correctAnswer: "box-shadow",
    },
    {
      questionText: "Was bewirkt justify-content in Flexbox?",
      answerText1: "Vertikale Ausrichtung",
      answerText2: "Horizontale Ausrichtung entlang der Hauptachse",
      answerText3: "Schriftgröße ändern",
      answerText4: "Innenabstand setzen",
      correctAnswer: "Horizontale Ausrichtung entlang der Hauptachse",
    },
    {
      questionText: "Welche Eigenschaft gehört zum Box-Modell?",
      answerText1: "padding",
      answerText2: "align",
      answerText3: "flex",
      answerText4: "display",
      correctAnswer: "padding",
    },
    {
      questionText: "Welche Eigenschaft steuert die Stapelreihenfolge?",
      answerText1: "stack",
      answerText2: "z-index",
      answerText3: "layer",
      answerText4: "position-order",
      correctAnswer: "z-index",
    },
    {
      questionText: "Welche CSS-Technik wird für responsive Design genutzt?",
      answerText1: "@media",
      answerText2: "@responsive",
      answerText3: "@screen",
      answerText4: "@layout",
      correctAnswer: "@media",
    },
    {
      questionText: "Was macht overflow: hidden?",
      answerText1: "Blendet Überlauf aus",
      answerText2: "Vergrößert Container",
      answerText3: "Scroll aktiviert",
      answerText4: "Element fixiert",
      correctAnswer: "Blendet Überlauf aus",
    },
    {
      questionText: "Welche Eigenschaft definiert die Schriftart?",
      answerText1: "font-type",
      answerText2: "font-family",
      answerText3: "text-font",
      answerText4: "font-style",
      correctAnswer: "font-family",
    },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: { ...q, quizId: quiz.id },
    });
  }

  console.log("✅ CSS Quiz successfully seeded.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    Deno.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
