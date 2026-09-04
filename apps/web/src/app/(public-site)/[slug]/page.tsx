import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubSite } from "@/components/public-site/club-site";
import {
  getPublicSite,
  listPublishedSlugs,
} from "@/lib/public-site";
import { clubMetadata, clubStructuredData } from "@/lib/club-seo";

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
  return clubMetadata(data.site);
}

export default async function ClubSitePage({ params }: Params) {
  const { slug } = await params;
  const data = await getPublicSite(slug);
  if (!data) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            clubStructuredData(data.site, data.locations),
          ),
        }}
      />
      <ClubSite data={data} />
    </>
  );
}
