import type { LucideIcon } from "lucide-react";

/** Placeholder card for a feature this clone doesn't implement yet. */
export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
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
