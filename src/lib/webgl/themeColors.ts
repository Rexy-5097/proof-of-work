import { Color } from "three";

/**
 * Reads the live theme tokens (which flip on the light/dark ripple
 * transition) so the WebGL layers recolor with the rest of the site
 * instead of hardcoding hex. Returns three.Color instances ready for
 * uniforms.
 */
export interface WebglTheme {
  particle: Color;
  accent: Color;
  seal: Color;
  isLight: boolean;
}

export function readWebglTheme(): WebglTheme {
  const cs = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => {
    const v = cs.getPropertyValue(name).trim();
    return new Color(v || fallback);
  };
  return {
    particle: read("--ink-lo", "#6b83a0"),
    accent: read("--data", "#7fafe0"),
    seal: read("--seal", "#3dd698"),
    isLight: document.documentElement.dataset.theme === "light",
  };
}
