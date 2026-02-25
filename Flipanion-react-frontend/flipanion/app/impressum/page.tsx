import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Impressum – Flipanion',
  description: 'Impressum und rechtliche Informationen zu Flipanion.',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header Bar */}
      <header className="border-b border-[var(--border)] bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Zurück</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">Impressum</h1>

        <div className="space-y-8 text-[var(--foreground)]">
          {/* Angaben gemäß § 5 ECG */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Angaben gemäß § 5 ECG</h2>
            <div className="glass-card rounded-2xl p-6 space-y-1 text-sm leading-relaxed">
              <p className="font-medium">Flipanion – Schulprojekt</p>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
            <div className="glass-card rounded-2xl p-6 space-y-1 text-sm leading-relaxed">
              <p>
                <span className="text-[var(--text-muted)]">E-Mail:</span>{' '}
                <a
                  href="mailto:flipanion@spengergasse.at"
                  className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  flipanion@spengergasse.at
                </a>
              </p>
            </div>
          </section>

          {/* Haftungsausschluss */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Haftungsausschluss</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Haftung für Inhalte</h3>
                <p>
                  Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
                  Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                  Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
                  Gesetzen verantwortlich. Eine Verpflichtung zur Überwachung übermittelter oder
                  gespeicherter fremder Informationen besteht jedoch nicht.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Haftung für Links</h3>
                <p>
                  Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
                  Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
                  übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
                  Betreiber der Seiten verantwortlich.
                </p>
              </div>
            </div>
          </section>

          {/* Urheberrecht */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Urheberrecht</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede
                Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </div>
          </section>

          {/* Datenschutz */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Datenschutz</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich.
                Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name oder E-Mail-Adresse)
                erhoben werden, erfolgt dies stets auf freiwilliger Basis. Diese Daten werden ohne Ihre
                ausdrückliche Zustimmung nicht an Dritte weitergegeben.
              </p>
            </div>
          </section>
        </div>

      </main>
      <Footer />
    </div>
  );
}
