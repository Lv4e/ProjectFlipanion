import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'AGB â€“ Flipanion',
  description: 'Allgemeine GeschÃ¤ftsbedingungen von Flipanion.',
};

export default function AGBPage() {
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
            <span className="text-sm font-medium">Zurück</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-10 tracking-[-0.03em]">Allgemeine Geschäftsbedingungen (AGB)</h1>

        <div className="space-y-10 text-[var(--foreground)]">
          {/* Geltungsbereich */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Geltungsbereich</h2>
            <div className="glass-card rounded-xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Diese Allgemeinen GeschÃ¤ftsbedingungen gelten fÃ¼r die Nutzung der Plattform Flipanion
                (nachfolgend â€žPlattform" genannt). Mit der Registrierung bzw. Nutzung der Plattform
                erklÃ¤rt sich der Nutzer mit diesen AGB einverstanden.
              </p>
            </div>
          </section>

          {/* Leistungsbeschreibung */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Leistungsbeschreibung</h2>
            <div className="glass-card rounded-xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Flipanion ist eine interaktive Quiz-Plattform, die es Nutzern ermÃ¶glicht, Quizze zu
                erstellen, zu teilen und zu lÃ¶sen. Die Plattform dient ausschlieÃŸlich Bildungszwecken
                und ist ein Schulprojekt des Teams "Flipanion" der 3AHWII an der HTBLuVA Spengergasse.
              </p>
            </div>
          </section>

          {/* Registrierung und Nutzerkonto */}
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Registrierung und Nutzerkonto</h2>
            <div className="glass-card rounded-xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                FÃ¼r die vollstÃ¤ndige Nutzung der Plattform ist eine Registrierung erforderlich. Der
                Nutzer verpflichtet sich, bei der Registrierung wahrheitsgemÃ¤ÃŸe Angaben zu machen und
                seine Zugangsdaten vertraulich zu behandeln.
              </p>
              <p>
                Jeder Nutzer darf nur ein Konto anlegen. Die Weitergabe von Zugangsdaten an Dritte ist
                nicht gestattet. Der Nutzer haftet fÃ¼r alle AktivitÃ¤ten, die Ã¼ber sein Konto erfolgen.
              </p>
            </div>
          </section>

          {/* Nutzungsrechte und Pflichten */}
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Nutzungsrechte und Pflichten</h2>
            <div className="glass-card rounded-xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Der Nutzer erhÃ¤lt ein nicht Ã¼bertragbares, widerrufliches Recht zur Nutzung der
                Plattform im Rahmen dieser AGB. Es ist untersagt:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Die Plattform fÃ¼r rechtswidrige Zwecke zu nutzen</li>
                <li>Inhalte hochzuladen, die beleidigend, diskriminierend oder anderweitig anstÃ¶ÃŸig sind</li>
                <li>Die Plattform technisch zu manipulieren oder deren Betrieb zu stÃ¶ren</li>
                <li>Automatisierte Zugriffe (Bots, Scraper) ohne Genehmigung einzusetzen</li>
              </ul>
            </div>
          </section>

          {/* Geistiges Eigentum */}
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Geistiges Eigentum</h2>
            <div className="glass-card rounded-xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Alle Inhalte der Plattform (Design, Texte, Logos, Software) sind urheberrechtlich
                geschÃ¼tzt. Die vom Nutzer erstellten Quizze und Inhalte verbleiben im Eigentum des
                jeweiligen Nutzers.
              </p>
              <p>
                Mit dem Hochladen von Inhalten rÃ¤umt der Nutzer der Plattform ein einfaches,
                unentgeltliches Nutzungsrecht ein, um die Inhalte im Rahmen des Plattformbetriebs
                anzeigen und verarbeiten zu kÃ¶nnen.
              </p>
            </div>
          </section>

          {/* Haftung */}
          <section>
            <h2 className="text-xl font-semibold mb-3">6. HaftungsbeschrÃ¤nkung</h2>
            <div className="glass-card rounded-xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Die Plattform wird â€žwie besehen" bereitgestellt. Es wird keine GewÃ¤hr fÃ¼r die
                ununterbrochene VerfÃ¼gbarkeit, Fehlerfreiheit oder Eignung fÃ¼r einen bestimmten Zweck
                Ã¼bernommen.
              </p>
              <p>
                Die Betreiber haften nicht fÃ¼r SchÃ¤den, die durch die Nutzung oder die
                UnmÃ¶glichkeit der Nutzung der Plattform entstehen, sofern kein vorsÃ¤tzliches oder grob
                fahrlÃ¤ssiges Verhalten vorliegt.
              </p>
            </div>
          </section>

          {/* Datenschutz */}
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Datenschutz</h2>
            <div className="glass-card rounded-xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Der Schutz personenbezogener Daten ist uns wichtig. Informationen zur Verarbeitung
                personenbezogener Daten finden Sie in unserer DatenschutzerklÃ¤rung im{' '}
                <Link
                  href="/impressum"
                  className="text-[var(--primary)] hover:underline transition-colors"
                >
                  Impressum
                </Link>
                .
              </p>
            </div>
          </section>

          {/* KÃ¼ndigung */}
          <section>
            <h2 className="text-xl font-semibold mb-3">8. KÃ¼ndigung und KontolÃ¶schung</h2>
            <div className="glass-card rounded-xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Der Nutzer kann sein Konto jederzeit lÃ¶schen. Die Betreiber behalten sich das Recht
                vor, Nutzerkonten bei VerstoÃŸ gegen diese AGB ohne VorankÃ¼ndigung zu sperren oder zu
                lÃ¶schen.
              </p>
            </div>
          </section>

          {/* Ã„nderungen der AGB */}
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Ã„nderungen der AGB</h2>
            <div className="glass-card rounded-xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Die Betreiber behalten sich vor, diese AGB jederzeit zu Ã¤ndern. Ãœber wesentliche
                Ã„nderungen werden die Nutzer rechtzeitig informiert. Die weitere Nutzung der Plattform
                nach Inkrafttreten der Ã„nderungen gilt als Zustimmung zu den geÃ¤nderten AGB.
              </p>
            </div>
          </section>

          {/* Schlussbestimmungen */}
          <section>
            <h2 className="text-xl font-semibold mb-3">10. Schlussbestimmungen</h2>
            <div className="glass-card rounded-xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Es gilt Ã¶sterreichisches Recht. Sollten einzelne Bestimmungen dieser AGB unwirksam sein
                oder werden, bleibt die Wirksamkeit der Ã¼brigen Bestimmungen davon unberÃ¼hrt.
              </p>
              <p className="text-xs mt-4">
                Stand: Februar 2026
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
