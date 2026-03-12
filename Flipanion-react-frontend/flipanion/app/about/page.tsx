import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '../../components/Footer';
import InteractiveCard from '../../components/InteractiveCard';
import MagneticButton from '../../components/MagneticButton';
import ScrollReveal from '../../components/ScrollReveal';

export const metadata: Metadata = {
  title: 'Über uns – Flipanion',
  description: 'Erfahre mehr über Flipanion: die Lernplattform für HTL Wirtschaftsingenieurwesen-SchülerInnen. Interaktive Quizze, strukturiertes Lernen, ein Ziel.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-primary" style={{ top: '-12%', right: '-8%', width: '680px', height: '680px' }} />
        <div className="orb orb-accent" style={{ bottom: '-10%', left: '-7%', width: '560px', height: '560px' }} />
        <div className="orb orb-primary" style={{ top: '42%', left: '48%', width: '360px', height: '360px', opacity: 0.45 }} />
      </div>

      <main className="relative max-w-7xl mx-auto px-8">
        <section className="pt-24 pb-20 lg:pt-32 lg:pb-28">
          <ScrollReveal direction="up" delay={0}>
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] backdrop-blur-sm hover-glow">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-[var(--text-muted)] tracking-wider uppercase">
                  Über uns
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={80} distance={50}>
            <h1 className="text-center text-5xl md:text-7xl lg:text-[6.2rem] font-extrabold tracking-[-0.045em] text-[var(--foreground)] leading-[1.03]">
              Lernen neu gedacht mit
              <br />
              <span className="bg-gradient-to-r from-[var(--primary-light)] via-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                Flipanion
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={180}>
            <p className="text-center text-lg md:text-xl lg:text-2xl text-[var(--text-muted)] max-w-3xl mx-auto mt-8 leading-relaxed">
              Flipanion ist die Lernplattform von HTL-Schülern für SchülerInnen im
              Wirtschaftsingenieurwesen (HWII): interaktive Quizze, strukturierte Wiederholung
              und ein digitales Lernerlebnis, das dich wirklich voranbringt.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={260}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
              <InteractiveCard className="glass-card gradient-border rounded-2xl p-7" intensity={8} glowIntensity={0.08}>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-3">Fokus</p>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Wirtschaftsingenieurwesen</h3>
                <p className="text-[var(--text-muted)]">Speziell für HWII-Themen und HTL-Lernrealität gemacht.</p>
              </InteractiveCard>

              <InteractiveCard className="glass-card gradient-border rounded-2xl p-7" intensity={8} glowIntensity={0.08}>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-3">Methode</p>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Interaktiv lernen</h3>
                <p className="text-[var(--text-muted)]">Mit Quizzen statt reinem Auswendiglernen durch den Stoff gehen.</p>
              </InteractiveCard>

              <InteractiveCard className="glass-card gradient-border rounded-2xl p-7" intensity={8} glowIntensity={0.08}>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-3">Ziel</p>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Effizienter vorbereiten</h3>
                <p className="text-[var(--text-muted)]">Für Tests und Prüfungen mit mehr Struktur und weniger Stress.</p>
              </InteractiveCard>
            </div>
          </ScrollReveal>
        </section>

        <section className="pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <ScrollReveal direction="left" delay={0}>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-4">Das Problem</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
                Viel Theorie, wenig klare Lernstruktur.
              </h2>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-4">
                Viele HTL-SchülerInnen kämpfen mit großen Stoffmengen, verstreuten Unterlagen
                und Lernmethoden, die nicht wirklich effizient sind.
              </p>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                Gerade vor Tests und Prüfungen fehlt oft ein System, das Wissen strukturiert
                wiederholbar macht.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={80}>
              <InteractiveCard className="glass-card gradient-border rounded-3xl p-8 md:p-10" intensity={7} glowIntensity={0.07}>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-5">Typische Hürden</h3>
                <ul className="space-y-4 text-[var(--text-muted)]">
                  <li className="flex gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[var(--primary)]" />
                    <span>Zu viel Theorie in zu kurzer Zeit.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[var(--primary)]" />
                    <span>Kein zentraler Ort für relevantes Wissen.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[var(--primary)]" />
                    <span>Unsicherheit, ob man wirklich prüfungsfit ist.</span>
                  </li>
                </ul>
              </InteractiveCard>
            </ScrollReveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <ScrollReveal direction="left" delay={0} className="order-2 lg:order-1">
              <InteractiveCard className="glass-card gradient-border rounded-3xl p-8 md:p-10" intensity={7} glowIntensity={0.07}>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-5">Was Flipanion anders macht</h3>
                <ul className="space-y-4 text-[var(--text-muted)]">
                  <li className="flex gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span>Interaktive Quizze statt passivem Durchlesen.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span>Strukturierte Wissenswiederholung mit klarer Orientierung.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span>Digital-first aufgebaut, damit Lernen schneller startet.</span>
                  </li>
                </ul>
              </InteractiveCard>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={80} className="order-1 lg:order-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-4">Unsere Lösung</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
                Interaktiv, strukturiert, effizient.
              </h2>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-4">
                Flipanion kombiniert interaktive Quizze mit strukturiertem Üben,
                damit SchülerInnen ihr Wissen gezielt festigen können.
              </p>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                Das Ziel ist klar: Lernen vereinfachen und Vorbereitung auf Leistungschecks
                deutlich effektiver machen.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <ScrollReveal direction="left" delay={0}>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-4">
                Warum wir Flipanion entwickelt haben
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
                Weil wir dieselben Herausforderungen kennen.
              </h2>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed mb-4">
                Flipanion wurde von HTL-Schülern entwickelt, die selbst mit großen Stoffmengen,
                Zeitdruck und ineffizienten Lernwegen konfrontiert waren.
              </p>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                Das Projekt ist aus echter Erfahrung entstanden und wird als wachsendes
                Schülerprojekt kontinuierlich weiterentwickelt.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={80}>
              <div className="glass-card-static rounded-3xl p-8 md:p-10 border border-[var(--border-strong)]">
                <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-3">Student-built</p>
                <p className="text-2xl md:text-3xl font-semibold text-[var(--foreground)] leading-tight">
                  Kein theoretisches Konzept.
                  <br />
                  Eine Lösung aus dem Schulalltag.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="pb-24">
          <ScrollReveal direction="up" delay={0}>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-4 text-center">
              Für wen Flipanion gemacht ist
            </p>
            <h2 className="text-center text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-12">
              Gemacht für die HTL-Lernrealität.
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <ScrollReveal direction="up" delay={0}>
              <InteractiveCard className="glass-card gradient-border rounded-2xl p-8 h-full" intensity={7} glowIntensity={0.07}>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">SchülerInnen</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Speziell für Wirtschaftsingenieurwesen (HWII) aufgebaut, damit Lernstoff
                  schneller wiederholbar und besser greifbar wird.
                </p>
              </InteractiveCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100}>
              <InteractiveCard className="glass-card gradient-border rounded-2xl p-8 h-full" intensity={7} glowIntensity={0.07}>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">Lehrende</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Interaktive Quizze helfen dabei, Übungseinheiten digital zu ergänzen
                  und Lernfortschritt besser sichtbar zu machen.
                </p>
              </InteractiveCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <InteractiveCard className="glass-card gradient-border rounded-2xl p-8 h-full" intensity={7} glowIntensity={0.07}>
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">Innovations-Interessierte</h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  Ein praxisnahes EdTech-Projekt, das zeigt, wie Schülerperspektive
                  zu besserem Lernen führen kann.
                </p>
              </InteractiveCard>
            </ScrollReveal>
          </div>
        </section>

        <section className="pb-24">
          <ScrollReveal direction="up" delay={0}>
            <InteractiveCard
              className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[var(--surface)] p-10 md:p-14"
              intensity={5}
              glowIntensity={0.05}
            >
              <div className="absolute top-[-70px] right-[-40px] w-[260px] h-[260px] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-[-80px] left-[-30px] w-[220px] h-[220px] bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] rounded-full blur-3xl" />

              <div className="relative">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-subtle)] mb-4">Unsere Vision</p>
                <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
                  Eine Lernplattform, die mit den SchülerInnen mitwächst.
                </h2>
                <p className="text-lg md:text-xl text-[var(--text-muted)] leading-relaxed max-w-3xl">
                  Flipanion soll langfristig zu einem zentralen Lernbegleiter für HWII-SchülerInnen werden:
                  mit immer besserer Struktur, mehr Interaktivität und einem Lernerlebnis, das motiviert,
                  statt zu überfordern.
                </p>
              </div>
            </InteractiveCard>
          </ScrollReveal>
        </section>

        <section className="pb-28">
          <ScrollReveal direction="scale" delay={0}>
            <div className="glass-card-static rounded-3xl border border-[var(--border-strong)] p-10 md:p-14 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-5">
                Das ist erst der Anfang.
              </h2>
              <p className="text-lg md:text-xl text-[var(--text-muted)] mb-10 max-w-3xl mx-auto leading-relaxed">
                Flipanion ist ein wachsendes Schülerprojekt mit einem klaren Ziel:
                Lernen im Wirtschaftsingenieurwesen einfacher, interaktiver und effizienter zu machen.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth">
                  <MagneticButton
                    className="px-10 py-4 bg-[var(--foreground)] text-[var(--background)] text-base font-semibold rounded-xl hover:opacity-90 transition-all duration-300 active:scale-[0.97] cursor-pointer hover-glow"
                    strength={0.25}
                  >
                    Mit dem Lernen starten
                  </MagneticButton>
                </Link>
                <Link href="/browse">
                  <MagneticButton
                    className="px-10 py-4 text-base font-semibold text-[var(--text-muted)] hover:text-[var(--foreground)] border border-[var(--border-strong)] rounded-xl hover:border-[color-mix(in_srgb,var(--foreground)_20%,transparent)] transition-all duration-300 cursor-pointer"
                    strength={0.25}
                  >
                    Quizze ansehen
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}
