import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'AGB – Flipanion',
  description: 'Allgemeine Geschäftsbedingungen von Flipanion.',
};

export default function AGBPage() {
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
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

        <div className="space-y-8 text-[var(--foreground)]">
          {/* Geltungsbereich */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Geltungsbereich</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Plattform Flipanion
                (nachfolgend „Plattform" genannt). Mit der Registrierung bzw. Nutzung der Plattform
                erklärt sich der Nutzer mit diesen AGB einverstanden.
              </p>
            </div>
          </section>

          {/* Leistungsbeschreibung */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Leistungsbeschreibung</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Flipanion ist eine interaktive Quiz-Plattform, die es Nutzern ermöglicht, Quizze zu
                erstellen, zu teilen und zu lösen. Die Plattform dient ausschließlich Bildungszwecken
                und ist ein Schulprojekt des Teams "Flipanion" der 3AHWII an der HTBLuVA Spengergasse.
              </p>
            </div>
          </section>

          {/* Registrierung und Nutzerkonto */}
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Registrierung und Nutzerkonto</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Für die vollständige Nutzung der Plattform ist eine Registrierung erforderlich. Der
                Nutzer verpflichtet sich, bei der Registrierung wahrheitsgemäße Angaben zu machen und
                seine Zugangsdaten vertraulich zu behandeln.
              </p>
              <p>
                Jeder Nutzer darf nur ein Konto anlegen. Die Weitergabe von Zugangsdaten an Dritte ist
                nicht gestattet. Der Nutzer haftet für alle Aktivitäten, die über sein Konto erfolgen.
              </p>
            </div>
          </section>

          {/* Nutzungsrechte und Pflichten */}
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Nutzungsrechte und Pflichten</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Der Nutzer erhält ein nicht übertragbares, widerrufliches Recht zur Nutzung der
                Plattform im Rahmen dieser AGB. Es ist untersagt:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Die Plattform für rechtswidrige Zwecke zu nutzen</li>
                <li>Inhalte hochzuladen, die beleidigend, diskriminierend oder anderweitig anstößig sind</li>
                <li>Die Plattform technisch zu manipulieren oder deren Betrieb zu stören</li>
                <li>Automatisierte Zugriffe (Bots, Scraper) ohne Genehmigung einzusetzen</li>
              </ul>
            </div>
          </section>

          {/* Geistiges Eigentum */}
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Geistiges Eigentum</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Alle Inhalte der Plattform (Design, Texte, Logos, Software) sind urheberrechtlich
                geschützt. Die vom Nutzer erstellten Quizze und Inhalte verbleiben im Eigentum des
                jeweiligen Nutzers.
              </p>
              <p>
                Mit dem Hochladen von Inhalten räumt der Nutzer der Plattform ein einfaches,
                unentgeltliches Nutzungsrecht ein, um die Inhalte im Rahmen des Plattformbetriebs
                anzeigen und verarbeiten zu können.
              </p>
            </div>
          </section>

          {/* Haftung */}
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Haftungsbeschränkung</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Die Plattform wird „wie besehen" bereitgestellt. Es wird keine Gewähr für die
                ununterbrochene Verfügbarkeit, Fehlerfreiheit oder Eignung für einen bestimmten Zweck
                übernommen.
              </p>
              <p>
                Die Betreiber haften nicht für Schäden, die durch die Nutzung oder die
                Unmöglichkeit der Nutzung der Plattform entstehen, sofern kein vorsätzliches oder grob
                fahrlässiges Verhalten vorliegt.
              </p>
            </div>
          </section>

          {/* Datenschutz */}
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Datenschutz</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Der Schutz personenbezogener Daten ist uns wichtig. Informationen zur Verarbeitung
                personenbezogener Daten finden Sie in unserer Datenschutzerklärung im{' '}
                <Link
                  href="/impressum"
                  className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                >
                  Impressum
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Kündigung */}
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Kündigung und Kontolöschung</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Der Nutzer kann sein Konto jederzeit löschen. Die Betreiber behalten sich das Recht
                vor, Nutzerkonten bei Verstoß gegen diese AGB ohne Vorankündigung zu sperren oder zu
                löschen.
              </p>
            </div>
          </section>

          {/* Änderungen der AGB */}
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Änderungen der AGB</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Die Betreiber behalten sich vor, diese AGB jederzeit zu ändern. Über wesentliche
                Änderungen werden die Nutzer rechtzeitig informiert. Die weitere Nutzung der Plattform
                nach Inkrafttreten der Änderungen gilt als Zustimmung zu den geänderten AGB.
              </p>
            </div>
          </section>

          {/* Schlussbestimmungen */}
          <section>
            <h2 className="text-xl font-semibold mb-3">10. Schlussbestimmungen</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Es gilt österreichisches Recht. Sollten einzelne Bestimmungen dieser AGB unwirksam sein
                oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.
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
