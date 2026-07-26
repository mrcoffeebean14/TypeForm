"use client";

import { QUESTION_META } from "@/lib/questionMeta";
import type { FormSummaryStats } from "@/lib/types";

export function SummaryStats({ stats }: { stats: FormSummaryStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Total responses" value={stats.total_responses} />
        <StatCard label="Completed" value={stats.completed_responses} />
        <StatCard label="Completion rate" value={`${Math.round(stats.completion_rate * 100)}%`} />
      </div>

      <div className="space-y-4">
        {stats.questions.map((q, i) => {
          const meta = QUESTION_META[q.type];
          const entries = Object.entries(q.breakdown).filter(([k]) => k !== "average" && k !== "count");
          const maxCount = Math.max(1, ...entries.map(([, v]) => Number(v)));

          return (
            <div
              key={q.question_id}
              className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-neutral-100 text-xs font-semibold dark:bg-neutral-800">
                    {i + 1}
                  </span>
                  <h3 className="font-medium">{q.title || "Untitled question"}</h3>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-ink-faint">
                  <meta.icon size={13} /> {q.answered} answers
                </span>
              </div>

              {entries.length > 0 && (
                <div className="mt-4 space-y-2">
                  {entries.map(([label, count]) => {
                    const pct = q.answered ? Math.round((Number(count) / q.answered) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>{label}</span>
                          <span className="text-ink-faint">
                            {count} · {pct}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                          <div
                            className="h-full rounded-full bg-accent transition-all"
                            style={{ width: `${(Number(count) / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.breakdown.average !== undefined && (
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-accent">{q.breakdown.average}</span>
                  <span className="text-sm text-ink-faint">average</span>
                </div>
              )}

              {entries.length === 0 && q.breakdown.average === undefined && (
                <p className="mt-3 text-sm text-ink-faint">
                  {q.answered > 0 ? "Open-text responses — see individual submissions." : "No answers yet."}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
