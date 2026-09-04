import Image from "next/image";
import { TargetMark } from "@/components/marketing/icons";
import { Section } from "@/components/public-site/ui/section";
import { ROLE_LABELS } from "@/components/public-site/lib";
import type { PublicTeamMember } from "@/lib/public-site";

/** First initial of a name, for the avatar fallback. */
function initial(name: string | null): string {
  return name?.trim()?.[0]?.toUpperCase() ?? "";
}

/**
 * The team grid, reused on the home page and the About page. Portraits are large
 * and square-ish rather than small circles — for a club, the people are a
 * substantial part of what a visitor is deciding about.
 */
export function TeamGrid({ team }: { team: PublicTeamMember[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {team.map((m) => (
        <figure key={m.profile_id} className="group">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
            {m.avatar_url ? (
              <Image
                src={m.avatar_url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center bg-club-accent-soft text-4xl font-semibold text-club-accent-text">
                {initial(m.full_name) || (
                  <TargetMark className="h-12 w-12 opacity-50" />
                )}
              </span>
            )}
          </div>
          <figcaption className="mt-4">
            <span className="block font-semibold text-foreground">
              {m.full_name ?? "Team member"}
            </span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              {ROLE_LABELS[m.member_role]}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function Team({ team }: { team: PublicTeamMember[] }) {
  if (team.length === 0) return null;
  return (
    <Section
      id="team"
      tone="muted"
      width="wide"
      eyebrow="Who you'll meet"
      title="Our team"
    >
      <TeamGrid team={team} />
    </Section>
  );
}
