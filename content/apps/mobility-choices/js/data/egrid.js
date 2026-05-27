// US state-level electricity-grid carbon intensity, kg CO2 per kWh.
// Source: EPA eGRID2022, "State Output Emission Rates" (released 2024-01).
// https://www.epa.gov/egrid
// Values are non-baseload CO2 emission rate ÷ 1000 (eGRID publishes lb/MWh).
// Updated cadence: ~18 months. National avg fallback lives in constants.js.

export const EGRID_KG_CO2_PER_KWH = {
  AL: 0.358, AK: 0.510, AZ: 0.346, AR: 0.439, CA: 0.218, CO: 0.521,
  CT: 0.234, DE: 0.450, DC: 0.288, FL: 0.388, GA: 0.346, HI: 0.671,
  ID: 0.083, IL: 0.305, IN: 0.700, IA: 0.353, KS: 0.398, KY: 0.806,
  LA: 0.405, ME: 0.111, MD: 0.299, MA: 0.281, MI: 0.474, MN: 0.354,
  MS: 0.402, MO: 0.741, MT: 0.474, NE: 0.480, NV: 0.314, NH: 0.103,
  NJ: 0.244, NM: 0.516, NY: 0.182, NC: 0.317, ND: 0.638, OH: 0.486,
  OK: 0.411, OR: 0.143, PA: 0.336, RI: 0.395, SC: 0.281, SD: 0.193,
  TN: 0.288, TX: 0.397, UT: 0.594, VT: 0.005, VA: 0.281, WA: 0.075,
  WV: 0.857, WI: 0.508, WY: 0.788,
};
