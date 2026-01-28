'use client';

import React from 'react';
import { supabase } from '../supabase-client';
import Link from 'next/link';
import Header from '../../components/Header';

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

  // Fetch quizzes and subjects from Supabase
  React.useEffect(() => {
  async function fetchData() {
    setLoading(true);

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
    const { data: questionRows, error: questionsError } = await supabase
      .from('Question')
      .select('quizId'); // <- wichtig: so heißt es in deiner DB

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Zurück zur Startseite
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Quizze durchstöbern
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Entdecke Quizze, um dein Wissen zu testen
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quizze suchen
              </label>
              <input
                type="text"
                id="search"
                placeholder="Suche nach Titel oder Beschreibung ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nach Fach filtern
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

        {/* ...existing code... */}
        {/* Quiz Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'Quiz gefunden' : 'Quizze gefunden'}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Quizze werden geladen ...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-lg">Keine Quizze gefunden</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Passe deine Suche oder Filter an</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  {/* Quiz Image/Icon */}
                  <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-md mb-4 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {quiz.title ? quiz.title.charAt(0).toUpperCase() : 'Q'}
                    </span>
                  </div>

                  {/* Quiz Info */}
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {quiz.title || 'Ohne Titel'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {quiz.description || 'Keine Beschreibung vorhanden'}
                  </p>

                  {/* Quiz Meta */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {quiz.Subject?.name || quiz.subject || 'Allgemein'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {quiz.questionCount || 0} Fragen
                    </span>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/quizes/${quiz.id}`}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors block text-center"
                  >
                    Quiz starten →
                  </Link>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}