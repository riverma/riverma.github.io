// Minimal pub/sub state container.
// Single source of truth for screen, inputs, routing status, results, selected mode.

const listeners = new Set();
let state = freshState();

function freshState() {
  return {
    screen: 'main',                          // 'main' | 'settings' | 'about' | 'credits'
    start:  null,                            // { lat, lon, label }
    end:    null,                            // { lat, lon, label }
    status: 'idle',                          // 'idle' | 'routing' | 'results' | 'error'
    results: null,                           // { car: ModeResult|{error}, ... }
    selectedMode: 'car',                     // which mode's route is highlighted on the map
    sortBy: 'time',                          // 'time'|'cost'|'pollution'|'active'
    errorBanner: null,                       // top-of-screen banner text or null
  };
}

export function getState() { return state; }

export function setState(patch) {
  state = { ...state, ...patch };
  for (const fn of listeners) fn(state);
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

// Action helpers — encourage consistent dispatch from UI handlers.
export const actions = {
  setScreen:        (screen)        => setState({ screen }),
  setStart:         (place)         => setState({ start: place, status: 'idle', results: null }),
  setEnd:           (place)         => setState({ end: place, status: 'idle', results: null }),
  beginRouting:     ()              => setState({ status: 'routing', results: null, errorBanner: null }),
  setResults:       (results)       => setState({ status: 'results', results }),
  setError:         (msg)           => setState({ status: 'error', errorBanner: msg }),
  setSelectedMode:  (mode)          => setState({ selectedMode: mode }),
  setSortBy:        (key)           => setState({ sortBy: key }),
  clearBanner:      ()              => setState({ errorBanner: null }),
};
