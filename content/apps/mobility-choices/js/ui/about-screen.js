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
    <p>Mobility Choices shows what getting between two places really involves — its
    <strong>cost</strong>, <strong>time</strong>, <strong>pollution</strong>, and the
    <strong>physical activity</strong> you gain — for driving, cycling, e-biking, and walking.
    Rather than rolling everything into one made-up number, it shows each signal on its own,
    so you can weigh the trade-offs the default mapping apps hide.</p>

    <h2>The four signals</h2>
    <ul>
      <li><strong>Cost</strong> — by default the <em>energy</em> a trip uses: fuel (your MPG ×
      local gas price) or electricity (kWh × local price). A bike or a walk costs nothing to
      energise, so it reads as free. Turn on <em>“Add maintenance / wear costs”</em> in Settings
      to also fold in vehicle wear and bike/e-bike maintenance.</li>
      <li><strong>Time</strong> — the trip's duration. Shown as time, not converted to dollars.</li>
      <li><strong>Pollution</strong> — see below.</li>
      <li><strong>Activity</strong> — see below.</li>
    </ul>

    <h2>Activity &amp; health</h2>
    <p>Instead of putting a dollar value on your health, we report the <strong>minutes of
    moderate activity</strong> a trip gives you and compare them to the public-health
    guideline of <strong>150 minutes of activity per week</strong><sup><a href="#mc-fn-1">1</a></sup><sup><a href="#mc-fn-2">2</a></sup>.
    Walking, cycling, and e-biking all clear the moderate (≥3 MET) threshold, so the whole trip
    counts; an e-bike counts at a lighter intensity.</p>
    <p>Regularly reaching about 150 min/week is linked to roughly an <strong>11% lower risk of
    early death</strong><sup><a href="#mc-fn-3">3</a></sup> — the meta-analysis underlying the
    World Health Organization's HEAT tool<sup><a href="#mc-fn-4">4</a></sup>, the recognised
    standard transport agencies use to value walking and cycling.</p>

    <h2>Pollution</h2>
    <p>“Pollution” counts <strong>operational emissions only</strong> — what the trip puts into
    the air as you travel. A gas car emits CO₂ at the tailpipe<sup><a href="#mc-fn-5">5</a></sup>
    plus local pollutants — <strong>PM2.5, NOx, VOCs, and CO</strong> — that harm the lungs and
    hearts of people nearby<sup><a href="#mc-fn-7">7</a></sup><sup><a href="#mc-fn-8">8</a></sup>.
    An electric car has no tailpipe; its emissions move to the power grid (kWh × your state's
    grid intensity<sup><a href="#mc-fn-6">6</a></sup>), and so does an e-bike's — both far lower
    per mile. Walking and cycling are ~zero.<sup><a href="#mc-fn-9">9</a></sup></p>
    <p class="mc-prose-foot"><em>Footnote:</em> active travel does carry a small lifecycle carbon
    cost from the extra food calories it requires (~2.2 g CO₂e/kcal)<sup><a href="#mc-fn-10">10</a></sup>.
    That's a climate-accounting figure, not air pollution, so it is excluded from the Pollution
    signal and noted only in each card's details.</p>

    <h2>Only available in the Apple / Android app version</h2>
    <p>This web version runs entirely in your browser — no account, no server, free community
    map data — which keeps it private and works offline. A few features need a backend or paid
    data, so they live in the native app:</p>
    <ul>
      <li><strong>Public transit directions.</strong> Needs live GTFS feeds and a hosted routing
      backend with API keys — more than a static, offline-first web page can bundle.</li>
      <li><strong>Live traffic-aware drive times.</strong> Requires a paid real-time traffic
      feed; the web version uses free-flow community routing, so its drive times run optimistic.</li>
      <li><strong>Dollar-valued local-pollutant health damages.</strong> We name PM2.5/NOx/VOCs/CO
      here but only quantify CO₂; per-mile damage models (EPA/VTPI) are heavier datasets better
      suited to the app.</li>
      <li><strong>Multimodal trips</strong> (drive-to-train, bike-to-bus) — these build on the
      transit backend above.</li>
    </ul>

    <h2>Caveats &amp; assumptions</h2>
    <ul>
      <li><strong>Driving times are free-flow.</strong> Routing uses speed-limit-based times with
      no live traffic, so real-world drives usually take longer.</li>
      <li><strong>E-bike routing is approximate.</strong> No router offers a native e-bike profile,
      so we reuse the bicycle route (identical distance) and scale its duration down ~30% for
      typical e-bike commute speeds.</li>
      <li><strong>E-bike activity is lighter.</strong> E-bike minutes count toward the activity
      goal, but at a lower intensity than an analog bike.</li>
      <li><strong>Grid emissions need your state.</strong> With no state selected in Settings,
      electric-car and e-bike emissions use the US-average grid intensity; pick your state for a
      local figure.</li>
      <li><strong>Long walks are shown anyway.</strong> Multi-hour walking routes appear for
      comparison even when they aren't practical.</li>
      <li><strong>Numbers are periodic snapshots.</strong> Prices, grid intensity, and cost
      factors (EIA, EPA eGRID, AAA) drift over time and are updated occasionally, not live.</li>
    </ul>

    <h2>Providers</h2>
    <ul>
      <li><strong>Routing:</strong> OSRM, hosted by
      <a href="https://www.fossgis.de/" target="_blank" rel="noopener">FOSSGIS e.V.</a>
      at <code>routing.openstreetmap.de</code> (no API key). Optional: paste a free
      <a href="https://www.graphhopper.com" target="_blank" rel="noopener">GraphHopper</a> key
      in Settings to switch providers.</li>
      <li><strong>Geocoding:</strong>
      <a href="https://photon.komoot.io" target="_blank" rel="noopener">Photon</a> by Komoot,
      on OpenStreetMap data.</li>
      <li><strong>Map tiles:</strong> OpenStreetMap. Map data &copy; OpenStreetMap contributors.</li>
    </ul>

    <h2>References</h2>
    <ol class="mc-refs">
      <li id="mc-fn-1"><a href="https://www.who.int/publications/i/item/9789240015128" target="_blank" rel="noopener">WHO Guidelines on Physical Activity and Sedentary Behaviour (2020)</a></li>
      <li id="mc-fn-2"><a href="https://health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines" target="_blank" rel="noopener">US HHS Physical Activity Guidelines for Americans, 2nd ed.</a></li>
      <li id="mc-fn-3"><a href="https://doi.org/10.1186/s12966-014-0132-x" target="_blank" rel="noopener">Kelly et al. 2014, <em>Int. J. Behav. Nutr. Phys. Act.</em> — dose-response of walking/cycling and mortality</a></li>
      <li id="mc-fn-4"><a href="https://www.who.int/europe/tools-and-toolkits/health-economic-assessment-tool-for-walking-and-cycling" target="_blank" rel="noopener">WHO Health Economic Assessment Tool (HEAT) for walking and cycling</a></li>
      <li id="mc-fn-5"><a href="https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references" target="_blank" rel="noopener">EPA Greenhouse Gas Equivalencies — 8.887 kg CO₂/gallon gasoline</a></li>
      <li id="mc-fn-6"><a href="https://www.epa.gov/egrid" target="_blank" rel="noopener">EPA eGRID — grid CO₂ intensity by region</a></li>
      <li id="mc-fn-7"><a href="https://www.epa.gov/greenvehicles/smog-vehicle-emissions" target="_blank" rel="noopener">EPA — Smog, Soot, and Other Air Pollution from Transportation</a></li>
      <li id="mc-fn-8"><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8713776/" target="_blank" rel="noopener">Health impacts of on-road transportation emissions in the US (≈19,800 PM2.5 deaths/yr)</a></li>
      <li id="mc-fn-9"><a href="https://www.vtpi.org/tca/tca0510.pdf" target="_blank" rel="noopener">Victoria Transport Policy Institute — Transportation Cost &amp; Benefit Analysis II: Air Pollution Costs</a></li>
      <li id="mc-fn-10"><a href="https://www.science.org/doi/10.1126/science.aaq0216" target="_blank" rel="noopener">Poore &amp; Nemecek 2018, <em>Science</em> — lifecycle CO₂ of food</a></li>
    </ol>

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
