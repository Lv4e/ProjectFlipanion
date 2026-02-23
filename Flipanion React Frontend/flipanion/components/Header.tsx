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
  const [scrolled, setScrolled] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user as User | null);
      setAvatarUrl((user?.user_metadata as Record<string, string>)?.avatar_url ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null);
      setAvatarUrl((session?.user?.user_metadata as Record<string, string>)?.avatar_url ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-xl shadow-sm border-b border-[var(--border)]' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-indigo-500/25 transition-shadow">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="text-xl font-bold text-[var(--foreground)] tracking-tight">
            Flipanion
          </span>
        </Link>
        
        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {loading ? (
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-[var(--border)] rounded-lg animate-pulse" />
              <div className="h-9 w-24 bg-[var(--border)] rounded-lg animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link 
                href="/browse" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === '/browse' 
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' 
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                Entdecken
              </Link>
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#1a1a2e] shadow-sm overflow-hidden">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-xs">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--foreground)] hidden sm:block">
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'Nutzer'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                Abmelden
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth?mode=login">
                <button className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                  Anmelden
                </button>
              </Link>
              <Link href="/auth?mode=signup">
                <button className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl hover:from-indigo-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]">
                  Registrieren
                </button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
