'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import Header from '../../../components/Header';
import { supabase } from '../../supabase-client';

type AnyRow = Record<string, unknown>;

type NormalizedQuestion = {
  id: number | string;
  text: string;
  options: string[];
  correctIndex?: number;
};

function letterToIndex(v: string) {
  const s = (v ?? '').trim().toUpperCase();
  if (s === 'A') return 0;
  if (s === 'B') return 1;
  if (s === 'C') return 2;
  if (s === 'D') return 3;
  return undefined;
}

function toCorrectIndex(correctAnswer: unknown, options: string[]): number | undefined {
  if (correctAnswer === null || correctAnswer === undefined) return undefined;

  const raw = String(correctAnswer).trim();

  // "1".."4"
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 1 && n <= options.length) return n - 1;

  // "A".."D"
  const li = letterToIndex(raw);
  if (li !== undefined) return li;

  // exact text match
  const idx = options.findIndex((o) => o.trim() === raw);
  if (idx !== -1) return idx;

  return undefined;
}

function normalizeQuestion(q: AnyRow): NormalizedQuestion {
  const text: string =
    (q.questionText as string | null | undefined) ??
    (q.text as string | null | undefined) ??
    (q.prompt as string | null | undefined) ??
    (q.question as string | null | undefined) ??
    'Frage ohne Titel';

  const options = [
    q.answerText1,
    q.answerText2,
    q.answerText3,
    q.answerText4,
  ]
    .filter((x) => x !== null && x !== undefined)
    .map((x) => String(x).trim())
    .filter((x) => x.length > 0);

  const correctIndex = toCorrectIndex(q.correctAnswer, options);

  return {
    id: q.id as number | string,
    text,
    options: options.length ? options : ['(keine Antworten gefunden)'],
    correctIndex,
  };
}

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const quizId = Number(params?.id);

  const [loading, setLoading] = React.useState(true);
  const [quiz, setQuiz] = React.useState<AnyRow | null>(null);
  const [questions, setQuestions] = React.useState<NormalizedQuestion[]>([]);
  const [current, setCurrent] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [finished, setFinished] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);

  // Hinweistext, wenn quizId in Question fehlt oder nicht gesetzt ist
  const [hint, setHint] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!Number.isFinite(quizId)) {
      setError('Ungültige Quiz-ID.');
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      setHint(null);
      setFinished(false);

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // 1) Quiz laden
      const { data: quizData, error: quizErr } = await supabase
        .from('Quiz')
        .select('*, Subject(id, name)')
        .eq('id', quizId)
        .single();

      if (quizErr) {
        setError(`Quiz konnte nicht geladen werden: ${quizErr.message}`);
        setLoading(false);
        return;
      }

      setQuiz(quizData);

      // 2) Questions laden (erstmal ohne Filter, damit wir nicht “leer” enden)
      const { data: qData, error: qErr } = await supabase
        .from('Question')
        .select('*')
        .order('id', { ascending: true });

      if (qErr) {
        setError(`Fragen konnten nicht geladen werden: ${qErr.message}`);
        setLoading(false);
        return;
      }

      const all = (qData ?? []) as AnyRow[];

      // Prüfen ob Spalte quizId existiert
      const hasQuizIdColumn = all.length > 0 && Object.prototype.hasOwnProperty.call(all[0], 'quizId');

      // Wenn quizId existiert: filtern
      let filtered = all;
      if (hasQuizIdColumn) {
        filtered = all.filter((q) => q.quizId === quizId);
      }

      // Fallback: Wenn Filter 0 ergibt, trotzdem anzeigen + Hinweis
      if (hasQuizIdColumn && filtered.length === 0 && all.length > 0) {
        setHint(
          'Keine Fragen mit quizId=' +
            quizId +
            ' gefunden. Wahrscheinlich ist quizId in den Question-Rows nicht gesetzt. Ich zeige dir daher alle Fragen als Fallback.'
        );
        filtered = all;
      }

      if (!hasQuizIdColumn && currentUser) {
        setHint(
          'In der Question-Tabelle scheint keine Spalte "quizId" vorhanden zu sein (oder sie kommt nicht im Select zurück). Ich zeige daher alle Fragen an.'
        );
      }

      const normalized = filtered.map(normalizeQuestion);

      setQuestions(normalized);
      setCurrent(0);
      setAnswers({});
      setLoading(false);
    })();
  }, [quizId]);

  const q = questions[current];

  const canScore = React.useMemo(
    () => questions.some((x) => typeof x.correctIndex === 'number'),
    [questions]
  );

  const score = React.useMemo(() => {
    if (!canScore) return 0;
    let s = 0;
    for (const question of questions) {
      const selected = answers[String(question.id)];
      if (typeof question.correctIndex === 'number' && selected === question.correctIndex) s++;
    }
    return s;
  }, [answers, questions, canScore]);

  const selectedForCurrent = q ? answers[String(q.id)] : undefined;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-12">
        <Link href="/browse" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Zurück zur Übersicht
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="mt-4 text-sm text-[var(--text-muted)]">Quiz wird geladen ...</p>
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-6 border-red-200 dark:border-red-500/20">
            <h1 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Quiz konnte nicht geöffnet werden
            </h1>
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Quiz Header Card */}
            {user && (
            <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in-up relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br from-indigo-500/8 to-violet-500/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative">
                <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
                  {typeof quiz?.title === 'string' && quiz.title.trim().length > 0 ? quiz.title : 'Quiz'}
                </h1>
                <p className="text-[var(--text-muted)] mt-1 text-sm">
                  {typeof quiz?.description === 'string' ? quiz.description : ''}
                </p>

                <div className="flex items-center justify-between mt-4 text-sm text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      {(quiz as AnyRow)?.Subject?.name ?? (quiz as AnyRow)?.subject ?? 'Allgemein'}
                    </span>
                  </span>
                  <span className="text-sm">
                    {questions.length} {questions.length === 1 ? 'Frage' : 'Fragen'}
                    {canScore ? ` · ${score} Punkte` : ''}
                  </span>
                </div>

                {hint ? (
                  <div className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
                    {hint}
                  </div>
                ) : null}
              </div>
            </div>
            )}

            {!user ? (
              <div className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Bereit zum Lernen?</h2>
                <p className="text-[var(--text-muted)] mb-6 max-w-sm leading-relaxed">
                  Melde dich an oder erstelle ein Konto, um dieses Quiz zu starten und deinen Lernfortschritt zu verfolgen.
                </p>
                <Link
                  href="/auth"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium shadow-md shadow-indigo-500/15 transition-all active:scale-[0.98]"
                >
                  Jetzt anmelden
                </Link>
              </div>
            ) : questions.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-[var(--foreground)] font-medium mb-1">Keine Fragen gefunden</p>
                <p className="text-sm text-[var(--text-muted)]">Dieses Quiz hat noch keine Fragen.</p>
              </div>
            ) : finished ? (
              /* Results Card */
              <div className="glass-card rounded-2xl p-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Geschafft!</h2>
                <p className="text-[var(--text-muted)] mb-6">
                  {canScore
                    ? <>Du hast <span className="font-bold text-indigo-500">{score}</span> von <span className="font-bold">{questions.length}</span> Fragen richtig beantwortet.</>
                    : 'Quiz abgeschlossen.'}
                </p>

                {/* Progress Bar */}
                {canScore && (
                  <div className="w-full max-w-xs mx-auto bg-[var(--border)] rounded-full h-2.5 mb-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${(score / questions.length) * 100}%` }}
                    />
                  </div>
                )}

                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setFinished(false);
                      setCurrent(0);
                      setAnswers({});
                    }}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  >
                    Erneut versuchen
                  </button>
                  <Link
                    href="/browse"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium shadow-md shadow-indigo-500/15 transition-all active:scale-[0.98]"
                  >
                    Zur Übersicht
                  </Link>
                </div>
              </div>
            ) : (
              /* Question Card */
              <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
                {/* Progress */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--text-muted)]">
                    Frage {current + 1} von {questions.length}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {Math.round(((current + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-1.5 mb-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-5 leading-relaxed">
                  {q.text}
                </h2>

                <div className="space-y-2.5">
                  {q.options.map((opt, idx) => {
                    const selected = selectedForCurrent === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [String(q.id)]: idx }))
                        }
                        className={[
                          'w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer group',
                          selected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm shadow-indigo-500/10'
                            : 'border-[var(--border)] hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-[var(--surface-hover)]',
                          'text-[var(--foreground)]',
                        ].join(' ')}
                      >
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold mr-3 transition-colors ${
                          selected
                            ? 'bg-indigo-500 text-white'
                            : 'bg-[var(--background)] text-[var(--text-muted)] group-hover:text-indigo-500'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-7">
                  <button
                    type="button"
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    disabled={current === 0}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Zurück
                  </button>

                  {current < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium shadow-md shadow-indigo-500/15 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Weiter
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFinished(true)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium shadow-md shadow-indigo-500/15 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Abschließen
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
