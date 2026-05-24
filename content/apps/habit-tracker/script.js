'use strict';

/* ============================================================
 * Habits — handwritten habit checklist.
 * All state in localStorage. No network, no libraries.
 * ============================================================ */

const STORAGE_KEY = 'riverma.habit-tracker.v1';

let state = { version: 1, habits: [], days: {} };
let viewedDate = getToday();            // 'YYYY-MM-DD'
let currentScreen = 'checklist';        // 'checklist' | 'edit' | 'stats'
// Long-press absorbs the trailing click on whichever count cell fires next.
// Module-scoped so it survives the re-render that long-press triggers.
let suppressNextClick = false;

/* ---------- Storage ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 1) {
      state.habits = Array.isArray(parsed.habits) ? parsed.habits : [];
      state.days   = (parsed.days && typeof parsed.days === 'object') ? parsed.days : {};
    }
  } catch (_) { /* corrupt blob — start fresh rather than crash */ }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
}

/* ---------- Dates (local time, no UTC parsing) ---------- */
function pad2(n) { return n < 10 ? '0' + n : '' + n; }
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmtKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function addDays(s, n) {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return fmtKey(d);
}
function isToday(s) { return s === getToday(); }
function isFuture(s) { return s > getToday(); }
function ordinal(n) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + 'th';
  switch (n % 10) {
    case 1: return n + 'st';
    case 2: return n + 'nd';
    case 3: return n + 'rd';
    default: return n + 'th';
  }
}
const MONTHS  = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
const WEEKDAY = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function formatDateLine(s) {
  const d = parseDate(s);
  return `${MONTHS[d.getMonth()]} ${ordinal(d.getDate())}`;
}
function formatSubDateLine(s) {
  const d = parseDate(s);
  return `${WEEKDAY[d.getDay()]}, ${d.getFullYear()}`;
}

/* ---------- Habits ---------- */
function uid() { return 'h_' + Math.random().toString(36).slice(2, 10); }

function addHabit({ name = '', note = '', minimum = 1 } = {}) {
  const h = {
    id: uid(),
    name,
    note,
    minimum: Math.max(1, Number(minimum) || 1),
    createdAt: getToday()
  };
  state.habits.push(h);
  // Seed today's record if today is already active.
  const today = getToday();
  if (state.days[today]) state.days[today].counts[h.id] = 0;
  saveState();
  return h;
}
function updateHabit(id, patch) {
  const h = state.habits.find(x => x.id === id);
  if (!h) return;
  if (patch.name    !== undefined) h.name    = patch.name;
  if (patch.note    !== undefined) h.note    = patch.note;
  if (patch.minimum !== undefined) h.minimum = Math.max(1, Number(patch.minimum) || 1);
  saveState();
}
function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  // Historical counts in state.days[*].counts[id] are left in place but become orphans;
  // they're harmless because stats only iterate habits that still exist.
  saveState();
}
function moveHabit(id, dir) {
  const i = state.habits.findIndex(h => h.id === id);
  if (i < 0) return;
  const j = i + dir;
  if (j < 0 || j >= state.habits.length) return;
  const [h] = state.habits.splice(i, 1);
  state.habits.splice(j, 0, h);
  saveState();
}

/* ---------- Day records ---------- */
function ensureDayActive(dateStr) {
  if (state.days[dateStr]) return state.days[dateStr];
  const counts = {};
  for (const h of state.habits) counts[h.id] = 0;
  state.days[dateStr] = { counts };
  return state.days[dateStr];
}
function getCount(dateStr, habitId) {
  const day = state.days[dateStr];
  return day ? (day.counts[habitId] || 0) : 0;
}
// "Has the user ever logged anything?" — used to retire the first-run hint.
function userHasEverLogged() {
  for (const k in state.days) {
    const counts = state.days[k].counts;
    for (const id in counts) if (counts[id] > 0) return true;
  }
  return false;
}
function increment(habitId, dateStr) {
  const day = ensureDayActive(dateStr);
  if (!(habitId in day.counts)) day.counts[habitId] = 0;
  day.counts[habitId] += 1;
  saveState();
}
function decrement(habitId, dateStr) {
  const day = state.days[dateStr];
  if (!day) return;
  const cur = day.counts[habitId] || 0;
  if (cur <= 0) return;
  day.counts[habitId] = cur - 1;
  // Note: even if the day's totals drop back to all-zero, we keep the day record.
  // The user explicitly interacted, so it remains an "active day" for stats purposes.
  saveState();
}

