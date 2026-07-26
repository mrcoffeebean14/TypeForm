"use client";

import {
  Cloud,
  Eye,
  Loader2,
  Palette,
  Plug,
  Send,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { LogicEditor } from "@/components/builder/LogicEditor";
import { PreviewModal } from "@/components/builder/PreviewModal";
import { QuestionCanvas } from "@/components/builder/QuestionCanvas";
import { QuestionList } from "@/components/builder/QuestionList";
import { SettingsPanel } from "@/components/builder/SettingsPanel";
import { SharePanel } from "@/components/builder/SharePanel";
import { ThemePanel } from "@/components/builder/ThemePanel";
import { useBuilder } from "@/components/builder/useBuilder";
import { WorkflowCanvas } from "@/components/builder/WorkflowCanvas";
import { Button } from "@/components/ui/Button";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

type Tab = "create" | "workflow" | "design" | "share" | "connect";

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
    { id: "workflow", label: "Workflow", icon: Workflow },
    { id: "design", label: "Design", icon: Palette },
    { id: "share", label: "Share", icon: Send },
    { id: "connect", label: "Connect", icon: Plug },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg">
      {/* Top bar */}
      <header className="z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
        <div className="flex items-center gap-4">
          <Logo href="/dashboard" />
          <div className="h-5 w-px bg-line" />
          {/* bg-transparent is explicit: text inputs otherwise keep the UA
              `field` background, which flips with color-scheme and would show
              as a box against the header. */}
          <input
            value={form.title}
            onChange={(e) => b.updateFormMeta({ title: e.target.value })}
            className="rounded bg-transparent px-2 py-1 text-sm font-medium text-ink outline-none transition-colors hover:bg-surface-2 focus:bg-surface-2"
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
                  : "text-ink-soft hover:bg-surface-2",
              )}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
          <Link
            href={`/forms/${form.id}/results`}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-surface-2"
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
            <aside className="w-72 shrink-0 border-r border-line bg-surface">
              <QuestionList
                questions={form.questions}
                selectedId={b.selectedId}
                onSelect={b.setSelectedId}
                onAdd={b.addQuestion}
                onDelete={b.deleteQuestion}
                onReorder={b.reorderQuestions}
              />
            </aside>

            <main className="flex-1 overflow-hidden bg-bg">
              <QuestionCanvas
                form={form}
                question={b.selected}
                index={selectedIndex < 0 ? 0 : selectedIndex}
                onUpdate={(patch) => b.selected && b.updateQuestion(b.selected.id, patch)}
              />
            </main>

            <aside className="w-80 shrink-0 border-l border-line bg-surface">
              <SettingsPanel
                question={b.selected}
                allQuestions={form.questions}
                onUpdate={(patch) => b.selected && b.updateQuestion(b.selected.id, patch)}
                onUpdateOptions={(options) => b.selected && b.updateOptions(b.selected.id, options)}
              />
            </aside>
          </>
        )}

        {tab === "workflow" && (
          <>
            <main className="flex-1 overflow-hidden bg-bg">
              <WorkflowCanvas
                questions={form.questions}
                selectedId={b.selectedId}
                onSelect={b.setSelectedId}
              />
            </main>

            <aside className="w-80 shrink-0 overflow-y-auto border-l border-line bg-surface">
              {b.selected ? (
                <>
                  <div className="border-b border-line-subtle px-4 py-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                      Logic jump
                    </h3>
                    <p className="mt-0.5 truncate text-sm text-ink">
                      {b.selected.title || `Question ${selectedIndex + 1}`}
                    </p>
                  </div>
                  <div className="px-4 py-4">
                    <LogicEditor
                      question={b.selected}
                      allQuestions={form.questions}
                      onChange={(logic) => b.updateQuestion(b.selected!.id, { logic })}
                    />
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-ink-faint">
                  Select a question on the canvas to edit its branching.
                </div>
              )}
            </aside>
          </>
        )}

        {tab === "design" && (
          <>
            <aside className="w-80 shrink-0 border-r border-line bg-surface">
              <ThemePanel form={form} onUpdateTheme={b.updateTheme} onUpdateSettings={b.updateSettings} />
            </aside>
            <main className="flex-1 overflow-hidden bg-bg">
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

