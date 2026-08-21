import {
  importLibrary,
  setOptions,
  type LibraryMap,
} from "@googlemaps/js-api-loader";

/**
 * Google Maps JavaScript API access for client components. The browser key is
 * public (referrer-restricted in Google Cloud); when it's absent, callers fall
 * back to manual address entry.
 */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

/**
 * Map ID required by AdvancedMarkerElement (and vector maps). Defaults to
 * Google's reserved `DEMO_MAP_ID` for development; set your own cloud-styled
 * Map ID in production.
 */
export const GOOGLE_MAPS_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

let configured = false;

/**
 * Import a Maps library on demand, or `null` when no API key is configured.
 * Options are set once, lazily, before the first import.
 */
export async function importMapsLibrary<T extends keyof LibraryMap>(
  name: T,
): Promise<LibraryMap[T] | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;
  if (!configured) {
    setOptions({ key: GOOGLE_MAPS_API_KEY, v: "weekly" });
    configured = true;
  }
  return importLibrary(name);
}

/** Structured address + geo data captured from a Places selection. */
export type PlaceAddress = {
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

type AddressComponent = {
  types: string[];
  longText: string | null;
  shortText: string | null;
};

function pick(
  components: AddressComponent[],
  type: string,
  form: "long" | "short" = "long",
): string {
  const c = components.find((comp) => comp.types.includes(type));
  if (!c) return "";
  return (form === "short" ? c.shortText : c.longText) ?? "";
}

/** A stable Google Maps URL that resolves to a specific place by id. */
export function mapsUrlForPlaceId(placeId: string): string {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
}

/**
 * Flatten a Places `Place` (new Places API) into our structured address shape.
 * Accepts the loosely-typed place returned by `fetchFields` so this stays
 * resilient to minor SDK shape differences.
 */
export function placeToAddress(place: {
  addressComponents?: AddressComponent[] | null;
  location?: { lat: () => number; lng: () => number } | null;
  id?: string | null;
}): PlaceAddress {
  const components = place.addressComponents ?? [];
  const streetNumber = pick(components, "street_number");
  const route = pick(components, "route");
  const city =
    pick(components, "locality") ||
    pick(components, "postal_town") ||
    pick(components, "sublocality_level_1") ||
    pick(components, "administrative_area_level_2");
  const placeId = place.id ?? "";

  return {
    address_line1: [streetNumber, route].filter(Boolean).join(" "),
    address_line2: pick(components, "subpremise"),
    city,
    region: pick(components, "administrative_area_level_1", "short"),
    postal_code: pick(components, "postal_code"),
    country: pick(components, "country"),
    latitude: place.location ? place.location.lat() : null,
    longitude: place.location ? place.location.lng() : null,
    google_place_id: placeId,
    google_maps_url: placeId ? mapsUrlForPlaceId(placeId) : "",
  };
}
