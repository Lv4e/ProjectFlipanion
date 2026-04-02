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
        title: "Materialwirtschaft & Logistik",
        description: "Single-Choice Quiz zu Materialwirtschaft und Logistik",
        jahrgang: 1,
        questions: [
            {
                questionText: "Was ist das Hauptziel der Materialwirtschaft?",
                answerText1: "Gewinne maximieren",
                answerText2: "Materialien richtig bereitstellen",
                answerText3: "Mitarbeiter führen",
                answerText4: "Maschinen warten",
                correctOption: "B",
            },
            {
                questionText: "Was gehört zum „magischen Dreieck“?",
                answerText1: "Qualität, Zeit, Kosten",
                answerText2: "Gewinn, Umsatz, Kosten",
                answerText3: "Material, Transport, Lager",
                answerText4: "Produktion, Verkauf, Einkauf",
                correctOption: "A",
            },
            {
                questionText: "Welche Aufgabe gehört zur Materialbeschaffung?",
                answerText1: "Transport",
                answerText2: "Lagerung",
                answerText3: "Einkauf",
                answerText4: "Entsorgung",
                correctOption: "C",
            },
            {
                questionText: "Was beschreibt Logistik?",
                answerText1: "Personalplanung",
                answerText2: "Materialfluss",
                answerText3: "Gewinn",
                answerText4: "Maschinenleistung",
                correctOption: "B",
            },
            {
                questionText: "Was ist Distributionslogistik?",
                answerText1: "Einkauf",
                answerText2: "Produktion",
                answerText3: "Verkauf an Kunden",
                answerText4: "Lagerung",
                correctOption: "C",
            },
            {
                questionText: "Was ist Entsorgungslogistik?",
                answerText1: "Transport",
                answerText2: "Verkauf",
                answerText3: "Abfallentsorgung",
                answerText4: "Einkauf",
                correctOption: "C",
            },
        ],
    },
    {
        title: "Materialarten",
        description: "Single-Choice Quiz zu Rohstoffen und Materialarten",
        jahrgang: 1,
        questions: [
            {
                questionText: "Was sind Rohstoffe?",
                answerText1: "Fertige Produkte",
                answerText2: "Unbearbeitete natürliche Ressourcen",
                answerText3: "Halbfertige Produkte",
                answerText4: "Maschinen",
                correctOption: "B",
            },
            {
                questionText: "Was sind Halbfabrikate?",
                answerText1: "Endprodukte",
                answerText2: "Rohstoffe",
                answerText3: "Vorprodukte",
                answerText4: "Abfallstoffe",
                correctOption: "C",
            },
            {
                questionText: "Was sind Fertigerzeugnisse?",
                answerText1: "Rohstoffe",
                answerText2: "Endprodukte",
                answerText3: "Halbfabrikate",
                answerText4: "Maschinen",
                correctOption: "B",
            },
            {
                questionText: "Was sind Hilfsstoffe?",
                answerText1: "Gehen nicht ins Produkt ein",
                answerText2: "Werden verkauft",
                answerText3: "Gehen ins Produkt ein",
                answerText4: "Sind Maschinen",
                correctOption: "C",
            },
            {
                questionText: "Was sind Betriebsstoffe?",
                answerText1: "Werden verkauft",
                answerText2: "Gehen ins Produkt ein",
                answerText3: "Gehen nicht ins Produkt ein",
                answerText4: "Sind Rohstoffe",
                correctOption: "C",
            },
        ],
    },
    {
        title: "Transport & Verpackung",
        description: "Single-Choice Quiz zu Transport und Verpackungsarten",
        jahrgang: 1,
        questions: [
            {
                questionText: "Was sind Transportmittel?",
                answerText1: "Nur Maschinen",
                answerText2: "Mittel zum Transport von Gütern/Personen",
                answerText3: "Nur Fahrzeuge",
                answerText4: "Nur Lager",
                correctOption: "B",
            },
            {
                questionText: "Was ist ein Beispiel für innerbetrieblichen Transport?",
                answerText1: "Flugzeug",
                answerText2: "Schiff",
                answerText3: "Förderband",
                answerText4: "Zug",
                correctOption: "C",
            },
            {
                questionText: "Was ist Stückgut?",
                answerText1: "Flüssig",
                answerText2: "Gasförmig",
                answerText3: "Einzelne transportierbare Einheiten",
                answerText4: "Pulver",
                correctOption: "C",
            },
            {
                questionText: "Was ist Schüttgut?",
                answerText1: "Verpackt",
                answerText2: "Flüssig",
                answerText3: "Lose Materialien",
                answerText4: "Einzelteile",
                correctOption: "C",
            },
            {
                questionText: "Was ist Primärverpackung?",
                answerText1: "Transportverpackung",
                answerText2: "Konsumverpackung",
                answerText3: "Lagerverpackung",
                answerText4: "Schutzverpackung",
                correctOption: "B",
            },
            {
                questionText: "Was ist eine Tertiärverpackung?",
                answerText1: "Einzelverpackung",
                answerText2: "Karton",
                answerText3: "Palette",
                answerText4: "Folie",
                correctOption: "C",
            },
        ],
    },
    {
        title: "Materialfluss & Planung",
        description: "Single-Choice Quiz zu Materialfluss und Planung",
        jahrgang: 1,
        questions: [
            {
                questionText: "Was ist das Ziel der Materialflussplanung?",
                answerText1: "Kosten erhöhen",
                answerText2: "Wege optimieren",
                answerText3: "Produktion stoppen",
                answerText4: "Lager vergrößern",
                correctOption: "B",
            },
            {
                questionText: "Was ist eine Materialflussanalyse?",
                answerText1: "Kostenrechnung",
                answerText2: "Analyse der Transportwege",
                answerText3: "Personalplanung",
                answerText4: "Verkaufsanalyse",
                correctOption: "B",
            },
            {
                questionText: "Was ist ein Von-Nach-Diagramm?",
                answerText1: "Kostenplan",
                answerText2: "Transportmatrix",
                answerText3: "Lagerplan",
                answerText4: "Zeitplan",
                correctOption: "B",
            },
            {
                questionText: "Was zeigt ein Sankey-Diagramm?",
                answerText1: "Gewinne",
                answerText2: "Energiefluss",
                answerText3: "Materialflüsse",
                answerText4: "Kosten",
                correctOption: "C",
            },
        ],
    },
    {
        title: "Management & Ziele",
        description: "Single-Choice Quiz zu Management und Zielsystemen",
        jahrgang: 1,
        questions: [
            {
                questionText: "Was ist Management?",
                answerText1: "Produktion",
                answerText2: "Leitung und Organisation",
                answerText3: "Verkauf",
                answerText4: "Lagerung",
                correctOption: "B",
            },
            {
                questionText: "Welche Aufgabe hat ein Manager?",
                answerText1: "Nur produzieren",
                answerText2: "Ziele festlegen, planen, steuern",
                answerText3: "Nur verkaufen",
                answerText4: "Nur einkaufen",
                correctOption: "B",
            },
            {
                questionText: "Was ist ein ökonomisches Ziel?",
                answerText1: "Spaß",
                answerText2: "Gewinn",
                answerText3: "Freizeit",
                answerText4: "Urlaub",
                correctOption: "B",
            },
            {
                questionText: "Was bedeutet Liquidität?",
                answerText1: "Gewinn",
                answerText2: "Zahlungsfähigkeit",
                answerText3: "Umsatz",
                answerText4: "Kosten",
                correctOption: "B",
            },
            {
                questionText: "Was ist ein langfristiges Ziel?",
                answerText1: "Gewinn heute",
                answerText2: "Forschung & Entwicklung",
                answerText3: "Einkauf",
                answerText4: "Lagerung",
                correctOption: "B",
            },
        ],
    },
    {
        title: "Outsourcing & Insourcing",
        description: "Single-Choice Quiz zu Outsourcing und Insourcing",
        jahrgang: 1,
        questions: [
            {
                questionText: "Was ist Outsourcing?",
                answerText1: "Produktion intern",
                answerText2: "Aufgaben extern vergeben",
                answerText3: "Lagerung",
                answerText4: "Verkauf",
                correctOption: "B",
            },
            {
                questionText: "Ein Vorteil von Outsourcing ist:",
                answerText1: "Mehr Kosten",
                answerText2: "Fokus auf Kernkompetenzen",
                answerText3: "Mehr Arbeit",
                answerText4: "Weniger Kontrolle",
                correctOption: "B",
            },
            {
                questionText: "Ein Nachteil von Outsourcing ist:",
                answerText1: "Mehr Wissen",
                answerText2: "Know-how-Verlust",
                answerText3: "Mehr Gewinn",
                answerText4: "Weniger Aufwand",
                correctOption: "B",
            },
            {
                questionText: "Was ist Insourcing?",
                answerText1: "Aufgaben abgeben",
                answerText2: "Aufgaben selbst übernehmen",
                answerText3: "Verkauf",
                answerText4: "Transport",
                correctOption: "B",
            },
        ],
    },
    {
        title: "Kennzahlen & Wirtschaftlichkeit",
        description: "Single-Choice Quiz zu Kennzahlen und Wirtschaftlichkeit",
        jahrgang: 1,
        questions: [
            {
                questionText: "Was sind Kennzahlen?",
                answerText1: "Maschinen",
                answerText2: "Messgrößen für Unternehmen",
                answerText3: "Produkte",
                answerText4: "Mitarbeiter",
                correctOption: "B",
            },
            {
                questionText: "Was ist Produktivität?",
                answerText1: "Gewinn",
                answerText2: "Ausbringung / Einsatz",
                answerText3: "Kosten",
                answerText4: "Umsatz",
                correctOption: "B",
            },
            {
                questionText: "Was ist Rentabilität?",
                answerText1: "Umsatz / Kosten",
                answerText2: "Gewinn / Kapital",
                answerText3: "Kosten / Gewinn",
                answerText4: "Kapital / Umsatz",
                correctOption: "B",
            },
            {
                questionText: "Was beschreibt Gewinn?",
                answerText1: "Kosten – Erlöse",
                answerText2: "Erlöse – Kosten",
                answerText3: "Kapital – Kosten",
                answerText4: "Umsatz – Kapital",
                correctOption: "B",
            },
            {
                questionText: "Was ist ein KPI?",
                answerText1: "Produkt",
                answerText2: "Kennzahl",
                answerText3: "Maschine",
                answerText4: "Mitarbeiter",
                correctOption: "B",
            },
            {
                questionText: "Was bedeutet „rot“ im KPI-Ampelsystem?",
                answerText1: "Alles gut",
                answerText2: "Warnung",
                answerText3: "Problem / Handlungsbedarf",
                answerText4: "Neutral",
                correctOption: "C",
            },
        ],
    },
];

async function main() {
    console.log("Starting seed for Betriebstechnik...");

    const subject = await prisma.subject.upsert({
        where: { name: "Betriebstechnik" },
        update: {
            description: "Materialwirtschaft, Logistik, Management und Kennzahlen",
        },
        create: {
            name: "Betriebstechnik",
            description: "Materialwirtschaft, Logistik, Management und Kennzahlen",
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
