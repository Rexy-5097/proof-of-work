"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Seal } from "@/components/primitives/Seal";
import { useSound } from "@/components/providers/SoundProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useLenis } from "@/components/providers/LenisProvider";

/* The audit moved off "/" and onto its own route when the solar prologue
   became a gate, so every chapter anchor is now /proof#… — a real
   cross-route link from anywhere else on the site, and a same-page scroll
   once the reader is already inside the audit. */
const links = [
  { label: "Projects", href: "/proof#evidence" },
  { label: "Journal", href: "/engineering" },
  { label: "About", href: "/proof#about" },
  { label: "Contact", href: "/proof#contact" },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { enabled, setEnabled, play } = useSound();
  const { theme, toggleTheme } = useTheme();
  const { scrollTo } = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAnchor = (href: string) => (e: React.MouseEvent) => {
    if (pathname === "/proof" && href.startsWith("/proof#")) {
      e.preventDefault();
      scrollTo(href.slice("/proof".length));
      setMenuOpen(false);
    } else {
      setMenuOpen(false);
    }
    play("tap");
  };

  const toggleSound = () => {
    const next = !enabled;
    setEnabled(next);
    // Confirm the new state audibly only when turning ON (a gesture).
    if (next) play("toggle");
  };

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleTheme({ x: e.clientX, y: e.clientY });
    play("toggle");
    setMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-[var(--dur-ui)] print:hidden",
        scrolled ? "border-b border-line bg-bg-0/85 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-[var(--content-max)] items-center justify-between px-[var(--page-margin)]"
      >
        <Link
          href="/"
          onClick={handleAnchor("/proof#landing")}
          className="flex items-center gap-2 font-mono text-label font-medium tracking-[0.08em] text-ink-hi"
        >
          <Seal state="verified" size={11} />
          SOUMYADEB TRIPATHY
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={handleAnchor(l.href)}
              className="py-2 text-sm text-ink-md transition-colors duration-[var(--dur-tick)] hover:text-ink-hi"
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={toggleSound}
            className="mono-label cursor-pointer transition-colors duration-[var(--dur-tick)] hover:text-ink-md"
          >
            SOUND
            <span className={cn("ml-1.5", enabled ? "text-seal" : "text-ink-lo")}>
              {enabled ? "ON" : "OFF"}
            </span>
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={theme === "light"}
            aria-label="Toggle light and dark theme"
            onClick={handleThemeToggle}
            className="mono-label cursor-pointer transition-colors duration-[var(--dur-tick)] hover:text-ink-md"
          >
            THEME <span className="text-ink-hi">{theme === "light" ? "LIGHT" : "DARK"}</span>
          </button>
        </div>

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
          // -my-2.5 py-2.5 keeps the 14px glyph box on the same baseline as
          // the wordmark while giving the control a 34px hit area: at its
          // natural height it was a 14px target, under WCAG 2.2 AA's 24px
          // minimum and genuinely fiddly to hit on a phone.
          className="-my-2.5 -mr-2 py-2.5 pr-2 pl-3 font-mono text-label text-ink-hi md:hidden"
        >
          {menuOpen ? "CLOSE" : "MENU"}
        </button>
      </nav>

      {menuOpen ? (
        <div className="border-b border-line bg-bg-0/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-1 px-[var(--page-margin)] py-4">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={handleAnchor(l.href)}
                className="flex items-baseline gap-3 py-2.5 text-ink-hi"
              >
                <span className="mono-label">{String(i + 1).padStart(2, "0")}</span>
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={toggleSound}
              className="mono-label cursor-pointer py-2.5 text-left"
            >
              SOUND
              <span className={cn("ml-1.5", enabled ? "text-seal" : "text-ink-lo")}>
                {enabled ? "ON" : "OFF"}
              </span>
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={theme === "light"}
              aria-label="Toggle light and dark theme"
              onClick={handleThemeToggle}
              className="mono-label cursor-pointer py-2.5 text-left"
            >
              THEME <span className="text-ink-hi">{theme === "light" ? "LIGHT" : "DARK"}</span>
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
