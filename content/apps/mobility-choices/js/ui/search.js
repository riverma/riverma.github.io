// Address search input with Photon-backed autocomplete and a "lat,lon" escape hatch.
// One factory per input (start/end) keeps state local.

import { suggest, parseLatLon } from '../geo/geocode.js';
import { debounce } from '../util/debounce.js';
import { el, clear } from '../util/dom.js';

export function initSearchInput(rootEl, { label, onPick }) {
  const inputId = `search-${label.toLowerCase()}`;
  const input = el('input', {
    id: inputId, type: 'search', autocomplete: 'off',
    placeholder: `${label} (address, place, or "lat,lon")`,
    'aria-label': label,
    'aria-autocomplete': 'list',
    'aria-controls': `${inputId}-list`,
  });
  const list = el('ul', { id: `${inputId}-list`, class: 'mc-suggest', role: 'listbox', hidden: true });
  const wrap = el('div', { class: 'mc-search-row' },
    el('label', { for: inputId }, label),
    el('div', { class: 'mc-search-input' }, input, list),
  );
  rootEl.appendChild(wrap);

  let activeController = null;
  let cache = new Map();   // query → places[]

  const run = debounce(async (q) => {
    // lat,lon escape hatch: accept and don't query Photon.
    const direct = parseLatLon(q);
    if (direct) {
      renderSuggestions([{ ...direct }], 'Use coordinates');
      return;
    }
    if (!q || q.length < 2) { hideList(); return; }
    if (cache.has(q)) { renderSuggestions(cache.get(q)); return; }
    if (activeController) activeController.abort();
    activeController = new AbortController();
    try {
      const hits = await suggest(q, { signal: activeController.signal });
      cache.set(q, hits);
      // Trim cache to last 30 entries.
      if (cache.size > 30) cache = new Map([...cache.entries()].slice(-30));
      renderSuggestions(hits);
    } catch (err) {
      if (err.name !== 'AbortError') renderError(err);
    }
  }, 250);

  input.addEventListener('input', (e) => run(e.target.value));
  input.addEventListener('focus', () => { if (list.children.length) list.hidden = false; });
  input.addEventListener('keydown', onKeyDown);
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) hideList();
  });

  function renderSuggestions(hits, hintLabel = null) {
    clear(list);
    if (!hits?.length) {
      list.appendChild(el('li', { class: 'mc-suggest-empty', 'aria-disabled': 'true' }, 'No matches'));
    } else {
      hits.forEach((p, i) => {
        const li = el('li', {
          class: 'mc-suggest-item', role: 'option', tabindex: '-1', dataset: { idx: String(i) },
        }, hintLabel && i === 0 ? `${hintLabel}: ${p.label}` : p.label);
        li.addEventListener('mousedown', (e) => { e.preventDefault(); pick(p); });
        list.appendChild(li);
      });
    }
    list.hidden = false;
  }

  function renderError(err) {
    clear(list);
    list.appendChild(el('li', { class: 'mc-suggest-error' }, `Lookup failed: ${err.message || err}`));
    list.hidden = false;
  }

  function pick(place) {
    input.value = place.label;
    hideList();
    onPick(place);
  }

  function hideList() { list.hidden = true; }

  function onKeyDown(e) {
    const items = list.querySelectorAll('.mc-suggest-item');
    if (!items.length) {
      if (e.key === 'Enter') {
        // Try lat,lon on Enter without suggestions.
        const direct = parseLatLon(input.value);
        if (direct) pick(direct);
      }
      return;
    }
    const current = list.querySelector('[aria-selected="true"]');
    let idx = current ? Number(current.dataset.idx) : -1;
    if (e.key === 'ArrowDown') { idx = Math.min(items.length - 1, idx + 1); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { idx = Math.max(0, idx - 1); e.preventDefault(); }
    else if (e.key === 'Enter')  {
      e.preventDefault();
      if (idx < 0) idx = 0;
      const hit = list.querySelector(`[data-idx="${idx}"]`);
      hit?.dispatchEvent(new MouseEvent('mousedown'));
      return;
    } else if (e.key === 'Escape') { hideList(); return; }
    else return;
    items.forEach(li => li.removeAttribute('aria-selected'));
    list.querySelector(`[data-idx="${idx}"]`)?.setAttribute('aria-selected', 'true');
  }

  return {
    setValue(text) { input.value = text; },
    focus() { input.focus(); },
  };
}
