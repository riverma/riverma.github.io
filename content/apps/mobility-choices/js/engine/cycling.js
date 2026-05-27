// Cycling cost / CO2 / health for a single route.

import {
  MET_CYCLING_LEISURE, CO2E_G_PER_KCAL_FOOD,
  BIKE_MAINT_USD_PER_MI,
} from '../data/constants.js';
import { metersToMiles } from '../util/units.js';
import { heatBenefit } from './heat.js';
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

  const calories = MET_CYCLING_LEISURE * (settings.weightKg || 75) * duration_hr;
  const food_co2_kg = (calories * CO2E_G_PER_KCAL_FOOD) / 1000;

  const health_usd = heatBenefit('cycling', duration_min, settings.tripsPerYear || 100);

  return {
    profile: 'bicycle',
    label: 'Cycling',
    icon: 'bicycle',
    distance_mi, duration_min,
    cost: { total: maint, breakdown: { maintenance: maint } },
    co2:  { total_kg: food_co2_kg, breakdown: { food: food_co2_kg } },
    health: { value_usd: health_usd, calories_burned: calories, minutes_active: duration_min },
    caveats: [...(route.caveats || []), CAVEATS.carbonFromFood, CAVEATS.healthEstimate],
  };
}
