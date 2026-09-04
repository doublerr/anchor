/**
 * Empty-row factories for the club public-site content's repeating sections,
 * used by the admin site editor. Keeping them here means the editor and the
 * public template never drift on field shape.
 */
import type {
  EventItem,
  Faq,
  GalleryImage,
  Highlight,
  PricingItem,
  Program,
  Testimonial,
} from "@/lib/org";

export function emptyHighlight(): Highlight {
  return { value: "", label: "" };
}

export function emptyProgram(): Program {
  return {
    name: "",
    audience: "",
    blurb: "",
    cta_label: "",
    cta_url: "",
    image_url: "",
  };
}

export function emptyPricing(): PricingItem {
  return { name: "", price: "", cadence: "", note: "", featured: false };
}

export function emptyEvent(): EventItem {
  return { title: "", date: "", blurb: "", url: "", image_url: "" };
}

export function emptyTestimonial(): Testimonial {
  return { quote: "", author: "", role: "", image_url: "" };
}

export function emptyFaq(): Faq {
  return { q: "", a: "" };
}

export function emptyGalleryImage(): GalleryImage {
  return { url: "", caption: "" };
}
