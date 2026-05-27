// SVG icon set — SF Symbols-inspired line icons. Returns an SVGElement.
// Stroke uses currentColor so callers control the tint via CSS color.

const NS = 'http://www.w3.org/2000/svg';

function svg(d, viewBox = '0 0 24 24') {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', viewBox);
  s.setAttribute('fill', 'none');
  s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '1.6');
  s.setAttribute('stroke-linecap', 'round');
  s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  s.appendChild(path);
  return s;
}

function svgMulti(paths, viewBox = '0 0 24 24') {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', viewBox);
  s.setAttribute('fill', 'none');
  s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '1.6');
  s.setAttribute('stroke-linecap', 'round');
  s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true');
  for (const p of paths) {
    const node = typeof p === 'string'
      ? Object.assign(document.createElementNS(NS, 'path'), {}) && (() => { const x = document.createElementNS(NS, 'path'); x.setAttribute('d', p); return x; })()
      : (() => { const x = document.createElementNS(NS, p.tag); for (const [k, v] of Object.entries(p)) if (k !== 'tag') x.setAttribute(k, v); return x; })();
    s.appendChild(node);
  }
  return s;
}

// --- Mode icons ---
export const ICONS = {
  car: () => svg(
    // Stylised hatchback silhouette
    'M4 17v-3l2-5a2 2 0 0 1 1.9-1.4h8.2A2 2 0 0 1 18 9l2 5v3a1 1 0 0 1-1 1h-1.5a1.5 1.5 0 0 1-3 0h-5a1.5 1.5 0 0 1-3 0H5a1 1 0 0 1-1-1Zm2-3h12 M7 11h10'
  ),

  bicycle: () => svgMulti([
    { tag: 'circle', cx: '6',  cy: '17', r: '3.4' },
    { tag: 'circle', cx: '18', cy: '17', r: '3.4' },
    { tag: 'path', d: 'M6 17 11 9h5l2 8 M9 9h4 M15 9V6h2' },
  ]),

  ebike: () => svgMulti([
    { tag: 'circle', cx: '6',  cy: '17', r: '3.4' },
    { tag: 'circle', cx: '18', cy: '17', r: '3.4' },
    { tag: 'path', d: 'M6 17 11 9h5l2 8 M9 9h4 M15 9V6h2' },
    // lightning bolt next to back wheel
    { tag: 'path', d: 'M5.4 12.5 6.5 10.2h1.2L7 12.4h1.2L6.8 15l.3-2.5H6Z',
      fill: 'currentColor', stroke: 'none' },
  ]),

  walk: () => svgMulti([
    { tag: 'circle', cx: '13', cy: '4',  r: '1.6' },
    { tag: 'path',   d: 'm9 21 2.5-6L9 13l2-5 3 1 2 3 3 1 M14 9l-1 5 4 7' },
  ]),

  // --- Header icons ---
  gear: () => svg(
    'M19.5 12a7.5 7.5 0 0 0-.16-1.55l1.97-1.52-2-3.46-2.32.78a7.55 7.55 0 0 0-2.69-1.55L13.8 2h-4l-.5 2.7a7.55 7.55 0 0 0-2.69 1.55l-2.32-.78-2 3.46 1.97 1.52A7.5 7.5 0 0 0 4.1 12c0 .53.06 1.05.16 1.55l-1.97 1.52 2 3.46 2.32-.78a7.55 7.55 0 0 0 2.69 1.55l.5 2.7h4l.5-2.7a7.55 7.55 0 0 0 2.69-1.55l2.32.78 2-3.46-1.97-1.52c.1-.5.16-1.02.16-1.55Z M11.8 14.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z'
  ),
  info: () => svgMulti([
    { tag: 'circle', cx: '12', cy: '12', r: '9.2' },
    { tag: 'path', d: 'M12 11v5.5 M12 8v.2' },
  ]),
  heart: () => svg(
    'M12 20s-7.5-4.7-7.5-10.2A4.3 4.3 0 0 1 12 6a4.3 4.3 0 0 1 7.5 3.8C19.5 15.3 12 20 12 20Z'
  ),
  chevronLeft: () => svg('m15 6-6 6 6 6'),
  chevronDown: () => svg('m6 9 6 6 6-6'),
  chevronUp:   () => svg('m6 15 6-6 6 6'),
  pin: () => svg('M12 21s7-7.5 7-12.5A7 7 0 1 0 5 8.5C5 13.5 12 21 12 21Z M12 11.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'),
  search: () => svgMulti([
    { tag: 'circle', cx: '11', cy: '11', r: '6.5' },
    { tag: 'path', d: 'm20 20-4.5-4.5' },
  ]),
  swap: () => svg('M7 4 4 7l3 3 M4 7h16 M17 14l3 3-3 3 M20 17H4'),
  clock: () => svgMulti([
    { tag: 'circle', cx: '12', cy: '12', r: '9.2' },
    { tag: 'path', d: 'M12 7v5l3 2.5' },
  ]),
  dollar: () => svg('M12 4v16 M16.5 8c-.5-1.7-2.3-3-4.5-3-2.5 0-4.5 1.6-4.5 3.5S9.5 11 12 11.5s4.5 1.5 4.5 3.5S14.5 19 12 19c-2.2 0-4-1.3-4.5-3'),
  leaf: () => svg('M5 19c0-7 6-12 14-12 0 8-5 14-12 14l-2-2Zm0 0L20 5'),
  spark: () => svg('M13 3 5 14h5l-1 7 8-11h-5l1-7Z'),
  arrowRight: () => svg('M5 12h14 M13 6l6 6-6 6'),
};

/** Append an icon SVG to a host element. */
export function setIcon(host, name) {
  while (host.firstChild) host.removeChild(host.firstChild);
  const factory = ICONS[name];
  if (factory) host.appendChild(factory());
}

/** Return a fresh icon SVG element. */
export function icon(name) {
  return ICONS[name]?.() || ICONS.info();
}
