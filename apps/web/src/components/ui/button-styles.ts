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

/**
 * Club public-site variants. These resolve against the per-club accent tokens
 * set on `#club-root` (see globals.css), so the same class string renders in
 * each club's own brand color. `club-tap` holds the 44px comfortable-target
 * floor, since these are the main things a visitor taps on a phone.
 */
export const buttonAccent = `${buttonBase} club-tap bg-club-accent text-club-accent-contrast hover:bg-club-accent-hover focus-visible:outline-club-accent`;

export const buttonAccentOutline = `${buttonBase} club-tap border border-border bg-surface text-foreground hover:border-club-accent hover:bg-muted focus-visible:outline-club-accent`;

/** For use on top of a photo scrim, where the page tokens don't apply. */
export const buttonOnImage = `${buttonBase} club-tap border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus-visible:outline-white`;
