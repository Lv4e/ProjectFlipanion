import { PrismaClient } from "./client/client.ts";

const prisma = new PrismaClient();

type OptionKey = "A" | "B" | "C" | "D";

type SeedQuestion = {
  questionText: string;
  answerText1: string;
  answerText2: string;
  answerText3: string;
  answerText4: string;
  correctOption: OptionKey;
};

type SeedQuiz = {
  title: string;
  description: string;
  jahrgang: number;
  questions: SeedQuestion[];
};

function buildQuestionData(question: SeedQuestion) {
  const answerByOption: Record<OptionKey, string> = {
    A: question.answerText1,
    B: question.answerText2,
    C: question.answerText3,
    D: question.answerText4,
  };

  return {
    questionText: question.questionText,
    answerText1: question.answerText1,
    answerText2: question.answerText2,
    answerText3: question.answerText3,
    answerText4: question.answerText4,
    correctAnswer: answerByOption[question.correctOption],
  };
}

async function removeExistingQuiz(title: string, subjectId: number) {
  const existingQuiz = await prisma.quiz.findUnique({
    where: {
      title_subjectId: {
        title,
        subjectId,
      },
    },
    select: { id: true },
  });

  if (!existingQuiz) {
    return false;
  }

  await prisma.$transaction([
    prisma.question.deleteMany({ where: { quizId: existingQuiz.id } }),
    prisma.quiz.delete({ where: { id: existingQuiz.id } }),
  ]);

  return true;
}

