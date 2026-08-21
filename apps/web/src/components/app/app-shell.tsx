import type { ReactNode } from "react";
import { signOut } from "@/app/(app)/actions";
import { TargetMark, LogoutIcon } from "@/components/marketing/icons";
import { buttonSecondary } from "@/components/ui/button-styles";
import { SidebarNav, BottomNav } from "@/components/app/nav-links";

/**
 * Admin portal chrome: a fixed sidebar on desktop, a top bar everywhere, and a
 * bottom tab bar on mobile. Server component — the only interactive pieces are
 * the client `SidebarNav`/`BottomNav` (active-link highlighting) and the
 * sign-out server action.
 */
export function AppShell({
  orgName,
  logoUrl,
  children,
}: {
  orgName: string;
  logoUrl?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 bg-muted">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <TargetMark className="h-7 w-7 text-foreground" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Anchor
          </span>
        </div>
        <div className="px-3">
          <SidebarNav />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-8 w-8 shrink-0 rounded-md object-cover"
              />
            ) : (
              <TargetMark className="h-7 w-7 shrink-0 text-foreground md:hidden" />
            )}
            <span className="truncate text-base font-semibold tracking-tight text-foreground">
              {orgName}
            </span>
          </div>
          <form action={signOut}>
            <button className={`${buttonSecondary} px-3 py-1.5 text-sm`}>
              <LogoutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>

        <BottomNav />
      </div>
    </div>
  );
}
