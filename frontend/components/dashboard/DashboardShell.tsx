"use client";

import {
  ChevronDown,
  FileStack,
  HelpCircle,
  Palette,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import Link from "next/link";

import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { Creator } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A control this clone doesn't implement (billing, contacts, integrations…).
 * Rendered so the layout matches Typeform, and dimmed so it reads as
 * not-yet-available — but it links to /coming-soon/<feature> rather than being a
 * dead button, so clicking it explains what the feature will do.
 */
export function InertItem({
  icon: Icon,
  label,
  href,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-faint opacity-70 transition hover:bg-surface-2 hover:text-ink hover:opacity-100",
        className,
      )}
    >
      {Icon && <Icon size={15} />}
      {label}
    </Link>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function DashboardTopBar({ creator }: { creator?: Creator }) {
  const name = creator?.name ?? "My account";

  return (
    <header className="shrink-0 border-b border-line bg-surface">
      {/* Account row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Logo href="/dashboard" />
          <button
            disabled
            title="Coming soon"
            className="flex cursor-not-allowed items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-ink-soft opacity-70"
          >
            {name} <ChevronDown size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <InertItem icon={Palette} label="Brand kit" href="/coming-soon/brand-kit" className="hidden lg:flex" />
          <InertItem icon={FileStack} label="Integrations" href="/coming-soon/integrations" className="hidden lg:flex" />
          <InertItem label="View plans" href="/coming-soon/plans" className="rounded-lg bg-surface-2 px-3" />
          <ThemeToggle />
          <Link
            href="/coming-soon/plans"
            aria-label="Help"
            className="rounded-lg p-1.5 text-ink-faint opacity-70 transition hover:bg-surface-2 hover:text-ink hover:opacity-100"
          >
            <HelpCircle size={18} />
          </Link>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent"
            title={creator?.email}
          >
            {initials(name)}
          </span>
        </div>
      </div>

      {/* Section-nav row. Only Forms exists in this clone. */}
      <nav className="flex items-center gap-1 px-4 pb-1.5">
        <span className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink">
          <FileStack size={15} /> Forms
        </span>
        <InertItem icon={Users} label="Contacts" href="/coming-soon/contacts" />
        <InertItem icon={Workflow} label="Automations" href="/coming-soon/automations" />
      </nav>
    </header>
  );
}
