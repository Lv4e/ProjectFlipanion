'use client'; 

import React from 'react';
import { supabase } from './supabase-client';
import Link from 'next/link';

export default function Home() {
  const [quizzes, setQuizzes] = React.useState([]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Header with Login/Signup */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flipanion</h1>
          
          {/* Login/Signup Container */}
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



        {/* Username Display */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, <span className="text-blue-600">JohnDoe</span>!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Ready to continue your learning journey?</p>
        </div>



        {/* Get Started Box */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 mb-8 text-white shadow-lg">
          <h3 className="text-2xl font-bold mb-3">Get Started</h3>
          <p className="mb-6 text-blue-50">
            Create your first quiz or explore existing ones to start learning!
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Create Quiz
            </button>
            <Link href="/browse">
              <button className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors border border-blue-400">
                Browse Quizzes
              </button>
            </Link>
          </div>
        </div>

        {/* Quizzes Placeholder */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Quizzes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            
           
          </div>
        </div>
      </main>
    </div>
  );
}
