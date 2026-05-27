// GraphHopper adapter — used only when the user pastes a free API key into Settings.
// Free tier: 500 routes/day, non-commercial. CORS-enabled.
// Docs: https://docs.graphhopper.com/openapi

import { httpGetJson, HttpError } from '../util/http.js';
import { EBIKE_DURATION_MULTIPLIER } from '../data/constants.js';
import { CAVEATS } from '../data/caveats.js';

const BASE = 'https://graphhopper.com/api/1/route';

const PROFILE_TO_VEHICLE = {
  car:     'car',
  bicycle: 'bike',
  ebike:   'bike',   // their real `ebike` requires paid plan; same approximation as OSRM
  foot:    'foot',
};

const PROFILE_TO_MODE = {
  car: 'drive', bicycle: 'bike', ebike: 'ebike', foot: 'walk',
};

export class GraphHopperRouter {
  /** @param {string} apiKey */
  constructor(apiKey) {
    if (!apiKey) throw new Error('GraphHopperRouter requires an API key');
    this.apiKey = apiKey;
  }

  /**
   * @param {LatLon} start
   * @param {LatLon} end
   * @param {'car'|'bicycle'|'ebike'|'foot'} profile
   * @param {{ signal?: AbortSignal }} [opts]
   * @returns {Promise<RouteResult>}
   */
  async route(start, end, profile, opts = {}) {
    const vehicle = PROFILE_TO_VEHICLE[profile];
    if (!vehicle) throw new Error(`GraphHopper: unsupported profile "${profile}"`);

    const params = new URLSearchParams();
    params.append('point', `${start.lat},${start.lon}`);
    params.append('point', `${end.lat},${end.lon}`);
    params.set('vehicle', vehicle);
    params.set('points_encoded', 'false');
    params.set('calc_points', 'true');
    params.set('instructions', 'false');
    params.set('key', this.apiKey);

    const url = `${BASE}?${params.toString()}`;
    const json = await httpGetJson(url, { signal: opts.signal });

    if (!json.paths?.length) {
      const msg = json.message || 'no path';
      throw new HttpError(`GraphHopper ${profile}: ${msg}`, 0);
    }
    const p = json.paths[0];

    let duration_s = p.time / 1000;
    const caveats = [];
    if (profile === 'ebike') {
      duration_s = duration_s * EBIKE_DURATION_MULTIPLIER;
      caveats.push(CAVEATS.ebikeRoutingApprox);
    }

    /** @type {RouteResult} */
    const result = {
      distance_m: p.distance,
      duration_s,
      geometry: p.points,
      legs: [{
        distance_m: p.distance,
        duration_s,
        geometry: p.points,
        mode: PROFILE_TO_MODE[profile],
      }],
      provider: 'graphhopper',
      profile,
      raw: p,
      caveats,
    };
    return result;
  }
}
