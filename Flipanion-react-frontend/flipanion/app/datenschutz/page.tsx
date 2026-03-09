import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Datenschutz – Flipanion',
  description: 'Datenschutzerklärung von Flipanion.',
};

export default function DatenschutzPage() {
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
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8">Datenschutzerklärung</h1>

        <div className="space-y-8 text-[var(--foreground)]">
          {/* Verantwortlicher */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Verantwortlicher</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Verantwortlicher für die Datenverarbeitung auf dieser Plattform ist das Team
                „Flipanion" der 3AHWII an der HTBLuVA Spengergasse.
              </p>
              <p className="mt-2">
                E-Mail:{' '}
                <a
                  href="mailto:flipanion@spengergasse.at"
                  className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                >
                  flipanion@spengergasse.at
                </a>
              </p>
            </div>
          </section>

          {/* Erhobene Daten */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Welche Daten wir erheben</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Im Rahmen der Nutzung unserer Plattform können folgende personenbezogene Daten
                erhoben werden:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>E-Mail-Adresse (bei Registrierung)</li>
                <li>Benutzername</li>
                <li>Erstellte Quizze und Antworten</li>
                <li>Statistiken zur Nutzung (z.&thinsp;B. Punktestände)</li>
              </ul>
            </div>
          </section>

          {/* Zweck der Verarbeitung */}
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Zweck der Datenverarbeitung</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>Wir verarbeiten Ihre Daten ausschließlich zu folgenden Zwecken:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Bereitstellung und Betrieb der Plattform</li>
                <li>Verwaltung von Nutzerkonten</li>
                <li>Anzeige persönlicher Statistiken und Fortschritte</li>
                <li>Verbesserung der Plattform</li>
              </ul>
            </div>
          </section>

          {/* Rechtsgrundlage */}
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Rechtsgrundlage</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Die Verarbeitung Ihrer Daten erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1
                lit. a DSGVO) sowie zur Erfüllung des Nutzungsvertrags (Art. 6 Abs. 1 lit. b DSGVO).
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Unsere Plattform verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem
                Endgerät gespeichert werden und die Nutzung der Plattform erleichtern.
              </p>
              <p>
                <span className="font-semibold text-[var(--foreground)]">Technisch notwendige Cookies:</span>{' '}
                Diese sind für den Betrieb der Plattform erforderlich (z.&thinsp;B. Authentifizierung,
                Session-Management).
              </p>
              <p>
                Sie können die Verwendung von Cookies über Ihren Browser steuern. Bitte beachten Sie,
                dass die Deaktivierung bestimmter Cookies die Funktionalität der Plattform
                einschränken kann.
              </p>
            </div>
          </section>

          {/* Datenweitergabe */}
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Weitergabe von Daten</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Ihre personenbezogenen Daten werden nicht an Dritte verkauft oder zu Werbezwecken
                weitergegeben. Eine Weitergabe erfolgt nur, soweit dies für den Betrieb der Plattform
                erforderlich ist (z.&thinsp;B. Hosting-Dienstleister).
              </p>
              <p>
                Wir nutzen Supabase als Backend-Dienst. Die Datenverarbeitung erfolgt auf Servern
                innerhalb der EU bzw. unter Einhaltung der DSGVO.
              </p>
            </div>
          </section>

          {/* Speicherdauer */}
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Speicherdauer</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Ihre Daten werden nur so lange gespeichert, wie es für die genannten Zwecke
                erforderlich ist. Bei Löschung Ihres Kontos werden Ihre personenbezogenen Daten
                unverzüglich entfernt, sofern keine gesetzlichen Aufbewahrungspflichten
                entgegenstehen.
              </p>
            </div>
          </section>

          {/* Ihre Rechte */}
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Ihre Rechte</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>Sie haben jederzeit das Recht auf:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Auskunft über Ihre gespeicherten Daten</li>
                <li>Berichtigung unrichtiger Daten</li>
                <li>Löschung Ihrer Daten</li>
                <li>Einschränkung der Verarbeitung</li>
                <li>Datenübertragbarkeit</li>
                <li>Widerruf einer erteilten Einwilligung</li>
              </ul>
              <p>
                Zur Ausübung Ihrer Rechte wenden Sie sich bitte an{' '}
                <a
                  href="mailto:flipanion@spengergasse.at"
                  className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                >
                  flipanion@spengergasse.at
                </a>
                .
              </p>
            </div>
          </section>

          {/* Beschwerderecht */}
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Beschwerderecht</h2>
            <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Sie haben das Recht, eine Beschwerde bei der zuständigen Aufsichtsbehörde einzureichen.
                In Österreich ist dies die Österreichische Datenschutzbehörde (DSB),
                Barichgasse 40–42, 1030 Wien.
              </p>
            </div>
          </section>

          {/* Änderungen */}
          <section>
            <h2 className="text-xl font-semibold mb-3">10. Änderungen dieser Datenschutzerklärung</h2>
            <div className="glass-card rounded-2xl p-6 space-y-4 text-sm leading-relaxed text-[var(--text-muted)]">
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen, um sie an
                geänderte Rechtslagen oder Änderungen der Plattform anzupassen. Die jeweils aktuelle
                Fassung finden Sie stets auf dieser Seite.
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
