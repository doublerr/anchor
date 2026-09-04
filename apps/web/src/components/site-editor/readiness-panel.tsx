"use client";

import { CheckIcon, ArrowRightIcon } from "@/components/marketing/icons";
import {
  SITE_ESSENTIALS,
  missingEssentials,
  type SiteEssentialsInput,
} from "@/lib/site-essentials";

/**
 * The "before your page can go live" panel at the top of the site editor.
 *
 * Deliberately not dismissible and not a toast: it is the reason the club's URL
 * is dark, so it stays on screen until it's resolved. Each outstanding item
 * names what's missing, says why it matters, and jumps straight to the tab that
 * fixes it — an admin should never have to hunt for the field being asked for.
 *
 * It reads the editor's in-progress state rather than the saved row, so ticking
 * an item off happens as the admin types, not after a round-trip.
 */
export function ReadinessPanel({
  content,
  onGoToTab,
}: {
  content: SiteEssentialsInput;
  onGoToTab: (tab: string) => void;
}) {
  const missing = missingEssentials(content);
  const done = SITE_ESSENTIALS.length - missing.length;

  if (missing.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-gold-400/50 bg-gold-50 p-4 dark:bg-gold-400/10">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink-900">
          <CheckIcon className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold text-foreground">
            Your page is ready to go live
          </p>
          <p className="text-sm text-muted-foreground">
            Save your changes and it&rsquo;s published at your club URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="site-readiness"
      className="rounded-xl border border-coral-300 bg-coral-50 p-5 dark:border-coral-400/40 dark:bg-coral-400/10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          id="site-readiness"
          className="font-semibold tracking-tight text-foreground"
        >
          Your page isn&rsquo;t live yet
        </h2>
        <span className="text-sm text-muted-foreground">
          {done} of {SITE_ESSENTIALS.length} done
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        A page without these does your club more harm than good, so we hold your
        URL until they&rsquo;re in. It takes about five minutes.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {missing.map((essential) => (
          <li key={essential.id}>
            <button
              type="button"
              onClick={() => onGoToTab(essential.tab)}
              className="group flex w-full items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition hover:border-gold-400"
            >
              <span
                aria-hidden
                className="mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/40"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-foreground">
                  {essential.label}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {essential.help}
                </span>
              </span>
              <ArrowRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
