import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

function slugify(children: ReactNode): string {
  return String(children)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Journal typography (design/04-components.md §ArticleCard): the engineer's
 * voice in Inter, machine facts in mono, narrator reserved for titles.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 id={slugify(children)} className="mt-14 mb-4 scroll-mt-24 font-body text-2xl font-semibold text-ink-hi">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={slugify(children)} className="mt-10 mb-3 scroll-mt-24 font-body text-lg font-semibold text-ink-hi">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="my-5 text-[1.0625rem] leading-[1.75] text-ink-md">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="my-5 space-y-2 pl-1 text-[1.0625rem] leading-[1.75] text-ink-md [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-ink-lo [&>li]:before:content-['—']">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-5 list-decimal space-y-2 pl-6 text-[1.0625rem] leading-[1.75] text-ink-md marker:font-mono marker:text-micro marker:text-ink-lo">
        {children}
      </ol>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-data underline decoration-data/40 underline-offset-2 transition-colors duration-[var(--dur-tick)] hover:text-ink-hi hover:decoration-ink-hi"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="rounded-r1 bg-bg-2 px-1.5 py-0.5 font-mono text-[0.875em] text-ink-hi">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-6 overflow-x-auto rounded-r3 border border-line bg-bg-1 p-5 font-mono text-[0.8125rem] leading-relaxed text-ink-md [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-seal bg-bg-1 px-5 py-1 font-display text-lg text-ink-hi italic [&_p]:my-3">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-line" />,
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[0.8125rem]">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-line-strong px-3 py-2 text-left text-micro tracking-[0.08em] text-ink-lo uppercase">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-line px-3 py-2 text-ink-md tabular">{children}</td>
    ),
    strong: ({ children }) => <strong className="font-semibold text-ink-hi">{children}</strong>,
    ...components,
  };
}
