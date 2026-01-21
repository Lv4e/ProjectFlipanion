'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '../../../components/Header';
import { supabase } from '../../supabase-client';

type AnyRow = Record<string, any>;

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

function toCorrectIndex(correctAnswer: any, options: string[]): number | undefined {
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
  const text =
    q.questionText ??
    q.text ??
    q.prompt ??
    q.question ??
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
    id: q.id,
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

  // Hinweistext, wenn quizId in Question fehlt oder nicht gesetzt ist
  const [hint, setHint] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!Number.isFinite(quizId)) {
      setError('Ungueltige Quiz-ID.');
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      setHint(null);
      setFinished(false);

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

      if (!hasQuizIdColumn) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/browse" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Zurueck zur Uebersicht
        </Link>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Quiz wird geladen ...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-red-200 dark:border-red-900">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Quiz konnte nicht geoeffnet werden
            </h1>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {quiz?.title ?? 'Quiz'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {quiz?.description ?? ''}
              </p>

              <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Fach:{' '}
                  <span className="font-medium">
                    {quiz?.Subject?.name ?? quiz?.subject ?? 'Allgemein'}
                  </span>
                </span>
                <span>
                  {questions.length} {questions.length === 1 ? 'Frage' : 'Fragen'}
                  {canScore ? ` • Punkte: ${score}` : ''}
                </span>
              </div>

              {hint ? (
                <div className="mt-4 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                  {hint}
                </div>
              ) : null}
            </div>

            {questions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300">
                  Keine Fragen gefunden.
                </p>
              </div>
            ) : finished ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fertig</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {canScore ? `Dein Ergebnis: ${score} / ${questions.length}` : 'Abgeschlossen.'}
                </p>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setFinished(false);
                      setCurrent(0);
                      setAnswers({});
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  >
                    Erneut versuchen
                  </button>
                  <Link
                    href="/browse"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Zurueck zur Uebersicht
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Frage {current + 1} von {questions.length}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {q.text}
                </h2>

                <div className="space-y-2">
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
                          'w-full text-left px-4 py-3 rounded-lg border transition-colors',
                          selected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
                          'text-gray-900 dark:text-white',
                        ].join(' ')}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    disabled={current === 0}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 text-gray-900 dark:text-white"
                  >
                    Zurueck
                  </button>

                  {current < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Weiter
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFinished(true)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Abschliessen
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
