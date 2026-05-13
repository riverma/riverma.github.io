(function () {
    'use strict';

    const I18N = {
        en: {
            appTitle: 'Mental Math',
            quickMode: 'Play',
            quickSub: '10 times-table problems',
            customize: 'Customize',
            pickMath: 'What to practice',
            multiply: 'Times',
            add: 'Plus',
            subtract: 'Minus',
            divide: 'Divide',
            mixed: 'Mixed',
            pickLevel: 'Level',
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard',
            howClose: 'Scoring',
            exact: 'Exact',
            rough: 'Good enough',
            howMany: 'Length',
            start: 'Start',
            answerPlaceholder: 'Your answer',
            submit: 'Go',
            tapToContinue: 'Tap to continue',
            correctMsg: 'Nice',
            closeEnough: 'Close enough',
            incorrectMsg: 'Oops',
            answerWas: 'Answer:',
            results: 'Nice work',
            accuracy: 'Score',
            bestStreak: 'Best streak',
            totalTime: 'Total time',
            avgTime: 'Average',
            fastest: 'Fastest',
            slowest: 'Slowest',
            seeAllProblems: 'See all problems',
            playAgain: 'Play again',
            menu: 'Menu',
            you: 'You:',
            blurbAce: 'You crushed it. 🌟',
            blurbGreat: 'Great job.',
            blurbGood: 'Nice try — keep going.',
            blurbKeep: 'Keep practicing.'
        },
        es: {
            appTitle: 'Cálculo Mental',
            quickMode: 'Jugar',
            quickSub: '10 problemas de multiplicar',
            customize: 'Personalizar',
            pickMath: 'Qué practicar',
            multiply: 'Por',
            add: 'Más',
            subtract: 'Menos',
            divide: 'Entre',
            mixed: 'Mezcla',
            pickLevel: 'Nivel',
            easy: 'Fácil',
            medium: 'Medio',
            hard: 'Difícil',
            howClose: 'Puntuación',
            exact: 'Exacto',
            rough: 'Más o menos',
            howMany: 'Cantidad',
            start: 'Empezar',
            answerPlaceholder: 'Tu respuesta',
            submit: 'OK',
            tapToContinue: 'Toca para seguir',
            correctMsg: '¡Bien!',
            closeEnough: '¡Casi exacto!',
            incorrectMsg: 'Uy',
            answerWas: 'Respuesta:',
            results: '¡Buen trabajo!',
            accuracy: 'Puntuación',
            bestStreak: 'Mejor racha',
            totalTime: 'Tiempo total',
            avgTime: 'Promedio',
            fastest: 'Más rápido',
            slowest: 'Más lento',
            seeAllProblems: 'Ver todos los problemas',
            playAgain: 'Jugar otra vez',
            menu: 'Menú',
            you: 'Tú:',
            blurbAce: '¡Increíble! 🌟',
            blurbGreat: '¡Muy bien!',
            blurbGood: 'Buen intento — sigue así.',
            blurbKeep: 'Sigue practicando.'
        }
    };

    const OP_SYMBOL = { multiply: '×', add: '+', subtract: '−', divide: '÷' };

    const PREFS_KEY = 'mentalMath.prefs.v1';

    const state = {
        language: 'en',
        mode: 'multiply',
        difficulty: 'medium',
        precision: 'exact',
        totalProblems: 10,
        customizeOpen: false,
        problems: [],
        currentIndex: 0,
        results: [],
        streak: 0,
        bestStreak: 0,
        problemStartTime: 0,
        awaitingDismiss: false,
        autoAdvanceTimer: null
    };

    const AUTO_ADVANCE_MS = 2200;

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    function makeMultiply(diff) {
        if (diff === 'easy')   return [randInt(2, 9),  randInt(2, 9)];
        if (diff === 'medium') {
            const single = randInt(2, 9);
            const two = randInt(10, 99);
            return Math.random() < 0.5 ? [single, two] : [two, single];
        }
        return [randInt(10, 99), randInt(10, 99)];
    }

    function makeAdd(diff) {
        if (diff === 'easy')   return [randInt(2, 20), randInt(2, 20)];
        if (diff === 'medium') return [randInt(10, 99), randInt(10, 99)];
        return [randInt(100, 999), randInt(100, 999)];
    }

    function makeSubtract(diff) {
        let a;
        if (diff === 'easy')   a = randInt(5, 30);
        else if (diff === 'medium') a = randInt(30, 200);
        else a = randInt(200, 999);
        const b = randInt(1, a);
        return [a, b];
    }

    function makeDivide(diff) {
        let qLo, qHi, bLo, bHi;
        if (diff === 'easy')        { qLo = 2; qHi = 9;  bLo = 2; bHi = 9;  }
        else if (diff === 'medium') { qLo = 2; qHi = 12; bLo = 2; bHi = 12; }
        else                        { qLo = 2; qHi = 15; bLo = 3; bHi = 15; }
        const q = randInt(qLo, qHi);
        const b = randInt(bLo, bHi);
        return [q * b, b];
    }

    function makeProblem(mode, diff) {
        let op = mode;
        if (mode === 'mixed') op = pick(['multiply', 'add', 'subtract', 'divide']);
        let a, b, answer;
        switch (op) {
            case 'multiply': [a, b] = makeMultiply(diff); answer = a * b; break;
            case 'add':      [a, b] = makeAdd(diff);      answer = a + b; break;
            case 'subtract': [a, b] = makeSubtract(diff); answer = a - b; break;
            case 'divide':   [a, b] = makeDivide(diff);   answer = a / b; break;
        }
        return { a, b, op, answer };
    }

    function isCorrect(expected, given, precision) {
        if (!Number.isFinite(given)) return false;
        if (precision === 'exact') return given === expected;
        const tol = Math.max(1, Math.abs(expected) * 0.05);
        return Math.abs(given - expected) <= tol;
    }

    /* ---------- i18n ---------- */

    function t(key) {
        return (I18N[state.language] && I18N[state.language][key]) || I18N.en[key] || key;
    }

    function applyTranslations() {
        document.documentElement.lang = state.language;
        $$('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        document.title = t('appTitle');
        const input = $('#answerInput');
        if (input) input.placeholder = t('answerPlaceholder');
        $$('.lang-btn').forEach((b) => {
            b.classList.toggle('is-active', b.dataset.lang === state.language);
        });
    }

    /* ---------- Persistence ---------- */

    function savePrefs() {
        try {
            localStorage.setItem(PREFS_KEY, JSON.stringify({
                language: state.language,
                mode: state.mode,
                difficulty: state.difficulty,
                precision: state.precision,
                totalProblems: state.totalProblems,
                customizeOpen: state.customizeOpen
            }));
        } catch (e) { /* storage may be unavailable */ }
    }

    function loadPrefs() {
        try {
            const raw = localStorage.getItem(PREFS_KEY);
            if (!raw) return;
            const p = JSON.parse(raw);
            if (p.language && I18N[p.language]) state.language = p.language;
            if (p.mode) state.mode = p.mode;
            if (p.difficulty) state.difficulty = p.difficulty;
            if (p.precision) state.precision = p.precision;
            if (p.totalProblems) state.totalProblems = Number(p.totalProblems);
            if (typeof p.customizeOpen === 'boolean') state.customizeOpen = p.customizeOpen;
        } catch (e) { /* ignore */ }
    }

    function applyCustomizeOpen() {
        const panel = $('#customizePanel');
        const toggle = $('#customizeToggle');
        if (!panel || !toggle) return;
        panel.hidden = !state.customizeOpen;
        toggle.setAttribute('aria-expanded', state.customizeOpen ? 'true' : 'false');
    }

    /* ---------- Screens ---------- */

    function setScreen(name) {
        document.body.classList.remove('screen-setup', 'screen-game', 'screen-scoreboard');
        document.body.classList.add('screen-' + name);
    }

    /* ---------- Setup screen ---------- */

    function syncSetupUI() {
        $$('.opt-row').forEach((row) => {
            const key = row.dataset.key;
            const target = key === 'count' ? String(state.totalProblems) :
                            key === 'mode' ? state.mode :
                            key === 'difficulty' ? state.difficulty :
                            key === 'precision' ? state.precision : null;
            row.querySelectorAll('.opt-btn').forEach((b) => {
                b.classList.toggle('is-active', b.dataset.value === target);
            });
        });
    }

    function wireSetup() {
        $$('.opt-row').forEach((row) => {
            row.addEventListener('click', (e) => {
                const btn = e.target.closest('.opt-btn');
                if (!btn) return;
                const key = row.dataset.key;
                const value = btn.dataset.value;
                if (key === 'mode') state.mode = value;
                else if (key === 'difficulty') state.difficulty = value;
                else if (key === 'precision') state.precision = value;
                else if (key === 'count') state.totalProblems = Number(value);
                syncSetupUI();
                savePrefs();
            });
        });

        $('#startBtn').addEventListener('click', startGame);

        $('#quickModeBtn').addEventListener('click', () => {
            state.mode = 'multiply';
            state.difficulty = 'medium';
            state.precision = 'exact';
            state.totalProblems = 10;
            syncSetupUI();
            savePrefs();
            startGame();
        });

        $$('.lang-btn').forEach((b) => {
            b.addEventListener('click', () => {
                state.language = b.dataset.lang;
                applyTranslations();
                savePrefs();
            });
        });

        $('#customizeToggle').addEventListener('click', () => {
            state.customizeOpen = !state.customizeOpen;
            applyCustomizeOpen();
            savePrefs();
        });
    }

    /* ---------- Game loop ---------- */

    function startGame() {
        state.problems = [];
        for (let i = 0; i < state.totalProblems; i++) {
            state.problems.push(makeProblem(state.mode, state.difficulty));
        }
        state.currentIndex = 0;
        state.results = [];
        state.streak = 0;
        state.bestStreak = 0;
        updateStreak(false);
        setScreen('game');
        showProblem();
    }

    function formatProblem(p) {
        return p.a + ' ' + OP_SYMBOL[p.op] + ' ' + p.b;
    }

    function showProblem() {
        const p = state.problems[state.currentIndex];
        const problemEl = $('#problem');
        $('#problemText').textContent = formatProblem(p);
        // Retrigger the pop animation by re-applying the class
        problemEl.style.animation = 'none';
        // eslint-disable-next-line no-unused-expressions
        problemEl.offsetWidth;
        problemEl.style.animation = '';
        updateProgress();
        const input = $('#answerInput');
        input.value = '';
        input.disabled = false;
        $('#submitBtn').disabled = false;
        $('#resultOverlay').classList.remove('is-visible', 'is-correct', 'is-incorrect');
        state.awaitingDismiss = false;
        if (state.autoAdvanceTimer) { clearTimeout(state.autoAdvanceTimer); state.autoAdvanceTimer = null; }
        state.problemStartTime = performance.now();
        setTimeout(() => input.focus(), 0);
    }

    function updateProgress() {
        const pct = (state.currentIndex / state.totalProblems) * 100;
        $('#progressFill').style.width = pct + '%';
    }

    function updateStreak(animate) {
        const el = $('#streak');
        $('#streakCount').textContent = state.streak;
        const hot = state.streak >= 3;
        el.classList.toggle('is-hot', hot);
        el.querySelector('.streak-icon').textContent = hot ? '🔥' : '⭐';
        if (animate) {
            el.style.animation = 'none';
            // eslint-disable-next-line no-unused-expressions
            el.offsetWidth;
            el.style.animation = '';
        }
    }

    function submitAnswer() {
        if (state.awaitingDismiss) return;
        const elapsedMs = performance.now() - state.problemStartTime;
        const input = $('#answerInput');
        const raw = input.value.trim();
        if (raw === '' || raw === '-') return;
        const given = Number(raw);
        const p = state.problems[state.currentIndex];
        const correct = isCorrect(p.answer, given, state.precision);
        const exact = given === p.answer;

        state.results.push({
            problem: formatProblem(p),
            expected: p.answer,
            given: given,
            isCorrect: correct,
            isExact: exact,
            ms: elapsedMs
        });

        if (correct) {
            state.streak++;
            if (state.streak > state.bestStreak) state.bestStreak = state.streak;
        } else {
            state.streak = 0;
        }
        updateStreak(correct);

        input.disabled = true;
        $('#submitBtn').disabled = true;
        showResultOverlay(correct, exact, p.answer, elapsedMs);
    }

    function showResultOverlay(correct, exact, expected, elapsedMs) {
        const overlay = $('#resultOverlay');
        overlay.classList.add('is-visible');
        overlay.classList.toggle('is-correct', correct);
        overlay.classList.toggle('is-incorrect', !correct);
        $('#resultIcon').textContent = correct ? '✓' : '✗';

        const textEl = $('#resultText');
        textEl.innerHTML = '';
        let label;
        if (correct && exact) label = t('correctMsg');
        else if (correct)     label = t('closeEnough');
        else                  label = t('incorrectMsg');
        textEl.appendChild(document.createTextNode(label));
        if (!exact || !correct) {
            const pill = document.createElement('span');
            pill.className = 'answer-pill';
            pill.textContent = t('answerWas') + ' ' + formatNum(expected);
            textEl.appendChild(document.createTextNode(' '));
            textEl.appendChild(pill);
        }

        $('#resultTime').textContent = formatTime(elapsedMs);
        state.awaitingDismiss = true;

        state.autoAdvanceTimer = setTimeout(advance, AUTO_ADVANCE_MS);
    }

    function advance() {
        if (state.autoAdvanceTimer) { clearTimeout(state.autoAdvanceTimer); state.autoAdvanceTimer = null; }
        state.awaitingDismiss = false;
        state.currentIndex++;
        if (state.currentIndex >= state.problems.length) {
            updateProgress();
            renderScoreboard();
            setScreen('scoreboard');
        } else {
            showProblem();
        }
    }

    function wireGame() {
        $('#answerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (state.awaitingDismiss) advance();
            else submitAnswer();
        });
        $('#resultOverlay').addEventListener('click', () => {
            if (state.awaitingDismiss) advance();
        });
        $('#quitBtn').addEventListener('click', () => {
            if (state.autoAdvanceTimer) { clearTimeout(state.autoAdvanceTimer); state.autoAdvanceTimer = null; }
            setScreen('setup');
        });
        $('#answerInput').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '');
        });
    }

    /* ---------- Scoreboard ---------- */

    function formatTime(ms) {
        const s = ms / 1000;
        return (s < 10 ? s.toFixed(2) : s.toFixed(1)) + 's';
    }

    function formatNum(n) {
        return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
    }

    function starsForAccuracy(pct) {
        if (pct >= 90) return 3;
        if (pct >= 60) return 2;
        if (pct >= 30) return 1;
        return 0;
    }

    function blurbForStars(n) {
        if (n === 3) return t('blurbAce');
        if (n === 2) return t('blurbGreat');
        if (n === 1) return t('blurbGood');
        return t('blurbKeep');
    }

    function renderScoreboard() {
        const results = state.results;
        const correctCount = results.filter((r) => r.isCorrect).length;
        const totalMs = results.reduce((s, r) => s + r.ms, 0);
        const avgMs = results.length ? totalMs / results.length : 0;
        const times = results.map((r) => r.ms);
        const fastMs = times.length ? Math.min.apply(null, times) : 0;
        const accuracy = results.length ? Math.round((correctCount / results.length) * 100) : 0;
        const starCount = starsForAccuracy(accuracy);

        const starEls = $$('#scoreStars .star');
        starEls.forEach((el, i) => el.classList.remove('lit'));
        starEls.forEach((el, i) => {
            setTimeout(() => {
                if (i < starCount) el.classList.add('lit');
            }, 180 + i * 200);
        });

        $('#scoreBlurb').textContent = blurbForStars(starCount);

        $('#statAccuracy').textContent = correctCount + ' / ' + results.length + '  (' + accuracy + '%)';
        $('#statStreak').textContent = state.bestStreak;
        $('#statTotal').textContent = formatTime(totalMs);
        $('#statAvg').textContent = formatTime(avgMs);
        $('#statFast').textContent = formatTime(fastMs);

        const list = $('#problemList');
        list.innerHTML = '';
        results.forEach((r) => {
            const li = document.createElement('li');
            li.className = r.isCorrect ? 'is-correct' : 'is-incorrect';

            const prob = document.createElement('div');
            const probLine = document.createElement('span');
            probLine.className = 'pl-problem';
            probLine.textContent = r.problem + ' = ' + formatNum(r.expected);
            prob.appendChild(probLine);
            if (!r.isExact) {
                const given = document.createElement('span');
                given.className = 'pl-given';
                given.textContent = t('you') + ' ' + formatNum(r.given);
                prob.appendChild(given);
            }

            const time = document.createElement('span');
            time.className = 'pl-time';
            time.textContent = formatTime(r.ms);

            const mark = document.createElement('span');
            mark.className = 'pl-mark';
            mark.textContent = r.isCorrect ? '✓' : '✗';

            li.appendChild(prob);
            li.appendChild(time);
            li.appendChild(mark);
            list.appendChild(li);
        });
    }

    function wireScoreboard() {
        $('#playAgainBtn').addEventListener('click', startGame);
        $('#menuBtn').addEventListener('click', () => setScreen('setup'));
    }

    /* ---------- Init ---------- */

    function init() {
        loadPrefs();
        applyTranslations();
        syncSetupUI();
        applyCustomizeOpen();
        wireSetup();
        wireGame();
        wireScoreboard();
        setScreen('setup');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
