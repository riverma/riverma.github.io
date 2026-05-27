// Methodology + citations doc. Static content, no state.

import { el, clear } from '../util/dom.js';
import { icon } from './icons.js';

export function initAboutScreen(rootEl, { onClose }) {
  clear(rootEl);
  rootEl.appendChild(header(onClose));
  rootEl.appendChild(body());
}

function header(onClose) {
  const back = el('button', { class: 'mc-icon-btn', 'aria-label': 'Back', onclick: () => onClose() });
  back.appendChild(icon('chevronLeft'));
  return el('header', { class: 'mc-app-header' },
    back,
    el('h1', { class: 'mc-h1' }, 'About'),
    el('span', { class: 'mc-spacer' }),
  );
}

function body() {
  const wrap = el('article', { class: 'mc-prose' });
  wrap.innerHTML = `
    <p>Mobility Choices estimates the <em>full</em> cost and benefit of getting between two places —
    money, time, CO₂, and health — for driving, cycling, e-biking, and walking.
    The goal is to make trade-offs the default mapping apps hide visible.</p>

    <h2>Sources of the numbers</h2>
    <ul>
      <li><strong>Driving — fuel CO₂:</strong> EPA factor of 8.887 kg CO₂ per gallon of gasoline
      (EPA Greenhouse Gas Equivalencies, 2023).</li>
      <li><strong>Driving — fuel cost:</strong> your MPG (settings) × your local gas price
      (settings; defaults from EIA weekly averages).</li>
      <li><strong>Driving — vehicle wear:</strong> marginal cost per mile (just the part that
      this particular trip wears on the car: maintenance &amp; repairs, tires, wear-related
      depreciation). We deliberately exclude fixed costs (insurance, registration, time-based
      depreciation) because they don't scale with whether you take this trip. Typical sedan
      ≈ $0.13/mi. Source: AAA <em>Your Driving Costs 2024</em> maintenance row + NHTSA tire
      replacement data; ceiling reference: IRS standard mileage $0.70/mi.</li>
      <li><strong>EV CO₂:</strong> kWh per mile × your state's EPA eGRID 2022 grid intensity.</li>
      <li><strong>Cycling maintenance:</strong> $0.03/mi (chain, tires, brake pads, occasional
      tune-up). Source: League of American Bicyclists / consumer cycling estimates,
      typical moderate rider $50–150/yr.</li>
      <li><strong>E-bike maintenance:</strong> $0.06/mi (regular-bike maintenance plus amortised
      battery wear ~$500 / ~30,000 mi and additional drivetrain wear from motor torque).</li>
      <li><strong>E-bike electricity:</strong> 20 / 30 / 50 Wh per mile depending on bike type
      (settings) × your local price.</li>
      <li><strong>Active-mode CO₂:</strong> the extra food calories required to sustain the activity,
      multiplied by ~2.2 g CO₂e per kcal (Poore &amp; Nemecek, <em>Science</em>, 2018, global-average diet).</li>
      <li><strong>Calories burned:</strong> METs × body weight (kg) × hours, using values from
      Ainsworth et al. 2011 Compendium of Physical Activities.</li>
    </ul>

    <h2>About the health-benefit number</h2>
    <p>This is the slipperiest number in the app. It is a simplified per-trip share of the
    <a href="https://www.heatwalkingcycling.org" target="_blank" rel="noopener">WHO HEAT</a>
    methodology, which estimates monetised mortality-risk reduction from regular active travel.</p>
    <p>HEAT is designed for population-level intervention assessment; a single trip's marginal value
    is by definition small. To make the number meaningful for one trip, we project this trip's
    minutes out to a year using your "trips per year" setting, apply HEAT's scaled mortality-risk
    reduction (capped at 450 minutes/week), multiply by US background mortality and the US DOT
    Value of Statistical Life (~$11.4M, 2024), and divide back by trips/year.</p>
    <p>Read it as: <em>if this trip is part of a regular pattern, what is its share worth?</em>
    A one-off trip gets a near-zero share; a daily commute gets a more substantial one.</p>

    <h2>What's deliberately missing in v1</h2>
    <ul>
      <li><strong>Public transit.</strong> The architecture reserves a transit slot, a multi-leg
      route shape, a transit-engine stub, and a transit settings section. Wiring a router into it
      (OpenTripPlanner, GraphHopper Transit, etc.) lands transit without rewriting the rest.</li>
      <li><strong>Traffic-aware driving times.</strong> OSRM uses free-flow speeds. Real-world
      driving times are usually longer.</li>
      <li><strong>Air-pollution &amp; crash-risk externalities</strong> for driving — methodology
      tractable but politically squishy. May land in a future version.</li>
      <li><strong>Multimodal trips</strong> (drive-to-trailhead, bike-to-train).</li>
    </ul>

    <h2>Provider details</h2>
    <p>Default routing: OSRM, hosted by <a href="https://www.fossgis.de/" target="_blank" rel="noopener">FOSSGIS e.V.</a>
    at <code>routing.openstreetmap.de</code> (no API key). Optional: paste a free
    <a href="https://www.graphhopper.com" target="_blank" rel="noopener">GraphHopper</a> key
    in settings to switch providers.</p>
    <p>Geocoding: <a href="https://photon.komoot.io" target="_blank" rel="noopener">Photon</a>
    by Komoot, on OpenStreetMap data.</p>
    <p>Map tiles: OpenStreetMap. Map data &copy; OpenStreetMap contributors.</p>

    <p class="mc-prose-foot">
      Full creator and dependency credits on the
      <a href="#" data-go="credits">Credits</a> screen.
    </p>
  `;
  // Re-route the inline link to the credits screen via the existing event hook.
  wrap.querySelector('[data-go="credits"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.dispatchEvent(new CustomEvent('mc:go', { detail: 'credits' }));
  });
  return wrap;
}
