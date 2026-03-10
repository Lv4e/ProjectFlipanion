"use client";

import React from "react";
import { supabase } from "../../supabase-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import CustomDropdown from "../../../components/CustomDropdown";

interface Subject {
  id: number;
  name: string;
}

interface QuestionForm {
  questionText: string;
  answerText1: string;
  answerText2: string;
  answerText3: string;
  answerText4: string;
  correctAnswer: string; // '1' | '2' | '3' | '4'
}

const emptyQuestion = (): QuestionForm => ({
  questionText: "",
  answerText1: "",
  answerText2: "",
  answerText3: "",
  answerText4: "",
  correctAnswer: "1",
});

export default function CreateQuiz() {
  const router = useRouter();

  // Auth
  const [user, setUser] = React.useState<
    import("@supabase/supabase-js").User | null
  >(null);
  const [authLoading, setAuthLoading] = React.useState(true);

  // Form state
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [subjectId, setSubjectId] = React.useState<number | "">("");
  const [questions, setQuestions] = React.useState<QuestionForm[]>([
    emptyQuestion(),
  ]);

  // Data
  const [subjects, setSubjects] = React.useState<Subject[]>([]);

  // UI state
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Fetch user & subjects
  React.useEffect(() => {
    async function init() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      setAuthLoading(false);

      const { data: subjectsData } = await supabase
        .from("Subject")
        .select("*")
        .order("name", { ascending: true });

      if (subjectsData) setSubjects(subjectsData);
    }
    init();
  }, []);

  // Question helpers
  const updateQuestion = (
    index: number,
    field: keyof QuestionForm,
    value: string,
  ) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation
  const validate = (): string | null => {
    if (!title.trim()) return "Bitte gib einen Quiz-Titel ein.";
    if (!subjectId) return "Bitte wähle ein Fach aus.";
    if (questions.length === 0) return "Füge mindestens eine Frage hinzu.";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim())
        return `Frage ${i + 1}: Bitte gib den Fragetext ein.`;
      if (!q.answerText1.trim()) return `Frage ${i + 1}: Antwort 1 fehlt.`;
      if (!q.answerText2.trim()) return `Frage ${i + 1}: Antwort 2 fehlt.`;
      if (!q.answerText3.trim()) return `Frage ${i + 1}: Antwort 3 fehlt.`;
      if (!q.answerText4.trim()) return `Frage ${i + 1}: Antwort 4 fehlt.`;
    }
    return null;
  };

  // Save to Supabase
  const handleSave = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      // 0) Get the DB user id from supabaseId
      let creatorId: number | null = null;
      if (user) {
        const { data: dbUser } = await supabase
          .from("User")
          .select("id")
          .eq("supabaseId", user.id)
          .single();
        if (dbUser) creatorId = dbUser.id;
      }

      // 1) Insert quiz
      const { data: quizData, error: quizError } = await supabase
        .from("Quiz")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          subjectId: subjectId as number,
          creatorId,
        })
        .select("id")
        .single();

      if (quizError) {
        throw new Error(quizError.message);
      }

      const quizId = quizData.id;

      // 2) Insert questions
      const questionRows = questions.map((q) => {
        const answerKey = `answerText${q.correctAnswer}` as keyof QuestionForm;
        return {
          questionText: q.questionText.trim(),
          answerText1: q.answerText1.trim(),
          answerText2: q.answerText2.trim(),
          answerText3: q.answerText3.trim(),
          answerText4: q.answerText4.trim(),
          correctAnswer: q[answerKey].trim(),
          quizId,
        };
      });

      const { error: questionsError } = await supabase
        .from("Question")
        .insert(questionRows);

      if (questionsError) {
        throw new Error(questionsError.message);
      }

      setSuccess(true);

      // Redirect to quiz after a short delay
      setTimeout(() => {
        router.push(`/quizes/${quizId}`);
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Ein unbekannter Fehler ist aufgetreten.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[color-mix(in_srgb,var(--primary)_25%,transparent)] border-t-[var(--primary)] rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Lädt ...</span>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-2xl mx-auto px-6 pt-28 pb-12">
          <div className="glass-card rounded-xl p-10 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              Anmeldung erforderlich
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              Du musst angemeldet sein, um ein Quiz zu erstellen.
            </p>
            <Link href="/auth">
              <button className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-lg hover:opacity-90 transition-all duration-300 active:scale-[0.98] cursor-pointer">
                Jetzt anmelden
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="max-w-2xl mx-auto px-6 pt-28 pb-12">
          <div className="glass-card rounded-xl p-10 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            </h2>
            <p className="text-[var(--text-muted)]">
              Du wirst gleich weitergeleitet ...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-3xl mx-auto px-8 pt-32 pb-20">
        {/* Page Header */}
        <div className="mb-10 animate-fade-in-up">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] mb-6 transition-colors duration-300"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Zurück zum Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-[-0.03em] mb-2">
            Neues Quiz erstellen
          </h1>
          <p className="text-lg text-[var(--text-muted)]">
            Fülle die Felder aus und füge deine Fragen hinzu.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="border border-red-500/20 rounded-lg p-4 mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-400 text-sm font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Quiz Details Card */}
        <div className="glass-card rounded-xl p-6 md:p-8 mb-6 animate-fade-in-up-delay-1 relative z-20" style={{ overflow: 'visible' }}>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-5 flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-[var(--primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            Quiz-Details
          </h2>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-[13px] font-medium text-[var(--text-muted)] mb-2"
              >
                Titel <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="z.B. Mathe Grundlagen Quiz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:ring-1 focus:ring-[var(--border-strong)] focus:border-[var(--border-strong)] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] transition-all outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-[13px] font-medium text-[var(--text-muted)] mb-2"
              >
                Beschreibung{" "}
                <span className="text-[var(--text-subtle)] text-xs">
                  (optional)
                </span>
              </label>
              <textarea
                id="description"
                placeholder="Worum geht es in diesem Quiz?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:ring-1 focus:ring-[var(--border-strong)] focus:border-[var(--border-strong)] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] transition-all outline-none resize-none"
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-[13px] font-medium text-[var(--text-muted)] mb-2"
              >
                Fach <span className="text-red-400">*</span>
              </label>
              <CustomDropdown
                id="subject"
                value={subjectId === '' ? '' : String(subjectId)}
                onChange={(val) => setSubjectId(val ? Number(val) : '')}
                placeholder="Fach auswählen ..."
                options={subjects.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="animate-fade-in-up-delay-2 relative z-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
              <div className="w-8 h-8 bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-[var(--primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              Fragen ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[var(--text-muted)] border border-[var(--border)] rounded-lg hover:border-[var(--border-strong)] hover:text-[var(--foreground)] transition-all cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Frage hinzufügen
            </button>
          </div>

          <div className="space-y-5">
            {questions.map((q, idx) => (
              <div key={idx} className="glass-card rounded-xl p-6 md:p-7">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                    <span className="w-7 h-7 bg-[var(--surface-hover)] border border-[var(--border)] rounded-md flex items-center justify-center text-[var(--text-muted)] text-xs font-medium">
                      {idx + 1}
                    </span>
                    Frage {idx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Frage entfernen"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">
                    Fragetext <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    placeholder="Wie lautet die Frage?"
                    value={q.questionText}
                    onChange={(e) =>
                      updateQuestion(idx, "questionText", e.target.value)
                    }
                    rows={2}
                    className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:ring-1 focus:ring-[var(--border-strong)] focus:border-[var(--border-strong)] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] transition-all outline-none resize-none"
                  />
                </div>

                {/* Answers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {([1, 2, 3, 4] as const).map((num) => {
                    const fieldKey = `answerText${num}` as keyof QuestionForm;
                    const isCorrect = q.correctAnswer === String(num);
                    return (
                      <div key={num} className="relative">
                        <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">
                          Antwort {num} <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={`Antwort ${num} eingeben`}
                            value={q[fieldKey]}
                            onChange={(e) =>
                              updateQuestion(idx, fieldKey, e.target.value)
                            }
                            className={`w-full px-4 py-2.5 pr-10 bg-[var(--background)] border rounded-lg focus:ring-1 focus:ring-[var(--border-strong)] focus:border-[var(--border-strong)] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] transition-all outline-none ${
                              isCorrect
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-[var(--border)]"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateQuestion(idx, "correctAnswer", String(num))
                            }
                            title={
                              isCorrect
                                ? "Richtige Antwort"
                                : "Als richtig markieren"
                            }
                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              isCorrect
                                ? "bg-green-500 text-white"
                                : "bg-[var(--border)] text-[var(--text-muted)] hover:bg-green-500/20 hover:text-green-500"
                            }`}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Correct answer hint */}
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <svg
                    className="w-3.5 h-3.5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Richtige Antwort: Antwort {q.correctAnswer}
                  {q[`answerText${q.correctAnswer}` as keyof QuestionForm] && (
                    <span className="text-green-400 font-medium">
                      —{" "}
                      {q[`answerText${q.correctAnswer}` as keyof QuestionForm]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button (Bottom) */}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full mt-5 py-4 border-2 border-dashed border-[var(--border)] hover:border-[var(--border-strong)] rounded-xl text-[var(--text-muted)] hover:text-[var(--foreground)] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Weitere Frage hinzufügen
          </button>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up-delay-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3.5 px-8 bg-[var(--foreground)] text-[var(--background)] font-medium rounded-lg hover:opacity-90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-[var(--background)]/30 border-t-[var(--background)] rounded-full animate-spin" />
                Wird gespeichert ...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Quiz erstellen
              </>
            )}
          </button>
          <Link href="/" className="flex-shrink-0">
            <button
              type="button"
              className="w-full sm:w-auto py-3.5 px-8 bg-[var(--surface)] text-[var(--foreground)] font-medium rounded-lg border border-[var(--border)] hover:border-[var(--border-strong)] transition-all cursor-pointer"
            >
              Abbrechen
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
