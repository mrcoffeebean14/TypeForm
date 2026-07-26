"use client";

import { BarChart3, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import type { FormSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface FormActions {
  onRename: (form: FormSummary) => void;
  onDuplicate: (form: FormSummary) => void;
  onDelete: (form: FormSummary) => void;
}

interface FormActionsMenuProps extends FormActions {
  form: FormSummary;
  /** Cards reveal the trigger on hover; table rows keep it always visible. */
  revealOnHover?: boolean;
}

/** Rename / Duplicate / Results / Delete, shared by the card and table views. */
export function FormActionsMenu({
  form,
  onRename,
  onDuplicate,
  onDelete,
  revealOnHover,
}: FormActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  return (
    <div
      className="relative"
      onMouseLeave={() => {
        closeTimer.current = setTimeout(() => setOpen(false), 120);
      }}
      onMouseEnter={() => clearTimeout(closeTimer.current)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "rounded-md p-1.5 text-ink-faint transition hover:bg-surface-2",
          revealOnHover && "opacity-0 group-hover:opacity-100",
        )}
        aria-label="Form actions"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg">
          <MenuItem icon={Pencil} label="Rename" onClick={() => { setOpen(false); onRename(form); }} />
          <MenuItem icon={Copy} label="Duplicate" onClick={() => { setOpen(false); onDuplicate(form); }} />
          <Link
            href={`/forms/${form.id}/results`}
            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2"
          >
            <BarChart3 size={15} /> Results
          </Link>
          <MenuItem icon={Trash2} label="Delete" danger onClick={() => { setOpen(false); onDelete(form); }} />
        </div>
      )}
    </div>
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
      className={cn("flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2", danger && "text-danger")}
    >
      <Icon size={15} /> {label}
    </button>
  );
}
