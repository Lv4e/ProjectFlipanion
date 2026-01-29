'use client';

import React from 'react';
import { supabase } from '../app/supabase-client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

export default function Header() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user as User | null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
          Flipanion
        </Link>
        
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="animate-pulse flex gap-3">
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : user ? (
            // Logged in - Show username and profile icon
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'Nutzer'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Abmelden
              </button>
            </div>
          ) : (
            // Not logged in - Show login/signup buttons
            <>
              <Link href="/auth?mode=login">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Anmelden
                </button>
              </Link>
              <Link href="/auth?mode=signup">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Registrieren
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
