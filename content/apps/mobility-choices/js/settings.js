// localStorage-backed settings with a schema version so future migrations don't lose data.
// Schema-version migration chain is empty at v1; add migrate_v1_to_v2 etc. as needed.

import {
  US_AVG_GAS_USD_GAL, US_AVG_ELEC_USD_KWH, DEFAULT_TRANSIT_FARE_USD,
} from './data/constants.js';

const STORAGE_KEY = 'riverma.mobility-choices.v1';
export const SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS = Object.freeze({
  _schema: SCHEMA_VERSION,
  units: 'imperial',                       // 'imperial' | 'metric'
  vehicleClass: 'medium_sedan',
  includeMaintenance: false,               // fold maintenance/wear into the Cost signal
  mpg: 28,
  evKwhPerMi: 0.30,
  gasPriceUsdGal: US_AVG_GAS_USD_GAL,
  stateCode: '',
  electricityUsdKwh: US_AVG_ELEC_USD_KWH,
  ebikeType: 'standard',                   // 'light' | 'standard' | 'cargo'
  weightKg: 75,
  walkingSpeedMph: 3.0,                    // sanity-check display only
  cyclingSpeedMph: 12,                     // sanity-check display only
  graphhopperKey: '',
  transit: { defaultFareUsd: DEFAULT_TRANSIT_FARE_USD, otpEndpoint: null },  // RESERVED
});

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    const migrated = migrate(parsed);
    return { ...DEFAULT_SETTINGS, ...migrated };  // missing keys fall through to defaults
  } catch (err) {
    console.warn('[mobility-choices] settings load failed, using defaults:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    const toStore = { ...settings, _schema: SCHEMA_VERSION };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (err) {
    console.warn('[mobility-choices] settings save failed:', err);
  }
}

export function resetSettings() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS };
}

function migrate(raw) {
  // Add migrate_v1_to_v2(raw) etc. here when schema evolves.
  return raw;
}
