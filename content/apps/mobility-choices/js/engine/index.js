// Engine orchestrator: parallel-fetch routes for every supported profile, run the
// per-mode compute() for each successful result, attach an overall score, return
// a unified Results map.
//
// Adding 'transit' later is a no-op for this file — getRouter() returns null in v1
// and engine/transit.js exports ENABLED:false, so the loop already skips it.

import { getRouter } from '../routing/index.js';
import { compute as computeDriving } from './driving.js';
import { compute as computeCycling } from './cycling.js';
import { compute as computeEbike   } from './ebike.js';
import { compute as computeWalking } from './walking.js';
import * as transit from './transit.js';
import { SOCIAL_COST_OF_CARBON_USD_PER_KG } from '../data/constants.js';

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
      result.score = scoreResult(result);
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

/**
 * Combine money, carbon, and health into a single comparable USD score.
 * Sign convention: positive = net cost to you (or to society); negative = net benefit.
 *   money_usd   = direct $ cost (positive)
 *   carbon_usd  = CO2 emissions monetised via EPA SC-CO2 (positive)
 *   health_usd  = NEGATED active-travel health benefit (negative for benefit modes)
 *   total_usd   = money + carbon + health_usd
 * @param {ModeResult} r
 */
export function scoreResult(r) {
  const money_usd  = r.cost?.total || 0;
  const carbon_usd = (r.co2?.total_kg || 0) * SOCIAL_COST_OF_CARBON_USD_PER_KG;
  const health_usd = -(r.health?.value_usd || 0);   // benefit becomes a negative cost
  const total_usd  = money_usd + carbon_usd + health_usd;
  return { money_usd, carbon_usd, health_usd, total_usd };
}

/**
 * Sort the keys of a results map by the requested metric. Failed/skipped modes
 * are pushed to the end in their original profile order.
 * @param {Object} results
 * @param {'overall'|'money'|'time'|'carbon'|'health'} sortBy
 * @returns {string[]} ordered profile keys
 */
export function sortProfiles(results, sortBy) {
  const profiles = ['car', 'bicycle', 'ebike', 'foot'];
  const ok = [], bad = [];
  for (const p of profiles) {
    const r = results?.[p];
    if (r && !r.error && !r.skipped) ok.push(p);
    else if (r) bad.push(p);
  }
  const key = {
    overall: p => results[p].score.total_usd,         // lower = better (more negative wins)
    money:   p => results[p].cost.total,              // lower = better
    time:    p => results[p].duration_min,            // lower = better
    carbon:  p => results[p].co2.total_kg,            // lower = better
    health:  p => -(results[p].health.value_usd || 0),// negated so MORE benefit sorts first
  }[sortBy] || (p => results[p].score.total_usd);
  ok.sort((a, b) => key(a) - key(b));
  return [...ok, ...bad];
}
