"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CloseIcon } from "@/components/marketing/icons";
import { Section } from "@/components/public-site/ui/section";
import type { GalleryImage } from "@/lib/org";

/** Six tiles fill the mosaic; the rest live one tap away in the lightbox. */
const MAX_TILES = 6;

/**
 * Gallery.
 *
 * A club's photos are the most persuasive thing on its site, so they get an
 * editorial mosaic — one lead image at double size, the rest tiled around it —
 * instead of the old uniform grid of squares that read as a contact sheet.
 * Every tile opens a lightbox, so the whole set is reachable without turning the
 * home page into a scroll (Miller's Law).
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const tiles = images.slice(0, MAX_TILES);
  const hidden = images.length - tiles.length;

  return (
    <Section
      id="gallery"
      width="wide"
      eyebrow="On the line"
      title="Gallery"
    >
      <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((image, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenAt(i)}
            aria-label={image.caption?.trim() || `View photo ${i + 1}`}
            className={`group relative aspect-square overflow-hidden rounded-xl bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-club-accent ${
              i === 0 ? "col-span-2 row-span-2 aspect-auto" : ""
            }`}
          >
            <Image
              src={image.url}
              alt={image.caption?.trim() || ""}
              fill
              sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
            />
            {image.caption?.trim() ? (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/85 to-transparent p-3 pt-8 text-left text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 md:text-sm">
                {image.caption}
              </span>
            ) : null}
            {i === tiles.length - 1 && hidden > 0 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-ink-950/60 text-sm font-semibold text-white">
                +{hidden} more
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {openAt !== null ? (
        <Lightbox
          images={images}
          index={openAt}
          onIndex={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      ) : null}
    </Section>
  );
}

function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const step = useCallback(
    (delta: number) => onIndex((index + delta + images.length) % images.length),
    [index, images.length, onIndex],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, step]);

  const current = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 flex flex-col bg-ink-950/95 p-4"
    >
      <div className="flex shrink-0 items-center justify-between text-sm text-white/70">
        <span>
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="club-tap inline-flex items-center justify-center rounded-full p-2.5 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <Image
          src={current.url}
          alt={current.caption?.trim() || ""}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          className="club-tap rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          ← Prev
        </button>
        {current.caption?.trim() ? (
          <p className="min-w-0 flex-1 truncate text-center text-sm text-white/80">
            {current.caption}
          </p>
        ) : (
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={() => step(1)}
          className="club-tap rounded-full border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
