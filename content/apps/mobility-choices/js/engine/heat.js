// Simplified per-trip share of the WHO HEAT health-economic methodology.
//
// HEAT proper estimates population-level mortality benefit from regular active travel,
// applies a relative-risk reduction (capped), multiplies by background mortality and VSL,
// and discounts over 10 years. Here we invert it to a per-trip share:
//   1. Project this trip's minutes out to a year using settings.tripsPerYear.
//   2. Convert to weekly minutes, cap at HEAT's reference cap.
//   3. Linearly scale the relative-risk reduction by (weekly_min / ref_min_wk).
//   4. Multiply by US crude mortality + VSL → annual benefit.
//   5. Divide back by tripsPerYear → per-trip share.
// Documented as an estimate, surfaced with a tooltip in the UI.

import {
  HEAT_RR_CYCLING, HEAT_RR_WALKING,
  HEAT_CYCLING_REF_MIN_WK, HEAT_WALKING_REF_MIN_WK,
  HEAT_CAP_MIN_WK, HEAT_BACKGROUND_MORTALITY_US,
  VSL_USD,
} from '../data/constants.js';

/**
 * @param {'cycling'|'walking'} kind
 * @param {number} durationMin     // minutes per trip
 * @param {number} tripsPerYear
 * @returns {number} USD per-trip health benefit
 */
export function heatBenefit(kind, durationMin, tripsPerYear) {
  if (!durationMin || !tripsPerYear) return 0;
  const rrAtRef = kind === 'cycling' ? HEAT_RR_CYCLING : HEAT_RR_WALKING;
  const refMinWk = kind === 'cycling' ? HEAT_CYCLING_REF_MIN_WK : HEAT_WALKING_REF_MIN_WK;

  const annualMin = durationMin * tripsPerYear;
  const weeklyMin = Math.min(annualMin / 52, HEAT_CAP_MIN_WK);

  const fullReduction = 1 - rrAtRef;
  const reduction = Math.min(fullReduction * (weeklyMin / refMinWk), fullReduction);

  const annualBenefit = HEAT_BACKGROUND_MORTALITY_US * reduction * VSL_USD;
  return annualBenefit / tripsPerYear;
}
