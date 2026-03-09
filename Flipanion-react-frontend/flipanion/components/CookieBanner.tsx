'use client';

import React from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] transition-opacity" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-slide-up">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-6 shadow-2xl border border-[var(--border)]">
          <div className="flex items-start gap-4">
            {/* Cookie Icon */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/10 shrink-0">
              <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 2a10 10 0 1010 10 4 4 0 01-5-1 4 4 0 01-1-5 10 10 0 00-4-4zm1 7a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 11-2 0 1 1 0 012 0zm6 2a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[var(--foreground)] mb-1">
                Wir verwenden Cookies
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                Wir nutzen Cookies, um dir die bestmögliche Erfahrung auf unserer Plattform zu bieten.
                Einige sind technisch notwendig, andere helfen uns, die Plattform zu verbessern.
                Mehr dazu in unserer{' '}
                <Link
                  href="/agb"
                  className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 underline underline-offset-2 transition-colors"
                >
                  AGB
                </Link>
                ,{' '}
                <Link
                  href="/datenschutz"
                  className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 underline underline-offset-2 transition-colors"
                >
                  Datenschutzerklärung
                </Link>{' '}
                und im{' '}
                <Link
                  href="/impressum"
                  className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 underline underline-offset-2 transition-colors"
                >
                  Impressum
                </Link>
                .
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={accept}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Alle akzeptieren
                </button>
                <button
                  onClick={decline}
                  className="px-5 py-2.5 text-sm font-medium text-[var(--text-muted)] bg-[var(--surface-hover)] hover:bg-[var(--border)] rounded-xl transition-colors cursor-pointer"
                >
                  Nur notwendige
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
