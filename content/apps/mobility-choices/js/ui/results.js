// Stacked results cards: every mode's full information visible inline.
// Each card shows monetary cost, monetised carbon, and health benefit/cost as colored
// chips, with a combined overall score prominent and an in-card "More info" expand
// for the detailed breakdown. A sort bar at the top reorders the cards.

import { el, clear } from '../util/dom.js';
import {
  formatDistance, formatDuration, formatUsd, formatKg, formatCalories,
  metersToMiles, kgToLb, mphToKmh,
} from '../util/units.js';
import { MODE_COLORS } from './map.js';
import { icon } from './icons.js';
import { sortProfiles } from '../engine/index.js';

const PROFILE_ORDER  = ['car', 'bicycle', 'ebike', 'foot'];
const SORT_OPTIONS   = [
  { key: 'overall', label: 'Overall score' },
  { key: 'money',   label: 'Cost'          },
  { key: 'time',    label: 'Time'          },
  { key: 'carbon',  label: 'Carbon'        },
  { key: 'health',  label: 'Health'        },
];

export function initResults(rootEl, { onSelect, onSortChange, onToggleExpand }) {
  const sortBar = el('div', { class: 'mc-sort-bar' });
  const cardsEl = el('div', { class: 'mc-cards' });
  rootEl.appendChild(sortBar);
  rootEl.appendChild(cardsEl);

  function render({ results, selectedMode, units, status, errorBanner, sortBy, expandedCards }) {
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
    const ordered = sortProfiles(results, sortBy);
    ordered.forEach((profile, idx) => {
      const r = results[profile];
      const isSelected = profile === selectedMode;
      const isExpanded = expandedCards?.has(profile);
      const isBest = idx === 0 && !r?.error && !r?.skipped;
      cardsEl.appendChild(renderCard(profile, r, { isSelected, isExpanded, isBest, units, sortBy }));
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

  function renderCard(profile, r, { isSelected, isExpanded, isBest, units, sortBy }) {
    const card = el('article', {
      class: 'mc-card' + (isSelected ? ' is-selected' : '') + (isBest ? ' is-best' : ''),
      style: {
        '--mc-card-accent': `var(--mc-c-${profile === 'foot' ? 'foot' : profile})`,
        '--mc-card-tint':   `var(--mc-c-${profile === 'foot' ? 'foot' : profile}-tint)`,
      },
      onclick: (e) => {
        // Don't steal taps from interactive children.
        if (e.target.closest('button, a, summary')) return;
        onSelect(profile);
      },
    });

    if (!r || r.error || r.skipped) {
      card.appendChild(renderUnavailableCard(profile, r));
      return card;
    }

    // Header — icon, label, primary time, best badge
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

    // Overall score (prominent)
    const total = r.score.total_usd;
    const totalKlass = total > 0.01 ? 'mc-cost' : (total < -0.01 ? 'mc-benefit' : 'mc-neutral');
    const totalLabel = total > 0.01 ? 'Net cost' : (total < -0.01 ? 'Net benefit' : 'Break-even');
    const totalDisplay = formatSignedUsd(total);
    const scoreRow = el('div', { class: 'mc-score-row' },
      el('span', { class: 'mc-score-label' }, totalLabel),
      el('span', { class: `mc-score-value ${totalKlass}` }, totalDisplay),
    );
    card.appendChild(scoreRow);

    // Three metric chips: money / carbon / health
    const metrics = el('div', { class: 'mc-metric-row' });
    metrics.appendChild(metricChip('Money',  formatCostUsd(r.cost.total),       r.cost.total > 0 ? 'cost' : 'neutral'));
    metrics.appendChild(metricChip('Carbon', formatCarbonChip(r),               r.co2.total_kg > 0.001 ? 'cost' : 'neutral'));
    metrics.appendChild(metricChip('Health', formatHealthChip(r),               healthKlass(r)));
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
      card.appendChild(renderDetail(r, units));
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

  function renderDetail(r, units) {
    const wrap = el('div', { class: 'mc-card-detail' });

    // Cost breakdown
    if (Object.keys(r.cost.breakdown).length) {
      wrap.appendChild(detailHeading('Cost breakdown'));
      const ul = el('ul', { class: 'mc-breakdown' });
      if (r.cost.breakdown.fuel != null)         ul.appendChild(el('li', {}, `Fuel: ${formatUsd(r.cost.breakdown.fuel)}`));
      if (r.cost.breakdown.electricity != null)  ul.appendChild(el('li', {}, `Electricity: ${formatUsd(r.cost.breakdown.electricity)}`));
      if (r.cost.breakdown.maintenance != null)  ul.appendChild(el('li', {}, `Maintenance & wear: ${formatUsd(r.cost.breakdown.maintenance)}`));
      if (r.cost.breakdown.wear != null)         ul.appendChild(el('li', {}, `Maintenance & wear: ${formatUsd(r.cost.breakdown.wear)}`));
      wrap.appendChild(ul);
    }

    // CO2 breakdown
    if (Object.keys(r.co2.breakdown).length) {
      wrap.appendChild(detailHeading('Carbon breakdown'));
      const ul = el('ul', { class: 'mc-breakdown' });
      if (r.co2.breakdown.tailpipe != null) ul.appendChild(el('li', {}, `Tailpipe: ${formatKg(r.co2.breakdown.tailpipe)}`));
      if (r.co2.breakdown.grid != null)     ul.appendChild(el('li', {}, `Grid electricity: ${formatKg(r.co2.breakdown.grid)}`));
      if (r.co2.breakdown.food != null)     ul.appendChild(el('li', {}, `Food calories (replacement): ${formatKg(r.co2.breakdown.food)}`));
      wrap.appendChild(ul);
    }

    // Health detail
    if (r.health.calories_burned > 0) {
      wrap.appendChild(detailHeading('Activity'));
      wrap.appendChild(el('p', { class: 'mc-detail-text' },
        `${formatCalories(r.health.calories_burned)} burned · ${formatDuration(r.health.minutes_active * 60)} of active travel.`));
    }

    if (r.caveats?.length) {
      wrap.appendChild(detailHeading('Caveats'));
      const ul = el('ul', { class: 'mc-breakdown' });
      r.caveats.forEach(c => ul.appendChild(el('li', {}, c)));
      wrap.appendChild(ul);
    }

    return wrap;
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

// ---- Formatting helpers ----

function formatSignedUsd(v) {
  if (Math.abs(v) < 0.01) return '$0.00';
  if (v < 0) return `+${formatUsd(-v)}`;   // negative = benefit; show with +
  return formatUsd(v);
}

function formatCostUsd(v) {
  if (Math.abs(v) < 0.005) return 'free';
  return formatUsd(v);
}

function formatCarbonChip(r) {
  // Show kg primarily, with the $ social cost in a sub-line via tooltip text
  return formatKg(r.co2.total_kg);
}

function formatHealthChip(r) {
  const v = r.health.value_usd || 0;
  if (Math.abs(v) < 0.5) return '—';
  return `+${formatUsd(v)}`;
}

function healthKlass(r) {
  const v = r.health.value_usd || 0;
  if (v > 0.5) return 'benefit';
  if (v < -0.5) return 'cost';
  return 'neutral';
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
    'Pick a start and end above — we\'ll show you the full cost of each: money, time, carbon, and what it does for you.'));
  return hero;
}
