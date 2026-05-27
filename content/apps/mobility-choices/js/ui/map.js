// Leaflet wrapper. Sole consumer of the global L (loaded as a classic script before this module).
// Owns the map, OSM tile layer, per-mode route layer groups, and start/end markers.

const MODE_COLORS = {
  car:     '#2e7df2',  // sky / transit blue
  bicycle: '#16a34a',  // energy green
  ebike:   '#8b5cf6',  // electric violet
  foot:    '#f59e0b',  // warm amber
  transit: '#ef4444',  // red — reserved
};

const HL_WEIGHT = 8, HL_OPACITY = 0.98, HL_CASING = 'rgba(255,255,255,0.9)';
const DIM_WEIGHT = 5, DIM_OPACITY = 0.5;

export function initMap(containerEl) {
  const L = window.L;
  if (!L) throw new Error('Leaflet not loaded — ensure vendor/leaflet/leaflet.js is included before this module');

  // Override default icon paths because we self-host images under vendor/leaflet/images/.
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'vendor/leaflet/images/marker-icon-2x.png',
    iconUrl:       'vendor/leaflet/images/marker-icon.png',
    shadowUrl:     'vendor/leaflet/images/marker-shadow.png',
  });

  const map = L.map(containerEl, { zoomControl: true, attributionControl: true })
              .setView([34.0522, -118.2437], 11);  // Los Angeles default

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Per-mode layer groups: each holds a casing polyline + a colored polyline.
  const layers = {};
  for (const profile of Object.keys(MODE_COLORS)) {
    layers[profile] = L.layerGroup().addTo(map);
  }

  const markers = { start: null, end: null };

  let selectedMode = 'car';

  function clearRoutes() {
    for (const lg of Object.values(layers)) lg.clearLayers();
  }

  function setMarkers(start, end) {
    if (markers.start) { map.removeLayer(markers.start); markers.start = null; }
    if (markers.end)   { map.removeLayer(markers.end);   markers.end = null; }
    if (start) markers.start = L.marker([start.lat, start.lon], { title: start.label || 'Start' }).addTo(map);
    if (end)   markers.end   = L.marker([end.lat,   end.lon],   { title: end.label   || 'End'   }).addTo(map);
  }

  function setRoutes(resultsByProfile) {
    clearRoutes();
    for (const [profile, result] of Object.entries(resultsByProfile || {})) {
      const geom = result?.route?.geometry || result?.geometry;
      if (!geom) continue;
      const color = MODE_COLORS[profile] || '#444';
      const isSelected = profile === selectedMode;

      // White casing underneath for contrast over busy tiles when highlighted.
      if (isSelected) {
        window.L.geoJSON(geom, { style: { color: HL_CASING, weight: HL_WEIGHT + 4, opacity: 0.9 } })
                .addTo(layers[profile]);
      }
      window.L.geoJSON(geom, {
        style: {
          color,
          weight:  isSelected ? HL_WEIGHT  : DIM_WEIGHT,
          opacity: isSelected ? HL_OPACITY : DIM_OPACITY,
        },
      }).addTo(layers[profile]);
    }
  }

  function setMode(profile) {
    if (selectedMode === profile) return;
    selectedMode = profile;
    // Restyle: the cheapest way without losing geometry references is to rebuild from the
    // last-known results. The caller (main.js) is expected to invoke setRoutes again.
  }

  function fitToRouteFeatures() {
    const all = [];
    for (const lg of Object.values(layers)) {
      lg.eachLayer(l => { if (l.getBounds) all.push(l.getBounds()); });
    }
    if (markers.start) all.push(window.L.latLngBounds([markers.start.getLatLng()]));
    if (markers.end)   all.push(window.L.latLngBounds([markers.end.getLatLng()]));
    if (!all.length) return;
    const combined = all.reduce((acc, b) => acc.extend(b), all[0]);
    map.fitBounds(combined, { padding: [40, 40] });
  }

  function invalidate() { map.invalidateSize(); }

  return {
    setMarkers,
    setRoutes,
    setMode,
    fitToRoute: fitToRouteFeatures,
    clear: () => { clearRoutes(); setMarkers(null, null); },
    invalidate,
    get selectedMode() { return selectedMode; },
  };
}

export { MODE_COLORS };
