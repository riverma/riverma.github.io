// Mobility Choices — calculation constants.
// Every value cites its source in the trailing comment.
// Update annually: AAA tables (yearly), eGRID (~18 mo), EIA prices (continuous), HEAT (rare).

// --- Unit conversion (here, not util/units.js, because formulas live alongside) ---
export const M_PER_MI = 1609.344;
export const KG_PER_LB = 0.45359237;

// --- Fuel & carbon ---
export const KG_CO2_PER_GAL_GASOLINE = 8.887;
  // EPA "Greenhouse Gases Equivalencies Calculator — Calculations and References", 2023.
  // https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references

// --- Social Cost of Carbon ($/kg CO2) used to monetise carbon emissions for the overall score.
//     EPA 2023 SC-CO2 final value: ~$190/tonne at 2% discount rate (2020 USD). $0.19/kg.
//     https://www.epa.gov/environmental-economics/social-cost-greenhouse-gases
export const SOCIAL_COST_OF_CARBON_USD_PER_KG = 0.190;

export const CO2E_G_PER_KCAL_FOOD = 2.2;
  // Poore & Nemecek, "Reducing food's environmental impacts through producers and consumers",
  // Science 2018 — global average diet, lifecycle CO2-eq per dietary kcal.
  // https://www.science.org/doi/10.1126/science.aaq0216

// --- US default prices (user-overridable in settings) ---
export const US_AVG_GAS_USD_GAL    = 3.50;   // EIA U.S. retail gasoline rolling avg (2025-26)
export const US_AVG_ELEC_USD_KWH   = 0.18;   // EIA residential avg (2025-26)
export const US_AVG_GRID_KG_CO2_KWH = 0.371; // EPA eGRID 2022 national, used when no state selected

// --- HEAT (simplified per-trip share of WHO HEAT methodology) ---
export const VSL_USD = 11_400_000;
  // US DOT 2024 Value of Statistical Life guidance.
  // https://www.transportation.gov/office-policy/transportation-policy/revised-departmental-guidance-on-valuation-of-a-statistical-life-in-economic-analysis
export const HEAT_RR_CYCLING            = 0.90;  // Kelly 2014 meta-analysis: ~10% all-cause mortality reduction at reference dose
export const HEAT_RR_WALKING            = 0.89;  // Kelly 2014: ~11% reduction at reference dose
export const HEAT_CYCLING_REF_MIN_WK    = 100;   // WHO HEAT reference dose
export const HEAT_WALKING_REF_MIN_WK    = 168;   // WHO HEAT reference dose
export const HEAT_CAP_MIN_WK            = 450;   // WHO HEAT cap (no further benefit above this)
export const HEAT_BACKGROUND_MORTALITY_US = 0.0084;
  // CDC NVSR 2023 crude all-cause death rate, ~8.4 per 1,000 population.
  // https://www.cdc.gov/nchs/products/nvsr.htm

// --- MET (Metabolic Equivalent of Task) values ---
// Ainsworth et al., "2011 Compendium of Physical Activities".
// https://sites.google.com/site/compendiumofphysicalactivities/
export const MET_WALKING_MODERATE = 3.5;   // ~3.0 mph, level
export const MET_CYCLING_LEISURE  = 6.8;   // ~12–14 mph
export const MET_EBIKE            = 4.9;   // Langford et al. 2017

// --- Marginal vehicle wear $/mi — the trip-attributable portion.
//
// We deliberately EXCLUDE fixed costs (insurance, registration, time-based depreciation),
// because those don't scale with whether you take this particular trip. The number reflects
// "how much does this trip wear on the car?" — closer to honest for per-trip comparison than
// AAA's full "cost-of-ownership" composite, which inflates marginal cost roughly 4×.
//
// Breakdown for a typical sedan (~$0.13/mi):
//   • Maintenance & repairs ........... ~$0.06/mi  (AAA YDC 2024 "maintenance/repairs" row)
//   • Tires ........................... ~$0.02/mi  (NHTSA replacement cycles)
//   • Wear-related depreciation ....... ~$0.05/mi  (estimated from used-market $/mi correlation)
//
// Sources:
//   • AAA "Your Driving Costs 2024" maintenance row: https://newsroom.aaa.com
//   • IRS std mileage 2025 = $0.70/mi (full ownership), useful only as ceiling reference
//   • Consumer Reports lifetime-cost studies
export const VEHICLE_WEAR_USD_PER_MI = {
  small_sedan:  0.10,
  medium_sedan: 0.13,
  small_suv:    0.14,
  medium_suv:   0.17,
  pickup:       0.19,
  hybrid:       0.11,   // simpler maintenance, brake-regen reduces wear
  ev:           0.09,   // fewest moving parts; tires wear faster but not enough to offset
};
export const VEHICLE_CLASS_LABELS = {
  small_sedan:  'Small sedan',
  medium_sedan: 'Medium sedan',
  small_suv:    'Small SUV',
  medium_suv:   'Medium SUV',
  pickup:       'Pickup truck',
  hybrid:       'Hybrid',
  ev:           'Electric (EV)',
};

// --- Bike & e-bike rolling costs ($/mi marginal) ---
// Regular bike: tires, chain, brake pads, occasional tune-up. League of American Bicyclists
// and consumer cycling-magazine estimates converge on $50–150/yr for moderate riders
// (~2000 mi/yr) → $0.025–0.075/mi. Use 0.03 (mid-low; chain/tire/brake are the variable parts).
export const BIKE_MAINT_USD_PER_MI  = 0.03;
//
// E-bike: regular-bike maintenance plus amortised battery wear (~$500 / ~30,000 mi = $0.017/mi)
// plus drivetrain wear from motor torque (~$0.01/mi). Total ~$0.05–0.07/mi.
export const EBIKE_MAINT_USD_PER_MI = 0.06;

// --- E-bike efficiency presets (Wh/mile) ---
export const EBIKE_WH_PER_MI = {
  light:    20,
  standard: 30,
  cargo:    50,
};
export const EBIKE_TYPE_LABELS = {
  light:    'Lightweight (≈250 W)',
  standard: 'Standard commuter (≈500 W)',
  cargo:    'Cargo (heavy load)',
};

// --- EV ---
export const EV_KWH_PER_MI_DEFAULT = 0.30;   // typical mid-size EV (EPA 2024 averages)

// --- e-bike speedup multiplier vs. OSRM bike profile (no native ebike costing) ---
export const EBIKE_DURATION_MULTIPLIER = 0.7;
  // E-bike commute speeds are ~30% faster than analog bikes at moderate assist.
  // Sources: Langford 2017; Bourne et al. 2018 meta-analysis on e-bike commute behaviour.

// --- HEAT e-bike health-benefit discount ---
// e-bikers achieve roughly the MET_EBIKE / MET_CYCLING_LEISURE share of the cycling benefit
// per active-minute (lower exertion, self-selected longer trips offset partially).
export const EBIKE_HEAT_DISCOUNT = MET_EBIKE / MET_CYCLING_LEISURE;  // ≈ 0.72

// --- Transit (RESERVED for v2; here so engine/transit.js can import without churn) ---
export const TRANSIT_KG_CO2_PER_PMT = {  // EPA 2024 transit emission factors, per passenger-mile
  bus_diesel: 0.089,
  bus_electric: 0.030,
  rail_light: 0.041,
  rail_commuter: 0.080,
  rail_intercity: 0.058,
  ferry: 0.190,
  tram: 0.030,
};
export const MET_TRANSIT_RIDING = 1.3;   // seated/standing on transit, mild postural activity
export const DEFAULT_TRANSIT_FARE_USD = 2.50;
