"use client";

import { useState, useSyncExternalStore } from "react";
import { buttonSecondary } from "@/components/ui/button-styles";
import { CopyIcon, CheckIcon, ExternalLinkIcon } from "@/components/marketing/icons";
import { SITE_URL } from "@/lib/site";

const noopSubscribe = () => () => {};

/**
 * The origin to build shareable links from: the browser's current origin on the
 * client (so dev → localhost, preview → the preview host, prod → the real
 * domain), and the production URL on the server. `useSyncExternalStore` reads
 * each snapshot from the right side without a hydration mismatch.
 */
function useAppOrigin(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => SITE_URL,
  );
}

/**
 * Surfaces a club's public URL plus copy-paste snippets the admin can embed on
 * their *existing* website: a member sign-in button and a link to their Anchor
 * page. All URLs are composed from the current app origin + slug, so links open
 * against whatever environment you're on (localhost in dev) and never drift.
 */
export function ShareSite({ slug }: { slug: string }) {
  const origin = useAppOrigin();
  const publicUrl = `${origin}/${slug}`;
  const loginUrl = `${origin}/login`;
  // Pretty host (no scheme) for display, e.g. "localhost:3210" or the domain.
  const displayHost = origin.replace(/^https?:\/\//, "");

  const loginButton = `<a href="${loginUrl}" style="display:inline-block;padding:12px 22px;background:#FFD257;color:#1B1B1F;font-family:system-ui,sans-serif;font-size:15px;font-weight:600;border-radius:8px;text-decoration:none;">Member Login</a>`;
  const siteLink = `<a href="${publicUrl}" style="display:inline-block;padding:12px 22px;background:#FFD257;color:#1B1B1F;font-family:system-ui,sans-serif;font-size:15px;font-weight:600;border-radius:8px;text-decoration:none;">Our Club Page</a>`;

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Share your page
        </h2>
        <p className="text-sm text-muted-foreground">
          Your public club page is live at the address below.
        </p>
      </div>

      {/* Live URL */}
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
          {displayHost}/{slug}
        </code>
        <CopyButton text={publicUrl} label="Copy link" />
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className={`${buttonSecondary} px-3 py-2 text-sm`}
        >
          <ExternalLinkIcon className="h-4 w-4" />
          Open
        </a>
      </div>

      {/* Embeddable snippets */}
      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-foreground">
          Already have a website?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste one of these snippets where you want the button to appear.
        </p>

        <Snippet
          title="Member sign-in button"
          preview={
            <PreviewButton href={loginUrl}>Member Login</PreviewButton>
          }
          code={loginButton}
        />
        <Snippet
          title="Link to your Anchor page"
          preview={
            <PreviewButton href={publicUrl}>Our Club Page</PreviewButton>
          }
          code={siteLink}
        />
      </div>
    </section>
  );
}

function Snippet({
  title,
  preview,
  code,
}: {
  title: string;
  preview: React.ReactNode;
  code: string;
}) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <CopyButton text={code} label="Copy code" />
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
        {preview}
      </div>
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Static, non-navigating preview of the embeddable button. */
function PreviewButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-block rounded-lg bg-gold-400 px-5 py-2.5 text-sm font-semibold text-ink-900 no-underline"
    >
      {children}
    </a>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure context / permissions) — no-op.
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`${buttonSecondary} px-3 py-2 text-sm`}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
