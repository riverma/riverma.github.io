// Credits — creator + every open-source dependency, dataset, and service.

import { el, clear } from '../util/dom.js';
import { CREATOR, creditsBySection } from '../data/credits.js';
import { icon } from './icons.js';

export function initCreditsScreen(rootEl, { onClose }) {
  clear(rootEl);
  rootEl.appendChild(header(onClose));
  rootEl.appendChild(body());
}

function header(onClose) {
  const back = el('button', { class: 'mc-icon-btn', 'aria-label': 'Back', onclick: () => onClose() });
  back.appendChild(icon('chevronLeft'));
  return el('header', { class: 'mc-app-header' },
    back,
    el('h1', { class: 'mc-h1' }, 'Credits'),
    el('span', { class: 'mc-spacer' }),
  );
}

function body() {
  const wrap = el('article', { class: 'mc-prose mc-credits' });

  wrap.appendChild(el('section', { class: 'mc-creator' },
    el('h2', {}, 'Created by'),
    el('p', { class: 'mc-creator-name' },
      el('a', { href: CREATOR.url, target: '_blank', rel: 'noopener' }, CREATOR.name)),
    el('p', { class: 'mc-creator-blurb' }, CREATOR.blurb),
  ));

  for (const [section, items] of creditsBySection()) {
    const sec = el('section', { class: 'mc-credits-section' });
    sec.appendChild(el('h2', {}, section));
    const list = el('ul', { class: 'mc-credits-list' });
    for (const c of items) {
      list.appendChild(creditItem(c));
    }
    sec.appendChild(list);
    wrap.appendChild(sec);
  }

  wrap.appendChild(el('p', { class: 'mc-prose-foot' },
    'Mobility Choices itself is part of riverma.github.io. ' +
    'If a project listed above is useful to you, please consider supporting it directly via the donate link.'));

  return wrap;
}

function creditItem(c) {
  const li = el('li', { class: 'mc-credit' });
  li.appendChild(el('div', { class: 'mc-credit-head' },
    el('a', { class: 'mc-credit-name', href: c.url, target: '_blank', rel: 'noopener' }, c.name),
    el('span', { class: 'mc-credit-license' }, c.license),
  ));
  li.appendChild(el('p', { class: 'mc-credit-role' }, c.role));
  if (c.donateUrl) {
    li.appendChild(el('p', { class: 'mc-credit-donate' },
      el('a', { href: c.donateUrl, target: '_blank', rel: 'noopener' }, '♥ Donate / sponsor')));
  }
  return li;
}
