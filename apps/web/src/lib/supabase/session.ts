import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./config";
import { RESERVED_SLUGS } from "@/lib/slug";

/** Path prefixes reachable without a session (auth forms + callbacks). */
const PUBLIC_PATHS = ["/login", "/signup", "/auth"];

const SLUG_SEGMENT = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

/**
 * Whether `pathname` addresses a public club site (`/{slug}` or `/{slug}/…`).
 * These render without a session, so the auth gate must let them through. A
 * reserved segment (which covers every app/auth/marketing route) is never a
 * public slug; the `[slug]` route itself 404s slugs with no published org.
 */
function isPublicSitePath(pathname: string): boolean {
  const first = pathname.split("/")[1]?.toLowerCase() ?? "";
  if (!first) return false;
  if (RESERVED_SLUGS.has(first)) return false;
  return SLUG_SEGMENT.test(first);
}

/**
 * Exact paths reachable without a session: the public marketing page plus the
 * SEO / metadata endpoints crawlers must reach (robots, sitemap, llms.txt,
 * the generated web manifest, and the Open Graph share image). Without these,
 * the auth redirect would bounce every crawler to /login.
 */
const PUBLIC_EXACT_PATHS = [
  "/",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/manifest.webmanifest",
  "/opengraph-image",
];

/**
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated users to /login. Called from `proxy.ts`.
 *
 * Do not run code between creating the client and calling `getUser()` —
 * that call is what revalidates/refreshes the token.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { url, key } = supabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic =
    PUBLIC_EXACT_PATHS.includes(pathname) ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    isPublicSitePath(pathname);

  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: return `supabaseResponse` as-is so the refreshed auth cookies
  // stay in sync between the request and the browser.
  return supabaseResponse;
}
