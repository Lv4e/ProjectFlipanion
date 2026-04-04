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

async function main() {
    console.log("Starting seed for Chemie (Jahrgang 2)...");

    const subject = await prisma.subject.upsert({
        where: { name: "Chemie" },
        update: {
            description: "Atome, Reaktionen, Redox und Umweltchemie",
        },
        create: {
            name: "Chemie",
            description: "Atome, Reaktionen, Redox und Umweltchemie",
        },
    });

    for (const quizSeed of quizzes) {
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

        console.log(`Seeded quiz: ${quiz.title} (${quizSeed.questions.length} Fragen)`);
    }

    console.log("Seed completed successfully.");
}

main()
    .catch((error) => {
        console.error("Seed error:", error);
        Deno.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
