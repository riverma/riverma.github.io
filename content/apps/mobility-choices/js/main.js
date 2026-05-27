// Entry: wire DOM ↔ state ↔ engine ↔ services.
// No math, no HTTP here — those live in engine/* and routing/* respectively.

import { getState, setState, subscribe, actions } from './state.js';
import { computeAllModes } from './engine/index.js';
import { initSearchInput } from './ui/search.js';
import { initMap } from './ui/map.js';
import { initResults } from './ui/results.js';
import { initSettingsScreen } from './ui/settings-screen.js';
import { initAboutScreen } from './ui/about-screen.js';
import { initCreditsScreen } from './ui/credits-screen.js';
import { loadSettings } from './settings.js';
import { icon } from './ui/icons.js';

// Replace [data-icon] declarative slots with their SVGs (header buttons, etc).
for (const host of document.querySelectorAll('[data-icon]')) {
  host.appendChild(icon(host.dataset.icon));
}

let settings = loadSettings();
let currentResults = null;        // last computed results — kept for map re-render on mode change
let activeAbort = null;           // for in-flight Compare cancellation

// --- Screen switching ---
const SCREENS = new Set(['main', 'settings', 'about', 'credits']);
function showScreen(name) {
  if (!SCREENS.has(name)) name = 'main';
  document.querySelectorAll('.mc-screen').forEach(el => el.classList.toggle('is-active', el.dataset.screen === name));
  // Trigger Leaflet resize when returning to main.
  if (name === 'main') queueMicrotask(() => mapApi?.invalidate());
  // Reload settings (user may have changed them).
  if (name === 'main') settings = loadSettings();
  actions.setScreen(name);
  // Reflect in URL hash so links and reloads stay on the same screen.
  if (location.hash !== `#${name}` && name !== 'main') location.hash = `#${name}`;
  else if (name === 'main' && location.hash) history.replaceState(null, '', location.pathname + location.search);
}

document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-go]');
  if (!btn) return;
  e.preventDefault();
  showScreen(btn.dataset.go);
});
document.addEventListener('mc:go', (e) => showScreen(e.detail));
window.addEventListener('hashchange', () => showScreen(location.hash.replace('#', '')));
// Honour an initial hash on first load.
if (location.hash) showScreen(location.hash.replace('#', ''));

// --- Boot UI ---
const searchBlock = document.getElementById('searchBlock');
const startInput = initSearchInput(searchBlock, { label: 'Start', onPick: (p) => { actions.setStart(p); updateCompareEnabled(); } });
const endInput   = initSearchInput(searchBlock, { label: 'End',   onPick: (p) => { actions.setEnd(p);   updateCompareEnabled(); } });

const mapApi = initMap(document.getElementById('map'));
const resultsApi = initResults(document.getElementById('results'), {
  onSelect: (profile) => {
    actions.setSelectedMode(profile);
    // Map sync happens in the state subscriber below — one place, never out-of-sync with state.
  },
});

initAboutScreen(document.getElementById('aboutScreen'), { onClose: () => showScreen('main') });
initCreditsScreen(document.getElementById('creditsScreen'), { onClose: () => showScreen('main') });
initSettingsScreen(document.getElementById('settingsScreen'), { onClose: () => showScreen('main') });

// --- Compare button ---
const compareBtn = document.getElementById('compareBtn');
function updateCompareEnabled() {
  const s = getState();
  compareBtn.disabled = !(s.start && s.end);
}
compareBtn.addEventListener('click', runCompare);

async function runCompare() {
  const s = getState();
  if (!s.start || !s.end) return;
  if (activeAbort) activeAbort.abort();
  activeAbort = new AbortController();
  actions.beginRouting();

  try {
    const results = await computeAllModes(s.start, s.end, settings, { signal: activeAbort.signal });
    currentResults = results;
    // Pick the first non-error mode as the default selected one (prefer car if it succeeded).
    const order = ['car', 'bicycle', 'ebike', 'foot'];
    const firstOk = order.find(p => results[p] && !results[p].error && !results[p].skipped) || 'car';
    setState({ status: 'results', results, selectedMode: firstOk });
    mapApi.setMarkers(s.start, s.end);
    mapApi.setRoutes(results);
    queueMicrotask(() => mapApi.fitToRoute());
  } catch (err) {
    actions.setError(err?.message || String(err));
  } finally {
    activeAbort = null;
  }
}

// --- Render on state changes ---
let lastRenderedSelectedMode = null;
subscribe((s) => {
  resultsApi.render({
    results: s.results,
    selectedMode: s.selectedMode,
    units: settings.units,
    status: s.status,
    errorBanner: s.errorBanner,
  });
  // Sync map highlight to state.selectedMode whenever it changes.
  if (s.status === 'results' && s.selectedMode !== lastRenderedSelectedMode && currentResults) {
    mapApi.setMode(s.selectedMode);
    mapApi.setRoutes(currentResults);
    lastRenderedSelectedMode = s.selectedMode;
  }
  const banner = document.getElementById('banner');
  if (s.errorBanner) { banner.textContent = s.errorBanner; banner.hidden = false; }
  else { banner.hidden = true; }
});

// --- Offline detection (informational banner) ---
function reflectOnline() {
  if (!navigator.onLine) setState({ errorBanner: 'Offline — routing and search are unavailable until you reconnect.' });
  else if (getState().errorBanner?.startsWith('Offline')) setState({ errorBanner: null });
}
window.addEventListener('online', reflectOnline);
window.addEventListener('offline', reflectOnline);
reflectOnline();

// Make map responsive to viewport changes (e.g. when keyboard hides on mobile).
window.addEventListener('resize', () => mapApi.invalidate());

// --- Demo trigger for screenshots / shareable preview URLs ---
// ?demo=1 → auto-fires the Pasadena→DTLA comparison so the loaded state is reproducible.
if (new URLSearchParams(location.search).get('demo') === '1') {
  actions.setStart({ lat: 34.1478, lon: -118.1445, label: 'Pasadena, CA' });
  actions.setEnd  ({ lat: 34.0522, lon: -118.2437, label: 'Downtown Los Angeles, CA' });
  document.querySelector('input[aria-label="Start"]').value = 'Pasadena, CA';
  document.querySelector('input[aria-label="End"]').value   = 'Downtown Los Angeles, CA';
  compareBtn.disabled = false;
  setTimeout(() => compareBtn.click(), 50);
}
