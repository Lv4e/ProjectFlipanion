"use client";

import React from "react";
import { supabase } from "./supabase-client";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { GradientButton } from "@/components/ui/gradient-button";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { GlowCard } from "@/components/ui/spotlight-card";

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
}

interface MyQuiz {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  subjectName: string;
  questionCount: number;
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
                  "id, title, description, createdAt, subjectId, Subject(name), Question(id)",
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
                "isCorrect, question:Question(id, quizId, quiz:Quiz(id, title, createdAt))",
              )
              .eq("userId", dbUser.id);

            if (!userAnswers || userAnswers.length === 0) {
              setLoadingCompleted(false);
              return;
            }

            // Group answers by quiz
            const quizMap = new Map<
              number,
              { title: string; correct: number; total: number; date: string }
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
          <div className="w-10 h-10 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Lädt ...</span>
        </div>
      </div>
    );
  }

  // Landing Page for non-logged-in users
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] overflow-hidden">
        <Header />

        {/* Background decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-rose-400/10 dark:bg-rose-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-400/10 dark:bg-pink-500/5 rounded-full blur-3xl" />
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-blue-400/8 dark:bg-blue-500/3 rounded-full blur-3xl" />
        </div>

        {/* Hero Section - Full Viewport */}
        <section className="relative w-full h-screen bg-black/[0.96] overflow-hidden">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />

          <div className="flex flex-col lg:flex-row h-full">
            {/* Left content */}
            <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 relative z-10">
              {/* Badge */}
              <div className="mb-6 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-rose-400">
                    Kostenlos &amp; ohne Werbung
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 animate-fade-in-up">
                Lernen mit
                <br />
                <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-pink-400 bg-clip-text text-transparent">
                  Flipanion
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-neutral-400 max-w-xl mt-6 mb-10 animate-fade-in-up-delay-1 leading-relaxed">
                Erstelle interaktive Quizze, lerne mit smarten Karteikarten und
                verfolge deinen Fortschritt — alles an einem Ort.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up-delay-2">
                <Link href="/auth">
                  <GradientButton className="px-8 py-3.5 text-base">
                    Jetzt kostenlos starten
                  </GradientButton>
                </Link>
                <Link href="/browse">
                  <GradientButton variant="variant" className="px-8 py-3.5 text-base">
                    Quizze entdecken
                  </GradientButton>
                </Link>
              </div>
            </div>

            {/* Right content - 3D Scene */}
            <div className="flex-1 relative min-h-[350px] lg:min-h-0">
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </section>

        <main className="relative max-w-6xl mx-auto px-6">

          {/* Features Section */}
          <div className="pb-24 animate-fade-in-up-delay-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <CardSpotlight className="rounded-2xl">
                <div className="relative z-20">
                  <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-rose-500/20">
                    <svg
                      className="w-5 h-5 text-white"
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
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Quizze erstellen
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Erstelle individuelle Quizze passend zu deinem Lernstoff und
                    teile sie mit Freunden.
                  </p>
                </div>
              </CardSpotlight>

              {/* Feature 2 */}
              <CardSpotlight className="rounded-2xl">
                <div className="relative z-20">
                  <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-pink-500/20">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Interaktiv lernen
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Lerne mit dynamischen Karteikarten und Quizzen — effektiv,
                    motivierend und mit Spaß.
                  </p>
                </div>
              </CardSpotlight>

              {/* Feature 3 */}
              <CardSpotlight className="rounded-2xl">
                <div className="relative z-20">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-blue-500/20">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Fortschritt verfolgen
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    Behalte deinen Lernfortschritt mit detaillierten Statistiken
                    jederzeit im Blick.
                  </p>
                </div>
              </CardSpotlight>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="pb-24">
            <CardSpotlight className="rounded-3xl">
              <div className="relative z-20 py-6 md:py-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                  Bereit loszulernen?
                </h2>
                <p className="text-lg text-neutral-400 mb-8 max-w-lg mx-auto">
                  Starte jetzt und entdecke eine neue Art zu lernen.
                </p>
                <Link href="/auth">
                  <GradientButton className="px-10 py-4 text-base">
                    Kostenlos starten
                  </GradientButton>
                </Link>
              </div>
            </CardSpotlight>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Dashboard for logged-in users
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        {/* Welcome */}
        <div className="mb-10 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-1 tracking-tight">
            Willkommen zurück,{" "}
            <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              {user?.user_metadata?.name || "Nutzer"}
            </span>
          </h2>
          <p className="text-[var(--text-muted)]">
            Bereit, deine Lernreise fortzusetzen?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-8 mb-10 animate-fade-in-up-delay-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
              Loslegen
            </h3>
            <p className="text-[var(--text-muted)] mb-6">
              Erstelle dein erstes Quiz oder entdecke bestehende, um direkt
              loszulegen!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/quiz/create">
                <GradientButton className="px-6 py-3">
                  Quiz erstellen
                </GradientButton>
              </Link>
              <Link href="/browse">
                <button className="px-6 py-3 bg-[var(--surface)] text-[var(--foreground)] font-semibold rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-rose-200 dark:hover:border-rose-500/30 transition-all cursor-pointer">
                  Quizze entdecken
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quizzes Section with Tabs */}
        <div className="animate-fade-in-up-delay-2">
          {/* Tab bar */}
          <div className="flex gap-1 mb-6 bg-[var(--surface)] rounded-xl p-1 border border-[var(--border)] w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("mine")}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "mine"
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/15"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Deine Quizze
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center ${
                activeTab === "completed"
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/15"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              Abgeschlossene Quizze
              {completedQuizzes.length > 0 && (
                <span
                  className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${
                    activeTab === "completed"
                      ? "bg-white/20 text-white"
                      : "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
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
                <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  Wird geladen ...
                </p>
              </div>
            ) : myQuizzes.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <li className="list-none col-span-full min-h-[14rem]">
                  <GlowCard glowColor="red" customSize className="h-full p-0 gap-0">
                    <Link
                      href="/quiz/create"
                      className="relative flex h-full flex-col items-center justify-center text-center overflow-hidden rounded-xl bg-[var(--background)] p-8 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] group cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <svg
                          className="w-7 h-7 text-rose-400"
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
                      <p className="text-[var(--text-muted)] text-sm group-hover:text-rose-500 transition-colors">
                        Noch keine Quizze vorhanden. Erstelle dein erstes!
                      </p>
                    </Link>
                  </GlowCard>
                </li>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myQuizzes.map((quiz) => (
                  <li key={quiz.id} className="list-none min-h-[14rem]">
                    <GlowCard glowColor="red" customSize className="h-full p-0 gap-0">
                      <Link
                        href={`/quizes/${quiz.id}`}
                        className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl bg-[var(--background)] p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] group block"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                            <svg
                              className="w-5 h-5 text-white"
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
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            {quiz.questionCount}{" "}
                            {quiz.questionCount === 1 ? "Frage" : "Fragen"}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-[var(--foreground)] mb-1 group-hover:text-rose-500 transition-colors">
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
                            <span className="text-xs text-[var(--text-muted)]">
                              {new Date(quiz.createdAt).toLocaleDateString("de-DE", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </GlowCard>
                  </li>
                ))}
                <li className="list-none min-h-[14rem]">
                  <GlowCard glowColor="red" customSize className="h-full p-0 gap-0">
                    <Link
                      href="/quiz/create"
                      className="relative flex h-full flex-col items-center justify-center text-center overflow-hidden rounded-xl bg-[var(--background)] p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] group cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <svg
                          className="w-6 h-6 text-rose-400"
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
                      <p className="text-[var(--text-muted)] text-sm group-hover:text-rose-500 transition-colors">
                        Neues Quiz erstellen
                      </p>
                    </Link>
                  </GlowCard>
                </li>
              </div>
            )
          ) : loadingCompleted ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Wird geladen ...
              </p>
            </div>
          ) : completedQuizzes.length === 0 ? (
            <GlowCard glowColor="red" customSize className="p-0 gap-0">
              <div className="relative overflow-hidden rounded-xl bg-[var(--background)] p-8 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7 text-rose-400"
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
            </GlowCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {completedQuizzes.map((cq) => {
                const pct =
                  cq.total > 0 ? Math.round((cq.score / cq.total) * 100) : 0;
                return (
                  <li key={cq.quizId} className="list-none min-h-[14rem]">
                    <GlowCard glowColor="red" customSize className="h-full p-0 gap-0">
                      <Link
                        href={`/quizes/${cq.quizId}`}
                        className="relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-xl bg-[var(--background)] p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] group block"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-7 h-7 bg-gradient-to-br from-rose-500 to-pink-600 rounded-md flex items-center justify-center shadow-sm shadow-rose-500/20">
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M9 12l2 2 4-4"
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
                        <div>
                          <h4 className="text-base font-bold text-[var(--foreground)] mb-1 group-hover:text-rose-500 transition-colors">
                            {cq.title}
                          </h4>
                          <p className="text-sm text-[var(--text-muted)] mb-3">
                            {cq.score} von {cq.total} richtig
                          </p>
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
                        </div>
                      </Link>
                    </GlowCard>
                  </li>
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
