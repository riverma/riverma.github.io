// Settings form. Renders once, binds to a local copy of settings, saves on Apply.
// All unit-dependent fields are displayed in the user's chosen measurement system:
// the storage stays canonical (kg, mph, mpg, $/gal) and the form converts at the
// input/output boundary. Switching system re-renders the form with converted values.

import { el, clear } from '../util/dom.js';
import { loadSettings, saveSettings, resetSettings } from '../settings.js';
import { US_STATES, STATE_BY_CODE } from '../data/states.js';
import { VEHICLE_CLASS_LABELS, EBIKE_TYPE_LABELS, EBIKE_WH_PER_MI } from '../data/constants.js';
import { icon } from './icons.js';
import {
  kgToLb, lbToKg, mphToKmh, kmhToMph,
  mpgToL100km, l100kmToMpg, usdGalToUsdL, usdLToUsdGal,
} from '../util/units.js';

const FE_BASE = 'https://www.fueleconomy.gov/ws/rest';

export function initSettingsScreen(rootEl, { onClose }) {
  let working = loadSettings();

  function isMetric() { return working.units === 'metric'; }

  function render() {
    clear(rootEl);
    rootEl.appendChild(buildHeader());
    rootEl.appendChild(buildForm());
  }

  function buildHeader() {
    const back = el('button', { class: 'mc-icon-btn', 'aria-label': 'Back', onclick: () => onClose() });
    back.appendChild(icon('chevronLeft'));
    return el('header', { class: 'mc-app-header' },
      back,
      el('h1', { class: 'mc-h1' }, 'Settings'),
      el('span', { class: 'mc-spacer' }),
    );
  }

  function buildForm() {
    const form = el('form', { class: 'mc-settings', onsubmit: (e) => e.preventDefault() });

    // Measurement system
    form.appendChild(section('Display', [
      radioField('Measurement system', 'units', [
        { value: 'imperial', label: 'US (miles · pounds · gallons)' },
        { value: 'metric',   label: 'Metric (km · kilograms · litres)' },
      ], () => {
        // Re-render so all unit-bound fields update their labels and converted values.
        render();
      }),
    ]));

    // Vehicle / Driving
    form.appendChild(section('Driving', [
      selectField('Vehicle class', 'vehicleClass', VEHICLE_CLASS_LABELS),
      mpgField(),
      gasPriceField(),
    ]));

    // Region
    form.appendChild(section('Region (affects grid CO₂ and default gas price)', [
      selectField('US state', 'stateCode',
        Object.fromEntries([['', '(none — use US average)'], ...US_STATES.map(s => [s.code, s.name])])),
      numberField('Electricity ($ / kWh)', 'electricityUsdKwh', 0.001, 0, 1),
    ]));

    // E-bike
    form.appendChild(section('E-bike', [
      radioField('E-bike type', 'ebikeType', Object.entries(EBIKE_TYPE_LABELS).map(([v, l]) =>
        ({ value: v, label: `${l} — ${formatEbikeEfficiency(EBIKE_WH_PER_MI[v])}` }))),
    ]));

    // You — weight + activity
    form.appendChild(section('You', [
      weightField(),
      numberField('Trips per year (for health benefit estimate)', 'tripsPerYear', 1, 1, 1000),
    ]));

    // GraphHopper
    form.appendChild(section('Optional: GraphHopper API key', [
      el('p', { class: 'mc-help' },
        'OSRM is the default router. If OSRM is slow or unavailable, paste a free GraphHopper key here (kept in your browser only).'),
      textField('API key', 'graphhopperKey', 'paste key or leave empty'),
    ]));

    // Actions
    form.appendChild(el('div', { class: 'mc-form-actions' },
      el('button', { type: 'button', class: 'mc-btn-primary', onclick: applyAndClose }, 'Save'),
      el('button', { type: 'button', class: 'mc-btn', onclick: () => { working = resetSettings(); render(); } }, 'Reset to defaults'),
    ));

    return form;
  }

  function section(title, children) {
    return el('div', { class: 'mc-section-group' },
      el('h2', { class: 'mc-section-title' }, title),
      el('section', { class: 'mc-section' }, ...children),
    );
  }

  function radioField(label, key, options, onSelect) {
    const wrap = el('fieldset', { class: 'mc-field' }, el('legend', {}, label));
    for (const opt of options) {
      const id = `set-${key}-${opt.value}`;
      const input = el('input', {
        type: 'radio', id, name: key, value: opt.value,
        checked: working[key] === opt.value,
        onchange: () => { working[key] = opt.value; if (onSelect) onSelect(); },
      });
      wrap.appendChild(el('label', { for: id, class: 'mc-radio' }, input, ' ', opt.label));
    }
    return wrap;
  }

  function selectField(label, key, mapping) {
    const sel = el('select', { name: key, onchange: (e) => { working[key] = e.target.value; } });
    for (const [val, txt] of Object.entries(mapping)) {
      const opt = el('option', { value: val }, txt);
      if (working[key] === val) opt.selected = true;
      sel.appendChild(opt);
    }
    return el('label', { class: 'mc-field' }, el('span', {}, label), sel);
  }

  function numberField(label, key, step, min, max) {
    const input = el('input', {
      type: 'number', name: key, value: String(working[key] ?? ''),
      step: String(step), min: String(min), max: String(max),
      oninput: (e) => { working[key] = parseFloat(e.target.value) || 0; },
    });
    return el('label', { class: 'mc-field' }, el('span', {}, label), input);
  }

  function textField(label, key, placeholder) {
    const input = el('input', {
      type: 'text', name: key, value: String(working[key] ?? ''), placeholder: placeholder || '',
      oninput: (e) => { working[key] = e.target.value; },
    });
    return el('label', { class: 'mc-field' }, el('span', {}, label), input);
  }

  // --- Unit-aware fields ---

  function weightField() {
    const metric = isMetric();
    const labelText = `Body weight (${metric ? 'kg' : 'lb'})`;
    const displayed = metric ? working.weightKg : kgToLb(working.weightKg);
    const input = el('input', {
      type: 'number', name: 'weightDisplay',
      value: String(round1(displayed)), step: '0.5', min: '20', max: '500',
      oninput: (e) => {
        const v = parseFloat(e.target.value) || 0;
        working.weightKg = metric ? v : lbToKg(v);
      },
    });
    return el('label', { class: 'mc-field' }, el('span', {}, labelText), input);
  }

  function mpgField() {
    const metric = isMetric();
    const labelText = metric ? 'Fuel use (L/100 km)' : 'Fuel economy (mpg)';
    const displayed = metric ? mpgToL100km(working.mpg) : working.mpg;
    const input = el('input', {
      type: 'number', name: 'mpgDisplay',
      value: String(round1(displayed)),
      step: metric ? '0.1' : '0.1',
      min: '0.1', max: '200',
      oninput: (e) => {
        const v = parseFloat(e.target.value) || 0;
        working.mpg = metric ? l100kmToMpg(v) : v;
      },
    });
    const lookupBtn = el('button', { type: 'button', class: 'mc-btn',
      onclick: () => openMpgLookup(input, metric) }, 'Look up by year/make/model');
    return el('label', { class: 'mc-field' },
      el('span', {}, labelText),
      el('div', { class: 'mc-inline' }, input, lookupBtn),
    );
  }

  function gasPriceField() {
    const metric = isMetric();
    const labelText = metric ? 'Gas price ($/L)' : 'Gas price ($/gal)';
    const displayed = metric ? usdGalToUsdL(working.gasPriceUsdGal) : working.gasPriceUsdGal;
    const input = el('input', {
      type: 'number', name: 'gasDisplay',
      value: String(round2(displayed)),
      step: '0.01', min: '0.1', max: '20',
      oninput: (e) => {
        const v = parseFloat(e.target.value) || 0;
        working.gasPriceUsdGal = metric ? usdLToUsdGal(v) : v;
      },
    });
    const stateBtn = el('button', { type: 'button', class: 'mc-btn', onclick: () => {
      const st = STATE_BY_CODE[working.stateCode];
      if (st) {
        working.gasPriceUsdGal = st.gas;
        input.value = String(round2(metric ? usdGalToUsdL(st.gas) : st.gas));
      }
    } }, "Use my state's average");
    return el('label', { class: 'mc-field' },
      el('span', {}, labelText),
      el('div', { class: 'mc-inline' }, input, stateBtn));
  }

  function formatEbikeEfficiency(whPerMi) {
    if (isMetric()) {
      const whKm = whPerMi / 1.609344;
      return `${Math.round(whKm)} Wh/km`;
    }
    return `${whPerMi} Wh/mi`;
  }

  // --- fueleconomy.gov MPG lookup ---

  async function openMpgLookup(targetInput, metric) {
    const modal = el('div', { class: 'mc-modal', role: 'dialog', 'aria-modal': 'true' });
    const card = el('div', { class: 'mc-modal-card' });
    const body = el('div', { class: 'mc-modal-body' }, el('p', {}, 'Loading years…'));
    const close = el('button', { class: 'mc-icon-btn', onclick: () => modal.remove(), 'aria-label': 'Close' });
    close.appendChild(icon('chevronLeft'));   // reuse chevron as close glyph
    card.appendChild(el('header', { class: 'mc-modal-header' }, el('h3', {}, 'Find MPG'), close));
    card.appendChild(body);
    modal.appendChild(card);
    document.body.appendChild(modal);

    try {
      const yearItems = await feMenu('vehicle/menu/year');
      const yearSel = mkSelect(yearItems);
      const makeSel = el('select', { disabled: true });
      const modelSel = el('select', { disabled: true });
      const optionsSel = el('select', { disabled: true });

      yearSel.addEventListener('change', async () => {
        makeSel.replaceChildren(el('option', {}, 'Loading…')); modelSel.disabled = optionsSel.disabled = true;
        const makes = await feMenu(`vehicle/menu/make?year=${yearSel.value}`);
        replaceOptions(makeSel, makes); makeSel.disabled = false;
      });
      makeSel.addEventListener('change', async () => {
        modelSel.replaceChildren(el('option', {}, 'Loading…')); optionsSel.disabled = true;
        const models = await feMenu(`vehicle/menu/model?year=${yearSel.value}&make=${encodeURIComponent(makeSel.value)}`);
        replaceOptions(modelSel, models); modelSel.disabled = false;
      });
      modelSel.addEventListener('change', async () => {
        optionsSel.replaceChildren(el('option', {}, 'Loading…'));
        const opts = await feMenu(`vehicle/menu/options?year=${yearSel.value}&make=${encodeURIComponent(makeSel.value)}&model=${encodeURIComponent(modelSel.value)}`);
        replaceOptions(optionsSel, opts); optionsSel.disabled = false;
      });

      const useBtn = el('button', { class: 'mc-btn-primary', onclick: async () => {
        if (!optionsSel.value) return;
        const mpg = await feMpg(optionsSel.value);
        if (mpg != null) {
          working.mpg = mpg;
          targetInput.value = String(round1(metric ? mpgToL100km(mpg) : mpg));
          modal.remove();
        }
      } }, 'Use combined MPG');

      clear(body);
      body.appendChild(grid([['Year', yearSel], ['Make', makeSel], ['Model', modelSel], ['Trim', optionsSel]]));
      body.appendChild(useBtn);
    } catch (err) {
      clear(body);
      body.appendChild(el('p', { class: 'mc-error' },
        `Lookup unavailable (${err.message}). Please enter MPG manually.`));
    }
  }

  function applyAndClose() {
    saveSettings(working);
    onClose();
  }

  render();
  return { reload: () => { working = loadSettings(); render(); } };
}

// --- Helpers ---

const round1 = (v) => Math.round(v * 10) / 10;
const round2 = (v) => Math.round(v * 100) / 100;

async function feMenu(path) {
  const res = await fetch(`${FE_BASE}/${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const items = Array.isArray(data.menuItem) ? data.menuItem : (data.menuItem ? [data.menuItem] : []);
  return items.map(m => ({ value: String(m.value), text: String(m.text) }));
}

async function feMpg(vehicleId) {
  const res = await fetch(`${FE_BASE}/vehicle/${vehicleId}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const combined = data.comb08 ?? data.comb08U;
  const n = parseFloat(combined);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function mkSelect(items) {
  const sel = document.createElement('select');
  replaceOptions(sel, items);
  return sel;
}

function replaceOptions(sel, items) {
  sel.replaceChildren(...items.map(it => {
    const o = document.createElement('option');
    o.value = it.value; o.textContent = it.text;
    return o;
  }));
}

function grid(rows) {
  const tbl = el('div', { class: 'mc-modal-grid' });
  rows.forEach(([label, control]) => {
    tbl.appendChild(el('label', {}, label));
    tbl.appendChild(control);
  });
  return tbl;
}
