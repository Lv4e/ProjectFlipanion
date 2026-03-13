"use client";

import React from "react";
import { supabase } from "./supabase-client";
import Link from "next/link";
import Footer from "../components/Footer";
import InteractiveCard from "../components/InteractiveCard";
import MagneticButton from "../components/MagneticButton";
import ScrollReveal from "../components/ScrollReveal";

interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

interface CompletedQuiz {
  quizId: number;
  title: string;
  score: number;
  total: number;
  date: string;
  jahrgang: number;
}

interface MyQuiz {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  subjectName: string;
  questionCount: number;
  jahrgang: number;
}

export default function Home() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"mine" | "completed">(
    "mine",
  );
  const [completedQuizzes, setCompletedQuizzes] = React.useState<
    CompletedQuiz[]
  >([]);
  const [loadingCompleted, setLoadingCompleted] = React.useState(false);
  const [myQuizzes, setMyQuizzes] = React.useState<MyQuiz[]>([]);
  const [loadingMyQuizzes, setLoadingMyQuizzes] = React.useState(false);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null);
      if (!session?.user) {
        setMyQuizzes([]);
        setCompletedQuizzes([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser as User | null);
      setLoading(false);

      if (currentUser) {
        // Fetch user's own quizzes
        (async () => {
          setLoadingMyQuizzes(true);
          try {
            const { data: dbUser } = await supabase
              .from("User")
              .select("id")
              .eq("supabaseId", currentUser.id)
              .single();

            if (dbUser) {
              const { data: quizzes } = await supabase
                .from("Quiz")
                .select(
                  "id, title, description, createdAt, subjectId, jahrgang, Subject(name), Question(id)",
                )
                .eq("creatorId", dbUser.id)
                .order("createdAt", { ascending: false });

              if (quizzes) {
                setMyQuizzes(
                  quizzes.map((q: Record<string, unknown>) => ({
                    id: q.id as number,
                    title: q.title as string,
                    description: (q.description as string) || null,
                    createdAt: q.createdAt as string,
                    subjectName:
                      ((q.Subject as Record<string, unknown>)
                        ?.name as string) || "Unbekannt",
                    questionCount: Array.isArray(q.Question)
                      ? q.Question.length
                      : 0,
                    jahrgang: (q.jahrgang as number) || 1,
                  })),
                );
              }
            }
          } catch {
            // ignore
          } finally {
            setLoadingMyQuizzes(false);
          }
        })();

        // Fetch completed quizzes from the database
        (async () => {
          setLoadingCompleted(true);
          try {
            // Get DB user id
            const { data: dbUser } = await supabase
              .from("User")
              .select("id")
              .eq("supabaseId", currentUser.id)
              .single();

            if (!dbUser) {
              setLoadingCompleted(false);
              return;
            }

            // Get all user answers with their question→quiz info
            const { data: userAnswers } = await supabase
              .from("UserAnswer")
              .select(
                "isCorrect, question:Question(id, quizId, quiz:Quiz(id, title, createdAt, jahrgang))",
              )
              .eq("userId", dbUser.id);

            if (!userAnswers || userAnswers.length === 0) {
              setLoadingCompleted(false);
              return;
            }

            // Group answers by quiz
            const quizMap = new Map<
              number,
              { title: string; correct: number; total: number; date: string; jahrgang: number }
            >();

            for (const ua of userAnswers as Array<Record<string, unknown>>) {
              const q = ua.question as Record<string, unknown> | undefined;
              if (!q) continue;
              const quizData = q.quiz as
                | Record<string, unknown>
                | Array<Record<string, unknown>>
                | undefined;
              if (!quizData) continue;
              const quiz = Array.isArray(quizData) ? quizData[0] : quizData;
              if (!quiz) continue;
              const qId = quiz.id as number;
              if (!quizMap.has(qId)) {
                quizMap.set(qId, {
                  title: quiz.title as string,
                  correct: 0,
                  total: 0,
                  date: quiz.createdAt as string,
                  jahrgang: (quiz.jahrgang as number) || 1,
                });
              }
              const entry = quizMap.get(qId)!;
              entry.total++;
              if (ua.isCorrect) entry.correct++;
            }

            const results: CompletedQuiz[] = [];
            quizMap.forEach((v, quizId) => {
              results.push({
                quizId,
                title: v.title,
                score: v.correct,
                total: v.total,
                date: v.date,
                jahrgang: v.jahrgang,
              });
            });

            // Sort by most recently created quiz
            results.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
            setCompletedQuizzes(results);
          } catch {
            // ignore
          } finally {
            setLoadingCompleted(false);
          }
        })();
      }
    });
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[color-mix(in_srgb,var(--primary)_25%,transparent)] border-t-[var(--primary)] rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Lädt ...</span>
        </div>
      </div>
    );
  }

  // Landing Page for non-logged-in users
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] overflow-hidden">

        {/* Background orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="orb orb-primary" style={{ top: '-15%', right: '-5%', width: '700px', height: '700px' }} />
          <div className="orb orb-accent" style={{ bottom: '-10%', left: '-8%', width: '550px', height: '550px' }} />
          <div className="orb orb-primary" style={{ top: '40%', left: '50%', width: '400px', height: '400px', opacity: 0.5 }} />
        </div>

        {/* Hero Section */}
        <main className="relative max-w-7xl mx-auto px-8">
          <div className="pt-20 pb-32 lg:pt-28 lg:pb-40">
            {/* Badge */}
            <ScrollReveal direction="up" delay={0}>
              <div className="flex justify-center mb-10">
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] backdrop-blur-sm hover-glow">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-[var(--text-muted)] tracking-wider uppercase">
                    HTL Lernen für HWII · Stoff an einem Ort
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Headline */}
            <ScrollReveal direction="up" delay={100} distance={50}>
              <div className="text-center">
                <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-extrabold tracking-[-0.045em] text-[var(--foreground)] leading-[1.02]">
                  Lernen mit
                  <br />
                  <span className="bg-gradient-to-r from-[var(--primary-light)] via-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                    Flipanion
                  </span>
                </h1>
              </div>
            </ScrollReveal>

            {/* Subtitle */}
            <ScrollReveal direction="up" delay={200}>
              <p className="text-center text-lg md:text-xl lg:text-2xl text-[var(--text-muted)] max-w-2xl mx-auto mt-8 mb-14 leading-relaxed">
                Alle wichtigen Inhalte aus Wirtschaftsingenieurwesen in einer Plattform. Lerne für Tests, Schularbeiten und PLFs.
              </p>
            </ScrollReveal>

            {/* CTA Buttons */}
            <ScrollReveal direction="up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth">
                  <MagneticButton
                    className="px-10 py-4 bg-[var(--foreground)] text-[var(--background)] text-base font-semibold rounded-xl hover:opacity-90 transition-all duration-300 active:scale-[0.97] cursor-pointer hover-glow"
                    strength={0.25}
                  >
                    Beginne mit dem Lernen
                  </MagneticButton>
                </Link>
                <Link href="/browse">
                  <MagneticButton
                    className="px-10 py-4 text-base font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)] border border-[var(--border-strong)] rounded-xl hover:border-[color-mix(in_srgb,var(--foreground)_20%,transparent)] transition-all duration-300 cursor-pointer"
                    strength={0.25}
                  >
                    Quizze ansehen
                  </MagneticButton>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Features Section */}
          <div className="pb-32">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--foreground)] tracking-[-0.03em] mb-4">
                  Alles für Wirtschaftsingenieur-SchülerInnen
                </h2>
                <p className="text-lg text-[var(--text-muted)] max-w-lg mx-auto">
                  HTL-relevante Stoffgebiete in einem Hub: lernen, wiederholen und schneller prüfungsfit werden.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <ScrollReveal direction="up" delay={0}>
                <InteractiveCard className="glass-card gradient-border p-10 rounded-2xl group h-full" intensity={10} glowIntensity={0.08}>
                  <div className="w-14 h-14 bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-8 group-hover:border-[var(--border-strong)] group-hover:scale-110 transition-all duration-500">
                    <svg
                      className="w-6 h-6 text-[var(--primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                    Quizze erstellen
                  </h3>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Sammle Unterrichtsstoff an einem Ort und erstelle Quizze zu Rechnungswesen, BWL, Technik und weiteren Wirtschaftsingenieur-Fächern.
                  </p>
                </InteractiveCard>
              </ScrollReveal>

              {/* Feature 2 */}
              <ScrollReveal direction="up" delay={100}>
                <InteractiveCard className="glass-card gradient-border p-10 rounded-2xl group h-full" intensity={10} glowIntensity={0.08}>
                  <div className="w-14 h-14 bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-8 group-hover:border-[var(--border-strong)] group-hover:scale-110 transition-all duration-500">
                    <svg
                      className="w-6 h-6 text-[var(--primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                    HTL-Stoff wiederholen
                  </h3>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Wiederhole Wirtschaftsingenieur-Themen quizbasiert und lerne gezielt für HTL-Tests, Schularbeiten und PLFs.
                  </p>
                </InteractiveCard>
              </ScrollReveal>

              {/* Feature 3 */}
              <ScrollReveal direction="up" delay={200}>
                <InteractiveCard className="glass-card gradient-border p-10 rounded-2xl group h-full" intensity={10} glowIntensity={0.08}>
                  <div className="w-14 h-14 bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl flex items-center justify-center mb-8 group-hover:border-[var(--border-strong)] group-hover:scale-110 transition-all duration-500">
                    <svg
                      className="w-6 h-6 text-[var(--accent)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                    Fortschritt tracken
                  </h3>
                  <p className="text-[var(--text-muted)] leading-relaxed">
                    Hol dir den schnellen Überblick über wichtige Wirtschaftsingenieur-Themen und erkenne sofort, wo noch Lücken sind.
                  </p>
                </InteractiveCard>
              </ScrollReveal>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <ScrollReveal direction="scale" delay={0} duration={900}>
            <div className="pb-32">
              <InteractiveCard
                className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--surface)] p-16 md:p-20 text-center"
                intensity={5}
                glowIntensity={0.04}
              >
                {/* Decorative orbs */}
                <div className="absolute top-[-80px] right-[-50px] w-[300px] h-[300px] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-[-60px] left-[-40px] w-[250px] h-[250px] bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] rounded-full blur-3xl" style={{ animation: 'float 7s ease-in-out infinite reverse' }} />

                <div className="relative">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-5 tracking-[-0.03em]">
                    Bereit für deinen HWII-Lernhub?
                  </h2>
                  <p className="text-lg md:text-xl text-[var(--text-muted)] mb-12 max-w-lg mx-auto">
                    Starte jetzt mit dem gesamten HTL-Wirtschaftsingenieur-Stoff an einem Ort.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/auth">
                      <MagneticButton
                        className="px-12 py-4.5 bg-[var(--foreground)] text-[var(--background)] text-base font-semibold rounded-xl hover:opacity-90 transition-all duration-300 active:scale-[0.97] cursor-pointer hover-glow"
                        strength={0.3}
                      >
                        Mit dem Lernen starten
                      </MagneticButton>
                    </Link>
                    <Link href="/about">
                      <MagneticButton
                        className="px-12 py-4.5 border border-[var(--border-strong)] text-[var(--foreground)] text-base font-semibold rounded-xl hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] transition-all duration-300 active:scale-[0.97] cursor-pointer"
                        strength={0.3}
                      >
                        Erfahre mehr über uns
                      </MagneticButton>
                    </Link>
                  </div>
                </div>
              </InteractiveCard>
            </div>
          </ScrollReveal>
        </main>

        <Footer />
      </div>
    );
  }

  // Dashboard for logged-in users
  return (
    <div className="min-h-screen bg-[var(--background)]">

      <main className="max-w-7xl mx-auto px-8 pt-12 pb-20">
        {/* Welcome */}
        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-2 tracking-[-0.03em]">
            Willkommen zurück,{" "}
            <span className="bg-gradient-to-r from-[var(--primary-light)] to-[var(--primary)] bg-clip-text text-transparent">
              {user?.user_metadata?.name || "Nutzer"}
            </span>
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            Bereit, deine Lernreise fortzusetzen?
          </p>
        </div>

        {/* Quick Actions */}
        <InteractiveCard className="glass-card rounded-2xl p-10 mb-12 animate-fade-in-up-delay-1 relative overflow-hidden" intensity={5} glowIntensity={0.05}>
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[color-mix(in_srgb,var(--primary)_4%,transparent)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              Loslegen
            </h3>
            <p className="text-[var(--text-muted)] mb-8 text-lg">
              Erstelle dein erstes Quiz oder entdecke bestehende, um direkt
              loszulegen!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/quiz/create">
                <MagneticButton
                  className="px-8 py-3.5 bg-[var(--foreground)] text-[var(--background)] font-semibold rounded-xl hover:opacity-90 transition-all duration-300 active:scale-[0.97] cursor-pointer hover-glow"
                  strength={0.25}
                >
                  Quiz erstellen
                </MagneticButton>
              </Link>
              <Link href="/browse">
                <MagneticButton
                  className="px-8 py-3.5 text-[var(--text-muted)] hover:text-[var(--foreground)] font-semibold rounded-xl border border-[var(--border-strong)] hover:border-[color-mix(in_srgb,var(--foreground)_20%,transparent)] transition-all duration-300 cursor-pointer"
                  strength={0.25}
                >
                  Quizze entdecken
                </MagneticButton>
              </Link>
            </div>
          </div>
        </InteractiveCard>

        {/* Quizzes Section with Tabs */}
        <div className="animate-fade-in-up-delay-2">
          {/* Tab bar */}
          <div className="flex gap-1 mb-6 bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)] w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("mine")}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-300 cursor-pointer ${
                activeTab === "mine"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Deine Quizze
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-300 cursor-pointer flex items-center ${
                activeTab === "completed"
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Abgeschlossene Quizze
              {completedQuizzes.length > 0 && (
                <span
                  className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${
                    activeTab === "completed"
                      ? "bg-white/20 text-[var(--background)]"
                      : "bg-[var(--surface-hover)] text-[var(--text-muted)]"
                  }`}
                >
                  {completedQuizzes.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "mine" ? (
            loadingMyQuizzes ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-[color-mix(in_srgb,var(--primary)_25%,transparent)] border-t-[var(--primary)] rounded-full animate-spin" />
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  Wird geladen ...
                </p>
              </div>
            ) : myQuizzes.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Link
                  href="/quiz/create"
                  className="glass-card rounded-2xl p-8 col-span-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <svg
                      className="w-7 h-7 text-[var(--primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <p className="text-[var(--text-muted)] text-sm group-hover:text-[var(--primary)] transition-colors">
                    Noch keine Quizze vorhanden. Erstelle dein erstes!
                  </p>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myQuizzes.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/quizes/${quiz.id}`}
                    className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <svg
                          className="w-5 h-5 text-[var(--primary)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] text-[var(--primary)]">
                        {quiz.questionCount}{" "}
                        {quiz.questionCount === 1 ? "Frage" : "Fragen"}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                      {quiz.title}
                    </h4>
                    {quiz.description && (
                      <p className="text-sm text-[var(--text-muted)] mb-2 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-hover)] px-2 py-0.5 rounded-md">
                        {quiz.subjectName}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-hover)] px-2 py-0.5 rounded-md">
                        {quiz.jahrgang}. Jahrgang
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(quiz.createdAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/quiz/create"
                  className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-300 group cursor-pointer min-h-[180px]"
                >
                  <div className="w-12 h-12 bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <svg
                      className="w-6 h-6 text-[var(--primary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <p className="text-[var(--text-muted)] text-sm group-hover:text-[var(--primary)] transition-colors">
                    Neues Quiz erstellen
                  </p>
                </Link>
              </div>
            )
          ) : loadingCompleted ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-[color-mix(in_srgb,var(--primary)_25%,transparent)] border-t-[var(--primary)] rounded-full animate-spin" />
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Wird geladen ...
              </p>
            </div>
          ) : completedQuizzes.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-[var(--primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-[var(--foreground)] font-medium mb-1">
                Noch keine Quizze abgeschlossen
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Starte ein Quiz und komm zurück, um deinen Fortschritt zu sehen.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {completedQuizzes.map((cq) => {
                const pct =
                  cq.total > 0 ? Math.round((cq.score / cq.total) * 100) : 0;
                return (
                  <Link
                    key={cq.quizId}
                    href={`/quizes/${cq.quizId}`}
                    className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <svg
                          className="w-5 h-5 text-[var(--primary)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          pct >= 80
                            ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                            : pct >= 50
                              ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                              : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                      {cq.title}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)] mb-1">
                      {cq.score} von {cq.total} richtig
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium border border-[var(--border)] text-[var(--text-muted)] rounded-md mb-3 w-fit">
                      {cq.jahrgang}. Jahrgang
                    </span>
                    {/* Mini progress bar */}
                    <div className="w-full bg-[var(--border)] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          pct >= 80
                            ? "bg-green-500"
                            : pct >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
