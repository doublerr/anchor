import type { SVGProps } from "react";

/**
 * Anchor's brand mark: an archery target seen head-on. Rings use
 * `currentColor` so it inherits text color, with the gold center called out.
 */
export function TargetMark({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.5" className="fill-gold-400" />
    </svg>
  );
}

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function ScoreIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 19v-5" />
      <path d="M12 19v-9" />
      <path d="M16 19v-7" />
      <path d="M20 19V8" />
    </svg>
  );
}

export function MembersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.9" />
      <path d="M15.5 14.2A5.5 5.5 0 0 1 20.5 19" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3.5v3" />
      <path d="M16 3.5v3" />
      <path d="M8 13h2" />
      <path d="M14 13h2" />
      <path d="M8 16.5h2" />
    </svg>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5a2.5 2.5 0 0 0 3 2.4" />
      <path d="M17 6h2.5a2.5 2.5 0 0 1-3 2.4" />
      <path d="M12 13v3" />
      <path d="M9 20h6" />
      <path d="M10 20a2 2 0 0 1 4 0" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function BowIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 3a11 11 0 0 1 0 18" />
      <path d="M5 3l14 14" />
      <path d="M5 21l14-14" />
      <path d="M17 3h4v4" />
      <path d="M14 6l7-3" />
    </svg>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M7 14.5h4" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5l4.5 4.5L19 6.5" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
