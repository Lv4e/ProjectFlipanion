'use client';

import React from 'react';
import { supabase } from '../app/supabase-client';
import Link from 'next/link';
import Image from 'next/image';
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
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
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
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const applyTheme = (nextTheme: 'light' | 'dark') => {
    const html = document.documentElement;

    if (nextTheme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      html.style.colorScheme = 'light';
    }

    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
  };

  const toggleTheme = () => {
    applyTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled 
          ? 'backdrop-blur-2xl border-b border-[var(--border)]' 
          : 'bg-transparent'
      }`}
      style={
        scrolled
          ? {
              backgroundColor:
                'color-mix(in srgb, var(--background) 65%, transparent)',
            }
          : undefined
      }
    >
      <div className="max-w-7xl mx-auto px-8 h-[4.5rem] flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105">
            <Image src="/logo_flipanion.png" alt="Flipanion" width={200} height={200} className="scale-[1.6]" />
          </div>
          <span className="text-[1.05rem] font-bold text-[var(--foreground)] tracking-[-0.03em] opacity-90 group-hover:opacity-100 transition-opacity duration-300">
            Flipanion
          </span>
        </Link>
        
        {/* Navigation */}
        <nav className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Dark Mode aktivieren' : 'Light Mode aktivieren'}
            className="relative h-9 w-9 rounded-xl text-[var(--text-muted)] hover:text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-all duration-300"
            type="button"
          >
            {theme === 'light' ? (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646a9.003 9.003 0 1011.708 11.708z" />
              </svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1.5M12 19.5V21M4.5 12H3m18 0h-1.5M6.343 6.343L5.28 5.28m13.44 13.44l-1.063-1.063M17.657 6.343 18.72 5.28m-13.44 13.44 1.063-1.063M12 16.25A4.25 4.25 0 1 0 12 7.75a4.25 4.25 0 0 0 0 8.5Z" />
              </svg>
            )}
          </button>

          {loading ? (
            <div className="flex gap-2 ml-2">
              <div className="h-9 w-20 bg-[var(--surface-hover)] rounded-xl animate-pulse" />
              <div className="h-9 w-24 bg-[var(--surface-hover)] rounded-xl animate-pulse" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-1">
              <Link 
                href="/browse" 
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover-underline ${
                  pathname === '/browse' 
                    ? 'text-[var(--foreground)] bg-[var(--surface-hover)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                Entdecken
              </Link>
              <Link 
                href="/leaderboard" 
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover-underline ${
                  pathname === '/leaderboard' 
                    ? 'text-[var(--foreground)] bg-[var(--surface-hover)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
              >
                Leaderboard
              </Link>
              
              <div className="w-px h-5 bg-[var(--border)] mx-2.5" />
              
              <Link 
                href="/profile" 
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-300 group"
              >
                <div className="w-7 h-7 bg-[var(--primary)] rounded-lg flex items-center justify-center overflow-hidden opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-[11px]">
                      {(user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-[var(--text-muted)] group-hover:text-[var(--foreground)] hidden sm:block transition-colors duration-300">
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'Nutzer'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-red-400 rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-300"
              >
                <svg className="w-[18px] h-[18px] sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                <span className="hidden sm:inline">Abmelden</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 ml-2">
              <Link href="/auth?mode=login">
                <button className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--foreground)] rounded-xl transition-all duration-300">
                  Anmelden
                </button>
              </Link>
              <Link href="/auth?mode=signup">
                <button className="px-5 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--surface-hover)] border border-[var(--border-strong)] rounded-xl hover:bg-[var(--border)] transition-all duration-300">
                  Registrieren
                </button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
