import type { ReactNode } from "react";
import Image from "next/image";
import { TargetMark } from "@/components/marketing/icons";

/**
 * Every photo on a club site goes through here.
 *
 * The frame reserves its space via an aspect ratio before the image arrives, so
 * nothing on the page reflows as photos load (the old template used bare `<img>`
 * with no dimensions and shifted on every load). Inside it, `next/image` with
 * `fill` handles responsive sources and format negotiation.
 *
 * A club that hasn't uploaded a photo yet gets a designed placeholder rather
 * than a hole — most clubs fill their site in over several sittings.
 */
export function SitePhoto({
  src,
  alt,
  sizes,
  className = "",
  imageClassName = "",
  preload = false,
  absolute = false,
  overlay,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  /** Required: how wide the image renders, so the right source is fetched. */
  sizes: string;
  /** Frame classes — aspect ratio, rounding, positioning. */
  className?: string;
  imageClassName?: string;
  /** Preload this image. Use on the hero only (Next 16 replaced `priority`). */
  preload?: boolean;
  /** Fill a positioned ancestor instead of establishing its own frame. */
  absolute?: boolean;
  /** Rendered above the image, e.g. a scrim or caption. */
  overlay?: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <div
      className={`${absolute ? "absolute inset-0" : "relative"} overflow-hidden bg-muted ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          loading={preload ? "eager" : "lazy"}
          className={`object-cover ${imageClassName}`}
        />
      ) : (
        (fallback ?? <PhotoFallback />)
      )}
      {overlay}
    </div>
  );
}

/** The placeholder shown in a frame with no photo. */
export function PhotoFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-club-accent-soft">
      <TargetMark className="h-10 w-10 text-club-accent-text opacity-40" />
    </div>
  );
}

/**
 * The scrim that makes white text legible over an arbitrary club photo.
 *
 * A bottom-weighted gradient rather than a flat wash, so the photo still reads
 * at the top. The stops are set by contrast rather than by eye: on a narrow
 * phone the hero is content-sized, so a club with a long name and tagline
 * floats the text further up the ramp. The top stop therefore has to clear
 * 4.5:1 for the 14px eyebrow over a pure-white photo pixel by itself — at 0.6
 * alpha it does (4.68:1), so the guarantee holds regardless of how much copy a
 * club writes.
 */
export function PhotoScrim({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/70 to-ink-950/60 ${className}`}
    />
  );
}
