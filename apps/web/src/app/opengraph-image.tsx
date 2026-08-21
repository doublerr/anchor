import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

// Auto-wired by Next as the Open Graph / Twitter share image for every route.
// Uses the real Anchor brand mark (the multi-color "target" icon) over ink, so
// the card is on-brand with no external assets and never 404s.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#16171e";
const GOLD = "#ffd257";

// The brand mark shipped in public/brand, read at render time and embedded as
// a data URI. The "target" variant (aqua/coral/gold rings + gold A) reads on
// dark.
async function markDataUri() {
  const svg = await readFile(
    join(process.cwd(), "public/brand/icon-target.svg"),
    "utf8",
  );
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default async function Image() {
  const mark = await markDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: 80,
          fontFamily: "sans-serif",
          color: "#f3f3f3",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} width={220} height={220} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, fontWeight: 700, color: GOLD }}>{SITE_NAME}</div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              marginTop: 16,
              maxWidth: 820,
            }}
          >
            Run your archery club without the busywork.
          </div>
          <div style={{ fontSize: 30, color: "#9195a5", marginTop: 28 }}>
            {SITE_TAGLINE}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
