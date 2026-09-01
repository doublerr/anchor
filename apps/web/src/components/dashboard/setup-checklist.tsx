import Link from "next/link";
import { CheckIcon, ArrowRightIcon } from "@/components/marketing/icons";
import { buttonPrimary } from "@/components/ui/button-styles";

type Step = {
  title: string;
  description: string;
  done: boolean;
  href?: string;
  cta?: string;
};

/**
 * Post-onboarding getting-started checklist shown on the portal home. Step 1
 * (org setup) is always complete here — the (app) gate guarantees it. Further
 * steps drive the admin toward a finished club. Renders nothing once every step
 * is done; the dashboard then shows the Share panel instead.
 */
export function SetupChecklist({ siteComplete }: { siteComplete: boolean }) {
  const steps: Step[] = [
    {
      title: "Set up your organization",
      description: "Name, contact, and primary location.",
      done: true,
    },
    {
      title: "Build your public page",
      description: "Add your hero, programs, coaches, hours, and more.",
      done: siteComplete,
      href: "/site",
      cta: "Get started",
    },
  ];

  if (steps.every((s) => s.done)) return null;

  const remaining = steps.filter((s) => !s.done).length;

  return (
    <section className="mb-8 rounded-xl border border-border bg-surface p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Finish setting up
        </h2>
        <span className="text-sm text-muted-foreground">
          {remaining} step{remaining === 1 ? "" : "s"} left
        </span>
      </div>

      <ol className="mt-4 flex flex-col gap-3">
        {steps.map((step) => (
          <li
            key={step.title}
            className="flex items-center gap-4 rounded-lg border border-border bg-background p-4"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                step.done
                  ? "bg-gold-100 text-ink-900 dark:bg-gold-400/20 dark:text-gold-100"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.done ? <CheckIcon className="h-4 w-4" /> : null}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={`font-medium ${
                  step.done
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {step.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
            {!step.done && step.href ? (
              <Link
                href={step.href}
                className={`${buttonPrimary} shrink-0 px-4 py-2 text-sm`}
              >
                {step.cta}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
