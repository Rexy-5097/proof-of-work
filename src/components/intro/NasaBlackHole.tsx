"use client";

import { useEffect, useRef } from "react";

/**
 * The intro visual is NASA footage, not a hand-written effect.
 *
 * Source: NASA's Scientific Visualization Studio, "Black Hole Accretion
 * Disk Visualization" — https://svs.gsfc.nasa.gov/13326/
 * Credit: NASA's Goddard Space Flight Center / Jeremy Schnittman.
 * See public/NASA-CREDIT.txt for the full provenance record.
 *
 * The clip is a 360° orbit of the accretion disk, so scrubbing it with
 * scroll walks the reader around the black hole once and lands exactly
 * where it started — which is why the gate completes rather than loops.
 *
 * It is self-hosted rather than hotlinked: this site's stated claim is
 * that it loads nothing from a third-party origin, and that has to hold
 * for the landing page too. The file was re-encoded with a 10-frame GOP
 * so seeking is cheap; the imagery itself is unmodified.
 */
export default function NasaBlackHole({
  progressRef,
}: {
  progressRef: React.RefObject<number>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    let smoothed = 0;
    let duration = 0;

    const onMeta = () => {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
    };
    video.addEventListener("loadedmetadata", onMeta);
    if (video.readyState >= 1) onMeta();

    let running = document.visibilityState === "visible";
    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    function loop() {
      if (!running || !video) return;
      const target = progressRef.current ?? 0;
      // Ease toward the scroll target so a flick reads as momentum rather
      // than a jump cut between decoded frames.
      smoothed += (target - smoothed) * 0.1;
      if (duration > 0) {
        // Stop a hair short of the end: seeking to exactly duration can
        // park some decoders on a blank frame.
        const t = Math.min(smoothed, 0.999) * duration;
        if (Math.abs(video.currentTime - t) > 0.02) video.currentTime = t;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onMeta);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [progressRef]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      src="/nasa-blackhole.mp4"
      poster="/nasa-blackhole-poster.jpg"
      preload="auto"
      muted
      playsInline
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
