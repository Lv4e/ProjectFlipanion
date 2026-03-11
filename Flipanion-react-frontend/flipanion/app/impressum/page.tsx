import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Impressum â€“ Flipanion',
  description: 'Impressum und rechtliche Informationen zu Flipanion.',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header Bar */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-2xl">
        <div className="max-w-4xl mx-auto px-8 py-5 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">ZurÃ¼ck</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-10 tracking-[-0.03em]">Impressum</h1>

        <div className="space-y-10 text-[var(--foreground)]">
          {/* Angaben gemÃ¤ÃŸ Â§ 5 ECG */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Angaben gemÃ¤ÃŸ Â§ 5 ECG</h2>
            <div className="glass-card rounded-xl p-6 space-y-1 text-sm leading-relaxed">
              <p className="font-medium">Flipanion â€“ Schulprojekt</p>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Kontakt</h2>
            <div className="glass-card rounded-xl p-6 space-y-1 text-sm leading-relaxed">
              <p>
                <span className="text-[var(--text-muted)]">E-Mail:</span>{' '}
                <a
                  href="mailto:flipanion@spengergasse.at"
                  className="text-[var(--primary)] hover:underline transition-colors"
                >
                  flipanion@spengergasse.at
                </a>
              </p>
            </div>
          </section>

          {/* Haftungsausschluss */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Haftungsausschluss</h2>
            <div className="glass-card rounded-xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Haftung fÃ¼r Inhalte</h3>
                <p>
                  Die Inhalte unserer Seiten wurden mit grÃ¶ÃŸter Sorgfalt erstellt. FÃ¼r die Richtigkeit,
                  VollstÃ¤ndigkeit und AktualitÃ¤t der Inhalte kÃ¶nnen wir jedoch keine GewÃ¤hr Ã¼bernehmen.
                  Als Diensteanbieter sind wir fÃ¼r eigene Inhalte auf diesen Seiten nach den allgemeinen
                  Gesetzen verantwortlich. Eine Verpflichtung zur Ãœberwachung Ã¼bermittelter oder
                  gespeicherter fremder Informationen besteht jedoch nicht.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-1">Haftung fÃ¼r Links</h3>
                <p>
                  Unser Angebot enthÃ¤lt Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
                  Einfluss haben. Deshalb kÃ¶nnen wir fÃ¼r diese fremden Inhalte auch keine GewÃ¤hr
                  Ã¼bernehmen. FÃ¼r die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
                  Betreiber der Seiten verantwortlich.
                </p>
              </div>
            </div>
          </section>

          {/* Urheberrecht */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Urheberrecht</h2>
            <div className="glass-card rounded-xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem Ã¶sterreichischen Urheberrecht. Die VervielfÃ¤ltigung, Bearbeitung, Verbreitung und jede
                Art der Verwertung auÃŸerhalb der Grenzen des Urheberrechtes bedÃ¼rfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </div>
          </section>

          {/* Datenschutz */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Datenschutz</h2>
            <div className="glass-card rounded-xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten mÃ¶glich.
                Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name oder E-Mail-Adresse)
                erhoben werden, erfolgt dies stets auf freiwilliger Basis. Diese Daten werden ohne Ihre
                ausdrÃ¼ckliche Zustimmung nicht an Dritte weitergegeben.
              </p>
            </div>
          </section>
        </div>

      </main>
      <Footer />
    </div>
  );
}
