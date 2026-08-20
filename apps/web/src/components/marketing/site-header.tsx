import Link from "next/link";
import { TargetMark } from "./icons";
import { InterestForm } from "./interest-form";
import { buttonPrimary, buttonSecondary } from "@/components/ui/button-styles";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#workflow", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

export function SiteHeader({
  signedIn,
  authEnabled = false,
}: {
  signedIn: boolean;
  authEnabled?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <TargetMark className="h-6 w-6 text-foreground" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Anchor
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <Link href="/dashboard" className={`${buttonPrimary} px-4 py-2 text-sm`}>
              Dashboard
            </Link>
          ) : (
            <>
              {authEnabled ? (
                <>
                  <Link
                    href="/login"
                    className="hidden text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline"
                  >
                    Sign in
                  </Link>
                  <Link href="/login" className={`${buttonPrimary} px-4 py-2 text-sm`}>
                    Get started
                  </Link>
                </>
              ) : null}
              <InterestForm
                className={`${
                  authEnabled ? buttonSecondary : buttonPrimary
                } px-4 py-2 text-sm`}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
