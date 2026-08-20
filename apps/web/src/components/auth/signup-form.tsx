import Link from "next/link";
import { signup } from "@/app/(marketing)/signup/actions";
import { buttonPrimary } from "@/components/ui/button-styles";

const fieldClass =
  "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30";

const labelClass = "flex flex-col gap-1 text-sm font-medium text-foreground";

/**
 * Organization onboarding form. The signer creates their organization and
 * becomes its admin. Email-primary; phone optional. Archer / parent signups
 * are a separate, later team-specific flow.
 */
export function SignupForm({ error }: { error?: string }) {
  return (
    <form
      action={signup}
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm"
    >
      {error ? (
        <p className="rounded-md bg-coral-100 px-3 py-2 text-sm text-coral-700 dark:bg-coral-400/15 dark:text-coral-300">
          {error}
        </p>
      ) : null}

      <label className={labelClass}>
        Organization name
        <input
          name="organization_name"
          type="text"
          required
          placeholder="e.g. Riverside Archery Club"
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Your name
        <input
          name="full_name"
          type="text"
          required
          autoComplete="name"
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Phone <span className="font-normal text-muted-foreground">(optional)</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 123 4567"
          className={fieldClass}
        />
      </label>

      <label className={labelClass}>
        Password
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={fieldClass}
        />
      </label>

      <button className={`${buttonPrimary} mt-2 px-3 py-2 text-sm`}>
        Create organization
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
