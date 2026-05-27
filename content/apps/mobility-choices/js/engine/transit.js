// Transit engine — RESERVED for v2.
// Architecture hooks live here so engine/index.js can import without churn.
// When ENABLED flips to true and a transit router is wired in routing/, compute() will:
//   - iterate route.legs[] (walk + bus + walk + rail + walk etc.)
//   - sum fares (leg.transit.fare_usd ?? settings.transit.defaultFareUsd)
//   - sum CO2 via TRANSIT_KG_CO2_PER_PMT per leg.mode
//   - accumulate calories + HEAT credit on walking legs
//   - add a small MET contribution on riding legs

export const ENABLED = false;

export function compute(/* route, settings */) {
  return null;   // Engine/index.js checks ENABLED first; this should never run in v1.
}
