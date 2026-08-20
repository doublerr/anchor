import Link from "next/link";
import { TargetMark } from "./icons";

const FOOTER_GROUPS = [
  {
    heading: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#pricing", label: "Pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            <TargetMark className="h-6 w-6 text-foreground" />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              Anchor
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Anchor Platforms — everything your archery club needs to run
            practice, track scores, and grow, in one place.
          </p>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <div key={group.heading}>
            <h3 className="text-sm font-semibold text-foreground">
              {group.heading}
            </h3>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Anchor Platforms. All rights reserved.</p>
          <Link
            href="/login"
            className="font-medium text-foreground transition hover:text-gold-600"
          >
            Create your organization →
          </Link>
        </div>
      </div>
    </footer>
  );
}
