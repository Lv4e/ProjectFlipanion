"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../app/supabase-client";

export default function Footer() {
  const [loggedIn, setLoggedIn] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-sm mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-3">
              <div className="w-10 h-10 rounded-lg shadow-sm group-hover:shadow-indigo-500/25 transition-shadow overflow-hidden flex items-center justify-center">
                <Image
                  src="/logo_flipanion.png"
                  alt="Flipanion"
                  width={200}
                  height={200}
                  className="scale-[1.6]"
                />
              </div>
              <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                Flipanion
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              Deine interaktive Quiz-Plattform zum Lernen, Üben und Wissen
              testen.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              Plattform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/browse"
                  className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
                >
                  Quizze entdecken
                </Link>
              </li>
              <li>
                <Link
                  href={loggedIn ? "/profile" : "/auth"}
                  className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
                >
                  Mein Konto
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              Rechtliches
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/agb"
                  className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
                >
                  AGB
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
                >
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              Kontakt
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:flipanion@spengergasse.at"
                  className="text-sm text-[var(--text-muted)] hover:text-indigo-500 transition-colors"
                >
                  flipanion@spengergasse.at
                </a>
              </li>
              <li className="text-sm text-[var(--text-muted)]">
                ------------------------------
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Flipanion. Mit Liebe gebaut.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Ein Schulprojekt des Teams "Flipanion" der 3AHWII an der
            Spengergasse.
          </p>
        </div>
      </div>
    </footer>
  );
}
