import Link from "next/link";
import { TargetMark } from "@/components/marketing/icons";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Create your organization · Anchor",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
          <h1 className="mt-4 text-lg font-semibold text-foreground">
            Set up your organization
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an account to manage your archery club. You&rsquo;ll be its
            admin.
          </p>
        </div>

        <SignupForm error={error} />
      </div>
    </div>
  );
}
