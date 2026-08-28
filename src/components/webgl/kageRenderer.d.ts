/**
 * Types for the ported Kage renderer.
 *
 * The implementation is plain JS (see the note at the top of
 * kageRenderer.js): the original is written against loose array indexing
 * throughout, and porting it under `noUncheckedIndexedAccess` would bury a
 * faithful transcription in non-null assertions. `allowJs` stays false, so
 * tsc never type-checks that file — this declaration is its whole contract,
 * and Next's bundler compiles the JS as-is.
 */
export interface KageWorldOptions {
  /** The three namespace, imported dynamically by the host. */
  THREE: typeof import("three");
  canvas: HTMLCanvasElement;
  /** Skip the intro dolly and the camera damping. */
  reduce?: boolean;
  /** No hover: drops the pointer wisps and halves the scene's budget. */
  coarse?: boolean;
}

export interface KageWorld {
  /** Scroll, as a 0..1 fraction of the host document. */
  setProgress(t: number): void;
  /** Pointer, in normalised device coordinates. */
  setPointer(nx: number, ny: number): void;
  resize(): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

export function createKageWorld(options: KageWorldOptions): KageWorld;
