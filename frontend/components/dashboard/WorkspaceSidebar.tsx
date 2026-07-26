"use client";

import { ChevronUp, LayoutGrid, Mic, Plus, Search, Send } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

import { InertItem } from "./DashboardShell";

/** No billing model here — the meter shows real usage against a demo ceiling. */
const RESPONSE_LIMIT = 100;

interface WorkspaceSidebarProps {
  formCount: number;
  responsesCollected: number;
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: () => void;
}

export function WorkspaceSidebar({
  formCount,
  responsesCollected,
  query,
  onQueryChange,
  onCreate,
}: WorkspaceSidebarProps) {
  const pct = Math.min(100, Math.round((responsesCollected / RESPONSE_LIMIT) * 100));

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-surface">
      <div className="p-3">
        <Button variant="dark" className="w-full justify-center" onClick={onCreate}>
          <Plus size={16} /> Create form
        </Button>
      </div>

      <div className="px-3 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search"
            aria-label="Search forms"
            className="tf-field tf-focus w-full rounded-lg py-1.5 pl-8 pr-2 text-sm"
          />
        </div>
      </div>

      <div className="border-t border-line-subtle px-3 py-3">
        <div className="flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            <LayoutGrid size={13} /> Workspaces
          </span>
          <Link
            href="/coming-soon/workspaces"
            aria-label="New workspace"
            className="rounded p-1 text-ink-faint opacity-70 transition hover:bg-surface-2 hover:text-ink hover:opacity-100"
          >
            <Plus size={14} />
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between px-1 text-xs font-medium text-ink-soft">
          Private <ChevronUp size={14} className="text-ink-faint" />
        </div>

        <div className="mt-1.5 flex items-center justify-between rounded-lg bg-surface-2 px-2.5 py-2 text-sm">
          <span className="truncate">My workspace</span>
          <span className="text-xs text-ink-faint">{formCount}</span>
        </div>
      </div>

      <div className="mt-auto border-t border-line-subtle p-3">
        <p className="text-xs font-medium text-ink-soft">Responses collected</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-ink-faint">
          <span className="font-semibold text-ink">{responsesCollected}</span> / {RESPONSE_LIMIT}
        </p>
        <InertItem
          label="Increase response limit"
          href="/coming-soon/response-limit"
          className="mt-2 w-full justify-center rounded-lg border border-line text-xs"
        />
      </div>

      <div className="p-3 pt-0">
        <Link
          href="/coming-soon/ai"
          className="flex items-center gap-2 rounded-xl border border-line px-2.5 py-2 text-sm text-ink-faint opacity-70 transition hover:bg-surface-2 hover:text-ink hover:opacity-100"
        >
          <Mic size={15} />
          <span className="flex-1">Ask AI</span>
          <Send size={14} />
        </Link>
      </div>
    </aside>
  );
}
