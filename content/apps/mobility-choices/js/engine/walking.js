// Walking cost / CO2 / health for a single route.

import { MET_WALKING_MODERATE, CO2E_G_PER_KCAL_FOOD } from '../data/constants.js';
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

  const calories = MET_WALKING_MODERATE * (settings.weightKg || 75) * duration_hr;
  const food_co2_kg = (calories * CO2E_G_PER_KCAL_FOOD) / 1000;
  const health_usd = heatBenefit('walking', duration_min, settings.tripsPerYear || 100);

  const caveats = [...(route.caveats || []), CAVEATS.carbonFromFood, CAVEATS.healthEstimate];
  if (duration_hr > 3) caveats.push(CAVEATS.walkingLongRoute);

  return {
    profile: 'foot',
    label: 'Walking',
    icon: 'walk',
    distance_mi, duration_min,
    cost: { total: 0, breakdown: {} },
    co2:  { total_kg: food_co2_kg, breakdown: { food: food_co2_kg } },
    health: { value_usd: health_usd, calories_burned: calories, minutes_active: duration_min },
    caveats,
  };
}
