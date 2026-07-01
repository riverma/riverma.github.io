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

/**
 * The "Cost" signal in dollars. Always includes energy (fuel/electricity); maintenance &
 * wear are folded in only when the user opts in via Settings ("Add maintenance / wear
 * costs to estimates"). This keeps the everyday view simple — a bike reads as free —
 * while letting anyone who wants the wear-inclusive picture turn it on.
 *
 * @param {ModeResult} r
 * @param {Object} [settings] — uses settings.includeMaintenance
 * @returns {number} USD
 */
export function tripCostUsd(r, settings = {}) {
  const energy = r.cost?.energy || 0;
  const maint  = settings.includeMaintenance ? (r.cost?.maintenance || 0) : 0;
  return energy + maint;
}

/**
 * Sort the keys of a results map by the requested signal. Failed/skipped modes are pushed
 * to the end in their original profile order. There is no blended score — each signal is
 * ranked independently.
 * @param {Object} results
 * @param {'time'|'cost'|'pollution'|'active'} sortBy
 * @param {Object} [settings] — passed through to the Cost calculation
 * @returns {string[]} ordered profile keys
 */
export function sortProfiles(results, sortBy, settings = {}) {
  const profiles = ['car', 'bicycle', 'ebike', 'foot'];
  const ok = [], bad = [];
  for (const p of profiles) {
    const r = results?.[p];
    if (r && !r.error && !r.skipped) ok.push(p);
    else if (r) bad.push(p);
  }
  // More activity = better → sort descending. Everything else (time/cost/pollution) is a
  // cost → sort ascending.
  const desc = sortBy === 'active';
  const key = {
    time:      p => results[p].duration_min,
    cost:      p => tripCostUsd(results[p], settings),
    pollution: p => results[p].pollution.operational_kg,
    active:    p => results[p].activity.minutes || 0,
  }[sortBy] || (p => results[p].duration_min);
  ok.sort((a, b) => desc ? key(b) - key(a) : key(a) - key(b));
  return [...ok, ...bad];
}
