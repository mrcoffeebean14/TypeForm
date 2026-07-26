import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold text-ink">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-inverted text-inverted-fg">
        📌
      </span>
      <span className="text-[15px] tracking-tight">TypeForm</span>
    </Link>
  );
}
