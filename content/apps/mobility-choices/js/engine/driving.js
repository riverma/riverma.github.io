// Driving cost / pollution / activity for a single route.

import {
  KG_CO2_PER_GAL_GASOLINE, VEHICLE_WEAR_USD_PER_MI,
  EV_KWH_PER_MI_DEFAULT, US_AVG_GRID_KG_CO2_KWH,
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
  const duration_min = route.duration_s / 60;
  const caveats = [...(route.caveats || []), CAVEATS.drivingNoTraffic];

  const vehicleClass = settings.vehicleClass || 'medium_sedan';
  const isEV = vehicleClass === 'ev';
  const wearRate = VEHICLE_WEAR_USD_PER_MI[vehicleClass] || VEHICLE_WEAR_USD_PER_MI.medium_sedan;
  const wear = distance_mi * wearRate;

  const costRows = [];
  const pollutionRows = [];
  let energy = 0, energyLabel, operational_co2 = 0;

  if (isEV) {
    const kwh = distance_mi * (settings.evKwhPerMi || EV_KWH_PER_MI_DEFAULT);
    const elecPrice = settings.electricityUsdKwh ?? 0.18;
    const gridIntensity = EGRID_KG_CO2_PER_KWH[settings.stateCode] ?? US_AVG_GRID_KG_CO2_KWH;
    energy = kwh * elecPrice;
    energyLabel = 'Electricity';
    operational_co2 = kwh * gridIntensity;
    if (!settings.stateCode) caveats.push(CAVEATS.evGridFallback);
    costRows.push({ label: 'Electricity', calc: `${kwh.toFixed(1)} kWh × $${elecPrice.toFixed(2)}/kWh`, usd: energy });
    pollutionRows.push({ label: 'Grid electricity CO₂', calc: `${kwh.toFixed(1)} kWh × ${gridIntensity.toFixed(3)} kg/kWh`, kg: operational_co2 });
  } else {
    const mpg = settings.mpg || 28;
    const gasPrice = settings.gasPriceUsdGal ?? 3.50;
    const gallons = distance_mi / mpg;
    energy = gallons * gasPrice;
    energyLabel = 'Fuel';
    operational_co2 = gallons * KG_CO2_PER_GAL_GASOLINE;
    costRows.push({ label: 'Fuel', calc: `${gallons.toFixed(2)} gal × $${gasPrice.toFixed(2)}/gal`, usd: energy });
    pollutionRows.push({ label: 'Tailpipe CO₂', calc: `${gallons.toFixed(2)} gal × 8.887 kg/gal`, kg: operational_co2 });
  }

  costRows.push({ label: 'Maintenance & wear', calc: `${distance_mi.toFixed(1)} mi × $${wearRate.toFixed(2)}/mi`, usd: wear, optional: true });

  return {
    profile: 'car',
    label: isEV ? 'Driving (electric)' : 'Driving (gas)',
    icon: 'car',
    impact: isEV ? 'low' : 'high',   // gas = high (red chips); EV = low (orange chips)
    distance_mi, duration_min,
    cost: { energy, maintenance: wear, energyLabel, rows: costRows },
    pollution: { operational_kg: operational_co2, food_kg: 0, hasTailpipe: !isEV, rows: pollutionRows },
    activity: { minutes: 0, calories: 0, lighter: false, met: 0, weightKg: settings.weightKg || 75, hours: duration_min / 60 },
    caveats,
  };
}
