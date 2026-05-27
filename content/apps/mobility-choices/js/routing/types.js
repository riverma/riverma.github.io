// JSDoc typedefs shared by routing adapters and the engine.
// No runtime exports — this file exists so editors can pick up the @typedef references.

/**
 * @typedef {Object} LatLon
 * @property {number} lat
 * @property {number} lon
 */

/**
 * @typedef {Object} Leg
 * @property {number} distance_m
 * @property {number} duration_s
 * @property {Object} geometry                    // GeoJSON LineString
 * @property {'walk'|'bike'|'ebike'|'drive'|'bus'|'rail'|'tram'|'ferry'} mode
 * @property {Object} [transit]                   // populated for transit legs only
 * @property {number} [ascent_m]
 */

/**
 * @typedef {Object} RouteResult
 * @property {number} distance_m
 * @property {number} duration_s
 * @property {Object} geometry                    // full GeoJSON LineString for rendering
 * @property {Leg[]} legs                         // ≥1; single-mode routes have one leg
 * @property {string} provider                    // 'osrm' | 'graphhopper' | ...
 * @property {string} profile                     // canonical: 'car'|'bicycle'|'ebike'|'foot'|'transit'
 * @property {Object} raw                         // unparsed provider response (debug)
 * @property {string[]} caveats                   // adapter-attributable caveats, e.g. e-bike approximation
 */

export {};
