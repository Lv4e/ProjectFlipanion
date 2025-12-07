'use client';

import React from 'react';
import { supabase } from '../supabase-client';
import Link from 'next/link';

export default function BrowseQuizzes() {
  const [quizzes, setQuizzes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('all');

  // Fetch quizzes from Supabase
  React.useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true);
      const { data, error } = await supabase
        .from('Quiz')
        .select('*');
      
      if (error) {
        console.error('Error fetching quizzes:', error);
      } else {
        setQuizzes(data || []);
      }
      setLoading(false);
    }

    fetchQuizzes();
  }, []);

  // Filter quizzes based on search and subject
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || quiz.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
            Flipanion
          </Link>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Login
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Quizzes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore and discover quizzes to test your knowledge
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Quizzes
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Subject
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Subjects</option>
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="english">English</option>
                <option value="programming">Programming</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'Quiz' : 'Quizzes'} Found
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading quizzes...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No quizzes found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
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
                    {quiz.title || 'Untitled Quiz'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {quiz.description || 'No description available'}
                  </p>

                  {/* Quiz Meta */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {quiz.subject || 'General'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {quiz.questionCount || 0} Questions
                    </span>
                  </div>

                  {/* Action Button */}
                  <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                    Start Quiz →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
