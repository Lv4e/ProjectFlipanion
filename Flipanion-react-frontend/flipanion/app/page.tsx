'use client';

import React from 'react';
import { supabase } from './supabase-client';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

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

export default function Home() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'mine' | 'completed'>('mine');
  const [completedQuizzes, setCompletedQuizzes] = React.useState<CompletedQuiz[]>([]);
  const [loadingCompleted, setLoadingCompleted] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser as User | null);
      setLoading(false);

      if (currentUser) {
        // Fetch completed quizzes from the database
        (async () => {
          setLoadingCompleted(true);
          try {
            // Get DB user id
            const { data: dbUser } = await supabase
              .from('User')
              .select('id')
              .eq('supabaseId', currentUser.id)
              .single();

            if (!dbUser) { setLoadingCompleted(false); return; }

            // Get all user answers with their question→quiz info
            const { data: userAnswers } = await supabase
              .from('UserAnswer')
              .select('isCorrect, question:Question(id, quizId, quiz:Quiz(id, title, createdAt))')
              .eq('userId', dbUser.id);

            if (!userAnswers || userAnswers.length === 0) {
              setLoadingCompleted(false);
              return;
            }

            // Group answers by quiz
            const quizMap = new Map<number, { title: string; correct: number; total: number; date: string }>();

            for (const ua of userAnswers as Array<Record<string, unknown>>) {
              const q = ua.question as Record<string, unknown> | undefined;
              if (!q) continue;
              const quizData = q.quiz as Record<string, unknown> | Array<Record<string, unknown>> | undefined;
              if (!quizData) continue;
              const quiz = Array.isArray(quizData) ? quizData[0] : quizData;
              if (!quiz) continue;
              const qId = quiz.id as number;
              if (!quizMap.has(qId)) {
                quizMap.set(qId, { title: quiz.title as string, correct: 0, total: 0, date: quiz.createdAt as string });
              }
              const entry = quizMap.get(qId)!;
              entry.total++;
              if (ua.isCorrect) entry.correct++;
            }

            const results: CompletedQuiz[] = [];
            quizMap.forEach((v, quizId) => {
              results.push({ quizId, title: v.title, score: v.correct, total: v.total, date: v.date });
            });

            // Sort by most recently created quiz
            results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
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
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-blue-400/8 dark:bg-blue-500/3 rounded-full blur-3xl" />
        </div>

        {/* Hero Section */}
        <main className="relative max-w-6xl mx-auto px-6">
          <div className="pt-32 pb-20 lg:pt-44 lg:pb-28">
            {/* Badge */}
            <div className="flex justify-center mb-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Kostenlos &amp; Open Source
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="text-center animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.05]">
                Lernen mit
                <br />
                <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                  Flipanion
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-center text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mt-6 mb-10 animate-fade-in-up-delay-1 leading-relaxed">
              Erstelle interaktive Quizze, lerne mit smarten Karteikarten
              und verfolge deinen Fortschritt — alles an einem Ort.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in-up-delay-2">
              <Link href="/auth">
                <button className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-base font-semibold rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] cursor-pointer">
                  Jetzt kostenlos starten
                </button>
              </Link>
              <Link href="/browse">
                <button className="px-8 py-3.5 text-base font-semibold text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:bg-[var(--surface-hover)] hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all shadow-sm cursor-pointer">
                  Quizze entdecken
                </button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="pb-24 animate-fade-in-up-delay-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="glass-card p-7 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Quizze erstellen</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Erstelle individuelle Quizze passend zu deinem Lernstoff und teile sie mit Freunden.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-7 rounded-2xl hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group">
                <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Interaktiv lernen</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Lerne mit dynamischen Karteikarten und Quizzen — effektiv, motivierend und mit Spaß.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-7 rounded-2xl hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">Fortschritt verfolgen</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Behalte deinen Lernfortschritt mit detaillierten Statistiken jederzeit im Blick.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="pb-24">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-10 md:p-14 text-center shadow-2xl shadow-indigo-500/20">
              {/* Decorative circles */}
              <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-[-30px] left-[-30px] w-[150px] h-[150px] bg-white/10 rounded-full blur-2xl" />

              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                  Bereit loszulernen?
                </h2>
                <p className="text-lg text-indigo-100 mb-8 max-w-lg mx-auto">
                  Starte jetzt und entdecke eine neue Art zu lernen.
                </p>
                <Link href="/auth">
                  <button className="px-10 py-4 bg-white text-indigo-600 text-base font-bold rounded-xl hover:bg-indigo-50 transition-all shadow-lg active:scale-[0.98] cursor-pointer">
                    Kostenlos starten
                  </button>
                </Link>
              </div>
            </div>
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

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        {/* Welcome */}
        <div className="mb-10 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-1 tracking-tight">
            Willkommen zurück,{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              {user?.user_metadata?.name || 'Nutzer'}
            </span>
          </h2>
          <p className="text-[var(--text-muted)]">Bereit, deine Lernreise fortzusetzen?</p>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-8 mb-10 animate-fade-in-up-delay-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Loslegen</h3>
            <p className="text-[var(--text-muted)] mb-6">
              Erstelle dein erstes Quiz oder entdecke bestehende, um direkt loszulegen!
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md shadow-indigo-500/20 active:scale-[0.98] cursor-pointer">
                Quiz erstellen
              </button>
              <Link href="/browse">
                <button className="px-6 py-3 bg-[var(--surface)] text-[var(--foreground)] font-semibold rounded-xl border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all cursor-pointer">
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
              onClick={() => setActiveTab('mine')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'mine'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/15'
                  : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              Deine Quizze
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center ${
                activeTab === 'completed'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/15'
                  : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              Abgeschlossene Quizze
              {completedQuizzes.length > 0 && (
                <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ${
                  activeTab === 'completed'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {completedQuizzes.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'mine' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="glass-card rounded-2xl p-8 col-span-full flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-[var(--text-muted)] text-sm">Noch keine Quizze vorhanden. Erstelle dein erstes!</p>
              </div>
            </div>
          ) : loadingCompleted ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              <p className="mt-3 text-sm text-[var(--text-muted)]">Wird geladen ...</p>
            </div>
          ) : completedQuizzes.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[var(--foreground)] font-medium mb-1">Noch keine Quizze abgeschlossen</p>
              <p className="text-sm text-[var(--text-muted)]">Starte ein Quiz und komm zurück, um deinen Fortschritt zu sehen.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {completedQuizzes.map((cq) => {
                const pct = cq.total > 0 ? Math.round((cq.score / cq.total) * 100) : 0;
                return (
                  <Link key={cq.quizId} href={`/quizes/${cq.quizId}`} className="glass-card rounded-2xl p-6 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group block">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        pct >= 80 ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' :
                        pct >= 50 ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                        'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {pct}%
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[var(--foreground)] mb-1 group-hover:text-indigo-500 transition-colors">{cq.title}</h4>
                    <p className="text-sm text-[var(--text-muted)] mb-3">
                      {cq.score} von {cq.total} richtig
                    </p>
                    {/* Mini progress bar */}
                    <div className="w-full bg-[var(--border)] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
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
