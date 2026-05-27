// Per-trip health benefit, conservatively monetised.
//
// We use a per-kilocalorie estimate ($0.02/kcal) rather than the WHO HEAT methodology
// for the per-trip score, because HEAT projects sustained active travel into an annual
// mortality reduction and a single-trip extrapolation overstates the value. The per-kcal
// estimate is grounded in dose-response cohort studies (Wen 2011 Lancet, Arem 2015 JAMA)
// and scaled so individual trips show a modest but real contribution.
//
// The annualised HEAT figure is computed by heatAnnualBenefit() for display in the About
// page only — it is not used in the score.

import {
  HEALTH_USD_PER_KCAL,
  HEAT_RR_CYCLING, HEAT_RR_WALKING,
  HEAT_CYCLING_REF_MIN_WK, HEAT_WALKING_REF_MIN_WK,
  HEAT_CAP_MIN_WK, HEAT_BACKGROUND_MORTALITY_US, VSL_USD,
} from '../data/constants.js';

/**
 * Per-trip health benefit in USD.
 * @param {number} calories - calories burned on this trip
 */
export function perTripHealthBenefit(calories) {
  if (!calories || calories <= 0) return 0;
  return calories * HEALTH_USD_PER_KCAL;
}

/**
 * Reference annualised HEAT benefit for a sustained pattern.
 * Used by the About screen for context, NOT in the per-trip score.
 *
 * @param {'cycling'|'walking'} kind
 * @param {number} durationMin per-trip minutes
 * @param {number} tripsPerYear how often the user takes this trip
 */
export function heatAnnualBenefit(kind, durationMin, tripsPerYear) {
  if (!durationMin || !tripsPerYear) return 0;
  const rrAtRef  = kind === 'cycling' ? HEAT_RR_CYCLING : HEAT_RR_WALKING;
  const refMinWk = kind === 'cycling' ? HEAT_CYCLING_REF_MIN_WK : HEAT_WALKING_REF_MIN_WK;
  const annualMin = durationMin * tripsPerYear;
  const weeklyMin = Math.min(annualMin / 52, HEAT_CAP_MIN_WK);
  const fullReduction = 1 - rrAtRef;
  const reduction = Math.min(fullReduction * (weeklyMin / refMinWk), fullReduction);
  return HEAT_BACKGROUND_MORTALITY_US * reduction * VSL_USD;
}
