/**
 * Ambient fallback for the View Transitions API. Declared as an optional
 * member so this compiles regardless of whether the bundled lib.dom.d.ts
 * already has it — TS interface merging makes redeclaration safe.
 */
export {};

declare global {
  interface ViewTransition {
    readonly ready: Promise<void>;
    readonly finished: Promise<void>;
    readonly updateCallbackDone: Promise<void>;
    skipTransition(): void;
  }

  interface Document {
    startViewTransition?(callback: () => void | Promise<void>): ViewTransition;
  }
}
