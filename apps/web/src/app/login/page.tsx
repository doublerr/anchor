import Link from "next/link";
import { login, signup } from "./actions";
import { TargetMark } from "@/components/marketing/icons";
import { buttonPrimary, buttonSecondary } from "@/components/ui/button-styles";

export const metadata = {
  title: "Sign in · Anchor",
};

const fieldClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-muted px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <TargetMark className="h-7 w-7 text-foreground" />
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              Anchor
            </span>
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            Archery club management
          </p>
        </div>

        <form className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
          {message ? (
            <p className="rounded-md bg-aqua-100 px-3 py-2 text-sm text-aqua-700 dark:bg-aqua-400/15 dark:text-aqua-300">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-md bg-coral-100 px-3 py-2 text-sm text-coral-700 dark:bg-coral-400/15 dark:text-coral-300">
              {error}
            </p>
          ) : null}

          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Full name
            <input
              name="full_name"
              type="text"
              autoComplete="name"
              placeholder="Only needed to sign up"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className={fieldClass}
            />
          </label>

          <div className="mt-2 flex flex-col gap-2">
            <button formAction={login} className={`${buttonPrimary} px-3 py-2 text-sm`}>
              Sign in
            </button>
            <button
              formAction={signup}
              className={`${buttonSecondary} px-3 py-2 text-sm`}
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
