// Driving cost / CO2 / health for a single route.

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

  let fuel = 0, electricity = 0;
  let co2_tailpipe = 0, co2_grid = 0;

  if (isEV) {
    const kwh = distance_mi * (settings.evKwhPerMi || EV_KWH_PER_MI_DEFAULT);
    electricity = kwh * (settings.electricityUsdKwh ?? 0.18);
    const gridIntensity = EGRID_KG_CO2_PER_KWH[settings.stateCode] ?? US_AVG_GRID_KG_CO2_KWH;
    co2_grid = kwh * gridIntensity;
    if (!settings.stateCode) caveats.push(CAVEATS.evGridFallback);
  } else {
    const mpg = settings.mpg || 28;
    const gallons = distance_mi / mpg;
    fuel = gallons * (settings.gasPriceUsdGal ?? 3.50);
    co2_tailpipe = gallons * KG_CO2_PER_GAL_GASOLINE;
  }

  const wear = distance_mi * (VEHICLE_WEAR_USD_PER_MI[vehicleClass] || VEHICLE_WEAR_USD_PER_MI.medium_sedan);

  const total_cost = fuel + electricity + wear;
  const total_co2 = co2_tailpipe + co2_grid;

  return {
    profile: 'car',
    label: isEV ? 'Driving (EV)' : 'Driving',
    icon: 'car',
    distance_mi, duration_min,
    cost: {
      total: total_cost,
      breakdown: {
        fuel:        isEV ? undefined : fuel,
        electricity: isEV ? electricity : undefined,
        wear,
      },
    },
    co2: {
      total_kg: total_co2,
      breakdown: {
        tailpipe: isEV ? undefined : co2_tailpipe,
        grid:     isEV ? co2_grid   : undefined,
      },
    },
    health: { value_usd: 0, calories_burned: 0, minutes_active: 0 },
    caveats,
  };
}
