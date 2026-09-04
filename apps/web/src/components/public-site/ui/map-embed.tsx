"use client";

import { useState } from "react";
import { MapPinIcon } from "@/components/marketing/icons";

/**
 * A click-to-load Google Maps embed.
 *
 * The old template dropped a live Maps iframe per location into every page
 * load — two third-party frames, their scripts and their cookies, on a page
 * whose actual job is text and photos. Most visitors want the address; the ones
 * who want the map ask for it. The facade keeps the first paint cheap and only
 * hands control to Google on an explicit tap.
 */
export function MapEmbed({
  src,
  title,
  place,
}: {
  src: string;
  title: string;
  /** The address, so the control has a meaningful accessible name. */
  place?: string;
}) {
  const [shown, setShown] = useState(false);

  if (shown) {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[16/10] w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      className="group relative flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 bg-muted transition hover:bg-club-accent-soft focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-club-accent"
    >
      <MapContourBackdrop />
      <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-club-accent text-club-accent-contrast shadow-sm transition group-hover:scale-105">
        <MapPinIcon className="h-5 w-5" />
      </span>
      <span className="relative text-sm font-semibold text-foreground">
        Show map
      </span>
      <span className="relative text-xs text-muted-foreground">
        Loads Google Maps
      </span>
      {/* The visible label is "Show map", which says nothing about *what*. This
          gives the button a real accessible name — the one legitimate use of
          off-screen text here. */}
      {place ? <span className="sr-only">{title} — {place}</span> : null}
    </button>
  );
}

/** A faint abstract contour pattern so the facade reads as a map, not a gap. */
function MapContourBackdrop() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full text-foreground opacity-[0.07]"
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M-20 60 L90 40 L150 78 L250 52 L340 84" />
      <path d="M-20 108 L70 92 L160 126 L240 104 L340 132" />
      <path d="M-20 156 L84 146 L170 176 L260 150 L340 178" />
      <path d="M52 -10 L60 200" />
      <path d="M196 -10 L188 200" />
      <path d="M280 -10 L292 200" />
    </svg>
  );
}
