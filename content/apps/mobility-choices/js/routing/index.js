// Router selector. Returns null for unsupported profiles (e.g. 'transit') so the
// engine can skip them silently — avoids forcing every caller to special-case.

import { OsrmRouter } from './osrm.js';
import { GraphHopperRouter } from './graphhopper.js';

const osrmSingleton = new OsrmRouter();

/**
 * @param {{ graphhopperKey?: string }} settings
 * @param {'car'|'bicycle'|'ebike'|'foot'|'transit'} profile
 * @returns {{route: Function} | null}
 */
export function getRouter(settings, profile) {
  if (profile === 'transit') return null;     // RESERVED for v2
  const key = settings?.graphhopperKey?.trim();
  if (key) return new GraphHopperRouter(key);
  return osrmSingleton;
}
