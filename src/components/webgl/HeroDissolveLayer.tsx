"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * Gate + lazy loader for the hero headline dissolution. Same discipline
 * as BackgroundScene: three.js stays code-split and client-only, the DOM
 * headline remains the SSR / LCP / a11y / reduced-motion truth, and the
 * particle overlay is pure enhancement that only appears on capable
 * desktop pointers with motion enabled.
 */
const HeroDissolveScene = dynamic(() => import("./HeroDissolveScene"), { ssr: false });

export function HeroDissolveLayer() {
  const { animate } = useMotionPrefs();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!animate) {
      setOk(false);
      return;
    }
    const big = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    setOk(big && webgl);
  }, [animate]);

  if (!ok) return null;
  return <HeroDissolveScene />;
}
