import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { MotionPrefsProvider } from "@/components/providers/MotionPrefsProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { SoundProvider } from "@/components/providers/SoundProvider";
import { AuditProgressProvider } from "@/components/providers/AuditProgressProvider";
import { SiteNav } from "@/components/layout/SiteNav";
import { AuditRail } from "@/components/layout/AuditRail";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { BootSequence } from "@/components/boot/BootSequence";
import { Footer } from "@/components/layout/Footer";
import { ConsoleGreeting } from "@/components/chrome/ConsoleGreeting";
import { BackgroundScene } from "@/components/webgl/BackgroundScene";
import { site } from "@/data/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// display: "optional" — the hero headline is the LCP element; a late
// webfont swap would re-paint it and inflate LCP on slow connections.
// Fast connections render Newsreader normally; throttled first visits
// keep the size-adjusted serif fallback with no repaint.
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "optional",
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
        {/* No-flash theme script: must run before first paint, so it's a
            plain synchronous inline script ahead of everything else —
            not a React effect, which would run after hydration paints. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('pow-theme');if(t==='light')document.documentElement.dataset.theme='light';}catch(e){}})();",
          }}
        />
        <a
          href="#main"
          className="fixed top-4 left-4 z-100 -translate-y-24 rounded-r2 bg-bg-3 px-4 py-2.5 font-mono text-claim text-ink-hi transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionPrefsProvider>
          <ThemeProvider>
            <SoundProvider>
              <LenisProvider>
                <AuditProgressProvider>
                  <BackgroundScene />
                  <BootSequence />
                  <ScrollProgress />
                  <SiteNav />
                  <AuditRail />
                  {children}
                  <Footer />
                  <ConsoleGreeting />
                </AuditProgressProvider>
              </LenisProvider>
            </SoundProvider>
          </ThemeProvider>
        </MotionPrefsProvider>
      </body>
    </html>
  );
}
