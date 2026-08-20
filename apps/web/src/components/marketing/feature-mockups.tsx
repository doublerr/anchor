import type { ReactNode } from "react";

/**
 * Illustrative in-app "screenshots" for the marketing Features section.
 *
 * These are hand-built mock UIs (not real screenshots) rendered with the brand
 * tokens, so they stay crisp in light and dark without shipping image assets.
 * Everything here is decorative — the surrounding copy carries the meaning — so
 * the frames are marked aria-hidden.
 */

/** A faux app window: title bar with traffic-light dots + a label pill. */
function AppFrame({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg shadow-ink-900/5 ring-1 ring-ink-900/5 dark:shadow-black/20"
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-coral-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-aqua-400" />
        <span className="ml-3 rounded-md bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

const ROLE_BADGE = {
  Archer: "bg-aqua-100 text-aqua-700 dark:bg-aqua-400/15 dark:text-aqua-300",
  Coach: "bg-gold-100 text-gold-700 dark:bg-gold-400/15 dark:text-gold-300",
  Parent: "bg-ink-100 text-ink-600 dark:bg-ink-100/10 dark:text-ink-300",
  Admin: "bg-coral-100 text-coral-700 dark:bg-coral-400/15 dark:text-coral-300",
} as const;

const AVATAR_TINT = [
  "bg-aqua-400/20 text-aqua-700 dark:text-aqua-300",
  "bg-gold-400/20 text-gold-700 dark:text-gold-300",
  "bg-coral-400/20 text-coral-700 dark:text-coral-300",
  "bg-ink-400/20 text-ink-600 dark:text-ink-200",
];

const ROSTER = [
  { name: "Maya Chen", role: "Archer" as const, initials: "MC" },
  { name: "Diego Ramos", role: "Coach" as const, initials: "DR" },
  { name: "Priya Nair", role: "Archer" as const, initials: "PN" },
  { name: "Sam Whitfield", role: "Parent" as const, initials: "SW" },
  { name: "Ava Thompson", role: "Admin" as const, initials: "AT" },
];

/** Members & roles — a roster table with avatars, role badges, status. */
export function RosterMockup() {
  return (
    <AppFrame label="Members · 128 active">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" strokeLinecap="round" />
          </svg>
          Search roster
        </div>
        <span className="rounded-lg bg-gold-400 px-3 py-1.5 text-xs font-semibold text-ink-900">
          + Add member
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-b border-border pb-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        <span>Name</span>
        <span>Role</span>
        <span>Status</span>
      </div>

      <ul className="divide-y divide-border">
        {ROSTER.map((m, i) => (
          <li
            key={m.name}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 py-2.5"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${AVATAR_TINT[i % AVATAR_TINT.length]}`}
              >
                {m.initials}
              </span>
              <span className="truncate text-sm font-medium text-foreground">
                {m.name}
              </span>
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE[m.role]}`}
            >
              {m.role}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-aqua-500" />
              Active
            </span>
          </li>
        ))}
      </ul>
    </AppFrame>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CLASSES = [
  { time: "4:00", title: "Beginner JOAD", filled: 8, cap: 12, accent: "aqua" },
  { time: "5:30", title: "Intermediate line", filled: 11, cap: 12, accent: "gold" },
  { time: "7:00", title: "Comp team practice", filled: 6, cap: 10, accent: "coral" },
];
const BLOCK_ACCENT = {
  aqua: "border-l-aqua-400 bg-aqua-400/10",
  gold: "border-l-gold-400 bg-gold-400/10",
  coral: "border-l-coral-400 bg-coral-400/10",
} as const;

/** Classes & scheduling — a week strip with a day's class blocks. */
export function ScheduleMockup() {
  return (
    <AppFrame label="Schedule · This week">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">March 2026</span>
        <div className="flex gap-1 text-muted-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-xs">
            ‹
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border text-xs">
            ›
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
        {DAYS.map((d, i) => (
          <div key={d} className="text-[10px] font-medium text-muted-foreground">
            <div>{d}</div>
            <div
              className={`mt-1 flex h-7 items-center justify-center rounded-md text-xs font-semibold ${
                i === 2
                  ? "bg-gold-400 text-ink-900"
                  : "bg-muted text-foreground"
              }`}
            >
              {9 + i}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {CLASSES.map((c) => (
          <div
            key={c.title}
            className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 ${BLOCK_ACCENT[c.accent as keyof typeof BLOCK_ACCENT]}`}
          >
            <span className="w-10 text-xs font-semibold text-foreground">
              {c.time}
            </span>
            <span className="flex-1 truncate text-sm font-medium text-foreground">
              {c.title}
            </span>
            <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {c.filled}/{c.cap}
            </span>
          </div>
        ))}
      </div>
    </AppFrame>
  );
}

// Concentric target rings for the scoring mockup (outer → in).
const SCORE_RINGS = [
  { r: 46, fill: "var(--color-ink-900)" },
  { r: 37, fill: "var(--color-surface)" },
  { r: 28, fill: "var(--color-aqua-400)" },
  { r: 19, fill: "var(--color-coral-400)" },
  { r: 10, fill: "var(--color-gold-400)" },
];
// A tight arrow group near the center (offsets from bullseye, in viewBox units).
const ARROWS = [
  [2, -3],
  [-4, 1],
  [1, 4],
  [-1, -6],
  [5, 2],
];
// Rising trend for the mini progress chart (normalized 0–1 heights).
const TREND = [0.35, 0.42, 0.4, 0.55, 0.62, 0.7, 0.82];

/** Scoring & analytics — a target face plus a rising progress chart. */
export function ScoringMockup() {
  return (
    <AppFrame label="Scores · Maya Chen">
      <div className="grid grid-cols-2 gap-4">
        {/* Target face with a grouped arrow cluster */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-muted p-3">
          <svg viewBox="0 0 100 100" className="w-full max-w-[130px]">
            {SCORE_RINGS.map((ring) => (
              <circle
                key={ring.r}
                cx="50"
                cy="50"
                r={ring.r}
                fill={ring.fill}
                stroke="var(--color-border)"
                strokeWidth="0.75"
              />
            ))}
            {ARROWS.map(([dx, dy], i) => (
              <circle
                key={i}
                cx={50 + dx}
                cy={50 + dy}
                r="2.4"
                fill="var(--color-ink-900)"
                stroke="#fff"
                strokeWidth="0.75"
              />
            ))}
          </svg>
          <span className="mt-2 text-[10px] font-medium text-muted-foreground">
            Last end · 5 arrows
          </span>
        </div>

        {/* Stat + rising bar chart */}
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-muted-foreground">
            Season average
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              287
            </span>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-aqua-600">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              12%
            </span>
          </div>

          <div className="mt-auto flex h-20 items-end gap-1.5 pt-3">
            {TREND.map((h, i) => (
              <div key={i} className="flex flex-1 flex-col justify-end">
                <div
                  className={`rounded-t ${i === TREND.length - 1 ? "bg-gold-400" : "bg-aqua-400/50"}`}
                  style={{ height: `${h * 100}%` }}
                />
              </div>
            ))}
          </div>
          <span className="mt-1.5 text-[10px] text-muted-foreground">
            Last 7 sessions
          </span>
        </div>
      </div>
    </AppFrame>
  );
}
