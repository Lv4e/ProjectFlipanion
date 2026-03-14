'use client';

import React from 'react';
import { supabase } from '../supabase-client';
import Link from 'next/link';
import Footer from '../../components/Footer';
import CustomDropdown from '../../components/CustomDropdown';

// Define the Quiz type based on your database structure
interface Quiz {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  jahrgang: number;
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

// Slide-in card wrapper with Intersection Observer
function SlideInCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : `translateX(${index % 2 === 0 ? '-40px' : '40px'})`,
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function BrowseQuizzes() {
  const INITIAL_VISIBLE = 12;
  const LOAD_MORE_STEP = 6;

  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  
  const [selectedSubject, setSelectedSubject] = React.useState('all');
  const [selectedJahrgang, setSelectedJahrgang] = React.useState('all');
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_VISIBLE);
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
    const matchesJahrgang = selectedJahrgang === 'all' || quiz.jahrgang === Number(selectedJahrgang);
    return matchesSearch && matchesSubject && matchesJahrgang;
  });

  React.useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [searchTerm, selectedSubject, selectedJahrgang]);

  const visibleQuizzes = filteredQuizzes.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-[var(--background)]">

      <main className="max-w-7xl mx-auto px-8 pt-12 pb-20">
        {/* Page Header */}
        <div className="mb-12 animate-fade-in-up">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] mb-6 transition-colors duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Zurück zur Startseite
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--foreground)] tracking-[-0.03em] mb-2">
            Quizze entdecken
          </h1>
          <p className="text-lg text-[var(--text-muted)]">
            Finde Quizze, um dein Wissen zu testen
          </p>
        </div>

        {/* Error Message for Unautenticated Users */}
        {questionsError && !user && (
          <div className="glass-card border-red-500/20 rounded-lg p-4 mb-8 animate-fade-in-up">
            <p className="text-red-400 text-sm font-medium">
              Du musst dich anmelden, um die Anzahl der Fragen zu sehen.
            </p>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="glass-card-static rounded-2xl p-8 mb-10 animate-fade-in-up-delay-1 relative z-40" style={{ overflow: 'visible' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:ring-1 focus:ring-[var(--border-strong)] focus:border-[var(--border-strong)] text-[var(--foreground)] placeholder:text-[var(--text-subtle)] transition-all outline-none"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label htmlFor="subject" className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">
                Nach Fach filtern
              </label>
              <CustomDropdown
                id="subject"
                value={selectedSubject}
                onChange={(val) => setSelectedSubject(val)}
                placeholder="Alle Fächer"
                options={[
                  { value: 'all', label: 'Alle Fächer' },
                  ...subjects.map((subject) => ({
                    value: subject.name,
                    label: subject.name,
                  })),
                ]}
              />
            </div>

            {/* Jahrgang Filter */}
            <div>
              <label htmlFor="jahrgang" className="block text-[13px] font-medium text-[var(--text-muted)] mb-2">
                Nach Jahrgang filtern
              </label>
              <CustomDropdown
                id="jahrgang"
                value={selectedJahrgang}
                onChange={(val) => setSelectedJahrgang(val)}
                placeholder="Alle Jahrgänge"
                options={[
                  { value: 'all', label: 'Alle Jahrgänge' },
                  { value: '1', label: '1. Jahrgang' },
                  { value: '2', label: '2. Jahrgang' },
                  { value: '3', label: '3. Jahrgang' },
                  { value: '4', label: '4. Jahrgang' },
                  { value: '5', label: '5. Jahrgang' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="animate-fade-in-up-delay-2 relative z-0">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'Quiz gefunden' : 'Quizze gefunden'}
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 border-3 border-[color-mix(in_srgb,var(--primary)_25%,transparent)] border-t-[var(--primary)] rounded-full animate-spin" />
              <p className="mt-4 text-sm text-[var(--text-muted)]">Quizze werden geladen ...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="glass-card rounded-xl py-16 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <p className="text-[var(--foreground)] font-medium mb-1">Keine Quizze gefunden</p>
              <p className="text-sm text-[var(--text-muted)]">Passe deine Suche oder Filter an</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleQuizzes.map((quiz, index) => (
                <SlideInCard key={quiz.id} index={index}>
                  <div
                    className="glass-card gradient-border relative isolate rounded-2xl overflow-hidden hover:border-[var(--border-strong)] transition-all duration-300 group"
                  >
                    {/* Quiz Image/Icon */}
                    <div className="h-32 bg-[var(--surface-hover)] border-b border-[var(--border)] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 pointer-events-none bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />
                      <span className="text-[var(--text-muted)] text-5xl font-bold relative group-hover:scale-110 transition-transform duration-500">
                        {quiz.title ? quiz.title.charAt(0).toUpperCase() : 'Q'}
                      </span>
                    </div>

                    {/* Quiz Content */}
                    <div className="p-6">
                      <h3 className="font-semibold text-[var(--foreground)] mb-2 text-lg group-hover:text-[var(--foreground)] transition-colors">
                        {quiz.title || 'Ohne Titel'}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2 leading-relaxed">
                        {quiz.description || 'Keine Beschreibung vorhanden'}
                      </p>

                      {/* Quiz Meta */}
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] rounded-md">
                          {quiz.Subject?.name || quiz.subject || 'Allgemein'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium border border-[var(--border)] text-[var(--text-muted)] rounded-md">
                          {quiz.jahrgang}. Jahrgang
                        </span>
                        <span className="ml-auto text-xs text-[var(--text-muted)]">
                          {!user ? '?' : quiz.questionCount || 0} Fragen
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/quizes/${quiz.id}`}
                        className="relative z-20 pointer-events-auto cursor-pointer w-full py-3 px-4 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] block text-center"
                      >
                        Quiz starten
                      </Link>
                    </div>
                  </div>
                </SlideInCard>
                ))}
              </div>

              {visibleQuizzes.length < filteredQuizzes.length && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_STEP)}
                    className="px-7 py-3 rounded-lg border border-[var(--border-strong)] text-[var(--foreground)] font-medium hover:bg-[var(--surface-hover)] transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    Mehr anzeigen (+6)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}