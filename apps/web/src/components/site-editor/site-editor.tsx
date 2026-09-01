"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { fieldClass, labelClass } from "@/components/ui/field-styles";
import {
  buttonSecondary,
  buttonGhost,
} from "@/components/ui/button-styles";
import { PlusIcon, TrashIcon } from "@/components/marketing/icons";
import {
  emptyEvent,
  emptyFaq,
  emptyHighlight,
  emptyPricing,
  emptyProgram,
  emptyTestimonial,
} from "@/lib/site-content";
import { saveSite, type SiteContentPayload } from "@/app/(app)/site/actions";
import { ShareSite } from "@/components/dashboard/share-site";
import type {
  EventItem,
  Faq,
  Highlight,
  OrgTeamMember,
  PricingItem,
  Program,
  SocialLinks,
  Testimonial,
} from "@/lib/org";

/** Bucket reused for all public-site imagery (public read). */
const MEDIA_BUCKET = "org-logos";

const SOCIAL_FIELDS: [keyof SocialLinks, string][] = [
  ["facebook", "Facebook"],
  ["instagram", "Instagram"],
  ["youtube", "YouTube"],
  ["tiktok", "TikTok"],
  ["x", "X"],
];

/** Editor tabs — one per major public-site section. */
const TABS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About page" },
  { id: "team", label: "Team" },
  { id: "programs", label: "Programs" },
  { id: "schedule", label: "Schedule & pricing" },
  { id: "events", label: "Events" },
  { id: "testimonials", label: "Testimonials" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
  { id: "social", label: "Social" },
  { id: "publish", label: "Publish & share" },
] as const;

