import type { ReactNode } from "react";
import Link from "next/link";
import { TargetMark } from "@/components/marketing/icons";
import { SITE_NAME } from "@/lib/site";

/**
 * Applies the saved club-site color mode before first paint (default dark), by
 * setting `data-club-theme` on the root wrapper. Runs synchronously so there's
 * no flash of the wrong theme.
 */
const THEME_INIT = `try{var t=localStorage.getItem('club-theme');if(t==='light'||t==='dark'){document.getElementById('club-root').dataset.clubTheme=t}}catch(e){}`;

/**
 * Shell for a public club site: the page content with a subtle "Powered by
 * Anchor" footer, wrapped in a manually-themed root (dark by default, toggled
 * from the header). No marketing header/nav — the club's own hero is the top of
 * the page. Distinct from the (marketing) group's chrome.
 */
export default function ClubSiteLayout({ children }: { children: ReactNode }) {
  return (
    <div
      id="club-root"
      data-club-theme="dark"
      suppressHydrationWarning
      className="flex min-h-full flex-1 flex-col bg-background text-foreground"
    >
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-4 md:px-6">
          {/* Links to the Anchor marketing home. Path-based hosting means the
              apex "/" is that home, so this resolves to the current origin —
              localhost in dev, the real domain in prod. */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <TargetMark className="h-5 w-5" />
            Powered by {SITE_NAME}
          </Link>
        </div>
      </footer>
    </div>
  );
}
