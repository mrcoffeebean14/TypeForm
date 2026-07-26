import { ArrowRight, BarChart3, GitBranch, MessageSquare } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import { HeroFormDemo } from "@/components/marketing/HeroFormDemo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { QUESTION_TYPES } from "@/lib/questionMeta";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteNav />
      <Hero />
      <TrustStrip />
      <Features />
      <QuestionTypes />
      <ClosingCta />
      <SiteFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ Nav --- */

function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
            <a className="transition-colors hover:text-ink" href="#features">Product</a>
            <a className="transition-colors hover:text-ink" href="#types">Templates</a>
            <a className="transition-colors hover:text-ink" href="#pricing">Pricing</a>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/dashboard" className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:block">
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-inverted px-4 py-2 text-sm font-semibold text-inverted-fg transition-transform hover:scale-[1.03]"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------- Hero --- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient accent glow, kept faint. */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-accent/10 blur-3xl" />

      <div className="mx-auto grid max-w-container items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            No-code · Free to start
          </span>

          <h1 className="text-display mt-6 text-5xl font-extrabold sm:text-6xl lg:text-[68px]">
            Forms people{" "}
            <span className="relative whitespace-nowrap">
              actually enjoy
              <svg className="absolute -bottom-1 left-0 w-full text-accent" height="10" viewBox="0 0 300 10" preserveAspectRatio="none" aria-hidden>
                <path d="M2 7 Q 150 1 298 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>{" "}
            answering.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            Build conversational forms and surveys that feel like a chat, not a chore.
            Ask one question at a time — and watch completion rates climb.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-inverted px-6 py-3.5 text-base font-semibold text-inverted-fg transition-transform hover:scale-[1.03]"
            >
              Get started — it’s free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/f/customer-feedback-demo"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              Try a live form
            </Link>
          </div>

          <p className="mt-4 text-sm text-ink-faint">No credit card. No sign-up wall.</p>
        </div>

        <div className="lg:pl-4">
          <HeroFormDemo />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Trust strip --- */

function TrustStrip() {
  const names = ["Northwind", "Lumen", "Foundry", "Cardinal", "Verve", "Atlas"];
  return (
    <section className="border-y border-line bg-surface">
      <div className="mx-auto flex max-w-container flex-col items-center gap-6 px-6 py-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
          Teams collect better answers with TypeForm. Trusted by hundreds of companies, from startups to scale-ups.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
          {names.map((n) => (
            <span key={n} className="text-lg font-bold tracking-tight text-ink">
              {n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- Features --- */

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Conversational by design",
    body: "One question fills the screen at a time. It feels human, so more people finish what they start.",
  },
  {
    icon: GitBranch,
    title: "Logic that adapts",
    body: "Branch to the right question based on the last answer. Skip what doesn’t apply, ask what does.",
  },
  {
    icon: BarChart3,
    title: "Insights that land",
    body: "Live summaries, per-response detail, and one-click CSV export — no spreadsheet wrangling.",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-container px-6 py-20 lg:py-28">
      <div className="max-w-2xl">
        <h2 className="text-display text-4xl font-extrabold sm:text-5xl">
          A form that talks with people, not at them.
        </h2>
        <p className="mt-5 text-lg text-ink-soft">
          Everything you need to ask well and understand fast — without touching a line of code.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="group rounded-2xl border border-line bg-surface p-7 transition-shadow hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.25)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform group-hover:scale-105">
              <Icon size={20} />
            </div>
            <h3 className="mt-5 text-xl font-bold">{title}</h3>
            <p className="mt-2 leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------- Question types --- */

function QuestionTypes() {
  return (
    <section id="types" className="bg-surface-alt">
      <div className="mx-auto max-w-container px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-display text-4xl font-extrabold sm:text-5xl">
              Every question type you’ll reach for.
            </h2>
            <p className="mt-5 max-w-md text-lg text-ink-soft">
              From a quick yes/no to multi-select and ratings — mix them into a flow that reads
              like a conversation. Add your own colors, and make it yours.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-inverted px-6 py-3.5 text-base font-semibold text-inverted-fg transition-transform hover:scale-[1.03]"
            >
              Build your first form
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {QUESTION_TYPES.map(({ type, label, icon: Icon }) => (
              <div
                key={type}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3.5 text-sm font-medium text-ink shadow-sm"
              >
                <Icon size={17} className="shrink-0 text-accent" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Closing CTA --- */

function ClosingCta() {
  return (
    <section id="pricing" className="mx-auto max-w-container px-6 py-20 lg:py-28">
      <div className="relative overflow-hidden rounded-[32px] bg-inverted px-8 py-16 text-center text-inverted-fg sm:px-16 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <h2 className="text-display relative text-4xl font-extrabold sm:text-5xl">
          Start asking awesomely.
        </h2>
        <p className="relative mx-auto mt-5 max-w-lg text-lg text-inverted-fg/70">
          Spin up your first conversational form in minutes. It’s free to build, share, and collect.
        </p>
        <Link
          href="/dashboard"
          className="relative mt-9 inline-flex items-center gap-2 rounded-lg bg-inverted-fg px-7 py-3.5 text-base font-semibold text-inverted transition-transform hover:scale-[1.03]"
        >
          Create a form
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Footer --- */

function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <Logo />
        <p className="text-sm text-ink-faint">
          A built for the craft of asking well.
        </p>
      </div>
    </footer>
  );
}
