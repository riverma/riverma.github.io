// Cycling cost / pollution / activity for a single route.

import {
  MET_CYCLING_LEISURE, CO2E_G_PER_KCAL_FOOD,
  BIKE_MAINT_USD_PER_MI,
} from '../data/constants.js';
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

  const maint = distance_mi * BIKE_MAINT_USD_PER_MI;
  const weightKg = settings.weightKg || 75;
  const calories = MET_CYCLING_LEISURE * weightKg * duration_hr;
  const food_co2_kg = (calories * CO2E_G_PER_KCAL_FOOD) / 1000;

  return {
    profile: 'bicycle',
    label: 'Cycling',
    icon: 'bicycle',
    impact: 'low',
    distance_mi, duration_min,
    cost: {
      energy: 0, maintenance: maint, energyLabel: null,
      rows: [{ label: 'Maintenance', calc: `${distance_mi.toFixed(1)} mi × $${BIKE_MAINT_USD_PER_MI.toFixed(2)}/mi`, usd: maint, optional: true }],
    },
    pollution: { operational_kg: 0, food_kg: food_co2_kg, hasTailpipe: false, rows: [] },
    activity: { minutes: duration_min, calories, lighter: false, met: MET_CYCLING_LEISURE, weightKg, hours: duration_hr },
    caveats: [...(route.caveats || []), CAVEATS.pollutionFootnote, CAVEATS.activityEstimate],
  };
}