/* ---------- SVG ---------- */
const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(name, attrs) {
  const el = document.createElementNS(SVGNS, name);
  if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
// Deterministic small jitter so marks look hand-drawn but stable across re-renders.
function jitter(seed, range) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return ((x - Math.floor(x)) * 2 - 1) * range;
}

// Render n tally marks into `container`. Groups of 5: 4 verticals + 1 diagonal.
function renderTally(container, n) {
  container.innerHTML = '';
  if (n <= 0) return;
  const fullGroups = Math.floor(n / 5);
  const rem = n % 5;
  const groupW = 28, groupH = 32, gap = 8, strokeBase = 2.4;
  const totalGroups = fullGroups + (rem > 0 ? 1 : 0);
  const totalW = totalGroups * groupW + (totalGroups - 1) * gap;

  const svg = svgEl('svg', {
    class: 'tally',
    viewBox: `0 0 ${totalW} ${groupH}`,
    'aria-hidden': 'true',
    preserveAspectRatio: 'xMinYMid meet'
  });

  let x = 0;
  const drawVertical = (xPos, seed) => {
    const j = jitter(seed, 1.2);
    svg.appendChild(svgEl('line', {
      x1: xPos + j * 0.3,
      y1: 3 + jitter(seed + 100, 1.4),
      x2: xPos - j * 0.3,
      y2: groupH - 3 + jitter(seed + 200, 1.4),
      stroke: 'currentColor',
      'stroke-width': (strokeBase + jitter(seed + 300, 0.4)).toFixed(2),
      'stroke-linecap': 'round'
    }));
  };
  for (let g = 0; g < fullGroups; g++) {
    const base = g * 17;
    for (let i = 0; i < 4; i++) drawVertical(x + 3 + i * 5, base + i);
    svg.appendChild(svgEl('line', {
      x1: x - 1 + jitter(base + 9, 1.4),
      y1: groupH - 4 + jitter(base + 10, 1.4),
      x2: x + 25 + jitter(base + 11, 1.4),
      y2: 4 + jitter(base + 12, 1.4),
      stroke: 'currentColor',
      'stroke-width': (strokeBase + jitter(base + 13, 0.4)).toFixed(2),
      'stroke-linecap': 'round'
    }));
    x += groupW + gap;
  }
  if (rem > 0) {
    const base = (fullGroups + 1) * 17;
    for (let i = 0; i < rem; i++) drawVertical(x + 3 + i * 5, base + i);
  }
  container.appendChild(svg);
}

// Big hand-drawn pass checkmark (animates via CSS).
function renderPassCheck(container) {
  container.innerHTML = '';
  const svg = svgEl('svg', {
    class: 'passcheck',
    viewBox: '0 0 60 50',
    width: '60',
    height: '50',
    'aria-hidden': 'true'
  });
  // Slightly curved strokes for a hand-drawn feel without looking sloppy.
  const path = svgEl('path', {
    d: 'M6 30 Q14 36 23 44 Q40 22 56 6',
    fill: 'none',
    'stroke-width': 5.5,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  });
  svg.appendChild(path);
  container.appendChild(svg);
}

