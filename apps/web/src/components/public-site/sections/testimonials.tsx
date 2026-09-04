import Image from "next/image";
import { QuoteIcon } from "@/components/marketing/icons";
import { SitePhoto, PhotoScrim } from "@/components/public-site/ui/site-photo";
import { list, text } from "@/components/public-site/lib";
import type { Testimonial } from "@/lib/org";
import type { PublicSite } from "@/lib/public-site";

/** Two supporting quotes under the lead one; more than that becomes a wall. */
const MAX_SUPPORTING = 2;

/**
 * Testimonials, rendered as the page's one full-bleed moment.
 *
 * Peak–End: a page that keeps the same rhythm from top to bottom is remembered
 * as flat, however good the content is. This band interrupts the section
 * cadence — edge to edge, a photo behind it, one quote at display size — and
 * sits mid-page where a visitor is deciding whether this club is for them.
 *
 * It borrows the club's own photography (a gallery shot, else the hero) rather
 * than asking for another upload.
 */
export function Testimonials({ site }: { site: PublicSite }) {
  const testimonials = list(site.testimonials);
  if (!testimonials) return null;

  const [lead, ...rest] = testimonials;
  const supporting = rest.slice(0, MAX_SUPPORTING);
  const backdrop =
    list(site.gallery)?.[0]?.url ?? text(site.hero_image_url) ?? null;

  return (
    <section id="testimonials" className="relative isolate scroll-mt-20 overflow-hidden">
      {backdrop ? (
        <SitePhoto
          absolute
          src={backdrop}
          alt=""
          sizes="100vw"
          overlay={<PhotoScrim className="bg-ink-950/75" />}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-ink-900" />
      )}

      <div className="relative mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6 md:py-28">
        <QuoteIcon className="mx-auto h-9 w-9 text-club-accent" />
        <blockquote className="mt-6 text-balance text-2xl font-medium leading-snug text-white md:text-4xl md:leading-tight">
          &ldquo;{lead.quote}&rdquo;
        </blockquote>
        <Attribution testimonial={lead} />

        {supporting.length > 0 ? (
          <div className="mt-14 grid gap-6 border-t border-white/15 pt-12 text-left sm:grid-cols-2">
            {supporting.map((t, i) => (
              <figure key={i}>
                <blockquote className="text-base leading-relaxed text-white/85">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <Attribution testimonial={t} small />
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Attribution({
  testimonial,
  small = false,
}: {
  testimonial: Testimonial;
  small?: boolean;
}) {
  const author = text(testimonial.author);
  const role = text(testimonial.role);
  if (!author && !role) return null;

  return (
    <figcaption
      className={`flex items-center gap-3 ${
        small ? "mt-4" : "mt-8 justify-center"
      }`}
    >
      {testimonial.image_url ? (
        <Image
          src={testimonial.image_url}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover ring-2 ring-white/25"
        />
      ) : null}
      <span className="text-left">
        {author ? (
          <span className="block text-sm font-semibold text-white">
            {author}
          </span>
        ) : null}
        {role ? (
          <span className="block text-sm text-white/70">{role}</span>
        ) : null}
      </span>
    </figcaption>
  );
}
