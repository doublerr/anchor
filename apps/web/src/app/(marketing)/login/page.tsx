import Link from "next/link";
import { login } from "./actions";
import { buttonPrimary } from "@/components/ui/button-styles";

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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your Anchor account
          </p>
        </div>

        <form
          action={login}
          className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm"
        >
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

          <button
            type="submit"
            className={`${buttonPrimary} mt-2 px-3 py-2 text-sm`}
          >
            Sign in
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Setting up a club?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline"
            >
              Create an organization
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
