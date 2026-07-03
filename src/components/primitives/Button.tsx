"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useMagnetic } from "@/hooks/useMagnetic";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-r2 px-5 py-2.5 " +
  "font-mono text-claim font-medium tracking-[0.06em] uppercase " +
  "transition-[color,background-color,border-color,transform] duration-[var(--dur-tick)] cursor-pointer select-none";

const variants: Record<Variant, string> = {
  primary:
    "border border-seal bg-seal-dim text-seal hover:bg-seal/20 hover:text-seal-bright",
  secondary:
    "border border-line-strong text-ink-hi hover:border-ink-md hover:bg-bg-2",
  ghost: "text-ink-md hover:text-ink-hi underline-offset-4 hover:underline px-2",
};

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  (
    | ({ href: string } & Omit<ComponentPropsWithoutRef<"a">, "href" | "className">)
    | ({ href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className">)
  );

/**
 * Only primary/secondary get the magnetic pull — ghost already has its
 * own micro-interaction (underline + arrow nudge) and doesn't need a
 * second one competing with it (design/04-components.md).
 */
export function Button({ variant = "secondary", className, children, ...rest }: ButtonProps) {
  const classes = cn(base, variants[variant], className);
  const magnetic = variant !== "ghost";
  // Two separate typed refs (one per possible rendered tag) — cleaner
  // than a single `useRef<HTMLElement>` fighting each element's own type.
  const anchorRef = useMagnetic<HTMLAnchorElement>();
  const buttonRef = useMagnetic<HTMLButtonElement>();

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...anchorProps } = rest as { href: string } & ComponentPropsWithoutRef<"a">;
    const external = href.startsWith("http");
    if (external) {
      return (
        <a
          ref={magnetic ? anchorRef : undefined}
          href={href}
          data-cursor="link"
          className={classes}
          rel="noopener noreferrer"
          target="_blank"
          {...anchorProps}
        >
          {children}
        </a>
      );
    }
    return (
      <Link ref={magnetic ? anchorRef : undefined} href={href} data-cursor="link" className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as ComponentPropsWithoutRef<"button">;
  return (
    <button
      ref={magnetic ? buttonRef : undefined}
      type={buttonProps.type ?? "button"}
      data-cursor="link"
      className={classes}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
