import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminOrg } from "@/lib/org";
import {
  MembersIcon,
  MapPinIcon,
  BowIcon,
  PlusIcon,
  SettingsIcon,
  ArrowRightIcon,
} from "@/components/marketing/icons";
import { buttonPrimary, buttonSecondary } from "@/components/ui/button-styles";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { ShareSite } from "@/components/dashboard/share-site";
import { siteIsReady } from "@/lib/site-essentials";

export const metadata = {
  title: "Overview · Anchor",
};

/** Compact one-line summary of an address for the locations list. */
function formatAddress(parts: (string | null)[]) {
  return parts.filter(Boolean).join(", ") || "No address on file";
}

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { org } = await getAdminOrg(supabase, user.id);
  // The layout gate guarantees a completed org here; guard defensively anyway.
  if (!org) redirect("/create-organization");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const [membersCount, locationsCount, archersCount, additionalLocations] =
    await Promise.all([
      supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", org.id),
      supabase
        .from("locations")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", org.id),
      supabase
        .from("archers")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", org.id),
      supabase
        .from("locations")
        .select("id, name, address_line1, city, region")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: true }),
    ]);

  const firstName = profile?.full_name?.split(" ")[0];
  // Readiness, not "did they press Save once" — site_completed_at only records
  // that the editor was visited, and a saved-but-empty page is still dark.
  const siteLive = org.site_published && siteIsReady(org);

  const stats = [
    {
      label: "Members",
      value: membersCount.count ?? 0,
      Icon: MembersIcon,
      href: "/members",
    },
    {
      label: "Archers",
      value: archersCount.count ?? 0,
      Icon: BowIcon,
      href: "/members",
    },
    {
      // +1 for the primary/HQ address stored on the org itself.
      label: "Locations",
      value: (locationsCount.count ?? 0) + 1,
      Icon: MapPinIcon,
      href: "/locations",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Here&rsquo;s what&rsquo;s happening at {org.name}.
        </p>
      </div>

      {/* Getting-started checklist (hidden once every step is done) */}
      <div className="mt-8">
        <SetupChecklist org={org} />
        {siteLive ? <ShareSite slug={org.slug} live /> : null}
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition hover:border-gold-400"
          >
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                {value}
              </p>
            </div>
            <span className="rounded-lg bg-muted p-2.5 text-muted-foreground transition group-hover:bg-gold-100 group-hover:text-ink-900 dark:group-hover:bg-gold-400/15 dark:group-hover:text-gold-100">
              <Icon className="h-6 w-6" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Locations */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Locations
            </h2>
            <Link
              href="/locations"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Manage <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {/* Primary / HQ address, stored on the org itself. */}
            <li className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
              <span className="mt-0.5 rounded-lg bg-gold-100 p-2 text-ink-900 dark:bg-gold-400/15 dark:text-gold-100">
                <MapPinIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  {org.name}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Primary
                  </span>
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {formatAddress([
                    org.address_line1,
                    org.city,
                    org.region,
                    org.postal_code,
                  ])}
                </p>
              </div>
            </li>

            {additionalLocations.data?.map((loc) => (
              <li
                key={loc.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <span className="mt-0.5 rounded-lg bg-muted p-2 text-muted-foreground">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{loc.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {formatAddress([loc.address_line1, loc.city, loc.region])}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Quick actions
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/members"
              className={`${buttonPrimary} px-4 py-2.5 text-sm`}
            >
              <PlusIcon className="h-4 w-4" />
              Invite a member
            </Link>
            <Link
              href="/locations"
              className={`${buttonSecondary} px-4 py-2.5 text-sm`}
            >
              <MapPinIcon className="h-4 w-4" />
              Add a location
            </Link>
            <Link
              href="/settings"
              className={`${buttonSecondary} px-4 py-2.5 text-sm`}
            >
              <SettingsIcon className="h-4 w-4" />
              Organization settings
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
