"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { fieldClass, labelClass } from "@/components/ui/field-styles";
import { buttonPrimary, buttonSecondary, buttonGhost } from "@/components/ui/button-styles";
import { TargetMark, PlusIcon, CheckIcon, LockIcon } from "@/components/marketing/icons";
import {
  completeOnboarding,
  type LocationInput,
  type OnboardingPayload,
} from "@/app/onboarding/actions";
import type { UrlType } from "@/lib/org";
import {
  slugify,
  validateSlug,
  validateOrgName,
  ORG_NAME_MAX,
  SLUG_MAX,
} from "@/lib/slug";
import { CLUB_URL_DOMAIN } from "@/lib/site";
import { AddressAutocomplete } from "@/components/onboarding/address-autocomplete";

type CoreFields = {
  name: string;
  slug: string;
  url_type: UrlType;
  description: string;
  website: string;
  logo_url: string;
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  contact_name: string;
  contact_title: string;
  timezone: string;
  currency: string;
  google_maps_url: string;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string;
};

const STEPS = ["Basics", "Contact", "Details", "Locations", "Review"] as const;

const CURRENCIES = ["USD", "CAD", "EUR", "GBP", "AUD", "NZD"];

function emptyLocation(): LocationInput {
  return {
    name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    region: "",
    postal_code: "",
    country: "",
    special_instructions: "",
    google_maps_url: "",
    latitude: null,
    longitude: null,
    google_place_id: "",
  };
}

