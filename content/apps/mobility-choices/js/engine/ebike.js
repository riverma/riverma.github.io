// E-bike cost / pollution / activity for a single route.
// Distance is the same as a regular bike; duration was already scaled down 30% in the OSRM adapter.

import {
  MET_EBIKE, CO2E_G_PER_KCAL_FOOD, US_AVG_GRID_KG_CO2_KWH,
  EBIKE_MAINT_USD_PER_MI, EBIKE_WH_PER_MI,
} from '../data/constants.js';
import { EGRID_KG_CO2_PER_KWH } from '../data/egrid.js';
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

  const ebikeType = settings.ebikeType || 'standard';
  const wh_per_mi = EBIKE_WH_PER_MI[ebikeType] ?? EBIKE_WH_PER_MI.standard;
  const kwh = (distance_mi * wh_per_mi) / 1000;

  const elecPrice = settings.electricityUsdKwh ?? 0.18;
  const electricity = kwh * elecPrice;
  const maint = distance_mi * EBIKE_MAINT_USD_PER_MI;

  const gridIntensity = EGRID_KG_CO2_PER_KWH[settings.stateCode] ?? US_AVG_GRID_KG_CO2_KWH;
  const grid_co2_kg = kwh * gridIntensity;

  const weightKg = settings.weightKg || 75;
  const calories = MET_EBIKE * weightKg * duration_hr;
  const food_co2_kg = (calories * CO2E_G_PER_KCAL_FOOD) / 1000;

  return {
    profile: 'ebike',
    label: 'E-bike',
    icon: 'ebike',
    impact: 'low',
    distance_mi, duration_min,
    cost: {
      energy: electricity, maintenance: maint, energyLabel: 'Electricity',
      rows: [
        { label: 'Electricity', calc: `${kwh.toFixed(2)} kWh × $${elecPrice.toFixed(2)}/kWh`, usd: electricity },
        { label: 'Maintenance', calc: `${distance_mi.toFixed(1)} mi × $${EBIKE_MAINT_USD_PER_MI.toFixed(2)}/mi`, usd: maint, optional: true },
      ],
    },
    pollution: {
      operational_kg: grid_co2_kg, food_kg: food_co2_kg, hasTailpipe: false,
      rows: [{ label: 'Grid electricity CO₂', calc: `${kwh.toFixed(2)} kWh × ${gridIntensity.toFixed(3)} kg/kWh`, kg: grid_co2_kg }],
    },
    // E-bike pedalling still clears the moderate (≥3 MET) threshold, so the whole trip counts —
    // but at a lighter intensity than an analog bike, flagged for honesty.
    activity: { minutes: duration_min, calories, lighter: true, met: MET_EBIKE, weightKg, hours: duration_hr },
    caveats: [...(route.caveats || []), CAVEATS.pollutionFootnote, CAVEATS.activityEstimate, CAVEATS.ebikeLighter],
  };
}
