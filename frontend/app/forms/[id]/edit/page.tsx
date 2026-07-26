"use client";

import {
  Cloud,
  Eye,
  Loader2,
  Palette,
  Plug,
  Send,
  Sparkles,
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

type Tab = "create" | "design" | "share" | "connect";

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
      <span className="mt-4 inline-block rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink-faint">
        Coming soon
      </span>
    </div>
  );
}
