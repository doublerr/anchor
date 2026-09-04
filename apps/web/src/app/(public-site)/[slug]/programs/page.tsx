import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramsPage } from "@/components/public-site/programs-page";
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
    path: "/programs",
    title: place ? `Archery Programs in ${place} — ${site.name}` : `Programs — ${site.name}`,
    description: site.programs_intro?.trim() ||
      `Archery programs, classes and lessons at ${site.name}${place ? ` in ${place}` : ""}.`,
  });
}

export default async function ClubProgramsPage({ params }: Params) {
  const { slug } = await params;
  const data = await getPublicSite(slug);
  if (!data) notFound();

  return <ProgramsPage data={data} />;
}
