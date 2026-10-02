"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { DUR, EASE } from "@/lib/motion";
import { Button } from "@/components/primitives/Button";
import { Seal } from "@/components/primitives/Seal";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { site } from "@/data/site";

/**
 * An optional form relay (Formspree, FormSubmit's AJAX endpoint, a route
 * handler…) that accepts a JSON POST. Without one the form still works: it
 * composes the message into the visitor's own mail client. The stamp says
 * which of the two happened — "delivered" is only ever claimed when a
 * server said so.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;

const utcStamp = () => new Date().toISOString().slice(11, 19) + "Z";

/**
 * The "email dispatch" card: the address as text you can read and
 * copy, not only a mailto that assumes a desktop mail client. Copying
 * SEALs the glyph for a moment (design/06 §4, "Copy hash").
 */
export function EmailDispatch() {
  const [copied, setCopied] = useState(false);
  const { play } = useSound();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      play("seal");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the address is still selectable text */
    }
  };

  return (
    <div className="panel-e1 p-5">
      <p className="mono-label mb-3 text-[0.6875rem]">DIRECT LINE</p>
      <p className="font-mono text-[0.9375rem] break-all text-ink-hi select-all">{site.email}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={copy} className="min-h-9 px-3 py-1.5 text-[0.75rem]" aria-live="polite">
          {copied ? (
            <>
              <Seal state="verified" size={10} /> COPIED
            </>
          ) : (
            "COPY ADDRESS"
          )}
        </Button>
        <Button variant="ghost" href={`mailto:${site.email}`} className="min-h-9 py-1.5 text-[0.75rem]">
          OPEN MAIL ↗
        </Button>
      </div>
    </div>
  );
}

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done"; delivered: boolean; at: string }
  | { kind: "error"; message: string };

/** The transmit form — design/04 "Forms (contact)", specified, never built. */
export function TransmitForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const { animate } = useMotionPrefs();
  const { play } = useSound();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus({ kind: "error", message: "That address doesn't look deliverable — check it and transmit again." });
      return;
    }
    if (message.trim().length < 10) {
      setStatus({ kind: "error", message: "Say a little more — at least a sentence." });
      return;
    }
    if (!ENDPOINT) {
      const subject = encodeURIComponent("Proof of Work — open channel");
      const body = encodeURIComponent(`${message}\n\n— ${email}`);
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
      setStatus({ kind: "done", delivered: false, at: utcStamp() });
      play("seal");
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, message, _subject: "Proof of Work — open channel" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus({ kind: "done", delivered: true, at: utcStamp() });
      setMessage("");
      play("seal");
    } catch {
      setStatus({
        kind: "error",
        message: `The relay didn't confirm receipt. Nothing was lost — write to ${site.email} directly.`,
      });
    }
  };

  const field =
    "w-full rounded-r2 border border-line bg-bg-1 px-3 py-2.5 font-mono text-[0.8125rem] text-ink-hi placeholder:text-ink-lo transition-colors duration-[var(--dur-tick)] focus:border-line-strong focus:outline-none";

  return (
    <form onSubmit={submit} noValidate className="panel-e1 space-y-4 p-5 md:p-6">
      <p className="mono-label text-[0.6875rem]">TRANSMIT</p>
      <div>
        <label htmlFor="tx-email" className="mono-label mb-1.5 block text-[0.6875rem]">
          RETURN ADDRESS
        </label>
        <input
          id="tx-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className={field}
        />
      </div>
      <div>
        <label htmlFor="tx-message" className="mono-label mb-1.5 block text-[0.6875rem]">
          MESSAGE
        </label>
        <textarea
          id="tx-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What are you building, and what has to stay correct?"
          className={cn(field, "resize-y leading-relaxed")}
        />
      </div>

      {status.kind === "error" ? (
        <p role="alert" className="font-mono text-micro leading-relaxed text-flag">
          ◈ {status.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="primary" type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? "TRANSMITTING…" : "TRANSMIT →"}
        </Button>
        {status.kind === "done" ? (
          <motion.p
            role="status"
            initial={animate ? { scale: 1.3, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: DUR.stamp, ease: EASE.stamp }}
            className="flex items-center gap-1.5 font-mono text-micro tracking-[0.08em] text-seal"
          >
            <Seal state="verified" size={10} />
            {status.delivered ? `DELIVERED ${status.at}` : `DRAFT HANDED TO YOUR MAIL CLIENT ${status.at}`}
          </motion.p>
        ) : null}
      </div>
    </form>
  );
}
