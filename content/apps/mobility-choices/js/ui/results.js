// Stacked results cards: every mode's full information visible inline.
// There is no blended score — each mode shows independent signals (Cost, Time, Pollution,
// Activity) as chips, and the expanded view lays each section out as a calculation table
// showing how the numbers were derived. A sort bar at the top reorders by the chosen signal.

import { el, clear } from '../util/dom.js';
import { formatDistance, formatDuration, formatUsd, formatKg } from '../util/units.js';
import { icon } from './icons.js';
import { sortProfiles, tripCostUsd } from '../engine/index.js';
import { ACTIVITY_WEEKLY_GOAL_MIN, ACTIVITY_MORTALITY_REDUCTION_PCT } from '../data/constants.js';

const PROFILE_ORDER  = ['car', 'bicycle', 'ebike', 'foot'];
const SORT_OPTIONS   = [
  { key: 'time',      label: 'Time'      },
  { key: 'cost',      label: 'Cost'      },
  { key: 'pollution', label: 'Pollution' },
  { key: 'active',    label: 'Activity'  },
];

export function initResults(rootEl, { onSelect, onSortChange, onToggleExpand }) {
  const sortBar = el('div', { class: 'mc-sort-bar' });
  const cardsEl = el('div', { class: 'mc-cards' });
  rootEl.appendChild(sortBar);
  rootEl.appendChild(cardsEl);

  function render({ results, selectedMode, units, status, errorBanner, sortBy, expandedCards, includeMaintenance }) {
    clear(sortBar);
    clear(cardsEl);

    if (status === 'idle') {
      cardsEl.appendChild(renderEmptyHero());
      return;
    }
    if (status === 'routing') {
      cardsEl.appendChild(el('p', { class: 'mc-hint' }, 'Computing routes…'));
      return;
    }
    if (status === 'error') {
      cardsEl.appendChild(el('p', { class: 'mc-error' }, errorBanner || 'Something went wrong.'));
      return;
    }

    // status === 'results'
    sortBar.appendChild(renderSortBar(sortBy));
    const ordered = sortProfiles(results, sortBy, { includeMaintenance });
    ordered.forEach((profile, idx) => {
      const r = results[profile];
      const isSelected = profile === selectedMode;
      const isExpanded = expandedCards?.has(profile);
      const isBest = idx === 0 && !r?.error && !r?.skipped;
      cardsEl.appendChild(renderCard(profile, r, { isSelected, isExpanded, isBest, units, includeMaintenance }));
    });
  }

  function renderSortBar(sortBy) {
    const wrap = el('div', { class: 'mc-sort-inner' });
    wrap.appendChild(el('label', { class: 'mc-sort-label', for: 'mc-sort' }, 'Sort by'));
    const sel = el('select', { id: 'mc-sort', class: 'mc-sort-select',
      onchange: (e) => onSortChange(e.target.value),
    });
    for (const opt of SORT_OPTIONS) {
      const o = el('option', { value: opt.key }, opt.label);
      if (opt.key === sortBy) o.selected = true;
      sel.appendChild(o);
    }
    wrap.appendChild(sel);
    return wrap;
  }

  function renderCard(profile, r, { isSelected, isExpanded, isBest, units, includeMaintenance }) {
    const card = el('article', {
      class: 'mc-card' + (isSelected ? ' is-selected' : '') + (isBest ? ' is-best' : ''),
      style: {
        '--mc-card-accent': `var(--mc-c-${profile === 'foot' ? 'foot' : profile})`,
        '--mc-card-tint':   `var(--mc-c-${profile === 'foot' ? 'foot' : profile}-tint)`,
      },
      onclick: (e) => {
        if (e.target.closest('button, a, summary')) return;
        onSelect(profile);
      },
    });

    if (!r || r.error || r.skipped) {
      card.appendChild(renderUnavailableCard(profile, r));
      return card;
    }

    // Header — icon, label, primary time + distance, best badge
    const head = el('div', { class: 'mc-card-head' });
    const iconHost = el('span', { class: 'mc-card-icon', 'aria-hidden': 'true' });
    iconHost.appendChild(icon(r.icon));
    head.appendChild(iconHost);
    const headText = el('div', { class: 'mc-card-headtext' });
    headText.appendChild(el('h3', { class: 'mc-card-label' }, r.label));
    headText.appendChild(el('p', { class: 'mc-card-sub' },
      `${formatDuration(r.duration_min * 60)} · ${formatDistance(r.distance_mi * 1609.344, units)}`));
    head.appendChild(headText);
    if (isBest) head.appendChild(el('span', { class: 'mc-best-badge' }, '★ Best'));
    card.appendChild(head);

    // Three signal chips: Cost / Pollution / Activity
    const cost = tripCostUsd(r, { includeMaintenance });
    const metrics = el('div', { class: 'mc-metric-row' });
    metrics.appendChild(metricChip('Cost',      formatCostUsd(cost),    impactKlass(cost, 0.005, r.impact)));
    metrics.appendChild(metricChip('Pollution', formatPollutionChip(r), impactKlass(r.pollution.operational_kg, 0.001, r.impact)));
    metrics.appendChild(metricChip('Activity',  formatActivityChip(r),  r.activity.minutes > 0 ? 'benefit' : 'neutral'));
    card.appendChild(metrics);

    // Expand button + detail panel
    const moreBtn = el('button', {
      class: 'mc-more-btn', type: 'button',
      'aria-expanded': isExpanded ? 'true' : 'false',
      onclick: () => onToggleExpand(profile),
    });
    moreBtn.appendChild(el('span', {}, isExpanded ? 'Hide details' : 'More info'));
    moreBtn.appendChild(icon(isExpanded ? 'chevronUp' : 'chevronDown'));
    card.appendChild(moreBtn);

    if (isExpanded) {
      card.appendChild(renderDetail(r, includeMaintenance));
    }

    return card;
  }

  function renderUnavailableCard(profile, r) {
    const fallback = el('div', { class: 'mc-card-head' });
    fallback.appendChild(el('h3', { class: 'mc-card-label' }, profileLabel(profile)));
    fallback.appendChild(el('p', { class: 'mc-card-sub' },
      r?.error ? `Couldn't compute — ${r.error}` :
      r?.skipped ? `Not available in v1 (${r.reason})` :
      'No data.'));
    return fallback;
  }

  function renderDetail(r, includeMaintenance) {
    const wrap = el('div', { class: 'mc-card-detail' });

    // Each signal is grouped in its own boxed section so the three are clearly separated.

    // Activity & health
    const activityExtras = [];
    if (r.activity.minutes > 0) {
      activityExtras.push(el('p', { class: 'mc-detail-text mc-caption' },
        `Regularly reaching ${ACTIVITY_WEEKLY_GOAL_MIN} min/week is linked to ~${ACTIVITY_MORTALITY_REDUCTION_PCT}% lower risk of early death.`));
    }
    wrap.appendChild(detailSection('Activity & health', renderActivityTable(r), activityExtras));

    // Cost
    wrap.appendChild(detailSection('Cost', renderCostTable(r, includeMaintenance)));

    // Pollution
    const pollExtras = [];
    if (r.pollution.hasTailpipe) {
      pollExtras.push(el('p', { class: 'mc-detail-text mc-caption' },
        'Plus local pollutants — PM2.5, NOx, VOCs, CO — that electric and active modes avoid.'));
    }
    if (r.pollution.food_kg > 0.001) {
      pollExtras.push(el('p', { class: 'mc-detail-text mc-caption' },
        `Lifecycle CO₂ of the extra food calories ≈ ${formatKg(r.pollution.food_kg)} (excluded — see About).`));
    }
    wrap.appendChild(detailSection('Pollution', renderPollutionTable(r), pollExtras));

    // Caveats — compact muted text, not bullets
    if (r.caveats?.length) {
      const caveatNodes = r.caveats.map(c => el('p', { class: 'mc-detail-text mc-caveat' }, c));
      wrap.appendChild(detailSection('Caveats', null, caveatNodes));
    }

    return wrap;
  }

  // A boxed, clearly-separated section: heading + (optional) table + extra notes.
  function detailSection(title, tableEl, extras = []) {
    const sec = el('section', { class: 'mc-detail-section' });
    sec.appendChild(detailHeading(title));
    if (tableEl) sec.appendChild(tableEl);
    extras.forEach(n => sec.appendChild(n));
    return sec;
  }

  // ---- Calculation tables ----

  function calcTable(rows) {
    const table = el('table', { class: 'mc-calc-table' });
    table.appendChild(el('thead', {}, el('tr', {},
      el('th', {}, 'Item'),
      el('th', {}, 'Calculation'),
      el('th', { class: 'mc-calc-amount' }, 'Amount'),
    )));
    const tb = el('tbody', {});
    for (const row of rows) {
      tb.appendChild(el('tr', { class: row.klass || '' },
        el('td', {}, row.label),
        el('td', { class: 'mc-calc-calc' }, row.calc || '—'),
        el('td', { class: 'mc-calc-amount' }, row.amount),
      ));
    }
    table.appendChild(tb);
    return table;
  }

  function renderActivityTable(r) {
    if (r.activity.minutes <= 0) {
      return calcTable([{ label: 'Physical activity', calc: 'seated the whole way', amount: '0 min', klass: 'mc-calc-row--total' }]);
    }
    const min = Math.round(r.activity.minutes);
    const pct = Math.round((min / ACTIVITY_WEEKLY_GOAL_MIN) * 100);
    const cal = Math.round(r.activity.calories);
    const effort = r.activity.met >= 6 ? 'vigorous effort'
                 : r.activity.met >= 3 ? 'moderate effort' : 'light effort';
    const lighter = r.activity.lighter ? ' (lighter)' : '';
    return calcTable([
      { label: 'Active minutes' + lighter, calc: 'the whole trip is active', amount: `${min} min` },
      { label: 'Share of weekly goal', calc: `${min} of ${ACTIVITY_WEEKLY_GOAL_MIN} min per week`, amount: `${pct}%` },
      { label: 'Calories burned', calc: `${effort}, ${Math.round(r.activity.weightKg)} kg, ${formatDuration(min * 60)}`, amount: `${cal} kcal` },
    ]);
  }

  function renderCostTable(r, includeMaintenance) {
    const rows = [];
    for (const row of r.cost.rows) {
      const counted = !row.optional || includeMaintenance;
      rows.push({
        label: row.label + (row.optional && !includeMaintenance ? ' — not counted' : ''),
        calc: row.calc,
        amount: formatUsd(row.usd),
        klass: counted ? '' : 'mc-calc-row--muted',
      });
    }
    rows.push({ label: 'Total cost', calc: '', amount: formatCostUsd(tripCostUsd(r, { includeMaintenance })), klass: 'mc-calc-row--total' });
    return calcTable(rows);
  }

  function renderPollutionTable(r) {
    const rows = r.pollution.rows.map(row => ({ label: row.label, calc: row.calc, amount: formatKg(row.kg) }));
    if (!rows.length) {
      rows.push({ label: 'Operational emissions', calc: 'human-powered', amount: '0 kg', klass: 'mc-calc-row--total' });
    } else if (rows.length > 1) {
      rows.push({ label: 'Total', calc: '', amount: formatKg(r.pollution.operational_kg), klass: 'mc-calc-row--total' });
    }
    return calcTable(rows);
  }

  function detailHeading(text) {
    return el('h4', { class: 'mc-detail-h' }, text);
  }

  function metricChip(label, valueText, klass) {
    return el('div', { class: `mc-metric mc-metric--${klass}` },
      el('span', { class: 'mc-metric-label' }, label),
      el('span', { class: 'mc-metric-value' }, valueText),
    );
  }

  return { render };
}

