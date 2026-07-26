"use client";

import { ArrowLeft, Download, Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { ResponsesTable } from "@/components/results/ResponsesTable";
import { SummaryStats } from "@/components/results/SummaryStats";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { api } from "@/lib/api";
import { useForm, useResponses, useSummary } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type Tab = "summary" | "responses";

export default function ResultsPage({ params }: { params: { id: string } }) {
  const { data: form } = useForm(params.id);
  const { data: responses, isLoading: loadingResponses } = useResponses(params.id);
  const { data: summary, isLoading: loadingSummary } = useSummary(params.id);
  const [tab, setTab] = useState<Tab>("summary");

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-ink-faint hover:text-ink">
              <ArrowLeft size={18} />
            </Link>
            <Logo href="/dashboard" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href={`/forms/${form.id}/edit`}>
              <Button variant="secondary" size="sm">
                <Pencil size={15} /> Edit
              </Button>
            </Link>
            <a href={api.exportCsvUrl(form.id)}>
              <Button size="sm">
                <Download size={15} /> Export CSV
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{form.title}</h1>
          <p className="mt-1 text-sm text-ink-faint">
            {summary?.total_responses ?? 0} responses collected
          </p>
        </div>

        <div className="mb-6 flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
          {(["summary", "responses"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize transition",
                tab === t
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-faint hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "summary" &&
          (loadingSummary || !summary ? (
            <LoadingBlock />
          ) : (
            <SummaryStats stats={summary} />
          ))}

        {tab === "responses" &&
          (loadingResponses || !responses ? (
            <LoadingBlock />
          ) : (
            <ResponsesTable form={form} responses={responses} />
          ))}
      </main>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      ))}
    </div>
  );
}
