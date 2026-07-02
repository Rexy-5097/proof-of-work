"use client";

import { useEffect, useRef } from "react";

/** 2px top progress thread for viewports without the AuditRail (<1280px). */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      barRef.current?.style.setProperty("transform", `scaleX(${p})`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[51] h-0.5 xl:hidden">
      <div
        ref={barRef}
        className="h-full origin-left bg-seal"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