// Heatmap for a single habit. Cols = weeks, rows = weekday (Sun..Sat).
function renderHeatmap(container, habit, weeksBack = 10) {
  container.innerHTML = '';
  const cell = 12, gap = 3;
  const cols = weeksBack, rows = 7;
  const w = cols * (cell + gap) - gap;
  const h = rows * (cell + gap) - gap;

  const svg = svgEl('svg', {
    class: 'heatmap',
    viewBox: `0 0 ${w} ${h}`,
    'aria-label': `${weeksBack}-week activity for ${habit.name || 'habit'}`,
    role: 'img'
  });

  const today = parseDate(getToday());
  // Today should sit in the rightmost column, at its current weekday row.
  const lastIndex = (cols - 1) * rows + today.getDay();
  const start = new Date(today);
  start.setDate(start.getDate() - lastIndex);

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const idx = c * rows + r;
      const d = new Date(start);
      d.setDate(d.getDate() + idx);
      const key = fmtKey(d);
      const future = d > today;
      const dayRec = state.days[key];

      let cls = 'cell cell-inactive';
      let titleText = `${key}: no data`;
      if (future) {
        cls = 'cell cell-future';
        titleText = `${key}: future`;
      } else if (dayRec && (habit.id in dayRec.counts)) {
        const n = dayRec.counts[habit.id] || 0;
        if (n >= habit.minimum) {
          cls = 'cell cell-pass';
        } else {
          cls = 'cell cell-fail';
        }
        titleText = `${key}: ${n}/${habit.minimum}`;
      }

      const rect = svgEl('rect', {
        x: c * (cell + gap),
        y: r * (cell + gap),
        width: cell,
        height: cell,
        rx: 1.5,
        class: cls
      });
      const t = svgEl('title');
      t.textContent = titleText;
      rect.appendChild(t);
      svg.appendChild(rect);
    }
  }
  container.appendChild(svg);
}

/* ---------- Stats ---------- */
function statsForHabit(habit) {
  const keys = Object.keys(state.days)
    .filter(k => habit.id in state.days[k].counts)
    .sort();
  const totalActiveDays = keys.length;
  let passedDays = 0, totalReps = 0;
  let longest = 0, runLongest = 0;
  for (const k of keys) {
    const n = state.days[k].counts[habit.id] || 0;
    totalReps += n;
    if (n >= habit.minimum) {
      passedDays++;
      runLongest++;
      if (runLongest > longest) longest = runLongest;
    } else {
      runLongest = 0;
    }
  }
  let current = 0;
  for (let i = keys.length - 1; i >= 0; i--) {
    const n = state.days[keys[i]].counts[habit.id] || 0;
    if (n >= habit.minimum) current++; else break;
  }
  return {
    totalActiveDays,
    passedDays,
    passRate: totalActiveDays ? Math.round((passedDays / totalActiveDays) * 100) : 0,
    totalReps,
    avgPerDay: totalActiveDays ? (totalReps / totalActiveDays).toFixed(1) : '0.0',
    currentStreak: current,
    longestStreak: longest
  };
}
function overallStats() {
  const keys = Object.keys(state.days).sort();
  let totalHabitDays = 0, passedHabitDays = 0;
  for (const k of keys) {
    for (const h of state.habits) {
      if (h.id in state.days[k].counts) {
        totalHabitDays++;
        if ((state.days[k].counts[h.id] || 0) >= h.minimum) passedHabitDays++;
      }
    }
  }
  return {
    totalActiveDays: keys.length,
    firstKey: keys[0] || null,
    lastKey: keys[keys.length - 1] || null,
    overallPassRate: totalHabitDays ? Math.round((passedHabitDays / totalHabitDays) * 100) : 0
  };
}

