// Credits — creator + every open-source dependency, dataset, and service the app uses.
// Rendered by ui/credits-screen.js. Verify license terms and donate URLs annually.

export const CREATOR = {
  name: 'Rishi Verma',
  url: 'https://riverma.github.io',
  blurb: 'Created and maintained by Rishi Verma. Part of riverma.github.io.',
};

export const CREDITS = [
  // --- Software libraries ---
  { section: 'Software libraries', name: 'Leaflet', license: 'BSD-2-Clause',
    role: 'Lightweight interactive map rendering on the route view. Self-hosted in vendor/leaflet/.',
    url: 'https://leafletjs.com',
    donateUrl: 'https://opencollective.com/leaflet' },

  // --- Map data & tile servers ---
  { section: 'Map data & tile servers', name: 'OpenStreetMap', license: 'ODbL 1.0',
    role: 'Community-built map data underlying every tile, route, and address lookup in this app.',
    url: 'https://www.openstreetmap.org',
    donateUrl: 'https://donate.openstreetmap.org' },
  { section: 'Map data & tile servers', name: 'OSM tile servers (operations.osmfoundation.org)',
    license: 'OSMF Tile Usage Policy',
    role: 'Hosted raster tiles displayed on the map. Please use the donate link to support hosting.',
    url: 'https://operations.osmfoundation.org/policies/tiles/',
    donateUrl: 'https://supportingthemap.org' },

  // --- Routing & geocoding ---
  { section: 'Routing & geocoding services', name: 'OSRM (Open Source Routing Machine)',
    license: 'BSD-2-Clause',
    role: 'Default routing engine — computes driving, cycling, and walking directions. Public instance hosted by FOSSGIS e.V. at routing.openstreetmap.de.',
    url: 'https://project-osrm.org',
    donateUrl: 'https://www.fossgis.de/spende' },
  { section: 'Routing & geocoding services', name: 'GraphHopper', license: 'Apache-2.0',
    role: 'Optional alternative routing engine — used when an API key is provided in settings.',
    url: 'https://www.graphhopper.com',
    donateUrl: 'https://github.com/sponsors/karussell' },
  { section: 'Routing & geocoding services', name: 'Photon (by Komoot)', license: 'Apache-2.0',
    role: 'Address autocomplete and geocoding, built on OpenStreetMap data.',
    url: 'https://photon.komoot.io',
    donateUrl: null },

  // --- Reference data & methodology ---
  { section: 'Reference data & methodology', name: 'WHO HEAT', license: 'WHO open access',
    role: 'Health Economic Assessment Tool methodology — simplified to per-trip health-benefit estimates here.',
    url: 'https://www.heatwalkingcycling.org',
    donateUrl: null },
  { section: 'Reference data & methodology', name: 'EPA GHG Emission Factors',
    license: 'US Government work (public domain)',
    role: 'Gasoline CO₂ emission factor (8.887 kg / gallon) and reference figures.',
    url: 'https://www.epa.gov/climateleadership/ghg-emission-factors-hub',
    donateUrl: null },
  { section: 'Reference data & methodology', name: 'EPA eGRID',
    license: 'US Government work (public domain)',
    role: 'State-level electricity-grid carbon intensities used in e-bike CO₂ calculations.',
    url: 'https://www.epa.gov/egrid',
    donateUrl: null },
  { section: 'Reference data & methodology', name: 'US Energy Information Administration (EIA)',
    license: 'US Government work (public domain)',
    role: 'Default gasoline and electricity price benchmarks.',
    url: 'https://www.eia.gov',
    donateUrl: null },
  { section: 'Reference data & methodology', name: 'AAA "Your Driving Costs"',
    license: 'AAA report — cited',
    role: 'Non-fuel cost-per-mile figures by vehicle class (depreciation, maintenance, insurance, registration).',
    url: 'https://newsroom.aaa.com',
    donateUrl: null },
  { section: 'Reference data & methodology',
    name: 'fueleconomy.gov (US DOE / EPA)',
    license: 'US Government work (public domain)',
    role: 'Optional year/make/model MPG lookup in the settings screen.',
    url: 'https://www.fueleconomy.gov',
    donateUrl: null },
  { section: 'Reference data & methodology',
    name: 'Ainsworth et al. — 2011 Compendium of Physical Activities',
    license: 'Academic, cited',
    role: 'Standard MET values for calorie-burn calculations.',
    url: 'https://sites.google.com/site/compendiumofphysicalactivities/',
    donateUrl: null },
  { section: 'Reference data & methodology',
    name: 'Poore & Nemecek (Science, 2018)', license: 'Academic, cited',
    role: 'Embedded carbon per dietary kcal — used to compute food-side CO₂ for active modes.',
    url: 'https://www.science.org/doi/10.1126/science.aaq0216',
    donateUrl: null },
  { section: 'Reference data & methodology',
    name: 'CDC National Vital Statistics Reports', license: 'US Government work (public domain)',
    role: 'US background all-cause mortality rate used in the HEAT calculation.',
    url: 'https://www.cdc.gov/nchs/products/nvsr.htm',
    donateUrl: null },
];

// Group helper for the UI.
export function creditsBySection() {
  const groups = new Map();
  for (const c of CREDITS) {
    if (!groups.has(c.section)) groups.set(c.section, []);
    groups.get(c.section).push(c);
  }
  return groups;
}
