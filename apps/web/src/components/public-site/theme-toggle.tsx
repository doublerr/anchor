"use client";

import { SunIcon, MoonIcon } from "@/components/marketing/icons";

/**
 * Toggles the public club site between light and dark by flipping
 * `data-club-theme` on the `#club-root` wrapper and persisting the choice.
 *
 * The site starts in `auto` (the visitor's OS preference); the first tap pins
 * the opposite of whatever they're currently seeing. The visible icon is chosen
 * purely in CSS from that attribute (see globals.css), so there's no React state
 * and no hydration mismatch.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.getElementById("club-root");
    if (!root) return;
    const current = root.dataset.clubTheme;
    const showingDark =
      current === "dark" ||
      (current !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = showingDark ? "light" : "dark";
    root.dataset.clubTheme = next;
    try {
      localStorage.setItem("club-theme", next);
    } catch {
      // Storage unavailable (private mode / blocked) — the toggle still works
      // for this page view; it just won't be remembered.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color mode"
      className={`club-tap inline-flex shrink-0 items-center justify-center rounded-full p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent ${className}`}
    >
      <SunIcon className="club-theme-sun h-5 w-5" />
      <MoonIcon className="club-theme-moon h-5 w-5" />
    </button>
  );
}