export function OnboardingWizard({
  initial,
  orgId,
}: {
  initial: CoreFields;
  orgId: string;
}) {
  const [step, setStep] = useState(0);
  const [fields, setFields] = useState<CoreFields>({
    ...initial,
    timezone:
      initial.timezone ||
      (typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : ""),
  });
  const [locations, setLocations] = useState<LocationInput[]>([]);
  const [error, setError] = useState<string>();
  const [uploading, setUploading] = useState(false);
  // Once the user hand-edits the slug we stop auto-deriving it from the name.
  const [slugTouched, setSlugTouched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const timezones = useMemo<string[]>(() => {
    try {
      // Supported in modern browsers; fall back to just the detected zone.
      return (
        Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
      ).supportedValuesOf?.("timeZone") ?? [fields.timezone].filter(Boolean);
    } catch {
      return [fields.timezone].filter(Boolean);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set<K extends keyof CoreFields>(key: K, value: CoreFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  // Editing the name auto-fills the slug until the user takes it over.
  function onNameChange(value: string) {
    setFields((f) => ({
      ...f,
      name: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  // Normalize slug keystrokes toward valid characters as the user types.
  function onSlugChange(value: string) {
    setSlugTouched(true);
    set(
      "slug",
      value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
    );
  }

  function updateLocation(i: number, patch: Partial<LocationInput>) {
    setLocations((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function removeLocation(i: number) {
    setLocations((ls) => ls.filter((_, idx) => idx !== i));
  }

  // A location carries content worth keeping if it has an address or a link.
  function locationHasContent(l: LocationInput): boolean {
    return Boolean(
      l.address_line1.trim() ||
        l.city.trim() ||
        l.google_maps_url.trim() ||
        l.special_instructions.trim(),
    );
  }

  // Per-step required-field validation; returns an error message or undefined.
  function validateStep(s: number): string | undefined {
    if (s === 0) {
      if (!fields.name.trim()) return "Organization name is required.";
      const nameErr = validateOrgName(fields.name);
      if (nameErr) return nameErr;
      const slugErr = validateSlug(fields.slug.trim());
      if (slugErr) return slugErr;
      if (fields.url_type === "existing" && !fields.website.trim())
        return "Enter your existing website URL, or choose an Anchor URL.";
    }
    if (s === 1) {
      if (!fields.contact_name.trim()) return "Contact name is required.";
      if (!fields.phone.trim()) return "A contact phone number is required.";
    }
    if (s === 3) {
      // The primary location fills the org's address; it's required.
      const required: [keyof CoreFields, string][] = [
        ["address_line1", "Street address"],
        ["city", "City"],
        ["region", "State / region"],
        ["postal_code", "Postal code"],
        ["country", "Country"],
      ];
      const missing = required.filter(([k]) => !String(fields[k] ?? "").trim());
      if (missing.length > 0)
        return `Primary location — required: ${missing.map(([, l]) => l).join(", ")}.`;
      // Additional locations with content each need a name.
      const unnamed = locations.some(
        (l) => !l.name.trim() && locationHasContent(l),
      );
      if (unnamed)
        return "Give each additional location a name, or remove it.";
    }
    return undefined;
  }

  function next() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(undefined);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(undefined);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onLogoChange(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(undefined);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const path = `${orgId}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("org-logos")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("org-logos").getPublicUrl(path);
      set("logo_url", data.publicUrl);
    } catch (e) {
      setError(
        `Logo upload failed: ${e instanceof Error ? e.message : "unknown error"}`,
      );
    } finally {
      setUploading(false);
    }
  }

  function submit() {
    setError(undefined);
    const payload: OnboardingPayload = {
      ...fields,
      locations: locations.filter((l) => l.name.trim()),
    };
    startTransition(async () => {
      const res = await completeOnboarding(payload);
      // On success the action redirects; only errors return a value.
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <TargetMark className="h-8 w-8 text-foreground" />
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Anchor
        </span>
      </div>

      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? "bg-gold-400 text-ink-900"
                    : done
                      ? "bg-gold-100 text-ink-900 dark:bg-gold-400/20 dark:text-gold-100"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <span className="h-px flex-1 bg-border" />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        {error ? (
          <p className="mb-4 rounded-md bg-coral-100 px-3 py-2 text-sm text-coral-700 dark:bg-coral-400/15 dark:text-coral-300">
            {error}
          </p>
        ) : null}

        {step === 0 ? (
          <StepBasics
            fields={fields}
            set={set}
            onNameChange={onNameChange}
            onSlugChange={onSlugChange}
            uploading={uploading}
            fileRef={fileRef}
            onLogoChange={onLogoChange}
          />
        ) : null}
        {step === 1 ? <StepContact fields={fields} set={set} /> : null}
        {step === 2 ? (
          <StepDetails fields={fields} set={set} timezones={timezones} />
        ) : null}
        {step === 3 ? (
          <StepLocations
            fields={fields}
            set={set}
            onPrimaryChange={(patch) => setFields((f) => ({ ...f, ...patch }))}
            locations={locations}
            addLocation={() =>
              setLocations((ls) => [...ls, emptyLocation()])
            }
            removeLocation={removeLocation}
            updateLocation={updateLocation}
          />
        ) : null}
        {step === 4 ? (
          <StepReview fields={fields} locations={locations} />
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || isPending}
            className={`${buttonGhost} px-3 py-2 text-sm ${step === 0 ? "invisible" : ""}`}
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className={`${buttonPrimary} px-5 py-2 text-sm`}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={isPending}
              className={`${buttonPrimary} px-5 py-2 text-sm`}
            >
              {isPending ? "Finishing…" : "Finish setup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Steps --------------------------------- */

type SetFn = <K extends keyof CoreFields>(k: K, v: CoreFields[K]) => void;

function StepBasics({
  fields,
  set,
  onNameChange,
  onSlugChange,
  uploading,
  fileRef,
  onLogoChange,
}: {
  fields: CoreFields;
  set: SetFn;
  onNameChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  uploading: boolean;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onLogoChange: (file: File | undefined) => void;
}) {
  const slug = fields.slug.trim();
  const slugError = slug ? validateSlug(slug) : null;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Organization basics
        </h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your club. You can change any of this later.
        </p>
      </div>

      <label className={labelClass}>
        Organization name
        <input
          value={fields.name}
          onChange={(e) => onNameChange(e.target.value)}
          maxLength={ORG_NAME_MAX}
          className={fieldClass}
          placeholder="Riverside Archery Club"
        />
      </label>

      <ClubUrlTabs
        fields={fields}
        set={set}
        onSlugChange={onSlugChange}
        slugError={slugError}
      />

      <label className={labelClass}>
        Description{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
        <textarea
          value={fields.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={fieldClass}
          placeholder="A community archery club for all ages and skill levels."
        />
      </label>

      <div className={labelClass}>
        Logo{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {fields.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fields.logo_url}
                alt="Logo preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <TargetMark className="h-8 w-8 text-muted-foreground" />
            )}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onLogoChange(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`${buttonSecondary} px-3 py-2 text-sm`}
          >
            {uploading ? "Uploading…" : fields.logo_url ? "Replace" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

type UrlTab = {
  id: UrlType;
  label: string;
  locked?: boolean;
};

const URL_TABS: UrlTab[] = [
  { id: "anchor_path", label: "Anchor URL" },
  { id: "anchor_subdomain", label: "Anchor Subdomain", locked: true },
  { id: "existing", label: "Existing URL" },
];

/**
 * The "Club URL" chooser: a tabbed control over how the club's public page is
 * reached. Anchor URL (path) is the default; Anchor Subdomain is a locked paid
 * feature; Existing URL points at the club's own website. The selection is
 * persisted as `url_type`; the slug always exists and lives under the first tab.
 */
function ClubUrlTabs({
  fields,
  set,
  onSlugChange,
  slugError,
}: {
  fields: CoreFields;
  set: SetFn;
  onSlugChange: (value: string) => void;
  slugError: string | null;
}) {
  const active = fields.url_type;
  return (
    <div className={labelClass}>
      Club URL
      <div
        role="tablist"
        aria-label="Club URL type"
        className="flex flex-wrap gap-1 rounded-md bg-muted p-1"
      >
        {URL_TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={tab.locked}
              onClick={() => !tab.locked && set("url_type", tab.id)}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition ${
                selected
                  ? "bg-surface text-foreground shadow-sm"
                  : tab.locked
                    ? "cursor-not-allowed text-muted-foreground/70"
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.locked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-900 dark:bg-gold-400/20 dark:text-gold-100">
                  <LockIcon className="h-3 w-3" />
                  Pro
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="pt-1">
        {active === "anchor_path" ? (
          <>
            <div className="flex items-center overflow-hidden rounded-md border border-border bg-background focus-within:border-gold-400 focus-within:ring-2 focus-within:ring-gold-400/30">
              <span className="select-none border-r border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                {CLUB_URL_DOMAIN}/
              </span>
              <input
                value={fields.slug}
                onChange={(e) => onSlugChange(e.target.value)}
                maxLength={SLUG_MAX}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none"
                placeholder="riverside-archery-club"
                aria-invalid={slugError ? true : undefined}
              />
            </div>
            {slugError ? (
              <span className="mt-1 block text-xs font-normal text-coral-600 dark:text-coral-400">
                {slugError}
              </span>
            ) : (
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                Your club&rsquo;s free web address. Lowercase letters, numbers,
                and hyphens.
              </span>
            )}
          </>
        ) : null}

        {active === "existing" ? (
          <>
            <input
              value={fields.website}
              onChange={(e) => set("website", e.target.value)}
              className={fieldClass}
              placeholder="https://your-club.com"
              type="url"
            />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              Point members to a website you already run.
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}

const ROLE_OPTIONS = ["Owner", "Head Instructor", "Club Administrator"];

function StepContact({ fields, set }: { fields: CoreFields; set: SetFn }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Primary contact
        </h2>
        <p className="text-sm text-muted-foreground">
          The owner or head instructor members should reach out to.
        </p>
      </div>

      <label className={labelClass}>
        Name
        <input
          value={fields.contact_name}
          onChange={(e) => set("contact_name", e.target.value)}
          className={fieldClass}
          autoComplete="name"
          placeholder="Alex Morgan"
        />
      </label>

      <label className={labelClass}>
        Role{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
        <select
          value={fields.contact_title}
          onChange={(e) => set("contact_title", e.target.value)}
          className={fieldClass}
        >
          <option value="">Select a role…</option>
          {/* Preserve any custom role already saved that isn't in the list. */}
          {fields.contact_title &&
          !ROLE_OPTIONS.includes(fields.contact_title) ? (
            <option value={fields.contact_title}>{fields.contact_title}</option>
          ) : null}
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Phone
        <input
          value={fields.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={fieldClass}
          type="tel"
          autoComplete="tel"
        />
      </label>

      <label className={labelClass}>
        Email{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
        <input
          value={fields.email}
          onChange={(e) => set("email", e.target.value)}
          className={fieldClass}
          type="email"
          autoComplete="email"
        />
      </label>
    </div>
  );
}

function StepDetails({
  fields,
  set,
  timezones,
}: {
  fields: CoreFields;
  set: SetFn;
  timezones: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Club details
        </h2>
        <p className="text-sm text-muted-foreground">
          Your timezone and currency. Hours live on each site&rsquo;s Google
          Maps link.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Timezone
          <select
            value={fields.timezone}
            onChange={(e) => set("timezone", e.target.value)}
            className={fieldClass}
          >
            {!timezones.includes(fields.timezone) && fields.timezone ? (
              <option value={fields.timezone}>{fields.timezone}</option>
            ) : null}
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Currency
          <select
            value={fields.currency}
            onChange={(e) => set("currency", e.target.value)}
            className={fieldClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function StepLocations({
  fields,
  set,
  onPrimaryChange,
  locations,
  addLocation,
  removeLocation,
  updateLocation,
}: {
  fields: CoreFields;
  set: SetFn;
  onPrimaryChange: (patch: Partial<CoreFields>) => void;
  locations: LocationInput[];
  addLocation: () => void;
  removeLocation: (i: number) => void;
  updateLocation: (i: number, patch: Partial<LocationInput>) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Primary location
          </h2>
          <p className="text-sm text-muted-foreground">
            Your club&rsquo;s main address. Search for it to drop a pin.
          </p>
        </div>

        <AddressAutocomplete
          value={fields}
          onChange={onPrimaryChange}
          idPrefix="org"
        />

        <label className={labelClass}>
          Google Maps link{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
          <input
            value={fields.google_maps_url}
            onChange={(e) => set("google_maps_url", e.target.value)}
            className={fieldClass}
            type="url"
            placeholder="https://maps.app.goo.gl/…"
          />
          <span className="text-xs font-normal text-muted-foreground">
            We link members here for hours and directions to your primary site.
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Additional locations
          </h2>
          <p className="text-sm text-muted-foreground">
            Other ranges or venues beyond your primary site. Add as many as you
            like, or skip this.
          </p>
        </div>

      {locations.map((loc, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Location {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeLocation(i)}
              className={`${buttonGhost} px-2 py-1 text-xs`}
            >
              Remove
            </button>
          </div>
          <label className={labelClass}>
            Name
            <input
              value={loc.name}
              onChange={(e) => updateLocation(i, { name: e.target.value })}
              className={fieldClass}
              placeholder="North Field Range"
            />
          </label>
          <AddressAutocomplete
            value={loc}
            onChange={(patch) => updateLocation(i, patch)}
            idPrefix={`loc-${i}`}
          />
          <label className={labelClass}>
            Google Maps link{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
            <input
              value={loc.google_maps_url}
              onChange={(e) =>
                updateLocation(i, { google_maps_url: e.target.value })
              }
              className={fieldClass}
              type="url"
              placeholder="https://maps.app.goo.gl/…"
            />
            <span className="text-xs font-normal text-muted-foreground">
              Members tap through for this site&rsquo;s hours and directions.
            </span>
          </label>
          <label className={labelClass}>
            Special instructions to get there{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
            <textarea
              value={loc.special_instructions}
              onChange={(e) =>
                updateLocation(i, { special_instructions: e.target.value })
              }
              rows={2}
              className={fieldClass}
              placeholder="Park in the gravel lot and follow the path past the barn."
            />
          </label>
        </div>
      ))}

        <button
          type="button"
          onClick={addLocation}
          className={`${buttonSecondary} justify-center px-4 py-2 text-sm`}
        >
          <PlusIcon className="h-4 w-4" />
          Add a location
        </button>
      </div>
    </div>
  );
}

function StepReview({
  fields,
  locations,
}: {
  fields: CoreFields;
  locations: LocationInput[];
}) {
  const named = locations.filter((l) => l.name.trim());
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Review &amp; finish
        </h2>
        <p className="text-sm text-muted-foreground">
          Confirm everything looks right, then finish setup.
        </p>
      </div>

      <dl className="grid gap-4 rounded-lg border border-border bg-background p-4 text-sm sm:grid-cols-2">
        <Item label="Organization" value={fields.name} />
        <Item
          label="Club URL"
          value={
            fields.url_type === "existing"
              ? fields.website || "—"
              : `${CLUB_URL_DOMAIN}/${fields.slug}`
          }
        />
        <Item
          label="Contact"
          value={
            fields.contact_name
              ? fields.contact_title
                ? `${fields.contact_name} · ${fields.contact_title}`
                : fields.contact_name
              : "—"
          }
        />
        <Item label="Phone" value={fields.phone} />
        <Item label="Email" value={fields.email || "—"} />
        <Item
          label="Primary location"
          value={[
            fields.address_line1,
            fields.city,
            fields.region,
            fields.postal_code,
            fields.country,
          ]
            .filter(Boolean)
            .join(", ")}
        />
        <Item label="Timezone" value={fields.timezone || "—"} />
        <Item label="Currency" value={fields.currency || "—"} />
        <Item
          label="Hours & directions"
          value={fields.google_maps_url ? "Google Maps link added" : "Not set"}
        />
        <Item
          label="Locations"
          value={named.length ? named.map((l) => l.name).join(", ") : "None"}
        />
      </dl>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-foreground">
        {value || "—"}
      </dd>
    </div>
  );
}
