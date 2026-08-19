/**
 * Shared button class strings so every call-to-action across the app uses the
 * same shape and the standardized palette. Append a size (e.g. `px-4 py-2
 * text-sm`) at the call site.
 *
 * - `buttonPrimary`   → gold, the brand's main action
 * - `buttonSecondary` → outlined, for lower-emphasis actions
 * - `buttonGhost`     → text-only, for tertiary actions
 */
const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";

export const buttonPrimary = `${buttonBase} bg-gold-400 text-ink-900 hover:bg-gold-300 focus-visible:outline-gold-500`;

export const buttonSecondary = `${buttonBase} border border-border text-foreground hover:bg-muted focus-visible:outline-ink-400`;

export const buttonGhost = `${buttonBase} text-muted-foreground hover:text-foreground`;
