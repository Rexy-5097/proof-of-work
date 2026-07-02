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

export type SoundKind = "tap" | "seal" | "toggle";

interface SoundApi {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  play: (kind: SoundKind) => void;
}

const SoundContext = createContext<SoundApi>({
  enabled: false,
  setEnabled: () => {},
  play: () => {},
});

const STORAGE_KEY = "pow-sound";

/**
 * Interaction sounds, OFF by default (design/07-architecture.md §11).
 * Synthesized with WebAudio — no audio assets shipped, nothing fetched.
 * The AudioContext is created lazily on the first play after opt-in,
 * which is always inside a user gesture (the toggle itself).
 * Each cue is <100ms at very low gain; none carry meaning.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setEnabledState(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const play = useCallback(
    (kind: SoundKind) => {
      if (!enabled || typeof window === "undefined") return;
      try {
        ctxRef.current ??= new AudioContext();
        const ctx = ctxRef.current;
        if (ctx.state === "suspended") void ctx.resume();

        const t0 = ctx.currentTime;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);

        const tone = (
          freq: number,
          start: number,
          dur: number,
          peak: number,
        ) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.gain.setValueAtTime(0, t0 + start);
          gain.gain.linearRampToValueAtTime(peak, t0 + start + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
          osc.start(t0 + start);
          osc.stop(t0 + start + dur);
        };

        switch (kind) {
          case "tap":
            tone(880, 0, 0.05, 0.02);
            break;
          case "seal":
            tone(660, 0, 0.045, 0.02);
            tone(990, 0.045, 0.05, 0.018);
            break;
          case "toggle":
            tone(520, 0, 0.04, 0.016);
            break;
        }
      } catch {
        /* audio unavailable — sounds are never meaning-bearing */
      }
    },
    [enabled],
  );

  const value = useMemo<SoundApi>(
    () => ({
      enabled,
      setEnabled: (v) => {
        setEnabledState(v);
        localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
      },
      play,
    }),
    [enabled, play],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundApi {
  return useContext(SoundContext);
}
