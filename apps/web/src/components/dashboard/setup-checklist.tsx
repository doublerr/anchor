import Link from "next/link";
import { CheckIcon, ArrowRightIcon } from "@/components/marketing/icons";
import { buttonPrimary } from "@/components/ui/button-styles";
import {
  SITE_ESSENTIALS,
  missingEssentials,
  type SiteEssentialsInput,
} from "@/lib/site-essentials";

/**
 * Post-onboarding getting-started checklist on the portal home.
 *
 * It used to tick "build your public page" off the moment the editor was saved
 * once, however empty the result — which told an admin they were finished while
 * their club URL sat dark. It now names the specific things still standing
 * between them and a live page, so the remaining work is concrete rather than
 * "go and fill something in".
 *
 * Renders nothing once the page is live; the dashboard shows the Share panel.
 */
export function SetupChecklist({ org }: { org: SiteEssentialsInput }) {
  const missing = missingEssentials(org);
  if (missing.length === 0) return null;

  const done = SITE_ESSENTIALS.length - missing.length;

  return (
    <section className="mb-8 rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Your club page isn&rsquo;t live yet
        </h2>
        <span className="text-sm text-muted-foreground">
          {done} of {SITE_ESSENTIALS.length} done
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        We hold your public address until your page has enough on it to be worth
        visiting. Here&rsquo;s what&rsquo;s left.
      </p>

      <ol className="mt-4 flex flex-col gap-3">
        {SITE_ESSENTIALS.map((essential) => {
          const isDone = essential.isDone(org);
          return (
            <li
              key={essential.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isDone
                    ? "bg-gold-100 text-ink-900 dark:bg-gold-400/20 dark:text-gold-100"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <CheckIcon className="h-4 w-4" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`font-medium ${
                    isDone
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {essential.label}
                </p>
                {!isDone ? (
                  <p className="text-sm text-muted-foreground">
                    {essential.help}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <Link href="/site" className={`${buttonPrimary} mt-5 px-4 py-2 text-sm`}>
        {done === 0 ? "Build my page" : "Finish my page"}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </section>
  );
}
