import {
  ArrowLeft,
  FileStack,
  Gauge,
  LayoutGrid,
  Palette,
  Sparkles,
  Users,
  UserPlus,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/Logo";
import { ComingSoon } from "@/components/ui/ComingSoon";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Every dashboard control this clone doesn't implement lands here. */
const FEATURES: Record<string, Feature> = {
  invite: {
    icon: UserPlus,
    title: "Team collaboration & sharing",
    description:
      "Invite teammates to a workspace, share forms, and edit together with per-member permissions.",
  },
  integrations: {
    icon: FileStack,
    title: "Integrations",
    description:
      "Pipe responses straight into Google Sheets, Slack, Notion, and Zapier as they come in.",
  },
  contacts: {
    icon: Users,
    title: "Contacts",
    description:
      "Map form responses onto a contact record so you can see everything one person has sent you.",
  },
  automations: {
    icon: Workflow,
    title: "Automations",
    description:
      "Trigger an email, a webhook, or a follow-up form automatically when a response arrives.",
  },
  "brand-kit": {
    icon: Palette,
    title: "Brand kit",
    description:
      "Save your logo, palette, and fonts once, then apply them across every form you build.",
  },
  plans: {
    icon: Wallet,
    title: "Plans & billing",
    description:
      "Upgrade for higher response limits, custom domains, and priority support.",
  },
  "response-limit": {
    icon: Gauge,
    title: "Response limits",
    description:
      "Raise the monthly response cap on your workspace, or set per-form collection limits.",
  },
  workspaces: {
    icon: LayoutGrid,
    title: "Multiple workspaces",
    description:
      "Group forms into separate workspaces for different teams, clients, or projects.",
  },
  ai: {
    icon: Sparkles,
    title: "Build with AI",
    description:
      "Describe the form you want in plain language and get a draft with questions and logic ready to edit.",
  },
};

export default function ComingSoonPage({ params }: { params: { feature: string } }) {
  const feature = FEATURES[params.feature];
  if (!feature) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-line bg-surface px-4 py-2.5">
        <Logo href="/dashboard" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <ComingSoon
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-2"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </Link>
      </main>
    </div>
  );
}
