"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * The signature element: a live, self-playing conversational form. A question
 * slides in, its answer types itself out, the OK confirms, and it advances —
 * the one-question-at-a-time experience running for real on the page instead
 * of a static screenshot.
 */

type Frame =
  | { kind: "text"; letter: string; question: string; answer: string }
  | { kind: "choice"; letter: string; question: string; options: string[]; pick: number }
  | { kind: "rating"; letter: string; question: string; max: number; pick: number };

const FRAMES: Frame[] = [
  { kind: "text", letter: "A", question: "What should we call you?", answer: "Priya" },
  {
    kind: "choice",
    letter: "B",
    question: "What brings you here today?",
    options: ["Just exploring", "Building a survey", "Collecting feedback"],
    pick: 1,
  },
  { kind: "rating", letter: "C", question: "How’s your day going so far?", max: 5, pick: 4 },
];


export function HeroFormDemo() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const frame = FRAMES[index];

  const schedule = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped("");
    setConfirmed(false);

    const advance = () =>
      schedule(() => setIndex((i) => (i + 1) % FRAMES.length), reduce ? 2200 : 1400);

    if (reduce) {
      // No typing animation — show the completed state, then move on.
      if (frame.kind === "text") setTyped(frame.answer);
      setConfirmed(true);
      advance();
      return () => timers.current.forEach(clearTimeout);
    }

    if (frame.kind === "text") {
      frame.answer.split("").forEach((_, i) =>
        schedule(() => setTyped(frame.answer.slice(0, i + 1)), 420 + i * 130),
      );
      schedule(() => setConfirmed(true), 420 + frame.answer.length * 130 + 350);
    } else {
      schedule(() => setConfirmed(true), 900);
    }
    advance();

    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduce]);

  const progress = useMemo(() => ((index + 1) / FRAMES.length) * 100, [index]);

  return (
    <div className="relative w-full">
      {/* Soft depth: two stacked cards peeking behind the live one. */}
      <div className="absolute inset-x-6 -bottom-3 h-full rounded-[26px] bg-black/[0.04]" />
      <div className="absolute inset-x-3 -bottom-1.5 h-full rounded-[26px] bg-black/[0.05]" />

      <div className="relative overflow-hidden rounded-[26px] border border-line bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
        <div className="h-1 w-full bg-surface-2">
          <motion.div
            className="h-full rounded-r-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex min-h-[300px] flex-col justify-center px-8 py-10 sm:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -22 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-accent">
                <span>{frame.letter}</span>
                <span className="text-xs">→</span>
              </div>

              <h3 className="text-xl font-semibold leading-snug text-ink sm:text-2xl">
                {frame.question}
              </h3>

              <div className="mt-6">
                {frame.kind === "text" && <TextAnswer typed={typed} />}
                {frame.kind === "choice" && <ChoiceAnswer frame={frame} confirmed={confirmed} />}
                {frame.kind === "rating" && <RatingAnswer frame={frame} confirmed={confirmed} />}
              </div>

              <div className="mt-7 flex items-center gap-3">
                <motion.span
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg"
                  animate={confirmed ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  OK <Check size={14} />
                </motion.span>
                <span className="text-xs text-ink-faint">
                  press <kbd className="rounded bg-black/[0.06] px-1.5 py-0.5">Enter ↵</kbd>
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TextAnswer({ typed }: { typed: string }) {
  return (
    <div className="border-b-2 border-accent/40 pb-2 text-2xl font-light text-ink">
      {typed || <span className="text-ink-faint/50">Type your answer…</span>}
      <span className="ml-0.5 inline-block h-6 w-[2px] translate-y-1 animate-blink bg-accent" />
    </div>
  );
}

function ChoiceAnswer({ frame, confirmed }: { frame: Extract<Frame, { kind: "choice" }>; confirmed: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      {frame.options.map((opt, i) => {
        const active = confirmed && i === frame.pick;
        return (
          <div
            key={opt}
            className={`flex items-center gap-3 rounded-lg border-2 px-4 py-2.5 text-[15px] transition-colors ${
              active ? "border-accent bg-accent/10" : "border-accent/20 bg-accent/[0.03]"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded border border-accent/40 text-xs font-medium ${
                active ? "bg-accent text-accent-fg" : "text-accent"
              }`}
            >
              {active ? <Check size={13} /> : String.fromCharCode(65 + i)}
            </span>
            {opt}
          </div>
        );
      })}
    </div>
  );
}

function RatingAnswer({ frame, confirmed }: { frame: Extract<Frame, { kind: "rating" }>; confirmed: boolean }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: frame.max }).map((_, i) => {
        const active = confirmed && i < frame.pick;
        return (
          <div
            key={i}
            className={`flex h-12 w-12 items-center justify-center rounded-lg border-2 text-lg font-medium transition-colors ${
              active
                ? "border-accent bg-accent text-accent-fg"
                : "border-accent/20 bg-accent/[0.03] text-accent"
            }`}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );
}
