import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Anchor Platforms",
    short_name: "Anchor",
    description: "Archery club management software",
    theme_color: "#22242F",
    background_color: "#22242F",
    display: "standalone",
    icons: [
      { src: "/brand/icon-gold-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-gold-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
