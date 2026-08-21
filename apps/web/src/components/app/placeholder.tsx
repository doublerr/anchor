import type { SVGProps } from "react";

/**
 * Stand-in for portal sections that aren't built yet, so the sidebar / quick
 * actions link somewhere real instead of 404-ing.
 */
export function Placeholder({
  title,
  description,
  Icon,
}: {
  title: string;
  description: string;
  Icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span className="rounded-xl bg-muted p-3 text-muted-foreground">
        <Icon className="h-8 w-8" />
      </span>
      <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <span className="mt-4 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Coming soon
      </span>
    </div>
  );
}
