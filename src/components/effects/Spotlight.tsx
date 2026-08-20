"use client";

import { cn } from "@/lib/cn";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * Spotlight — adapted from Aceternity UI (MIT), https://ui.aceternity.com.
 * The original paints a hard white ellipse; this build drives it from the
 * theme tokens and drops the opacity a long way so it reads as a lighting
 * condition on the blueprint rather than a glow effect. Animation is a
 * single composited transform/opacity keyframe, skipped under reduced
 * motion (where the spotlight simply renders in its resting position).
 */
export function Spotlight({ className, fill }: { className?: string; fill?: string }) {
  const { animate } = useMotionPrefs();

  return (
    <svg
      className={cn(
        "pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%]",
        animate ? "animate-spotlight opacity-0" : "opacity-100",
        className,
      )}
      viewBox="0 0 3787 2842"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g filter="url(#spotlight-blur)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill ?? "var(--data)"}
          fillOpacity="0.14"
        />
      </g>
      <defs>
        <filter
          id="spotlight-blur"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}
