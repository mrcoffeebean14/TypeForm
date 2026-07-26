"use client";

import { motion } from "framer-motion";
import { BarChart3, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import type { FormSummary } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

interface FormCardProps {
  form: FormSummary;
  onRename: (form: FormSummary) => void;
  onDuplicate: (form: FormSummary) => void;
  onDelete: (form: FormSummary) => void;
}

export function FormCard({ form, onRename, onDuplicate, onDelete }: FormCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const isPublished = form.status === "published";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col rounded-xl border border-line bg-surface transition-shadow hover:shadow-md"
    >
      <Link
        href={`/forms/${form.id}/edit`}
        className="flex h-28 items-center justify-center rounded-t-xl bg-surface-2 text-3xl"
      >
        <span className="opacity-70">📝</span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/forms/${form.id}/edit`} className="line-clamp-2 font-medium leading-tight hover:underline">
            {form.title}
          </Link>
          <div
            className="relative"
            onMouseLeave={() => {
              closeTimer.current = setTimeout(() => setMenuOpen(false), 120);
            }}
            onMouseEnter={() => clearTimeout(closeTimer.current)}
          >
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md p-1.5 text-ink-faint opacity-0 transition hover:bg-surface-2 group-hover:opacity-100"
              aria-label="Form actions"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg">
                <MenuItem icon={Pencil} label="Rename" onClick={() => { setMenuOpen(false); onRename(form); }} />
                <MenuItem icon={Copy} label="Duplicate" onClick={() => { setMenuOpen(false); onDuplicate(form); }} />
                <Link
                  href={`/forms/${form.id}/results`}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2"
                >
                  <BarChart3 size={15} /> Results
                </Link>
                <MenuItem icon={Trash2} label="Delete" danger onClick={() => { setMenuOpen(false); onDelete(form); }} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-ink-faint">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
              isPublished
                ? "bg-success/15 text-success"
                : "bg-surface-2 text-ink-soft"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-success" : "bg-ink-faint"}`} />
            {isPublished ? "Published" : "Draft"}
          </span>
          <span>·</span>
          <span>{form.question_count} questions</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-3 text-xs text-ink-faint">
          <Link href={`/forms/${form.id}/results`} className="flex items-center gap-1 hover:text-accent">
            <BarChart3 size={13} /> {form.response_count} responses
          </Link>
          <span>Edited {timeAgo(form.updated_at)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2 ${
        danger ? "text-danger" : ""
      }`}
    >
      <Icon size={15} /> {label}
    </button>
  );
}
