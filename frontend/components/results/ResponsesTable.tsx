"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

import type { Form, ResponseRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

interface ResponsesTableProps {
  form: Form;
  responses: ResponseRecord[];
}

export function ResponsesTable({ form, responses }: ResponsesTableProps) {
  const [active, setActive] = useState<ResponseRecord | null>(null);
  const questions = form.questions;

  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 py-24 text-center dark:border-neutral-700">
        <div className="text-4xl">📭</div>
        <h3 className="mt-4 font-medium">No responses yet</h3>
        <p className="mt-1 text-sm text-ink-faint">Share your form to start collecting answers.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-ink-faint dark:bg-neutral-900">
            <tr>
              <th className="px-4 py-3 font-medium">Submitted</th>
              {questions.map((q, i) => (
                <th key={q.id} className="whitespace-nowrap px-4 py-3 font-medium">
                  {q.title || `Q${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => {
              const answers = new Map(r.answers.map((a) => [a.question_id, a.value]));
              return (
                <tr
                  key={r.id}
                  onClick={() => setActive(r)}
                  className="cursor-pointer border-t border-neutral-100 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-ink-faint">
                    {r.submitted_at ? formatDateTime(r.submitted_at) : "—"}
                  </td>
                  {questions.map((q) => (
                    <td key={q.id} className="max-w-[220px] truncate px-4 py-3">
                      {formatValue(answers.get(q.id))}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-end bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl dark:bg-neutral-900"
              initial={{ x: 40 }}
              animate={{ x: 0 }}
              exit={{ x: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Response</h2>
                  <p className="text-sm text-ink-faint">
                    {active.submitted_at ? formatDateTime(active.submitted_at) : "In progress"}
                  </p>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="rounded-md p-1 text-ink-faint hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                {questions.map((q, i) => {
                  const answers = new Map(active.answers.map((a) => [a.question_id, a.value]));
                  return (
                    <div key={q.id}>
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                        {i + 1}. {q.title || "Untitled"}
                      </p>
                      <p className="mt-1 text-[15px]">{formatValue(answers.get(q.id))}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
