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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] animate-fade-in" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-slide-up">
        <div className="max-w-3xl mx-auto glass-card-static rounded-2xl p-8 border border-[var(--border)]">
          <div className="flex items-start gap-5">
            {/* Cookie Icon */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--surface-hover)] shrink-0">
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 2a10 10 0 1010 10 4 4 0 01-5-1 4 4 0 01-1-5 10 10 0 00-4-4zm1 7a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 11-2 0 1 1 0 012 0zm6 2a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1.5">
                Wir verwenden Cookies
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-5">
                Wir nutzen Cookies, um dir die bestmögliche Erfahrung auf unserer Plattform zu bieten.
                Einige sind technisch notwendig, andere helfen uns, die Plattform zu verbessern.
                Mehr dazu in unserer{' '}
                <Link
                  href="/agb"
                  className="text-[var(--foreground)] hover:underline underline-offset-2 transition-colors duration-300"
                >
                  AGB
                </Link>
                ,{' '}
                <Link
                  href="/datenschutz"
                  className="text-[var(--foreground)] hover:underline underline-offset-2 transition-colors duration-300"
                >
                  Datenschutzerklärung
                </Link>{' '}
                und im{' '}
                <Link
                  href="/impressum"
                  className="text-[var(--foreground)] hover:underline underline-offset-2 transition-colors duration-300"
                >
                  Impressum
                </Link>
                .
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={accept}
                  className="px-6 py-3 text-sm font-semibold text-[var(--background)] bg-[var(--foreground)] hover:opacity-90 rounded-xl transition-all duration-300 active:scale-[0.97] cursor-pointer hover-glow"
                >
                  Alle akzeptieren
                </button>
                <button
                  onClick={decline}
                  className="px-6 py-3 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)] bg-[var(--surface-hover)] rounded-xl transition-all duration-300 active:scale-[0.97] cursor-pointer"
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
