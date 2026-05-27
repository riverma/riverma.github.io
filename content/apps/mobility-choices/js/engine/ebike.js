// E-bike cost / CO2 / health for a single route.
// Distance is the same as a regular bike; duration was already scaled down 30% in the OSRM adapter.

import {
  MET_EBIKE, CO2E_G_PER_KCAL_FOOD, US_AVG_GRID_KG_CO2_KWH,
  EBIKE_MAINT_USD_PER_MI, EBIKE_WH_PER_MI,
} from '../data/constants.js';
import { EGRID_KG_CO2_PER_KWH } from '../data/egrid.js';
import { metersToMiles } from '../util/units.js';
import { perTripHealthBenefit } from './heat.js';
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

  const ebikeType = settings.ebikeType || 'standard';
  const wh_per_mi = EBIKE_WH_PER_MI[ebikeType] ?? EBIKE_WH_PER_MI.standard;
  const kwh = (distance_mi * wh_per_mi) / 1000;

  const elecPrice = settings.electricityUsdKwh ?? 0.18;
  const electricity = kwh * elecPrice;
  const maint = distance_mi * EBIKE_MAINT_USD_PER_MI;
  const total_cost = electricity + maint;

  const gridIntensity = EGRID_KG_CO2_PER_KWH[settings.stateCode] ?? US_AVG_GRID_KG_CO2_KWH;
  const grid_co2_kg = kwh * gridIntensity;

  const calories = MET_EBIKE * (settings.weightKg || 75) * duration_hr;
  const food_co2_kg = (calories * CO2E_G_PER_KCAL_FOOD) / 1000;
  const total_co2 = grid_co2_kg + food_co2_kg;

  // E-bikers burn fewer calories per minute than analog cyclists, so perTripHealthBenefit(calories)
  // naturally captures the reduced contribution without an additional discount factor.
  const health_usd = perTripHealthBenefit(calories);

  return {
    profile: 'ebike',
    label: 'E-bike',
    icon: 'ebike',
    distance_mi, duration_min,
    cost: { total: total_cost, breakdown: { electricity, maintenance: maint } },
    co2:  { total_kg: total_co2, breakdown: { grid: grid_co2_kg, food: food_co2_kg } },
    health: { value_usd: health_usd, calories_burned: calories, minutes_active: duration_min },
    caveats: [...(route.caveats || []), CAVEATS.carbonFromFood, CAVEATS.healthEstimate],
  };
}
