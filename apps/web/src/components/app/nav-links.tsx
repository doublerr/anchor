"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import {
  HomeIcon,
  MembersIcon,
  MapPinIcon,
  GlobeIcon,
  SettingsIcon,
} from "@/components/marketing/icons";

type NavItem = {
  href: string;
  label: string;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
};

/** Admin portal sections. Most beyond Overview are placeholders for now. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", Icon: HomeIcon },
  { href: "/members", label: "Members", Icon: MembersIcon },
  { href: "/locations", label: "Locations", Icon: MapPinIcon },
  { href: "/site", label: "Public site", Icon: GlobeIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Vertical list for the desktop sidebar. */
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-gold-100 text-ink-900 dark:bg-gold-400/15 dark:text-gold-100"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Icon tab bar for the bottom of the screen on mobile. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-stretch justify-around border-t border-border bg-surface md:hidden">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition ${
              active ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "text-gold-500" : ""}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
