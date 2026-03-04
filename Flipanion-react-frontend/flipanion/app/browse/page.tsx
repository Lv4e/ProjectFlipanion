'use client';

import React from 'react';
import { supabase } from '../supabase-client';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Define the Quiz type based on your database structure
interface Quiz {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  subject?: string;
  Subject?: {
    id: number;
    name: string;
  };
  questionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Define the Subject type
interface Subject {
  id: number;
  name: string;
}

export default function BrowseQuizzes() {
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  
  const [selectedSubject, setSelectedSubject] = React.useState('all');
  const [user, setUser] = React.useState<import('@supabase/supabase-js').User | null>(null);
  const [questionsError, setQuestionsError] = React.useState<boolean>(false);

  // Fetch quizzes and subjects from Supabase
  React.useEffect(() => {
  async function fetchData() {
    setLoading(true);
    setQuestionsError(false);

    // Get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    // 1) Quizzes holen
    const { data: quizzesData, error: quizzesError } = await supabase
      .from('Quiz')
      .select('*, Subject(id, name)');

    if (quizzesError) {
      console.error('Error fetching quizzes:', quizzesError);
      setLoading(false);
      return;
    }

    // 2) Alle Questions holen (nur quizId reicht) und zählen
    const { data: questionRows, error: questionsErrorResult } = await supabase
      .from('Question')
      .select('quizId'); // <- wichtig: so heißt es in deiner DB

    if (questionsErrorResult) {
      console.error('Error fetching questions:', questionsErrorResult);
      // Wenn nicht angemeldet, setze den Error-Flag
      if (!currentUser) {
        setQuestionsError(true);
      }
      // Quizzes trotzdem anzeigen, counts bleiben 0
      setQuizzes(quizzesData || []);
    } else {
      const counts: Record<number, number> = {};

      (questionRows || []).forEach((row: { quizId: number }) => {
        const qid = row.quizId;
        if (typeof qid === 'number') counts[qid] = (counts[qid] || 0) + 1;
      });

      const quizzesWithCount = (quizzesData || []).map((q: Quiz) => ({
        ...q,
        questionCount: counts[q.id] ?? 0,
      }));

      setQuizzes(quizzesWithCount);
    }

    // 3) Subjects holen (für Filter)
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('Subject')
      .select('*')

      .order('name', { ascending: true });

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
    } else {
      setSubjects(subjectsData || []);
    }

    setLoading(false);
  }

  fetchData();
}, []);

  // Filter quizzes based on search and subject
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const subjectName = quiz.Subject?.name || quiz.subject;
    const matchesSubject = selectedSubject === 'all' || subjectName === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        {/* Page Header */}
        <div className="mb-10 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Zurück zur Startseite
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight mb-1">
            Quizze entdecken
          </h1>
          <p className="text-[var(--text-muted)]">
            Finde Quizze, um dein Wissen zu testen
          </p>
        </div>

        {/* Error Message for Unautenticated Users */}
        {questionsError && !user && (
          <div className="glass-card border-red-200 dark:border-red-500/20 rounded-2xl p-4 mb-8 animate-fade-in-up">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              Du musst dich anmelden, um die Anzahl der Fragen zu sehen.
            </p>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in-up-delay-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Quizze suchen
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  id="search"
                  placeholder="Suche nach Titel oder Beschreibung ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-all outline-none"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Nach Fach filtern
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-[var(--foreground)] transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="all">Alle Fächer</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="animate-fade-in-up-delay-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'Quiz gefunden' : 'Quizze gefunden'}
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-[var(--text-muted)]">Quizze werden geladen ...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="glass-card rounded-2xl py-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <p className="text-[var(--foreground)] font-medium mb-1">Keine Quizze gefunden</p>
              <p className="text-sm text-[var(--text-muted)]">Passe deine Suche oder Filter an</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="glass-card rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group"
                  >
                    {/* Quiz Image/Icon */}
                    <div className="h-28 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                      <span className="text-white/90 text-4xl font-bold relative">
                        {quiz.title ? quiz.title.charAt(0).toUpperCase() : 'Q'}
                      </span>
                    </div>

                    {/* Quiz Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-[var(--foreground)] mb-1.5 group-hover:text-indigo-500 transition-colors">
                        {quiz.title || 'Ohne Titel'}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2 leading-relaxed">
                        {quiz.description || 'Keine Beschreibung vorhanden'}
                      </p>

                      {/* Quiz Meta */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                          {quiz.Subject?.name || quiz.subject || 'Allgemein'}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {!user ? '?' : quiz.questionCount || 0} Fragen
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/quizes/${quiz.id}`}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/15 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] block text-center"
                      >
                        Quiz starten
                      </Link>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}