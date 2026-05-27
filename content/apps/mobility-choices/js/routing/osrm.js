// OSRM adapter — FOSSGIS-hosted public instance at routing.openstreetmap.de.
// Default routing engine; no API key required. CORS-clean from github.io origin
// (verified 2026-05-25 pre-flight). Polite-use: limit requests, no automated scraping.
//
// OSRM URL convention is unusual: the *profile* is the path prefix
// (`routed-car` / `routed-bike` / `routed-foot`) and the literal `/route/v1/driving/`
// component is invariant regardless of profile.

import { httpGetJson, HttpError } from '../util/http.js';
import { EBIKE_DURATION_MULTIPLIER } from '../data/constants.js';
import { CAVEATS } from '../data/caveats.js';

const BASE = 'https://routing.openstreetmap.de';

const PROFILE_TO_PREFIX = {
  car:     'routed-car',
  bicycle: 'routed-bike',
  ebike:   'routed-bike',   // No native e-bike profile; duration scaled below.
  foot:    'routed-foot',
};

const PROFILE_TO_MODE = {
  car:     'drive',
  bicycle: 'bike',
  ebike:   'ebike',
  foot:    'walk',
};

export class OsrmRouter {
  /**
   * @param {LatLon} start
   * @param {LatLon} end
   * @param {'car'|'bicycle'|'ebike'|'foot'} profile
   * @param {{ signal?: AbortSignal }} [opts]
   * @returns {Promise<RouteResult>}
   */
  async route(start, end, profile, opts = {}) {
    const prefix = PROFILE_TO_PREFIX[profile];
    if (!prefix) throw new Error(`OSRM: unsupported profile "${profile}"`);

    const coords = `${start.lon},${start.lat};${end.lon},${end.lat}`;
    const url = `${BASE}/${prefix}/route/v1/driving/${coords}`
              + `?overview=full&geometries=geojson&steps=false&alternatives=false`;

    const json = await httpGetJson(url, { signal: opts.signal });
    if (json.code !== 'Ok' || !json.routes?.length) {
      throw new HttpError(`OSRM ${profile}: ${json.code || 'no route'} — ${json.message || ''}`, 0);
    }

    const r = json.routes[0];
    let duration_s = r.duration;
    const caveats = [];
    if (profile === 'ebike') {
      duration_s = duration_s * EBIKE_DURATION_MULTIPLIER;
      caveats.push(CAVEATS.ebikeRoutingApprox);
    }

    /** @type {RouteResult} */
    const result = {
      distance_m: r.distance,
      duration_s,
      geometry: r.geometry,
      legs: [{
        distance_m: r.distance,
        duration_s,
        geometry: r.geometry,
        mode: PROFILE_TO_MODE[profile],
      }],
      provider: 'osrm',
      profile,
      raw: r,
      caveats,
    };
    return result;
  }
}
