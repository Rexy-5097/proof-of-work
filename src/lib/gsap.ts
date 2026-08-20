import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point for GSAP plugins. Importing this module from
 * a lazily-loaded client component keeps GSAP out of the initial bundle;
 * registerPlugin is idempotent, so repeated imports are safe.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
