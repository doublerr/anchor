import type { Highlight } from "@/lib/org";

/**
 * The club's stat tiles, shared by the home page's About section and the About
 * sub-page.
 *
 * The column count follows the number of tiles rather than being pinned at
 * three: a club with a single highlight was getting one filled cell and
 * two-thirds of an empty bordered box.
 */
const COLUMNS: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

export function HighlightStats({
  highlights,
  className = "",
}: {
  highlights: Highlight[];
  className?: string;
}) {
  if (highlights.length === 0) return null;
  const columns = COLUMNS[Math.min(highlights.length, 3)] ?? "sm:grid-cols-3";

  return (
    <dl
      className={`grid gap-px overflow-hidden rounded-2xl border border-border bg-border ${columns} ${className}`}
    >
      {highlights.map((h, i) => (
        <div key={i} className="bg-surface px-6 py-8 text-center">
          <dt className="sr-only">{h.label}</dt>
          <dd>
            <span className="block text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {h.value}
            </span>
            <span className="mt-1.5 block text-sm text-muted-foreground">
              {h.label}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
