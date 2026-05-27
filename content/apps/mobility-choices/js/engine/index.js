// Engine orchestrator: parallel-fetch routes for every supported profile, run the
// per-mode compute() for each successful result, return a unified Results map.
//
// Adding 'transit' later is a no-op for this file — getRouter() returns null in v1
// and engine/transit.js exports ENABLED:false, so the loop already skips it.

import { getRouter } from '../routing/index.js';
import { compute as computeDriving } from './driving.js';
import { compute as computeCycling } from './cycling.js';
import { compute as computeEbike   } from './ebike.js';
import { compute as computeWalking } from './walking.js';
import * as transit from './transit.js';

export const PROFILES = ['car', 'bicycle', 'ebike', 'foot', 'transit'];

const COMPUTE = {
  car:     computeDriving,
  bicycle: computeCycling,
  ebike:   computeEbike,
  foot:    computeWalking,
  transit: transit.ENABLED ? transit.compute : null,
};

/**
 * @param {LatLon} start
 * @param {LatLon} end
 * @param {Object} settings
 * @param {{ signal?: AbortSignal }} [opts]
 * @returns {Promise<Object>} { car: ModeResult|{error}, bicycle: ..., ... }
 */
export async function computeAllModes(start, end, settings, opts = {}) {
  const tasks = PROFILES.map(async (profile) => {
    const computeFn = COMPUTE[profile];
    if (!computeFn) return [profile, { skipped: true, reason: 'not implemented in v1' }];

    const router = getRouter(settings, profile);
    if (!router) return [profile, { skipped: true, reason: 'no router for this profile' }];

    try {
      const route = await router.route(start, end, profile, { signal: opts.signal });
      const result = computeFn(route, settings);
      result.route = route;     // map.js needs the geometry
      return [profile, result];
    } catch (err) {
      return [profile, { error: err?.message || String(err), profile }];
    }
  });

  const settled = await Promise.allSettled(tasks);
  const out = {};
  for (const s of settled) {
    if (s.status === 'fulfilled') {
      const [profile, val] = s.value;
      out[profile] = val;
    }
    // Promise itself rejected (e.g. abort) — skip; UI shows "no result".
  }
  return out;
}
