"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * Client-only, lazy gate for the WebGL particle field. Three.js is code-
 * split behind next/dynamic({ ssr:false }) so it never touches SSR, the
 * initial critical path, or LCP — it downloads and mounts only after the
 * page is interactive, only when motion is allowed, only when WebGL is
 * actually available, and only on non-tiny screens. Everywhere else the
 * static SVG topology in HeroBackdrop remains the (fully sufficient)
 * background, so nothing is ever missing.
 */
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

function webglSupported(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function BackgroundScene() {
  const { animate } = useMotionPrefs();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!animate) {
      setOk(false);
      return;
    }
    // Skip on small/touch screens where the GPU field costs more than it
    // adds; the static blueprint is the mobile experience.
    const big = window.matchMedia("(min-width: 768px) and (pointer: fine)").matches;
    setOk(big && webglSupported());
  }, [animate]);

  useEffect(() => {
    const svg = document.getElementById("hero-topology-static");
    if (ok) svg?.style.setProperty("display", "none");
    return () => {
      svg?.style.removeProperty("display");
    };
  }, [ok]);

  if (!ok) return null;
  return <SceneCanvas />;
}