// ---- Formatting / classification helpers ----

// Chip color: zero (free/none) → green; otherwise high-impact (gas car) → red, low-impact
// (electric car, e-bike, bike) → orange.
function impactKlass(value, threshold, impact) {
  if (value < threshold) return 'benefit';
  return impact === 'high' ? 'cost' : 'warn';
}

function formatCostUsd(v) {
  if (Math.abs(v) < 0.005) return '$0';
  return formatUsd(v);
}

function formatPollutionChip(r) {
  if (r.pollution.operational_kg < 0.001) return '0 kg';
  return formatKg(r.pollution.operational_kg);
}

function formatActivityChip(r) {
  const min = Math.round(r.activity.minutes || 0);
  if (min <= 0) return '—';
  return `${min} min`;
}

function profileLabel(profile) {
  return ({ car: 'Driving', bicycle: 'Cycling', ebike: 'E-bike', foot: 'Walking', transit: 'Transit' })[profile] || profile;
}
function profileIconName(profile) {
  return ({ car: 'car', bicycle: 'bicycle', ebike: 'ebike', foot: 'walk', transit: 'pin' })[profile] || 'info';
}

// Friendly empty-state hero — four colored mode badges + a teaser headline.
function renderEmptyHero() {
  const hero = el('div', { class: 'mc-empty-hero' });
  const row = el('div', { class: 'mc-empty-row' });
  for (const p of PROFILE_ORDER) {
    const chip = el('span', { class: `mc-empty-chip mc-empty-chip--${p}` });
    chip.appendChild(icon(profileIconName(p)));
    row.appendChild(chip);
  }
  hero.appendChild(row);
  hero.appendChild(el('h2', { class: 'mc-empty-title' }, 'Four ways to get there.'));
  hero.appendChild(el('p', { class: 'mc-empty-sub' },
    'Pick a start and end above — we\'ll show the cost, time, pollution, and physical activity of each.'));
  return hero;
}
