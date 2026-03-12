import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CookieBanner from "../components/CookieBanner";
import { FloatingHeader } from "@/components/ui/floating-header";


const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flipanion – Die Quiz-Plattform für HTL Wirtschaftsingenieurwesen (HWII)",
  description: "Flipanion bündelt den HTL Wirtschaftsingenieurwesen (HWII)-Stoff an einem Ort. HTL Lernen mit Quizzen zu Rechnungswesen, BWL, Technik und Management für HTL SchülerInnen.",
  icons: {
    icon: "/logo_flipanion.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme') || 'dark';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                document.documentElement.style.colorScheme = 'dark';
              } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                document.documentElement.style.colorScheme = 'light';
              }
            } catch(e) {}
          `
        }} />
      </head>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <FloatingHeader />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
