/**
 * Empty-row factories for the club public-site content's repeating sections,
 * used by the admin site editor. Keeping them here means the editor and the
 * public template never drift on field shape.
 */
import type {
  EventItem,
  Faq,
  Highlight,
  PricingItem,
  Program,
} from "@/lib/org";

export function emptyHighlight(): Highlight {
  return { value: "", label: "" };
}

export function emptyProgram(): Program {
  return { name: "", audience: "", blurb: "", cta_label: "", cta_url: "" };
}

export function emptyPricing(): PricingItem {
  return { name: "", price: "", cadence: "", note: "" };
}

export function emptyEvent(): EventItem {
  return { title: "", date: "", blurb: "", url: "" };
}

export function emptyTestimonial(): { quote: string; author: string } {
  return { quote: "", author: "" };
}

export function emptyFaq(): Faq {
  return { q: "", a: "" };
}
