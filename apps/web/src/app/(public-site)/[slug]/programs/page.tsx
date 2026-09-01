import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramsPage } from "@/components/public-site/programs-page";
import { getPublicSite, listPublishedSlugs } from "@/lib/public-site";

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
  const description =
    site.programs_intro?.trim() ||
    `Programs and classes at ${site.name}.`;

  return {
    title: `Programs · ${site.name}`,
    description,
    openGraph: {
      title: `Programs · ${site.name}`,
      description,
      images: site.hero_image_url
        ? [site.hero_image_url]
        : site.logo_url
          ? [site.logo_url]
          : undefined,
    },
  };
}

export default async function ClubProgramsPage({ params }: Params) {
  const { slug } = await params;
  const data = await getPublicSite(slug);
  if (!data) notFound();

  return <ProgramsPage data={data} />;
}
