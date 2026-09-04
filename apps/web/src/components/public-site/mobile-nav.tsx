"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MenuIcon, CloseIcon } from "@/components/marketing/icons";
import { buttonAccent } from "@/components/ui/button-styles";
import type { NavItem } from "@/components/public-site/lib";

/**
 * The club site's mobile navigation.
 *
 * The previous template had none at all — the nav was `hidden md:flex`, so on a
 * phone (where most club-site traffic lands) the header was a logo and nothing
 * else, and every section below the fold was reachable only by scrolling.
 *
 * Rows are full-width and 56px tall rather than the desktop bar's text links:
 * a big target at a predictable edge is far quicker to hit than a small one
 * (Fitts's Law), and there is no reason to be stingy with space in a sheet.
 *
 * The sheet is portalled to `document.body` rather than rendered in place. The
 * header carries `backdrop-blur`, and a `backdrop-filter` makes an element a
 * containing block for its `position: fixed` descendants — so a sheet rendered
 * inside the header resolves `inset-0` against the 64px header box instead of
 * the viewport, and collapses to a strip.
 */
export function MobileNav({
  items,
  cta,
  hrefBase = "",
}: {
  items: NavItem[];
  cta: { label: string; href: string } | null;
  hrefBase?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    // The sheet is portalled to <body>, so the rest of the page is a sibling
    // rather than an ancestor — without this, tabbing past the last link walks
    // straight into content the visitor can't see behind the scrim. `inert`
    // takes the whole page out of the tab order and the accessibility tree,
    // which is what `aria-modal` promises but doesn't itself deliver.
    const root = document.getElementById("club-root");
    if (root) root.inert = true;

    // Captured now, not read in the cleanup: by teardown the ref may already
    // point somewhere else.
    const trigger = triggerRef.current;

    // The sheet is hidden at md and up, but hiding it while open would leave
    // the scroll lock on with no visible way to release it (a phone rotated to
    // landscape can cross the breakpoint). Close it instead.
    const desktop = window.matchMedia("(min-width: 768px)");
    function onBreakpoint() {
      if (desktop.matches) setOpen(false);
    }
    desktop.addEventListener("change", onBreakpoint);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();

    return () => {
      if (root) root.inert = false;
      desktop.removeEventListener("change", onBreakpoint);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      // Send focus back where it came from, rather than dropping the visitor at
      // the top of the document on every dismissal. When the sheet closed
      // because the viewport crossed into desktop, the trigger is display:none
      // and can't take focus — land on the page content instead.
      if (trigger?.offsetParent) {
        trigger.focus();
      } else {
        document.getElementById("main")?.focus();
      }
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="club-mobile-nav"
        className="club-tap inline-flex items-center justify-center rounded-full p-2.5 text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent md:hidden"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {open
        ? createPortal(
        <div
          id="club-mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 md:hidden"
        >
          {/* Scrim. Not a button: the visible X below is the accessible close
              control, and a second one here would just be a duplicate label. */}
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            className="absolute inset-x-0 top-0 max-h-full overflow-y-auto rounded-b-3xl border-b border-border bg-background p-4 shadow-xl outline-none"
          >
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="club-tap inline-flex items-center justify-center rounded-full p-2.5 text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.href ?? `${hrefBase}#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center border-b border-border text-lg font-medium text-foreground transition last:border-0 hover:text-club-accent-text"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {cta ? (
              <a
                href={cta.href}
                onClick={() => setOpen(false)}
                className={`${buttonAccent} mt-5 w-full px-5 py-3 text-base`}
              >
                {cta.label}
              </a>
            ) : null}
          </div>
        </div>,
        document.body,
          )
        : null}
    </>
  );
}
