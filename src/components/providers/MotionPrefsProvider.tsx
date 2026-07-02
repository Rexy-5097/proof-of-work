"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface MotionPrefs {
  /** True when animations should play (no OS preference, not user-disabled). */
  animate: boolean;
  /** User override via Escape toggle (persisted). */
  userDisabled: boolean;
  setUserDisabled: (v: boolean) => void;
}

const MotionPrefsContext = createContext<MotionPrefs>({
  animate: false,
  userDisabled: false,
  setUserDisabled: () => {},
});

const STORAGE_KEY = "pow-motion-off";

export function MotionPrefsProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(true);
  const [userDisabled, setUserDisabledState] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    setUserDisabledState(localStorage.getItem(STORAGE_KEY) === "1");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo<MotionPrefs>(
    () => ({
      animate: !reduced && !userDisabled,
      userDisabled,
      setUserDisabled: (v) => {
        setUserDisabledState(v);
        localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
      },
    }),
    [reduced, userDisabled],
  );

  return (
    <MotionPrefsContext.Provider value={value}>
      {children}
    </MotionPrefsContext.Provider>
  );
}

export function useMotionPrefs(): MotionPrefs {
  return useContext(MotionPrefsContext);
}
