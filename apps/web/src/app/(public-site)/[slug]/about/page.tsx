import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/public-site/about-page";
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
    site.mission?.trim() ||
    site.about?.trim() ||
    `About ${site.name} — mission, method, facilities, and team.`;

  return {
    title: `About · ${site.name}`,
    description,
    openGraph: {
      title: `About ${site.name}`,
      description,
      images: site.hero_image_url
        ? [site.hero_image_url]
        : site.logo_url
          ? [site.logo_url]
          : undefined,
    },
  };
}

export default async function ClubAboutPage({ params }: Params) {
  const { slug } = await params;
  const data = await getPublicSite(slug);
  if (!data) notFound();

  return <AboutPage data={data} />;
}