const quizzes: SeedQuiz[] = [
  {
    title: "Atome & Moleküle",
    description: "Single-Choice Quiz zu Atomen und Molekülen",
    jahrgang: 2,
    questions: [
      {
        questionText: "Was sagt das Gesetz der Massenerhaltung?",
        answerText1: "Masse verschwindet",
        answerText2: "Masse bleibt gleich",
        answerText3: "Masse wächst",
        answerText4: "Masse wird Energie",
        correctOption: "B",
      },
      {
        questionText: "Was bedeutet H₂O?",
        answerText1: "1 H, 2 O",
        answerText2: "2 H, 1 O",
        answerText3: "3 H",
        answerText4: "2 O",
        correctOption: "B",
      },
    ],
  },
  {
    title: "Chemische Bindungen",
    description: "Single-Choice Quiz zu chemischen Bindungen",
    jahrgang: 2,
    questions: [
      {
        questionText: "Was ist die Oktettregel?",
        answerText1: "8 Protonen",
        answerText2: "8 Elektronen in Außenschale",
        answerText3: "8 Atome",
        answerText4: "8 Moleküle",
        correctOption: "B",
      },
      {
        questionText: "Ionenbindung entsteht bei:",
        answerText1: "Metall + Metall",
        answerText2: "Nichtmetall + Nichtmetall",
        answerText3: "Metall + Nichtmetall",
        answerText4: "Gas + Gas",
        correctOption: "C",
      },
    ],
  },
  {
    title: "Chemische Reaktionen",
    description: "Single-Choice Quiz zu chemischen Reaktionen",
    jahrgang: 2,
    questions: [
      {
        questionText: "Was passiert bei einer chemischen Reaktion?",
        answerText1: "nur Formänderung",
        answerText2: "neue Stoffe entstehen",
        answerText3: "nichts",
        answerText4: "nur Temperatur",
        correctOption: "B",
      },
      {
        questionText: "Exotherm bedeutet:",
        answerText1: "Energie wird aufgenommen",
        answerText2: "Energie wird abgegeben",
        answerText3: "keine Energie",
        answerText4: "Licht entsteht",
        correctOption: "B",
      },
      {
        questionText: "Endotherm bedeutet:",
        answerText1: "Energie wird frei",
        answerText2: "Energie wird benötigt",
        answerText3: "keine Reaktion",
        answerText4: "nur Wärme",
        correctOption: "B",
      },
    ],
  },
  {
    title: "Redox",
    description: "Single-Choice Quiz zu Redoxreaktionen",
    jahrgang: 2,
    questions: [
      {
        questionText: "Oxidation ist:",
        answerText1: "Elektronenaufnahme",
        answerText2: "Elektronenabgabe",
        answerText3: "Protonenabgabe",
        answerText4: "Energie",
        correctOption: "B",
      },
      {
        questionText: "Reduktion ist:",
        answerText1: "Elektronenabgabe",
        answerText2: "Elektronenaufnahme",
        answerText3: "Wärme",
        answerText4: "Gas",
        correctOption: "B",
      },
      {
        questionText: "Was gilt immer?",
        answerText1: "nur Oxidation",
        answerText2: "nur Reduktion",
        answerText3: "beides gleichzeitig",
        answerText4: "nichts",
        correctOption: "C",
      },
    ],
  },
  {
    title: "Säuren & Basen",
    description: "Single-Choice Quiz zu Säuren und Basen",
    jahrgang: 2,
    questions: [
      {
        questionText: "Was zeigt ein Indikator?",
        answerText1: "Temperatur",
        answerText2: "pH-Wert",
        answerText3: "Masse",
        answerText4: "Druck",
        correctOption: "B",
      },
      {
        questionText: "Säuren enthalten:",
        answerText1: "OH⁻",
        answerText2: "H⁺",
        answerText3: "Na⁺",
        answerText4: "Cl⁻",
        correctOption: "B",
      },
      {
        questionText: "Basen enthalten:",
        answerText1: "H⁺",
        answerText2: "OH⁻",
        answerText3: "CO₂",
        answerText4: "O₂",
        correctOption: "B",
      },
    ],
  },
  {
    title: "pH-Wert",
    description: "Single-Choice Quiz zum pH-Wert",
    jahrgang: 2,
    questions: [
      {
        questionText: "Niedriger pH-Wert bedeutet:",
        answerText1: "basisch",
        answerText2: "sauer",
        answerText3: "neutral",
        answerText4: "fest",
        correctOption: "B",
      },
      {
        questionText: "Blut pH:",
        answerText1: "sauer",
        answerText2: "neutral",
        answerText3: "leicht basisch",
        answerText4: "extrem sauer",
        correctOption: "C",
      },
    ],
  },
  {
    title: "Ökologie & Umwelt",
    description: "Single-Choice Quiz zu Ökologie und Umwelt",
    jahrgang: 2,
    questions: [
      {
        questionText: "Produzenten sind:",
        answerText1: "Tiere",
        answerText2: "Pflanzen",
        answerText3: "Menschen",
        answerText4: "Bakterien",
        correctOption: "B",
      },
      {
        questionText: "Was ist LD50?",
        answerText1: "Temperatur",
        answerText2: "tödliche Dosis",
        answerText3: "Druck",
        answerText4: "Energie",
        correctOption: "B",
      },
      {
        questionText: "CO entsteht durch:",
        answerText1: "vollständige Verbrennung",
        answerText2: "unvollständige Verbrennung",
        answerText3: "Wasser",
        answerText4: "Luft",
        correctOption: "B",
      },
    ],
  },
  {
    title: "Umweltchemie",
    description: "Single-Choice Quiz zur Umweltchemie",
    jahrgang: 2,
    questions: [
      {
        questionText: "Ozon schützt vor:",
        answerText1: "Regen",
        answerText2: "UV-Strahlung",
        answerText3: "CO₂",
        answerText4: "Wind",
        correctOption: "B",
      },
    ],
  },
  {
    title: "Puffer & Umwelt",
    description: "Single-Choice Quiz zu Pufferlösungen",
    jahrgang: 2,
    questions: [
      {
        questionText: "Pufferlösungen:",
        answerText1: "ändern pH stark",
        answerText2: "halten pH konstant",
        answerText3: "sind Säuren",
        answerText4: "sind Basen",
        correctOption: "B",
      },
    ],
  },
  {
    title: "Stoffe & Grundlagen",
    description: "Single-Choice Quiz zu Stoffbegriffen",
    jahrgang: 2,
    questions: [
      {
        questionText: "Was ist ein Mol?",
        answerText1: "Masse",
        answerText2: "Teilchenanzahl",
        answerText3: "Volumen",
        answerText4: "Energie",
        correctOption: "B",
      },
      {
        questionText: "Physikalischer Vorgang:",
        answerText1: "neuer Stoff",
        answerText2: "gleiche Substanz",
        answerText3: "chemisch",
        answerText4: "Reaktion",
        correctOption: "B",
      },
    ],
  },
];

