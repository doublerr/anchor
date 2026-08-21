"use client";

import { useEffect, useRef, useState } from "react";
import { fieldClass, labelClass } from "@/components/ui/field-styles";
import { buttonGhost } from "@/components/ui/button-styles";
import {
  importMapsLibrary,
  GOOGLE_MAPS_API_KEY,
  GOOGLE_MAPS_MAP_ID,
  placeToAddress,
} from "@/lib/maps";

/** The address + geo fields this control reads and writes. */
export type AddressFields = {
  address_line1: string;
  address_line2: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string;
  google_maps_url: string;
};

/** Minimal shapes for the Places objects we touch (kept loose but not `any`). */
type PlaceLike = Parameters<typeof placeToAddress>[0] & {
  fetchFields: (opts: { fields: string[] }) => Promise<unknown>;
};
type SelectEvent = { placePrediction: { toPlace: () => PlaceLike } };

const hasKey = Boolean(GOOGLE_MAPS_API_KEY);

/**
 * Address input that defaults to Google Places autocomplete with a live map
 * preview, and falls back to plain manual fields (via a toggle, or
 * automatically when no API key is configured). On selection it fills the
 * structured address, coordinates, place id, and a Google Maps link.
 */
export function AddressAutocomplete({
  value,
  onChange,
  idPrefix,
}: {
  value: AddressFields;
  onChange: (patch: Partial<AddressFields>) => void;
  idPrefix: string;
}) {
  const [manual, setManual] = useState(!hasKey);
  const [loadError, setLoadError] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<google.maps.Map | null>(null);
  const markerObj = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  );
  // Keep the latest onChange without re-running the mount effect.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const hasAddress = Boolean(
    value.address_line1 || value.city || value.postal_code,
  );
  const showFields = manual || hasAddress;
  const showAutocomplete = hasKey && !manual && !loadError;

  // Mount the Places autocomplete element.
  useEffect(() => {
    if (!showAutocomplete) return;
    const host = hostRef.current;
    if (!host) return;

    let el: HTMLElement | null = null;
    let cancelled = false;

    async function init() {
      try {
        const places = await importMapsLibrary("places");
        if (cancelled || !host || !places) return;
        const element =
          new places.PlaceAutocompleteElement() as unknown as HTMLElement;
        element.style.width = "100%";
        element.addEventListener("gmp-select", async (event: Event) => {
          try {
            const place = (event as unknown as SelectEvent).placePrediction.toPlace();
            await place.fetchFields({
              fields: ["addressComponents", "location", "id", "formattedAddress"],
            });
            onChangeRef.current(placeToAddress(place));
          } catch {
            setLoadError(true);
          }
        });
        host.innerHTML = "";
        host.appendChild(element);
        el = element;
      } catch {
        if (!cancelled) setLoadError(true);
      }
    }

    void init();
    return () => {
      cancelled = true;
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };
  }, [showAutocomplete]);

  // Render / update the map preview whenever coordinates change.
  useEffect(() => {
    const el = mapRef.current;
    if (!el || value.latitude == null || value.longitude == null) {
      return;
    }
    const position = { lat: value.latitude, lng: value.longitude };
    let cancelled = false;

    async function render() {
      try {
        const [maps, markerLib] = await Promise.all([
          importMapsLibrary("maps"),
          importMapsLibrary("marker"),
        ]);
        if (cancelled || !el || !maps || !markerLib) return;
        if (!mapObj.current) {
          mapObj.current = new maps.Map(el, {
            center: position,
            zoom: 15,
            disableDefaultUI: true,
            clickableIcons: false,
            mapId: GOOGLE_MAPS_MAP_ID,
          });
        } else {
          mapObj.current.setCenter(position);
        }
        if (!markerObj.current) {
          markerObj.current = new markerLib.AdvancedMarkerElement({
            map: mapObj.current,
            position,
          });
        } else {
          markerObj.current.position = position;
        }
      } catch {
        /* Map is a nicety; ignore failures. */
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [value.latitude, value.longitude]);

  function field(
    key: keyof AddressFields,
    label: string,
    autoComplete?: string,
  ) {
    return (
      <label className={labelClass}>
        {label}
        <input
          id={`${idPrefix}-${key}`}
          value={String(value[key] ?? "")}
          onChange={(e) => onChange({ [key]: e.target.value })}
          className={fieldClass}
          autoComplete={autoComplete}
        />
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {showAutocomplete ? (
        <div className={labelClass}>
          Search address
          {/* Google Places autocomplete element is mounted here. */}
          <div ref={hostRef} className="w-full [&_input]:w-full" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-normal text-muted-foreground">
              Start typing your address, then pick it from the list.
            </span>
            <button
              type="button"
              onClick={() => setManual(true)}
              className={`${buttonGhost} px-1 py-0 text-xs`}
            >
              Enter address manually
            </button>
          </div>
        </div>
      ) : null}

      {loadError ? (
        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Address search is unavailable right now — enter the address manually
          below.
        </p>
      ) : null}

      {value.latitude != null && value.longitude != null ? (
        <div
          ref={mapRef}
          className="h-44 w-full overflow-hidden rounded-md border border-border"
        />
      ) : null}

      {showFields ? (
        <div className="flex flex-col gap-4">
          {field("address_line1", "Street address", "address-line1")}
          {field("address_line2", "Address line 2", "address-line2")}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("city", "City", "address-level2")}
            {field("region", "State / region", "address-level1")}
            {field("postal_code", "Postal code", "postal-code")}
            {field("country", "Country", "country-name")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