export function SiteEditor({
  orgId,
  slug,
  initial,
  teamMembers,
}: {
  orgId: string;
  slug: string;
  initial: SiteContentPayload;
  teamMembers: OrgTeamMember[];
}) {
  const [c, setC] = useState<SiteContentPayload>(initial);
  const [tab, setTab] = useState<string>(TABS[0].id);
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof SiteContentPayload>(
    key: K,
    value: SiteContentPayload[K],
  ) {
    setSaved(false);
    setC((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadImage(file: File): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${orgId}/site-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  function submit() {
    setError(undefined);
    startTransition(async () => {
      const res = await saveSite(c);
      if (res.error) {
        setError(res.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Your public page
        </h1>
        <p className="text-muted-foreground">
          Fill in as much or as little as you like — empty sections are hidden.
        </p>
      </div>

      {error ? (
        <p className="rounded-md bg-coral-100 px-3 py-2 text-sm text-coral-700 dark:bg-coral-400/15 dark:text-coral-300">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Tab rail with the Save button attached as a squared-off footer. */}
        <div className="flex flex-col md:w-56 md:shrink-0 md:self-start md:sticky md:top-4">
          <TabRail tabs={TABS} active={tab} onSelect={setTab} />
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-b-xl border border-t-0 border-border bg-gold-400 px-4 py-3 text-sm font-semibold text-ink-900 transition hover:bg-gold-300 disabled:opacity-60"
          >
            {isPending ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6">

      {tab === "home" ? (
        <>
      {/* Hero & About */}
      <Card title="Hero & about">
        <ImageField
          label="Logo"
          value={c.logo_url}
          onUpload={uploadImage}
          onChange={(v) => set("logo_url", v)}
        />
        <TextField
          label="Tagline"
          value={c.tagline}
          onChange={(v) => set("tagline", v)}
          placeholder="Now is a great time to learn archery"
        />
        <ImageField
          label="Hero image"
          value={c.hero_image_url}
          onUpload={uploadImage}
          onChange={(v) => set("hero_image_url", v)}
        />
        <TextArea
          label="About"
          value={c.about}
          onChange={(v) => set("about", v)}
          placeholder="Tell visitors about your club, coaches, and what makes it special."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Founded year"
            value={c.founded_year}
            onChange={(v) => set("founded_year", v)}
            placeholder="1995"
          />
        </div>
        <TextField
          label="Announcement banner"
          value={c.announcement}
          onChange={(v) => set("announcement", v)}
          placeholder="Summer intensives open for registration!"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Primary button label"
            value={c.cta_label}
            onChange={(v) => set("cta_label", v)}
            placeholder="Sign up today"
          />
          <TextField
            label="Primary button link"
            value={c.cta_url}
            onChange={(v) => set("cta_url", v)}
            placeholder="https://…"
          />
        </div>
      </Card>

      {/* Highlights */}
      <Card title="Highlights" description="Stat tiles shown in the About section.">
        <Rows<Highlight>
          rows={c.highlights}
          empty={emptyHighlight}
          addLabel="Add highlight"
          onChange={(rows) => set("highlights", rows)}
          render={(row, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Value"
                value={row.value}
                onChange={(v) => update({ value: v })}
                placeholder="8,000+"
              />
              <TextField
                label="Label"
                value={row.label}
                onChange={(v) => update({ label: v })}
                placeholder="archers coached"
              />
            </div>
          )}
        />
      </Card>

        </>
      ) : null}

      {tab === "about" ? (
        <>
      {/* About sub-page content */}
      <Card
        title="About page"
        description="A deeper “About us” page, linked from your home page. Your team appears here automatically."
      >
        <TextArea
          label="Mission"
          value={c.mission}
          onChange={(v) => set("mission", v)}
          placeholder="Why your club exists and what you strive for."
        />
        <TextArea
          label="Method"
          value={c.method}
          onChange={(v) => set("method", v)}
          placeholder="Your coaching approach and training philosophy."
        />
        <TextArea
          label="Facilities"
          value={c.facilities}
          onChange={(v) => set("facilities", v)}
          placeholder="Your range, equipment, and amenities."
        />
      </Card>

        </>
      ) : null}

      {tab === "team" ? (
        <>
      {/* Team — derived from members, not re-entered */}
      <Card
        title="Team"
        description="Choose which instructors and admins to feature. Archers are never shown publicly."
      >
        <TeamPicker
          members={teamMembers}
          selected={c.visible_member_ids}
          onChange={(ids) => set("visible_member_ids", ids)}
        />
      </Card>

        </>
      ) : null}

      {tab === "programs" ? (
        <>
      {/* Programs */}
      <Card
        title="Programs"
        description="Shown on your home page and a dedicated Programs page."
      >
        <TextArea
          label="Programs page intro"
          value={c.programs_intro}
          onChange={(v) => set("programs_intro", v)}
          placeholder="A short intro shown at the top of your Programs page."
        />
        <Rows<Program>
          rows={c.programs}
          empty={emptyProgram}
          addLabel="Add program"
          onChange={(rows) => set("programs", rows)}
          render={(row, update) => (
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Name"
                  value={row.name}
                  onChange={(v) => update({ name: v })}
                  placeholder="Junior Olympic Archery"
                />
                <TextField
                  label="Audience"
                  value={row.audience}
                  onChange={(v) => update({ audience: v })}
                  placeholder="Ages 8–20"
                />
              </div>
              <TextArea
                label="Description"
                value={row.blurb}
                onChange={(v) => update({ blurb: v })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Button label"
                  value={row.cta_label}
                  onChange={(v) => update({ cta_label: v })}
                  placeholder="View classes"
                />
                <TextField
                  label="Button link"
                  value={row.cta_url}
                  onChange={(v) => update({ cta_url: v })}
                />
              </div>
            </div>
          )}
        />
      </Card>

        </>
      ) : null}

      {tab === "schedule" ? (
        <>
      {/* Schedule */}
      <Card title="Schedule">
        <TextField
          label="Schedule / calendar link"
          value={c.schedule_url}
          onChange={(v) => set("schedule_url", v)}
          placeholder="https://…"
        />
      </Card>

      {/* Pricing */}
      <Card title="Pricing & fees">
        <Rows<PricingItem>
          rows={c.pricing}
          empty={emptyPricing}
          addLabel="Add price"
          onChange={(rows) => set("pricing", rows)}
          render={(row, update) => (
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Name"
                  value={row.name}
                  onChange={(v) => update({ name: v })}
                  placeholder="Drop-in lesson"
                />
                <TextField
                  label="Price"
                  value={row.price}
                  onChange={(v) => update({ price: v })}
                  placeholder="$25"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Cadence"
                  value={row.cadence}
                  onChange={(v) => update({ cadence: v })}
                  placeholder="per session"
                />
                <TextField
                  label="Note"
                  value={row.note}
                  onChange={(v) => update({ note: v })}
                  placeholder="Equipment included"
                />
              </div>
            </div>
          )}
        />
      </Card>

        </>
      ) : null}

      {tab === "events" ? (
        <>
      {/* Events */}
      <Card title="Events & clinics">
        <Rows<EventItem>
          rows={c.events}
          empty={emptyEvent}
          addLabel="Add event"
          onChange={(rows) => set("events", rows)}
          render={(row, update) => (
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Title"
                  value={row.title}
                  onChange={(v) => update({ title: v })}
                />
                <TextField
                  label="Date"
                  value={row.date}
                  onChange={(v) => update({ date: v })}
                  placeholder="Sat, Jun 14"
                />
              </div>
              <TextArea
                label="Description"
                value={row.blurb}
                onChange={(v) => update({ blurb: v })}
              />
              <TextField
                label="Link"
                value={row.url}
                onChange={(v) => update({ url: v })}
              />
            </div>
          )}
        />
      </Card>

        </>
      ) : null}

      {tab === "testimonials" ? (
        <>
      {/* Testimonials */}
      <Card title="Testimonials">
        <Rows<Testimonial>
          rows={c.testimonials}
          empty={emptyTestimonial}
          addLabel="Add testimonial"
          onChange={(rows) => set("testimonials", rows)}
          render={(row, update) => (
            <div className="flex flex-col gap-3">
              <TextArea
                label="Quote"
                value={row.quote}
                onChange={(v) => update({ quote: v })}
              />
              <TextField
                label="Author"
                value={row.author}
                onChange={(v) => update({ author: v })}
                placeholder="Parent of a JOAD archer"
              />
            </div>
          )}
        />
      </Card>

        </>
      ) : null}

      {tab === "gallery" ? (
        <>
      {/* Gallery */}
      <Card title="Gallery">
        <GalleryField
          urls={c.gallery}
          onUpload={uploadImage}
          onChange={(urls) => set("gallery", urls)}
        />
      </Card>

        </>
      ) : null}

      {tab === "faq" ? (
        <>
      {/* FAQ */}
      <Card title="FAQ">
        <Rows<Faq>
          rows={c.faqs}
          empty={emptyFaq}
          addLabel="Add question"
          onChange={(rows) => set("faqs", rows)}
          render={(row, update) => (
            <div className="flex flex-col gap-3">
              <TextField
                label="Question"
                value={row.q}
                onChange={(v) => update({ q: v })}
              />
              <TextArea
                label="Answer"
                value={row.a}
                onChange={(v) => update({ a: v })}
              />
            </div>
          )}
        />
      </Card>

        </>
      ) : null}

      {tab === "social" ? (
        <>
      {/* Social */}
      <Card title="Social links">
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIAL_FIELDS.map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              value={c.social_links[key] ?? ""}
              onChange={(v) =>
                set("social_links", { ...c.social_links, [key]: v })
              }
              placeholder="https://…"
            />
          ))}
        </div>
      </Card>

        </>
      ) : null}

      {tab === "publish" ? (
        <>
      {/* Publish */}
      <Card title="Visibility">
        <label className="flex items-center gap-3 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={c.site_published}
            onChange={(e) => set("site_published", e.target.checked)}
            className="h-4 w-4 rounded border-border text-gold-500 focus:ring-gold-400"
          />
          Publish my public page
        </label>
        <p className="text-sm text-muted-foreground">
          When off, visitors to your club URL see a not-found page.
        </p>
      </Card>

      <ShareSite slug={slug} />
        </>
      ) : null}

        </div>
      </div>
    </div>
  );
}

/* ------------------------------- primitives ------------------------------ */

/** Vertical tab rail (horizontal scroll on mobile) for switching sections. */
function TabRail({
  tabs,
  active,
  onSelect,
}: {
  tabs: readonly { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="flex w-full gap-1 overflow-x-auto rounded-t-xl border border-b-0 border-border bg-surface p-2 md:flex-col md:overflow-visible">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            aria-current={on ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
              on
                ? "bg-gold-100 text-ink-900 dark:bg-gold-400/15 dark:text-gold-100"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
        placeholder={placeholder}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={fieldClass}
        placeholder={placeholder}
      />
    </label>
  );
}

function ImageField({
  label,
  value,
  onUpload,
  onChange,
}: {
  label: string;
  value: string;
  onUpload: (file: File) => Promise<string>;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>();

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setErr(undefined);
    try {
      onChange(await onUpload(file));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={labelClass}>
      {label}
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </span>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className={`${buttonSecondary} px-3 py-2 text-sm`}
        >
          {busy ? "Uploading…" : value ? "Replace" : "Upload"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className={`${buttonGhost} px-2 py-1 text-xs`}
          >
            Remove
          </button>
        ) : null}
      </div>
      {err ? (
        <span className="text-xs font-normal text-coral-600 dark:text-coral-400">
          {err}
        </span>
      ) : null}
    </div>
  );
}

function GalleryField({
  urls,
  onUpload,
  onChange,
}: {
  urls: string[];
  onUpload: (file: File) => Promise<string>;
  onChange: (urls: string[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function add(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await onUpload(file));
      }
      onChange([...urls, ...uploaded]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {urls.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((src, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="aspect-square w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(urls.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded-full bg-ink-900/70 p-1 text-white"
                aria-label="Remove image"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => add(e.target.files)}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className={`${buttonSecondary} justify-center px-4 py-2 text-sm`}
      >
        <PlusIcon className="h-4 w-4" />
        {busy ? "Uploading…" : "Add photos"}
      </button>
    </div>
  );
}

/** Generic add/remove list for a repeating content section. */
function Rows<T>({
  rows,
  empty,
  addLabel,
  onChange,
  render,
}: {
  rows: T[];
  empty: () => T;
  addLabel: string;
  onChange: (rows: T[]) => void;
  render: (row: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              #{i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
              className={`${buttonGhost} px-2 py-1 text-xs`}
            >
              Remove
            </button>
          </div>
          {render(row, (patch) =>
            onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r))),
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, empty()])}
        className={`${buttonSecondary} justify-center px-4 py-2 text-sm`}
      >
        <PlusIcon className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}

const TEAM_ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  instructor: "Instructor",
};

/** Checkbox list of eligible members (admins/instructors) to feature publicly. */
function TeamPicker({
  members,
  selected,
  onChange,
}: {
  members: OrgTeamMember[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No instructors or admins yet. Add them from the Members page to feature
        them here.
      </p>
    );
  }
  const toggle = (id: string, on: boolean) =>
    onChange(on ? [...selected, id] : selected.filter((x) => x !== id));

  return (
    <ul className="flex flex-col gap-2">
      {members.map((m) => (
        <li key={m.id}>
          <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
            <input
              type="checkbox"
              checked={selected.includes(m.id)}
              onChange={(e) => toggle(m.id, e.target.checked)}
              className="h-4 w-4 rounded border-border text-gold-500 focus:ring-gold-400"
            />
            {m.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {m.full_name?.trim()?.[0]?.toUpperCase() ?? "?"}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-foreground">
                {m.full_name ?? "Unnamed member"}
              </span>
              <span className="block text-xs text-muted-foreground">
                {TEAM_ROLE_LABEL[m.member_role] ?? m.member_role}
              </span>
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
