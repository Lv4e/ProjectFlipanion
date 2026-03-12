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
    <footer className="mt-auto relative">
      {/* Gradient separator */}
      <div className="section-divider" />
      
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 group mb-5">
              <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105">
                <Image
                  src="/logo_flipanion.png"
                  alt="Flipanion"
                  width={200}
                  height={200}
                  className="scale-[1.6]"
                />
              </div>
              <span className="text-[1.05rem] font-bold text-[var(--foreground)] tracking-[-0.03em] opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                Flipanion
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-[280px]">
              Die Lern- und Quizplattform für HTL Wirtschaftsingenieur-SchülerInnen: gesamter HWII-Stoff an einem Ort.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-4 tracking-wide uppercase text-[11px]">
              Plattform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/browse"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-300 inline-block hover-underline"
                >
                  Quizze entdecken
                </Link>
              </li>
              <li>
                <Link
                  href={loggedIn ? "/profile" : "/auth"}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-300 inline-block hover-underline"
                >
                  Mein Konto
                </Link>
              </li>
              <li>
                <Link
                  href={loggedIn ? "/leaderboard" : "/auth"}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-300 inline-block hover-underline"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-300 inline-block hover-underline"
                >
                  Über uns
                </Link>
              </li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-4 tracking-wide uppercase text-[11px]">
              Rechtliches
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/impressum"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-300 inline-block hover-underline"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  href="/agb"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-300 inline-block hover-underline"
                >
                  AGB
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-300 inline-block hover-underline"
                >
                  Datenschutz
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-4 tracking-wide uppercase text-[11px]">
              Kontakt
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:KRU230104@spengergasse.at"
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors duration-300 inline-block hover-underline"
                >
                  KRU230104@spengergasse.at
                </a>
              </li>
              <li className="text-sm text-[var(--text-muted)]">Mo-Fr, 8:00-16:00</li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--text-subtle)]">
            &copy; {new Date().getFullYear()} Flipanion
          </p>
          <p className="text-xs text-[var(--text-subtle)]">
            Ein Schulprojekt der 3AHWII an der Spengergasse.
          </p>
        </div>
      </div>
    </footer>
  );
}