/* ============================================================
 * Rendering
 * ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function showScreen(name) {
  currentScreen = name;
  $$('.screen').forEach(s => s.classList.toggle('is-active', s.dataset.screen === name));
  if (name === 'checklist') renderChecklist();
  else if (name === 'edit') renderEdit();
  else if (name === 'stats') renderStats();
  // Reset scroll on screen switch.
  window.scrollTo(0, 0);
}

/* ---------- Checklist ---------- */
function renderChecklist() {
  const dateMain = $('#dateMain');
  const dateSub  = $('#dateSub');
  const btnNext  = $('#dayNext');
  const btnToday = $('#todayBtn');

  dateMain.textContent = formatDateLine(viewedDate);
  dateSub.textContent  = formatSubDateLine(viewedDate);
  btnNext.disabled = isToday(viewedDate);
  btnToday.hidden = isToday(viewedDate);

  const list = $('#habitList');
  const hint = document.querySelector('.sheet-hint');
  list.innerHTML = '';

  if (state.habits.length === 0) {
    if (hint) hint.hidden = true;
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <p>No habits yet.</p>
      <p>Tap <span class="inline-icon">✎</span> to add your first.</p>
    `;
    list.appendChild(empty);
    return;
  }
  // Show the gesture hint on first run only — retire it forever once the
  // user has logged anything.
  if (hint) hint.hidden = userHasEverLogged();

  for (const habit of state.habits) {
    const n = getCount(viewedDate, habit.id);
    const passed = n >= habit.minimum;

    const row = document.createElement('div');
    row.className = 'row' + (passed ? ' row-pass' : '');

    // Name cell
    const nameCell = document.createElement('div');
    nameCell.className = 'cell-name';
    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = habit.name || '(unnamed)';
    nameCell.appendChild(nameEl);
    if (habit.note) {
      const noteEl = document.createElement('div');
      noteEl.className = 'note';
      noteEl.textContent = habit.note;
      nameCell.appendChild(noteEl);
    }

    // Count cell — implemented as div+role=button so we can nest an actual
    // <button> (the undo control) inside without producing invalid HTML.
    const countCell = document.createElement('div');
    countCell.className = 'cell-count';
    countCell.setAttribute('role', 'button');
    countCell.setAttribute('tabindex', '0');
    const goalState = passed ? '. Goal reached' : '';
    countCell.setAttribute('aria-label',
      `${habit.name}: ${n} of ${habit.minimum}${goalState}. ` +
      `Tap to add one${n > 0 ? '. Long-press to subtract' : ''}.`);

    const tallyWrap = document.createElement('div');
    tallyWrap.className = 'tally-wrap';
    renderTally(tallyWrap, n);

    const numLine = document.createElement('div');
    numLine.className = 'num-line';
    numLine.innerHTML = `<span class="num">${n}</span><span class="slash"> / </span><span class="min">${habit.minimum}</span>`;

    countCell.appendChild(tallyWrap);
    countCell.appendChild(numLine);

    // Tap = increment. Long-press (~450ms) on a counted habit = decrement.
    let lpTimer = null;
    const cancelLP = () => {
      if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
    };
    countCell.addEventListener('pointerdown', () => {
      cancelLP();
      // Only meaningful when there's something to undo.
      if (getCount(viewedDate, habit.id) <= 0) return;
      lpTimer = setTimeout(() => {
        lpTimer = null;
        suppressNextClick = true;
        decrement(habit.id, viewedDate);
        renderChecklist();
        // Safety net: drop the flag in case no click event ever arrives.
        setTimeout(() => { suppressNextClick = false; }, 500);
      }, 450);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
      countCell.addEventListener(ev, cancelLP));
    countCell.addEventListener('click', () => {
      if (suppressNextClick) { suppressNextClick = false; return; }
      increment(habit.id, viewedDate);
      renderChecklist();
    });
    // Keyboard activation (matches native button semantics).
    countCell.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        increment(habit.id, viewedDate);
        renderChecklist();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        // Keyboard equivalent of long-press.
        e.preventDefault();
        decrement(habit.id, viewedDate);
        renderChecklist();
      }
    });

    row.appendChild(nameCell);
    row.appendChild(countCell);

    // Big pass check is a row-level sibling so it never collides with the
    // undo button inside the count cell.
    if (passed) {
      const checkWrap = document.createElement('div');
      checkWrap.className = 'check-wrap';
      renderPassCheck(checkWrap);
      row.appendChild(checkWrap);
    }

    list.appendChild(row);
  }
}

/* ---------- Edit ---------- */
function renderEdit() {
  const list = $('#editList');
  list.innerHTML = '';

  if (state.habits.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<p>Add your first habit below.</p>';
    list.appendChild(empty);
  }

  state.habits.forEach((habit, idx) => {
    const row = document.createElement('div');
    row.className = 'edit-row';

    // Reorder up/down
    const reorder = document.createElement('div');
    reorder.className = 'reorder';
    const up = document.createElement('button');
    up.type = 'button'; up.className = 'icon-btn'; up.innerHTML = '▲';
    up.setAttribute('aria-label', 'Move up');
    up.disabled = idx === 0;
    up.addEventListener('click', () => { moveHabit(habit.id, -1); renderEdit(); });
    const down = document.createElement('button');
    down.type = 'button'; down.className = 'icon-btn'; down.innerHTML = '▼';
    down.setAttribute('aria-label', 'Move down');
    down.disabled = idx === state.habits.length - 1;
    down.addEventListener('click', () => { moveHabit(habit.id, 1); renderEdit(); });
    reorder.appendChild(up); reorder.appendChild(down);

    // Fields
    const fields = document.createElement('div');
    fields.className = 'fields';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'edit-name';
    nameInput.placeholder = 'Habit name';
    nameInput.value = habit.name || '';
    nameInput.addEventListener('input', () => updateHabit(habit.id, { name: nameInput.value }));

    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.className = 'edit-note';
    noteInput.placeholder = 'when / trigger (optional)';
    noteInput.value = habit.note || '';
    noteInput.addEventListener('input', () => updateHabit(habit.id, { note: noteInput.value }));

    // Minimum stepper
    const stepper = document.createElement('div');
    stepper.className = 'stepper';
    const minLbl = document.createElement('span');
    minLbl.className = 'stepper-label';
    minLbl.textContent = 'Goal';
    const minus = document.createElement('button');
    minus.type = 'button'; minus.className = 'icon-btn'; minus.textContent = '−';
    minus.setAttribute('aria-label', 'Decrease goal');
    const minVal = document.createElement('span');
    minVal.className = 'stepper-val';
    minVal.textContent = habit.minimum;
    const plus = document.createElement('button');
    plus.type = 'button'; plus.className = 'icon-btn'; plus.textContent = '+';
    plus.setAttribute('aria-label', 'Increase goal');
    minus.addEventListener('click', () => {
      const next = Math.max(1, habit.minimum - 1);
      updateHabit(habit.id, { minimum: next });
      minVal.textContent = next;
      habit.minimum = next;
    });
    plus.addEventListener('click', () => {
      const next = habit.minimum + 1;
      updateHabit(habit.id, { minimum: next });
      minVal.textContent = next;
      habit.minimum = next;
    });
    stepper.appendChild(minLbl);
    stepper.appendChild(minus);
    stepper.appendChild(minVal);
    stepper.appendChild(plus);

    fields.appendChild(nameInput);
    fields.appendChild(noteInput);
    fields.appendChild(stepper);

    // Delete
    const del = document.createElement('button');
    del.type = 'button'; del.className = 'icon-btn del-btn';
    del.innerHTML = '✕';
    del.setAttribute('aria-label', `Delete ${habit.name}`);
    del.addEventListener('click', () => {
      if (confirm(`Delete "${habit.name || 'this habit'}"? Past history will remain in your data file but be hidden from stats.`)) {
        deleteHabit(habit.id);
        renderEdit();
      }
    });

    row.appendChild(reorder);
    row.appendChild(fields);
    row.appendChild(del);
    list.appendChild(row);
  });
}

/* ---------- Stats ---------- */
function renderStats() {
  const overall = overallStats();
  const overallEl = $('#statsOverall');
  if (!overall.totalActiveDays) {
    overallEl.innerHTML = `<p class="muted">No tracked days yet. Tap a count on the checklist to start recording — only days where you actually log something count toward these stats.</p>`;
  } else {
    overallEl.innerHTML = `
      <div class="overall-num">${overall.overallPassRate}%</div>
      <div class="overall-lbl">overall pass rate</div>
      <div class="overall-sub">
        ${overall.totalActiveDays} tracked day${overall.totalActiveDays === 1 ? '' : 's'}
        ${overall.firstKey ? `· ${formatDateLine(overall.firstKey)} – ${formatDateLine(overall.lastKey)}` : ''}
      </div>
    `;
  }

  const list = $('#statsList');
  list.innerHTML = '';
  if (state.habits.length === 0) {
    list.innerHTML = '<p class="muted">No habits to show stats for.</p>';
    return;
  }
  for (const habit of state.habits) {
    const s = statsForHabit(habit);

    const card = document.createElement('section');
    card.className = 'stat-card';

    const head = document.createElement('div');
    head.className = 'stat-head';
    head.innerHTML = `
      <div class="stat-name">${escapeHtml(habit.name || '(unnamed)')}</div>
      ${habit.note ? `<div class="stat-note">${escapeHtml(habit.note)}</div>` : ''}
    `;
    card.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'stat-grid';
    grid.innerHTML = `
      <div class="stat-cell"><div class="stat-big">${s.passRate}%</div><div class="stat-lbl">pass rate</div></div>
      <div class="stat-cell"><div class="stat-big">${s.currentStreak}</div><div class="stat-lbl">current streak</div></div>
      <div class="stat-cell"><div class="stat-big">${s.longestStreak}</div><div class="stat-lbl">longest streak</div></div>
      <div class="stat-cell"><div class="stat-big">${s.totalReps}</div><div class="stat-lbl">total reps</div></div>
      <div class="stat-cell"><div class="stat-big">${s.avgPerDay}</div><div class="stat-lbl">avg / day</div></div>
      <div class="stat-cell"><div class="stat-big">${s.totalActiveDays}</div><div class="stat-lbl">tracked days</div></div>
    `;
    card.appendChild(grid);

    const heatWrap = document.createElement('div');
    heatWrap.className = 'heat-wrap';
    const heatLbl = document.createElement('div');
    heatLbl.className = 'heat-lbl';
    heatLbl.textContent = 'last 10 weeks';
    const heatHost = document.createElement('div');
    heatHost.className = 'heat-host';
    renderHeatmap(heatHost, habit);
    heatWrap.appendChild(heatLbl);
    heatWrap.appendChild(heatHost);
    card.appendChild(heatWrap);

    list.appendChild(card);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

/* ============================================================
 * Boot + wiring
 * ============================================================ */
function wire() {
  // Day navigation
  $('#dayPrev').addEventListener('click', () => {
    viewedDate = addDays(viewedDate, -1);
    renderChecklist();
  });
  $('#dayNext').addEventListener('click', () => {
    if (isToday(viewedDate)) return;
    viewedDate = addDays(viewedDate, 1);
    renderChecklist();
  });
  $('#todayBtn').addEventListener('click', () => {
    viewedDate = getToday();
    renderChecklist();
  });

  // Top-nav screen buttons
  $('#editBtn').addEventListener('click', () => showScreen('edit'));
  $('#statsBtn').addEventListener('click', () => showScreen('stats'));
  $('#editDone').addEventListener('click', () => showScreen('checklist'));
  $('#statsDone').addEventListener('click', () => showScreen('checklist'));

  // Add habit
  $('#addHabitBtn').addEventListener('click', () => {
    addHabit({ name: '', note: '', minimum: 1 });
    renderEdit();
    // Focus the new name input.
    const inputs = $$('#editList .edit-name');
    if (inputs.length) inputs[inputs.length - 1].focus();
  });

  // If the user keeps the app open across midnight, refresh viewedDate to today.
  window.addEventListener('focus', () => {
    const t = getToday();
    if (viewedDate < t) { viewedDate = t; renderChecklist(); }
  });
}

function init() {
  loadState();
  wire();
  // Honor a #edit / #stats hash on initial load so screens are linkable.
  const initialScreen =
    location.hash === '#edit'  ? 'edit'  :
    location.hash === '#stats' ? 'stats' :
    'checklist';
  showScreen(initialScreen);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
