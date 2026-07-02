import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { MotionPrefsProvider } from "@/components/providers/MotionPrefsProvider";
import { site } from "@/data/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s — Soumyadeb Tripathy",
  },
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: "Proof of Work",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-r2 focus:bg-bg-3 focus:px-4 focus:py-2 focus:font-mono focus:text-claim focus:text-ink-hi"
        >
          Skip to content
        </a>
        <MotionPrefsProvider>{children}</MotionPrefsProvider>
      </body>
    </html>
  );
}