const mechatronikQuizzes: SeedQuiz[] = [
  {
    title: "Wechselstrom, Spule & Blindgrößen",
    description: "Single-Choice Quiz zu Wechselstrom, Spule und Blindgrößen",
    jahrgang: 3,
    questions: [
      {
        questionText: "Was beschreibt der Scheinwiderstand Z?",
        answerText1: "nur den Wirkwiderstand",
        answerText2: "Gesamtwiderstand aus Wirk- und Blindanteil",
        answerText3: "nur Blindwiderstand",
        answerText4: "Spannung",
        correctOption: "B",
      },
      {
        questionText: "Wie berechnet man den induktiven Blindwiderstand?",
        answerText1: "XL = 1/(2πfL)",
        answerText2: "XL = 2πfL",
        answerText3: "XL = R·I",
        answerText4: "XL = U·I",
        correctOption: "B",
      },
      {
        questionText: "Was beschreibt die Induktivität L?",
        answerText1: "Widerstand",
        answerText2: "Fähigkeit, Energie im Magnetfeld zu speichern",
        answerText3: "Strom",
        answerText4: "Leistung",
        correctOption: "B",
      },
      {
        questionText: "Wie hängen Wirkspannung und Blindspannung zusammen?",
        answerText1: "addieren sich linear",
        answerText2: "stehen senkrecht im Zeigerdiagramm",
        answerText3: "sind gleich",
        answerText4: "haben keine Beziehung",
        correctOption: "B",
      },
      {
        questionText: "Was bedeutet ein großer Blindanteil?",
        answerText1: "viel Nutzleistung",
        answerText2: "schlechte Energieausnutzung",
        answerText3: "kein Strom",
        answerText4: "kein Widerstand",
        correctOption: "B",
      },
    ],
  },
  {
    title: "Kondensator & Parallelschaltung",
    description: "Single-Choice Quiz zu Kondensator und Parallelschaltung",
    jahrgang: 3,
    questions: [
      {
        questionText: "Wie berechnet man den kapazitiven Blindwiderstand?",
        answerText1: "XC = 2πfC",
        answerText2: "XC = 1/(2πfC)",
        answerText3: "XC = R·C",
        answerText4: "XC = U/I",
        correctOption: "B",
      },
      {
        questionText: "Was passiert mit XC, wenn die Frequenz steigt?",
        answerText1: "steigt",
        answerText2: "bleibt gleich",
        answerText3: "sinkt",
        answerText4: "wird 0",
        correctOption: "C",
      },
      {
        questionText: "Wie berechnet man den Blindstrom durch den Kondensator?",
        answerText1: "I = U·R",
        answerText2: "I = U/XC",
        answerText3: "I = R·XC",
        answerText4: "I = U·XC",
        correctOption: "B",
      },
      {
        questionText: "Wie setzt sich der Gesamtstrom in der Parallelschaltung zusammen?",
        answerText1: "Summe der Spannungen",
        answerText2: "Vektorielle Addition der Ströme",
        answerText3: "einfache Addition",
        answerText4: "nur Wirkstrom",
        correctOption: "B",
      },
      {
        questionText: "Was beschreibt die Phasenverschiebung?",
        answerText1: "Zeit",
        answerText2: "Unterschied zwischen Strom und Spannung",
        answerText3: "Widerstand",
        answerText4: "Leistung",
        correctOption: "B",
      },
      {
        questionText: "Wie berechnet man die Scheinleistung?",
        answerText1: "S = U·I",
        answerText2: "S = R·I",
        answerText3: "S = U²",
        answerText4: "S = I²",
        correctOption: "A",
      },
    ],
  },
  {
    title: "Ohmsche Verbraucher & Leistung",
    description: "Single-Choice Quiz zu ohmschen Verbrauchern und Leistung",
    jahrgang: 3,
    questions: [
      {
        questionText: "Wie berechnet man den Widerstand eines Verbrauchers?",
        answerText1: "R = U/I",
        answerText2: "R = U·I",
        answerText3: "R = P·U",
        answerText4: "R = I²",
        correctOption: "A",
      },
      {
        questionText: "Wie berechnet man Leistung bei rein ohmscher Last?",
        answerText1: "P = U·I",
        answerText2: "P = U²·I",
        answerText3: "P = I/R",
        answerText4: "P = U/R",
        correctOption: "A",
      },
      {
        questionText: "Was ist der Scheitelwert des Stroms?",
        answerText1: "Mittelwert",
        answerText2: "Effektivwert",
        answerText3: "maximaler Wert der Sinuskurve",
        answerText4: "minimaler Wert",
        correctOption: "C",
      },
      {
        questionText: "Wie hängt Scheitelwert mit Effektivwert zusammen?",
        answerText1: "gleich",
        answerText2: "√2 · Ieff",
        answerText3: "Ieff / 2",
        answerText4: "Ieff²",
        correctOption: "B",
      },
      {
        questionText: "Was passiert mit der Leistung bei Verdopplung der Spannung?",
        answerText1: "halbiert sich",
        answerText2: "bleibt gleich",
        answerText3: "vervierfacht sich",
        answerText4: "verdoppelt sich",
        correctOption: "C",
      },
    ],
  },
  {
    title: "Grundlagen: Effektivwert, Induktivität & Blindleistung",
    description: "Single-Choice Quiz zu Effektivwert, Induktivität und Blindleistung",
    jahrgang: 3,
    questions: [
      {
        questionText: "Was ist der Effektivwert der Spannung?",
        answerText1: "Spitzenwert",
        answerText2: "Mittelwert",
        answerText3: "Gleichwertige Spannung mit gleicher Leistung",
        answerText4: "Differenzwert",
        correctOption: "C",
      },
      {
        questionText: "Wie verhält sich eine Induktivität bei Wechselspannung?",
        answerText1: "kein Einfluss",
        answerText2: "erzeugt Blindwiderstand",
        answerText3: "Kurzschluss",
        answerText4: "keine Energie",
        correctOption: "B",
      },
      {
        questionText: "Wie verhält sich der Strom bei einer Spule?",
        answerText1: "eilt voraus",
        answerText2: "eilt nach",
        answerText3: "gleich",
        answerText4: "zufällig",
        correctOption: "B",
      },
      {
        questionText: "Wie verhält sich eine Induktivität bei Gleichspannung (stationär)?",
        answerText1: "hoher Widerstand",
        answerText2: "Kurzschluss (nur Drahtwiderstand)",
        answerText3: "kein Strom",
        answerText4: "unendlich Widerstand",
        correctOption: "B",
      },
      {
        questionText: "Was ist Blindleistung?",
        answerText1: "nutzbare Leistung",
        answerText2: "Verlustleistung",
        answerText3: "Energieaustausch zwischen Quelle und Feld",
        answerText4: "Wärme",
        correctOption: "C",
      },
      {
        questionText: "Wo tritt Blindleistung hauptsächlich auf?",
        answerText1: "Widerständen",
        answerText2: "Kondensatoren und Spulen",
        answerText3: "Batterien",
        answerText4: "Lampen",
        correctOption: "B",
      },
    ],
  },
  {
    title: "Drehstrom & Sternschaltung",
    description: "Single-Choice Quiz zu Drehstrom und Sternschaltung",
    jahrgang: 3,
    questions: [
      {
        questionText: "Wie viele Phasen hat Drehstrom?",
        answerText1: "1",
        answerText2: "2",
        answerText3: "3",
        answerText4: "4",
        correctOption: "C",
      },
      {
        questionText: "Wie sind die Phasen verschoben?",
        answerText1: "60°",
        answerText2: "90°",
        answerText3: "120°",
        answerText4: "180°",
        correctOption: "C",
      },
      {
        questionText: "Was ist besonders an der Summe der Ströme im Drehstromsystem?",
        answerText1: "maximal",
        answerText2: "immer 0",
        answerText3: "unendlich",
        answerText4: "zufällig",
        correctOption: "B",
      },
      {
        questionText: "Was ist eine Sternschaltung?",
        answerText1: "Parallelschaltung",
        answerText2: "Reihenschaltung",
        answerText3: "Zusammenschluss aller Phasen an einem Punkt",
        answerText4: "Kurzschluss",
        correctOption: "C",
      },
      {
        questionText: "Wie nennt man den gemeinsamen Punkt?",
        answerText1: "Phase",
        answerText2: "Nullpunkt / Sternpunkt",
        answerText3: "Leiter",
        answerText4: "Widerstand",
        correctOption: "B",
      },
      {
        questionText: "Was ist ein Vorteil von Drehstrom?",
        answerText1: "weniger Leistung",
        answerText2: "gleichmäßige Leistungsabgabe",
        answerText3: "keine Spannung",
        answerText4: "kein Strom",
        correctOption: "B",
      },
    ],
  },
];

