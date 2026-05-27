// Raw Photon HTTP — CORS-enabled OSM-based geocoder by Komoot.
// Public instance at photon.komoot.io is "for development purposes" per Komoot's terms;
// debounce + light caching upstream keep us polite.

import { httpGetJson } from '../util/http.js';

const BASE = 'https://photon.komoot.io';

/**
 * @typedef {Object} Place
 * @property {number} lat
 * @property {number} lon
 * @property {string} label        // human-readable single line
 * @property {Object} raw          // unparsed Photon feature
 */

/**
 * @param {string} query
 * @param {{ limit?: number, lang?: string, signal?: AbortSignal }} [opts]
 * @returns {Promise<Place[]>}
 */
export async function photonSearch(query, opts = {}) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams();
  params.set('q', query.trim());
  params.set('limit', String(opts.limit ?? 5));
  params.set('lang', opts.lang ?? 'en');
  const json = await httpGetJson(`${BASE}/api?${params.toString()}`, { signal: opts.signal });
  return (json.features || []).map(featureToPlace);
}

/**
 * @param {number} lat
 * @param {number} lon
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<Place | null>}
 */
export async function photonReverse(lat, lon, opts = {}) {
  const params = new URLSearchParams();
  params.set('lat', String(lat));
  params.set('lon', String(lon));
  const json = await httpGetJson(`${BASE}/reverse?${params.toString()}`, { signal: opts.signal });
  return json.features?.[0] ? featureToPlace(json.features[0]) : null;
}

function featureToPlace(f) {
  const [lon, lat] = f.geometry?.coordinates || [];
  const p = f.properties || {};
  const parts = [
    p.name,
    p.housenumber && p.street ? `${p.housenumber} ${p.street}` : p.street,
    p.city || p.town || p.village || p.locality,
    p.state,
    p.country,
  ].filter(Boolean);
  // De-duplicate consecutive parts (e.g. "Pasadena, Pasadena").
  const dedup = parts.filter((v, i) => v !== parts[i - 1]);
  return { lat, lon, label: dedup.join(', '), raw: f };
}
