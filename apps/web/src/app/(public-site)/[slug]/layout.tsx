import type { ReactNode } from "react";
import { getPublicSite } from "@/lib/public-site";

/**
 * Applies the saved club-site color mode before first paint, by setting
 * `data-club-theme` on the root wrapper. Only a mode the visitor explicitly
 * chose is applied — otherwise the wrapper stays on `auto` and CSS follows the
 * OS preference. Runs synchronously so there's no flash of the wrong theme.
 */
const THEME_INIT = `try{var t=localStorage.getItem('club-theme');if(t==='light'||t==='dark'){document.getElementById('club-root').dataset.clubTheme=t}}catch(e){}`;

/**
 * Shell for a public club site: a manually-themeable root carrying the club's
 * chosen brand accent, with no marketing chrome — the club's own hero is the top
 * of the page and its own footer is the bottom. Distinct from the (marketing)
 * group's chrome.
 *
 * The site read here is deduped with the page's via React `cache()`.
 */
export default async function ClubSiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicSite(slug);

  return (
    <div
      id="club-root"
      data-club-theme="auto"
      data-club-accent={data?.site.accent_color ?? "gold"}
      suppressHydrationWarning
      className="flex min-h-full flex-1 flex-col bg-background text-foreground"
    >
      <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-club-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-club-accent-contrast"
      >
        Skip to content
      </a>
      {/* Each page renders its own <main id="main"> between the club's header
          and footer, so the skip link lands on the content and the header and
          footer keep their banner / contentinfo roles. */}
      {children}
    </div>
  );
}
