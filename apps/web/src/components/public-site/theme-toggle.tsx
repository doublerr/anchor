"use client";

import { SunIcon, MoonIcon } from "@/components/marketing/icons";

/**
 * Toggles the public club site between dark (default) and light color modes by
 * flipping `data-club-theme` on the `#club-root` wrapper and persisting the
 * choice. The visible icon is chosen purely in CSS from that attribute (see
 * globals.css), so there's no React state and no hydration mismatch.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.getElementById("club-root");
    if (!root) return;
    const next = root.dataset.clubTheme === "light" ? "dark" : "light";
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
      className="shrink-0 rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <SunIcon className="club-theme-sun h-5 w-5" />
      <MoonIcon className="club-theme-moon h-5 w-5" />
    </button>
  );
}
