"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export interface RippleFilterHandle {
  /** Called every rAF frame while a ripple is running. */
  update(distortScale: number, aberrationPx: number): void;
  reset(): void;
}

/**
 * The distortion half of the ripple: a displacement map (water-like
 * refraction) plus a three-channel offset/re-blend for sub-pixel
 * chromatic aberration. Attributes are written directly via refs from
 * lib/ripple.ts's rAF loop — cheaper and simpler than re-rendering React
 * state 60 times a second for values nothing else reads.
 * Mounted once, id="pow-ripple-distort" is referenced by globals.css.
 */
export const ThemeRippleFilter = forwardRef<RippleFilterHandle>(function ThemeRippleFilter(_props, ref) {
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const rOffRef = useRef<SVGFEOffsetElement>(null);
  const bOffRef = useRef<SVGFEOffsetElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      update(distortScale, aberrationPx) {
        dispRef.current?.setAttribute("scale", distortScale.toFixed(2));
        rOffRef.current?.setAttribute("dx", aberrationPx.toFixed(2));
        bOffRef.current?.setAttribute("dx", (-aberrationPx).toFixed(2));
      },
      reset() {
        dispRef.current?.setAttribute("scale", "0");
        rOffRef.current?.setAttribute("dx", "0");
        bOffRef.current?.setAttribute("dx", "0");
      },
    }),
    [],
  );

  return (
    <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <filter
          id="pow-ripple-distort"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.010 0.014" numOctaves={2} seed={7} result="noise" />
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="noise"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {/* Isolate R/G/B, offset red and blue oppositely, screen-blend
              back together — a sub-pixel chromatic-aberration fringe that
              tracks the same energy envelope as the displacement. */}
          <feColorMatrix
            in="displaced"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="rChan"
          />
          <feColorMatrix
            in="displaced"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="gChan"
          />
          <feColorMatrix
            in="displaced"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="bChan"
          />
          <feOffset ref={rOffRef} in="rChan" dx={0} dy="0" result="rOff" />
          <feOffset ref={bOffRef} in="bChan" dx={0} dy="0" result="bOff" />
          <feBlend in="rOff" in2="gChan" mode="screen" result="rg" />
          <feBlend in="rg" in2="bOff" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
});
