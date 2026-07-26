"use client";

import Link from "next/link";

import type { FormSummary } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

import { FormActionsMenu, type FormActions } from "./FormActionsMenu";

interface FormTableProps extends FormActions {
  forms: FormSummary[];
}

// With border-separate, a background on <tr> paints unevenly behind the cells
// and shows a seam at each column edge — so every cell carries it instead.
const CELL = "border-y border-line bg-surface px-3 py-2.5 transition-colors group-hover:bg-surface-2";

export function FormTable({ forms, onRename, onDuplicate, onDelete }: FormTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-y-1.5 text-sm">
        <thead>
          <tr className="text-xs font-medium text-ink-faint">
            <th className="px-3 pb-1 text-left font-medium">Name</th>
            <th className="w-28 px-3 pb-1 text-right font-medium">Responses</th>
            <th className="w-28 px-3 pb-1 text-right font-medium">Completed</th>
            <th className="w-32 px-3 pb-1 text-right font-medium">Updated</th>
            <th className="w-12 px-3 pb-1" />
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <tr key={form.id} className="group">
              <td className={cn(CELL, "rounded-l-xl border-l")}>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm ${
                      form.status === "published" ? "bg-accent/15" : "bg-surface-2"
                    }`}
                  >
                    📝
                  </span>
                  <Link
                    href={`/forms/${form.id}/edit`}
                    className="truncate font-medium hover:underline"
                  >
                    {form.title}
                  </Link>
                  {form.status === "published" && (
                    <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                      Live
                    </span>
                  )}
                </div>
              </td>
              <Count value={form.response_count} href={`/forms/${form.id}/results`} />
              <Count value={form.completed_count} href={`/forms/${form.id}/results`} />
              <td className={cn(CELL, "text-right text-ink-faint")}>
                {formatDate(form.updated_at)}
              </td>
              <td className={cn(CELL, "rounded-r-xl border-r")}>
                <div className="flex justify-end">
                  <FormActionsMenu
                    form={form}
                    onRename={onRename}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Zero reads as "–" so a busy column stays scannable, matching Typeform. */
function Count({ value, href }: { value: number; href: string }) {
  return (
    <td className={cn(CELL, "text-right")}>
      {value > 0 ? (
        <Link href={href} className="text-ink hover:text-accent hover:underline">
          {value}
        </Link>
      ) : (
        <span className="text-ink-faint">–</span>
      )}
    </td>
  );
}
