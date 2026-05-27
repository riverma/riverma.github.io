// Geocoding façade. v1 always uses Photon. Reserved for swapping in GraphHopper's
// geocoding endpoint (or a self-hosted Nominatim) without touching the UI layer.

import { photonSearch, photonReverse } from './photon.js';

/**
 * @param {string} query
 * @param {{ signal?: AbortSignal, limit?: number }} [opts]
 */
export function suggest(query, opts) {
  return photonSearch(query, opts);
}

/**
 * @param {number} lat
 * @param {number} lon
 */
export function reverse(lat, lon, opts) {
  return photonReverse(lat, lon, opts);
}

// Accept "lat,lon" as a direct input — handy escape hatch when geocoding fails or
// the user wants a pin they don't want to name.
const LATLON_RX = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;
export function parseLatLon(text) {
  const m = LATLON_RX.exec(text || '');
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lon = parseFloat(m[2]);
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon, label: `${lat.toFixed(5)}, ${lon.toFixed(5)}` };
}
