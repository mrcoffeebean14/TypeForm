import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold text-ink dark:text-white">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
        T
      </span>
      <span className="text-[15px] tracking-tight">Typeclone</span>
    </Link>
  );
}
