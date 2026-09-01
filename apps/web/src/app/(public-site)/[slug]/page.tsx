import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubSite } from "@/components/public-site/club-site";
import {
  getPublicSite,
  listPublishedSlugs,
} from "@/lib/public-site";

// Statically rendered per club, revalidated hourly; the site editor's saveSite
// action also revalidates a club's path on demand so edits go live immediately.
export const revalidate = 3600;
// Allow slugs created after build to be rendered on first request.
export const dynamicParams = true;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicSite(slug);
  if (!data) return { title: "Not found" };

  const { site } = data;
  const description =
    site.tagline ||
    site.description ||
    `${site.name} — archery club. Programs, schedule, and how to join.`;

  return {
    // Root layout applies the "%s · Anchor" title template.
    title: site.name,
    description,
    openGraph: {
      title: site.name,
      description,
      images: site.hero_image_url
        ? [site.hero_image_url]
        : site.logo_url
          ? [site.logo_url]
          : undefined,
    },
  };
}

export default async function ClubSitePage({ params }: Params) {
  const { slug } = await params;
  const data = await getPublicSite(slug);
  if (!data) notFound();

  return (
    <ClubSite
      site={data.site}
      locations={data.locations}
      team={data.team}
    />
  );
}
