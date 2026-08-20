"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { buttonPrimary, buttonSecondary } from "@/components/ui/button-styles";

const fieldClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30";

const labelClass = "flex flex-col gap-1 text-sm font-medium text-foreground";

const TEAM_SIZES = [
  "Just me",
  "2–10",
  "11–25",
  "26–50",
  "51–100",
  "100+",
] as const;

type Status = "idle" | "submitting" | "done" | "error";

/**
 * "Interested?" call-to-action. Renders a button that opens a modal with a
 * short lead-capture form. Submissions insert directly into
 * `public.interest_leads` via the browser Supabase client (insert-only RLS).
 *
 * Reusable across the landing page — pass a `label` and button `className`
 * (append a size, e.g. `px-5 py-3 text-sm`) at each call site.
 */
export function InterestForm({
  label = "Interested?",
  className = `${buttonPrimary} px-5 py-3 text-sm`,
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  // Portal target is only available in the browser.
  useEffect(() => setMounted(true), []);

  function close() {
    setOpen(false);
    // Reset a beat later so the modal doesn't flash back to the form.
    setTimeout(() => {
      setStatus("idle");
      setError(null);
    }, 200);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    if (!email && !phone) {
      setError("Please share an email or phone number so we can reach you.");
      return;
    }

    setStatus("submitting");
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("interest_leads")
      .insert({
        email: email || null,
        phone: phone || null,
        city: String(data.get("city") ?? "").trim() || null,
        state: String(data.get("state") ?? "").trim() || null,
        team_size: String(data.get("team_size") ?? "").trim() || null,
      });

    if (insertError) {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return;
    }

    setStatus("done");
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {open && mounted
        ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm"
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            {status === "done" ? (
              <div className="text-center">
                <h2 id={titleId} className="text-xl font-semibold">
                  Thanks — you&apos;re on the list!
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We&apos;ll reach out as soon as Anchor opens up for your club.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className={`${buttonPrimary} mt-6 px-5 py-2.5 text-sm`}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <h2 id={titleId} className="text-xl font-semibold">
                    Interested in Anchor?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Leave your details and we&apos;ll be in touch when it&apos;s
                    ready for your club.
                  </p>
                </div>

                {error ? (
                  <p className="rounded-md bg-coral-100 px-3 py-2 text-sm text-coral-700 dark:bg-coral-400/15 dark:text-coral-300">
                    {error}
                  </p>
                ) : null}

                <label className={labelClass}>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@club.org"
                    className={fieldClass}
                  />
                </label>

                <label className={labelClass}>
                  Phone{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 555 123 4567"
                    className={fieldClass}
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className={labelClass}>
                    City
                    <input
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      className={fieldClass}
                    />
                  </label>
                  <label className={labelClass}>
                    State
                    <input
                      name="state"
                      type="text"
                      autoComplete="address-level1"
                      placeholder="CA"
                      className={fieldClass}
                    />
                  </label>
                </div>

                <label className={labelClass}>
                  Size of team
                  <select name="team_size" defaultValue="" className={fieldClass}>
                    <option value="" disabled>
                      Select a range
                    </option>
                    {TEAM_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    className={`${buttonSecondary} px-4 py-2.5 text-sm`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className={`${buttonPrimary} px-5 py-2.5 text-sm`}
                  >
                    {status === "submitting" ? "Sending…" : "Notify me"}
                  </button>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
