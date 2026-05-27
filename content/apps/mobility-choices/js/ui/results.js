// Summary tab strip (one tile per mode) + expandable detail card for the selected mode.

import { el, clear } from '../util/dom.js';
import {
  formatDistance, formatDuration, formatUsd, formatKg, formatCalories,
} from '../util/units.js';
import { MODE_COLORS } from './map.js';
import { icon } from './icons.js';

const PROFILE_ORDER = ['car', 'bicycle', 'ebike', 'foot'];   // 'transit' deliberately hidden in v1

export function initResults(rootEl, { onSelect }) {
  const tabsEl = el('div', { class: 'mc-tabs', role: 'tablist' });
  const detailEl = el('div', { class: 'mc-detail', 'aria-live': 'polite' });
  rootEl.appendChild(tabsEl);
  rootEl.appendChild(detailEl);

  function render({ results, selectedMode, units, status, errorBanner }) {
    clear(tabsEl);
    clear(detailEl);

    if (status === 'idle') {
      detailEl.appendChild(renderEmptyHero());
      return;
    }
    if (status === 'routing') {
      detailEl.appendChild(el('p', { class: 'mc-hint' }, 'Computing routes…'));
      return;
    }
    if (status === 'error') {
      detailEl.appendChild(el('p', { class: 'mc-error' }, errorBanner || 'Something went wrong.'));
      return;
    }

    // status === 'results'
    PROFILE_ORDER.forEach((profile) => {
      const r = results?.[profile];
      const tab = renderTab(profile, r, profile === selectedMode, units);
      tab.addEventListener('click', () => onSelect(profile));
      tabsEl.appendChild(tab);
    });

    const current = results?.[selectedMode];
    detailEl.appendChild(renderDetail(selectedMode, current, units));
  }

  function renderTab(profile, r, isSelected, units) {
    const tab = el('button', {
      class: 'mc-tab' + (isSelected ? ' is-active' : ''),
      role: 'tab',
      'aria-selected': isSelected ? 'true' : 'false',
      style: {
        '--mc-tab-accent': `var(--mc-c-${profile === 'foot' ? 'foot' : profile})`,
        '--mc-tab-tint':   `var(--mc-c-${profile === 'foot' ? 'foot' : profile}-tint)`,
      },
    });
    const label = r?.label || profileLabel(profile);
    const iconName = r?.icon || profileIconName(profile);
    const iconHost = el('span', { class: 'mc-tab-icon', 'aria-hidden': 'true' });
    iconHost.appendChild(icon(iconName));
    tab.appendChild(iconHost);
    tab.appendChild(el('span', { class: 'mc-tab-label' }, label));
    if (!r || r.error || r.skipped) {
      tab.appendChild(el('span', { class: 'mc-tab-na' }, r?.error ? 'failed' : 'n/a'));
    } else {
      tab.appendChild(el('span', { class: 'mc-tab-primary' }, formatDuration(r.duration_min * 60)));
      tab.appendChild(el('span', { class: 'mc-tab-secondary' }, formatUsd(r.cost.total)));
      tab.appendChild(el('span', { class: 'mc-tab-tertiary' }, formatKg(r.co2.total_kg) + ' CO₂'));
    }
    return tab;
  }

  function renderDetail(profile, r, units) {
    const wrap = el('section', { class: 'mc-detail-card' });
    if (!r) {
      wrap.appendChild(el('p', { class: 'mc-hint' }, 'No data for this mode.'));
      return wrap;
    }
    if (r.error) {
      wrap.appendChild(el('h3', {}, profileLabel(profile)));
      wrap.appendChild(el('p', { class: 'mc-error' }, `Couldn't compute: ${r.error}`));
      return wrap;
    }
    if (r.skipped) {
      wrap.appendChild(el('h3', {}, profileLabel(profile)));
      wrap.appendChild(el('p', { class: 'mc-hint' }, `Not available in v1 (${r.reason}).`));
      return wrap;
    }

    const head = el('header', { class: 'mc-detail-head' });
    const iconHost = el('span', { class: 'mc-detail-icon', 'aria-hidden': 'true' });
    iconHost.appendChild(icon(r.icon));
    head.appendChild(iconHost);
    head.appendChild(el('h3', {}, r.label));
    wrap.appendChild(head);
    wrap.appendChild(renderRow('Distance', formatDistance(r.distance_mi * 1609.344, units)));
    wrap.appendChild(renderRow('Time',     formatDuration(r.duration_min * 60)));

    // Cost block
    wrap.appendChild(renderRow('Cost', formatUsd(r.cost.total)));
    const costBreakdown = el('ul', { class: 'mc-breakdown' });
    if (r.cost.breakdown.fuel != null)         costBreakdown.appendChild(el('li', {}, `Fuel: ${formatUsd(r.cost.breakdown.fuel)}`));
    if (r.cost.breakdown.electricity != null)  costBreakdown.appendChild(el('li', {}, `Electricity: ${formatUsd(r.cost.breakdown.electricity)}`));
    if (r.cost.breakdown.maintenance != null)  costBreakdown.appendChild(el('li', {}, `Maintenance & wear: ${formatUsd(r.cost.breakdown.maintenance)}`));
    if (r.cost.breakdown.wear != null)         costBreakdown.appendChild(el('li', {}, `Maintenance & wear: ${formatUsd(r.cost.breakdown.wear)}`));
    if (costBreakdown.children.length) wrap.appendChild(costBreakdown);

    // CO2 block
    wrap.appendChild(renderRow('CO₂ emissions', formatKg(r.co2.total_kg)));
    const co2Breakdown = el('ul', { class: 'mc-breakdown' });
    if (r.co2.breakdown.tailpipe != null) co2Breakdown.appendChild(el('li', {}, `Tailpipe: ${formatKg(r.co2.breakdown.tailpipe)}`));
    if (r.co2.breakdown.grid != null)     co2Breakdown.appendChild(el('li', {}, `Grid electricity: ${formatKg(r.co2.breakdown.grid)}`));
    if (r.co2.breakdown.food != null)     co2Breakdown.appendChild(el('li', {}, `Food calories (extra eating to replace): ${formatKg(r.co2.breakdown.food)}`));
    if (co2Breakdown.children.length) wrap.appendChild(co2Breakdown);

    // Health
    if (r.health.value_usd > 0) {
      wrap.appendChild(renderRow('Health benefit (est.)', formatUsd(r.health.value_usd), {
        title: 'Per-trip share of an annual mortality-risk reduction (simplified HEAT). See About.',
      }));
      wrap.appendChild(el('p', { class: 'mc-sub' },
        `${formatCalories(r.health.calories_burned)} burned · ${formatDuration(r.health.minutes_active * 60)} active`));
    } else if (r.health.calories_burned === 0 && profile === 'car') {
      wrap.appendChild(renderRow('Health benefit', '—', { title: 'Driving has no active-travel benefit.' }));
    }

    if (r.caveats?.length) {
      const det = el('details', { class: 'mc-caveats' });
      det.appendChild(el('summary', {}, `${r.caveats.length} caveat${r.caveats.length > 1 ? 's' : ''}`));
      const ul = el('ul');
      r.caveats.forEach(c => ul.appendChild(el('li', {}, c)));
      det.appendChild(ul);
      wrap.appendChild(det);
    }

    return wrap;
  }

  function renderRow(label, value, extra = {}) {
    return el('div', { class: 'mc-row' },
      el('span', { class: 'mc-row-label', title: extra.title || '' }, label),
      el('span', { class: 'mc-row-value' }, value),
    );
  }

  return { render };
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
  for (const p of ['car', 'bicycle', 'ebike', 'foot']) {
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
