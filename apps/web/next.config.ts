import type { NextConfig } from "next";

/**
 * Club-site imagery (logos, heroes, galleries, program and event photos) is
 * uploaded to Supabase Storage, so `next/image` needs that origin allow-listed.
 * Derived from the project URL rather than hardcoded, so preview and local
 * stacks work without touching this file.
 */
function supabaseImagePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const { protocol, hostname, port } = new URL(url);
    return [
      {
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePattern(),
  },
};

export default nextConfig;