async function seedSubject(
  subjectName: string,
  subjectDescription: string,
  subjectQuizzes: SeedQuiz[],
) {
  const subject = await prisma.subject.upsert({
    where: { name: subjectName },
    update: { description: subjectDescription },
    create: { name: subjectName, description: subjectDescription },
  });

  for (const quizSeed of subjectQuizzes) {
    const removed = await removeExistingQuiz(quizSeed.title, subject.id);
    if (removed) {
      console.log(`Removed existing quiz: ${quizSeed.title}`);
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: quizSeed.title,
        description: quizSeed.description,
        subjectId: subject.id,
        jahrgang: quizSeed.jahrgang,
      },
    });

    for (const question of quizSeed.questions) {
      await prisma.question.create({
        data: {
          ...buildQuestionData(question),
          quizId: quiz.id,
        },
      });
    }

    console.log(
      `Seeded quiz: ${quiz.title} (${quizSeed.questions.length} Fragen)`,
    );
  }

}

async function main() {
  console.log("Starting seed for Angewandte Mechatronik (Jahrgang 3)...");
  await seedSubject(
    "Angewandte Mechatronik",
    "Wechselstrom, Kondensator, Leistung und Drehstrom",
    mechatronikQuizzes,
  );

  console.log("Seed completed successfully.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed error:", error);
    Deno.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
