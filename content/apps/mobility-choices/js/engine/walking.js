// Walking cost / pollution / activity for a single route.

import { MET_WALKING_MODERATE, CO2E_G_PER_KCAL_FOOD } from '../data/constants.js';
import { metersToMiles } from '../util/units.js';
import { CAVEATS } from '../data/caveats.js';

/**
 * @param {RouteResult} route
 * @param {Object} settings
 * @returns {ModeResult}
 */
export function compute(route, settings) {
  const distance_mi = metersToMiles(route.distance_m);
  const duration_hr = route.duration_s / 3600;
  const duration_min = route.duration_s / 60;

  const weightKg = settings.weightKg || 75;
  const calories = MET_WALKING_MODERATE * weightKg * duration_hr;
  const food_co2_kg = (calories * CO2E_G_PER_KCAL_FOOD) / 1000;

  const caveats = [...(route.caveats || []), CAVEATS.pollutionFootnote, CAVEATS.activityEstimate];
  if (duration_hr > 3) caveats.push(CAVEATS.walkingLongRoute);

  return {
    profile: 'foot',
    label: 'Walking',
    icon: 'walk',
    impact: 'low',
    distance_mi, duration_min,
    cost: { energy: 0, maintenance: 0, energyLabel: null, rows: [] },
    pollution: { operational_kg: 0, food_kg: food_co2_kg, hasTailpipe: false, rows: [] },
    activity: { minutes: duration_min, calories, lighter: false, met: MET_WALKING_MODERATE, weightKg, hours: duration_hr },
    caveats,
  };
}
