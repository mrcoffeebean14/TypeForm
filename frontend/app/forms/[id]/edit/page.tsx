"use client";

import {
  Cloud,
  Eye,
  Loader2,
  Palette,
  Plug,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { PreviewModal } from "@/components/builder/PreviewModal";
import { QuestionCanvas } from "@/components/builder/QuestionCanvas";
import { QuestionList } from "@/components/builder/QuestionList";
import { SettingsPanel } from "@/components/builder/SettingsPanel";
import { SharePanel } from "@/components/builder/SharePanel";
import { ThemePanel } from "@/components/builder/ThemePanel";
import { useBuilder } from "@/components/builder/useBuilder";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

type Tab = "create" | "design" | "share" | "connect" | "team";

export default function BuilderPage({ params }: { params: { id: string } }) {
  const b = useBuilder(params.id);
  const [tab, setTab] = useState<Tab>("create");
  const [previewOpen, setPreviewOpen] = useState(false);

  if (b.loading || !b.form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  const form = b.form;
  const selectedIndex = form.questions.findIndex((q) => q.id === b.selectedId);

  const tabs: { id: Tab; label: string; icon: typeof Sparkles }[] = [
    { id: "create", label: "Create", icon: Sparkles },
    { id: "design", label: "Design", icon: Palette },
    { id: "share", label: "Share", icon: Send },
    { id: "connect", label: "Connect", icon: Plug },
    { id: "team", label: "Team", icon: Users },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Top bar */}
      <header className="z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-4">
          <Logo href="/dashboard" />
          <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
          <input
            value={form.title}
            onChange={(e) => b.updateFormMeta({ title: e.target.value })}
            className="rounded px-2 py-1 text-sm font-medium outline-none hover:bg-neutral-100 focus:bg-neutral-100 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
          />
          <SaveIndicator state={b.saveState} />
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                tab === t.id
                  ? "bg-accent/10 text-accent"
                  : "text-ink-soft hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
              )}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
          <Link
            href={`/forms/${form.id}/results`}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            Results
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye size={15} /> Preview
          </Button>
          {form.status === "published" ? (
            <Button variant="dark" size="sm" onClick={() => setTab("share")}>
              <Cloud size={15} /> Published
            </Button>
          ) : (
            <Button size="sm" onClick={b.publish}>
              <Send size={15} /> Publish
            </Button>
          )}
        </div>
      </header>

      {/* Tab content */}
      <div className="flex flex-1 overflow-hidden">
        {tab === "create" && (
          <>
            <aside className="w-72 shrink-0 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <QuestionList
                questions={form.questions}
                selectedId={b.selectedId}
                onSelect={b.setSelectedId}
                onAdd={b.addQuestion}
                onDelete={b.deleteQuestion}
                onReorder={b.reorderQuestions}
              />
            </aside>

            <main className="flex-1 overflow-hidden bg-neutral-100 dark:bg-neutral-950">
              <QuestionCanvas
                form={form}
                question={b.selected}
                index={selectedIndex < 0 ? 0 : selectedIndex}
                onUpdate={(patch) => b.selected && b.updateQuestion(b.selected.id, patch)}
              />
            </main>

            <aside className="w-80 shrink-0 border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <SettingsPanel
                question={b.selected}
                allQuestions={form.questions}
                onUpdate={(patch) => b.selected && b.updateQuestion(b.selected.id, patch)}
                onUpdateOptions={(options) => b.selected && b.updateOptions(b.selected.id, options)}
              />
            </aside>
          </>
        )}

        {tab === "design" && (
          <>
            <aside className="w-80 shrink-0 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
              <ThemePanel form={form} onUpdateTheme={b.updateTheme} onUpdateSettings={b.updateSettings} />
            </aside>
            <main className="flex-1 overflow-hidden bg-neutral-100 dark:bg-neutral-950">
              <QuestionCanvas
                form={form}
                question={b.selected ?? form.questions[0] ?? null}
                index={0}
                onUpdate={() => {}}
              />
            </main>
          </>
        )}

        {tab === "share" && (
          <main className="flex-1 overflow-y-auto">
            <SharePanel form={form} onPublish={b.publish} onUnpublish={b.unpublish} />
          </main>
        )}

        {tab === "connect" && (
          <main className="flex flex-1 items-center justify-center">
            <ComingSoon
              icon={Plug}
              title="Integrations & webhooks"
              description="Connect Google Sheets, Slack, Zapier, and webhooks. Coming soon."
            />
          </main>
        )}

        {tab === "team" && (
          <main className="flex flex-1 items-center justify-center">
            <ComingSoon
              icon={Users}
              title="Team collaboration & sharing"
              description="Invite teammates, share workspaces, and co-edit forms. Coming soon."
            />
          </main>
        )}
      </div>

      <PreviewModal open={previewOpen} form={form} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "idle") return null;
  return (
    <span className="flex items-center gap-1 text-xs text-ink-faint">
      {state === "saving" ? (
        <>
          <Loader2 size={12} className="animate-spin" /> Saving…
        </>
      ) : (
        <>✓ Saved</>
      )}
    </span>
  );
}

function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Plug;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-sm text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <Icon size={26} />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-ink-faint">{description}</p>
      <span className="mt-4 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-ink-faint dark:bg-neutral-800">
        Coming soon
      </span>
    </div>
  );
}
