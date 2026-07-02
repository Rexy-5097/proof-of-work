"use client";

import { useEffect, useState } from "react";
import { useSound } from "@/components/providers/SoundProvider";

const STORAGE_KEY = "pow-paper";

/** Paper mode for long reads — flips the article scope to the light palette. */
export function PaperToggle() {
  const [paper, setPaper] = useState(false);
  const { play } = useSound();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) === "1";
    setPaper(saved);
    applyTheme(saved);
    return () => applyTheme(false);
  }, []);

  const applyTheme = (on: boolean) => {
    const root = document.getElementById("article-root");
    if (on) root?.setAttribute("data-theme", "paper");
    else root?.removeAttribute("data-theme");
  };

  const toggle = () => {
    const next = !paper;
    setPaper(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    play("toggle");
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={paper}
      aria-label="Paper reading mode"
      onClick={toggle}
      className="mono-label shrink-0 cursor-pointer rounded-r1 border border-line px-3 py-1.5 transition-colors duration-[var(--dur-tick)] hover:border-line-strong hover:text-ink-md"
    >
      PAPER {paper ? "ON" : "OFF"}
    </button>
  );
}
