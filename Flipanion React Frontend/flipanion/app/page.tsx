'use client'; 

import React from 'react';
import { supabase } from './supabase-client';
import Link from 'next/link';
import Header from '../components/Header';


interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

export default function Home() {
  const [quizzes, setQuizzes] = React.useState([]);
  const [user, setUser] = React.useState<User | null>(null);


  React.useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
       setUser(user as User | null);
     });

  }, []);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Header with Login/Signup */}
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">



        {/* Username Display */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, <span className="text-blue-600">{user?.user_metadata?.name}</span>!
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
