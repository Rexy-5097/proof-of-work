"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { useMotionPrefs } from "./MotionPrefsProvider";
import { ThemeRippleFilter, type RippleFilterHandle } from "@/components/chrome/ThemeRippleFilter";
import { ThemeDroplet, type DropletHandle } from "@/components/chrome/ThemeDroplet";
import { maxRadiusFrom, runRipple } from "@/lib/ripple";

export type Theme = "dark" | "light";

interface ThemeApi {
  theme: Theme;
  /** Toggles theme; pass the triggering pointer/click coordinates so the
   *  ripple originates there. Falls back to a corner point if omitted. */
  toggleTheme: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeApi>({
  theme: "dark",
  toggleTheme: () => {},
});

const STORAGE_KEY = "pow-theme";
const RIPPLE_MS = 1400;

function applyThemeAttr(theme: Theme) {
  if (theme === "light") document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { animate } = useMotionPrefs();
  const [theme, setTheme] = useState<Theme>("dark");
  const filterRef = useRef<RippleFilterHandle>(null);
  const dropletRef = useRef<DropletHandle>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        setTheme(saved);
        // Re-assert the DOM attribute here too, not just state: the
        // inline no-flash script (layout.tsx) already set it correctly
        // on a real page load, but this effect is the only sync point
        // on a dev Fast Refresh remount, where that script doesn't
        // re-run. Without this, state and the DOM attribute can desync.
        applyThemeAttr(saved);
      }
    } catch {
      /* localStorage unavailable — default theme stands */
    }
  }, []);

  const toggleTheme = useCallback<ThemeApi["toggleTheme"]>(
    (origin) => {
      if (busyRef.current) return;
      const next: Theme = theme === "light" ? "dark" : "light";
      const x = origin?.x ?? window.innerWidth - 80;
      const y = origin?.y ?? 28;

      const commit = () => {
        setTheme(next);
        applyThemeAttr(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* best effort — theme still applies for this session */
        }
      };

      // No animation budget, or the browser can't do view transitions:
      // an instant swap is the correct, honest fallback — same contract
      // as every other animated element on this site.
      const startViewTransition = document.startViewTransition;
      if (!animate || typeof startViewTransition !== "function") {
        commit();
        return;
      }

      busyRef.current = true;

      // Safety watchdog: a backgrounded tab pauses rAF (and can pause the
      // View Transitions callback chain with it) for as long as the tab
      // stays hidden — correct, standard browser behavior, not a bug, but
      // if the ripple doesn't land within a generous real-clock window we
      // force the theme commit anyway rather than leave the toggle
      // permanently stuck (busyRef never clearing would disable it for
      // the rest of the session). Cleared the instant the real sequence
      // finishes; harmless no-op in the overwhelmingly common case.
      let settled = false;
      const watchdog = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        commit();
        document.documentElement.classList.remove("pow-rippling");
        document.documentElement.style.removeProperty("--ripple-mask");
        filterRef.current?.reset();
        busyRef.current = false;
      }, 6000);

      const run = async () => {
        await dropletRef.current?.play(x, y);

        const vt = startViewTransition.call(document, () => {
          flushSync(commit);
        });

        try {
          await vt.ready;
        } catch {
          /* older engines resolve `ready` differently; proceed anyway */
        }

        document.documentElement.classList.add("pow-rippling");
        const maxRadius = maxRadiusFrom(x, y, window.innerWidth, window.innerHeight);

        await runRipple({
          x,
          y,
          maxRadius,
          durationMs: RIPPLE_MS,
          onFrame: (mask, distortScale, aberrationPx) => {
            document.documentElement.style.setProperty("--ripple-mask", mask);
            filterRef.current?.update(distortScale, aberrationPx);
          },
        });

        filterRef.current?.reset();
        document.documentElement.classList.remove("pow-rippling");
        document.documentElement.style.removeProperty("--ripple-mask");

        try {
          await vt.finished;
        } catch {
          /* transition already settled */
        }

        if (!settled) {
          settled = true;
          clearTimeout(watchdog);
          busyRef.current = false;
        }
      };

      run().catch((err: unknown) => {
        console.error("[theme] ripple transition failed, falling back to instant swap", err);
        if (!settled) {
          settled = true;
          clearTimeout(watchdog);
          commit();
          document.documentElement.classList.remove("pow-rippling");
          document.documentElement.style.removeProperty("--ripple-mask");
          filterRef.current?.reset();
          busyRef.current = false;
        }
      });
    },
    [theme, animate],
  );

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <ThemeRippleFilter ref={filterRef} />
      <ThemeDroplet ref={dropletRef} />
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeApi {
  return useContext(ThemeContext);
}
