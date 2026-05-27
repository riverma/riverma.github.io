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
import { SOCIAL_COST_OF_CARBON_USD_PER_KG, VALUE_OF_TIME_USD_PER_HR_DEFAULT } from '../data/constants.js';

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
      result.score = scoreResult(result, settings);
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
 * Combine money, time, carbon, and health into a single comparable USD score.
 * Sign convention: HIGHER = BETTER. Positive total = net benefit; negative = net cost.
 *
 *   money_usd   = direct $ cost            (positive when paid)
 *   time_usd    = duration × value-of-time (positive when time is spent)
 *   carbon_usd  = kg CO2 × EPA SC-CO2      (positive when emitted)
 *   health_usd  = per-trip kcal × per-kcal value (positive when active)
 *   total_usd   = health − money − time − carbon
 *
 * Each "cost" component reduces the score; the only "benefit" component is health.
 * This means walking can lose to driving on short urban trips because the time cost
 * of walking outweighs its modest per-trip health benefit, which matches how most
 * people actually weigh the trade-off.
 *
 * @param {ModeResult} r
 * @param {Object} settings — uses settings.valueOfTimeUsdPerHr (default 15)
 */
export function scoreResult(r, settings = {}) {
  const vot       = settings.valueOfTimeUsdPerHr ?? VALUE_OF_TIME_USD_PER_HR_DEFAULT;
  const money_usd  = r.cost?.total || 0;
  const time_usd   = (r.duration_min || 0) / 60 * vot;
  const carbon_usd = (r.co2?.total_kg || 0) * SOCIAL_COST_OF_CARBON_USD_PER_KG;
  const health_usd = r.health?.value_usd || 0;
  const total_usd  = health_usd - money_usd - time_usd - carbon_usd;
  return { money_usd, time_usd, carbon_usd, health_usd, total_usd, vot_usd_per_hr: vot };
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
  // Higher overall / health = better → sort descending.
  // Lower money / time / carbon = better → sort ascending.
  const desc = sortBy === 'overall' || sortBy === 'health';
  const key = {
    overall: p => results[p].score.total_usd,
    money:   p => results[p].cost.total,
    time:    p => results[p].duration_min,
    carbon:  p => results[p].co2.total_kg,
    health:  p => results[p].health.value_usd || 0,
  }[sortBy] || (p => results[p].score.total_usd);
  ok.sort((a, b) => desc ? key(b) - key(a) : key(a) - key(b));
  return [...ok, ...bad];
}
