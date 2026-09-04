import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/public-site/about-page";
import { getPublicSite, listPublishedSlugs } from "@/lib/public-site";
import { cityRegion, clubMetadata } from "@/lib/club-seo";

export const revalidate = 3600;
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
  const place = cityRegion(site);

  return clubMetadata(site, {
    path: "/about",
    title: place ? `About ${site.name} — Archery in ${place}` : `About ${site.name}`,
    description: site.mission?.trim() ||
      site.about?.trim() ||
      `Mission, method, facilities and team at ${site.name}${place ? `, an archery club in ${place}` : ""}.`,
  });
}

export default async function ClubAboutPage({ params }: Params) {
  const { slug } = await params;
  const data = await getPublicSite(slug);
  if (!data) notFound();

  return <AboutPage data={data} />;
}
