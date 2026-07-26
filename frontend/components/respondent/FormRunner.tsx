"use client";

import { AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, api } from "@/lib/api";
import { resolveNextIndex } from "@/lib/logic";
import type { PublicForm } from "@/lib/types";
import { validateAnswer } from "@/lib/validation";

import { ProgressBar } from "./ProgressBar";
import { QuestionScreen } from "./QuestionScreen";
import { ThankYouScreen } from "./ThankYouScreen";
import { WelcomeScreen } from "./WelcomeScreen";

type Stage = "welcome" | "question" | "thankyou";

interface FormRunnerProps {
  form: PublicForm;
  /** Preview mode (builder): no network calls, no persistence. */
  preview?: boolean;
}

export function FormRunner({ form, preview = false }: FormRunnerProps) {
  const questions = form.questions;
  const accent = form.theme?.answerColor || form.theme?.primary || "#0445AF";
  const background = form.theme?.background || "#ffffff";
  const welcomeEnabled = !!form.settings?.welcome?.enabled && !preview;

  const [stage, setStage] = useState<Stage>(welcomeEnabled ? "welcome" : "question");
  const [current, setCurrent] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const responseId = useRef<string | null>(null);
  const startedRef = useRef(false);
  // Mirror of `answers` for synchronous reads (avoids stale closures when a
  // choice click both sets the answer and auto-advances in the same tick).
  const answersRef = useRef<Record<string, unknown>>({});

  // Start a (partial) response as soon as the respondent begins. The ref guard
  // ensures exactly one start even under React Strict Mode's double-invoke.
  useEffect(() => {
    if (preview || !form.id || startedRef.current) return;
    startedRef.current = true;
    api
      .startResponse(slugFromForm())
      .then((r) => {
        responseId.current = r.response_id;
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The public slug isn't on PublicForm; read it from the URL instead.
  function slugFromForm(): string {
    if (typeof window === "undefined") return "";
    const parts = window.location.pathname.split("/");
    return parts[parts.length - 1];
  }

  const persistPartial = useCallback(
    (qId: string, value: unknown) => {
      if (preview || !responseId.current) return;
      api.patchResponse(responseId.current, [{ question_id: qId, value }]).catch(() => {});
    },
    [preview],
  );

  const goNext = useCallback(() => {
    const q = questions[current];
    const value = answersRef.current[q.id];
    const err = validateAnswer(q, value);
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    // Logic jumps: a matching rule can skip ahead or end the form.
    const jump = resolveNextIndex(q, value, questions);
    const nextIndex = jump === -1 ? questions.length : jump ?? current + 1;
    const willFinish = nextIndex >= questions.length;

    // Only save a partial when the respondent is staying in the form. On the
    // final step the submit payload already carries every answer, so a PATCH
    // here would just race the POST on the same response.
    if (!willFinish) persistPartial(q.id, value);

    if (willFinish) {
      finish();
    } else {
      setHistory((h) => [...h, current]);
      setCurrent(nextIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, questions, persistPartial]);

  const goBack = useCallback(() => {
    setError(null);
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setCurrent(prev);
      return h.slice(0, -1);
    });
  }, []);

  const finish = useCallback(async () => {
    if (!preview && responseId.current) {
      const payload = Object.entries(answersRef.current).map(([question_id, value]) => ({ question_id, value }));
      try {
        await api.completeResponse(responseId.current, payload);
      } catch (e) {
        // Don't show a false "thank you" — surface the failure and stay put so
        // the respondent can retry rather than silently losing their answers.
        setError(e instanceof ApiError ? e.message : "Could not submit your response. Please try again.");
        return;
      }
    }
    setStage("thankyou");
  }, [preview]);

  // Global keyboard navigation for the whole flow.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (stage === "welcome" && e.key === "Enter") {
        setStage("question");
      } else if (stage === "question") {
        if (e.key === "ArrowUp" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.preventDefault();
          goBack();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, goBack]);

  const setAnswer = (qId: string, value: unknown) => {
    answersRef.current = { ...answersRef.current, [qId]: value };
    setAnswers((a) => ({ ...a, [qId]: value }));
    if (error) setError(null);
  };

  const progress =
    stage === "thankyou" ? 100 : questions.length ? ((current + (stage === "question" ? 1 : 0)) / questions.length) * 100 : 0;

  const isDark = form.theme?.mode === "dark";
  const textColor = form.theme?.questionColor || (isDark ? "#f5f5f5" : "#0A0A0A");

  return (
    <div
      className="no-scrollbar relative min-h-screen w-full overflow-y-auto"
      style={{ backgroundColor: background, color: textColor }}
    >
      {stage !== "thankyou" && questions.length > 0 && <ProgressBar percent={progress} accent={accent} />}

      <AnimatePresence mode="wait">
        {stage === "welcome" && (
          <WelcomeScreen
            key="welcome"
            title={form.settings?.welcome?.title || form.title}
            buttonText={form.settings?.welcome?.buttonText || "Start"}
            description={form.description}
            accent={accent}
            onStart={() => setStage("question")}
          />
        )}

        {stage === "question" && questions.length > 0 && (
          <QuestionScreen
            key={questions[current].id}
            question={questions[current]}
            index={current}
            total={questions.length}
            value={answers[questions[current].id]}
            error={error}
            accent={accent}
            isLast={current === questions.length - 1}
            onChange={(v) => setAnswer(questions[current].id, v)}
            onSubmit={goNext}
          />
        )}

        {stage === "question" && questions.length === 0 && (
          <div key="empty" className="flex min-h-screen items-center justify-center opacity-60">
            This form has no questions yet.
          </div>
        )}

        {stage === "thankyou" && (
          <ThankYouScreen
            key="thankyou"
            title={form.settings?.thankYou?.title || "Thank you!"}
            description={form.settings?.thankYou?.description || "Your response has been recorded."}
            accent={accent}
          />
        )}
      </AnimatePresence>

      {/* Up/down nav controls (bottom-right), like Typeform. */}
      {stage === "question" && (
        <div className="fixed bottom-6 right-6 z-40 flex overflow-hidden rounded-lg shadow-lg">
          <button
            onClick={goBack}
            disabled={history.length === 0}
            className="flex h-10 w-10 items-center justify-center text-white transition disabled:opacity-40"
            style={{ backgroundColor: accent }}
            aria-label="Previous question"
          >
            <ArrowUp size={18} />
          </button>
          <button
            onClick={goNext}
            className="flex h-10 w-10 items-center justify-center border-l border-white/20 text-white transition"
            style={{ backgroundColor: accent }}
            aria-label="Next question"
          >
            <ArrowDown size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
