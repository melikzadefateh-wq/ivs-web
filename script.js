'use strict';

/* ─── Dictionary ────────────────────────────────────────── */
const DICT = {
  en: {
    title:       'IVS ANALYZER',
    subtitle:    'Biological Rhythm Computing',
    flight:      'Flight Duration',
    zones:       'Time Zones',
    direction:   'Travel Vector',
    west:        'Westbound — Normal',
    east:        'Eastbound — Heavy',
    button:      'Compute Index',
    resLabel:    'ANALYSIS RESULT',
    hours:       'hrs',
    tzUnit:      'tz',
    stable:      'OPTIMAL',
    stableDesc:  'Biometric markers within normal range. Circadian rhythm adapts seamlessly — no intervention required.',
    caution:     'CAUTION',
    cautionDesc: 'Mild circadian shift detected. Hydration, light therapy, and melatonin are recommended.',
    critical:    'CRITICAL SHIFT',
    criticalDesc:'Severe desynchronosis confirmed. Immediate sleep protocol required — limit stimulants and screen exposure.',
  },
  ru: {
    title:       'IVS АНАЛИЗАТОР',
    subtitle:    'Вычисление биоритмов',
    flight:      'Длительность полёта',
    zones:       'Часовые пояса',
    direction:   'Вектор пути',
    west:        'На запад — Норма',
    east:        'На восток — Тяжело',
    button:      'Рассчитать',
    resLabel:    'РЕЗУЛЬТАТ АНАЛИЗА',
    hours:       'ч',
    tzUnit:      'пп',
    stable:      'ОПТИМАЛЬНО',
    stableDesc:  'Биоритмы в норме. Адаптация пройдёт незаметно — никаких вмешательств не требуется.',
    caution:     'ВНИМАНИЕ',
    cautionDesc: 'Умеренный сдвиг циркадных ритмов. Рекомендуется светотерапия, гидратация и мелатонин.',
    critical:    'КРИТИЧЕСКИЙ СДВИГ',
    criticalDesc:'Подтверждён тяжёлый десинхроноз. Немедленный протокол восстановления сна — ограничьте стимуляторы и экраны.',
  },
};

/* ─── State ─────────────────────────────────────────────── */
let lang = 'en';
let animFrame = null;

/* ─── Element refs ───────────────────────────────────────── */
const els = {
  btnEn:      () => document.getElementById('btn-en'),
  btnRu:      () => document.getElementById('btn-ru'),
  title:      () => document.getElementById('t-title'),
  subtitle:   () => document.getElementById('t-subtitle'),
  flight:     () => document.getElementById('t-flight'),
  zones:      () => document.getElementById('t-zones'),
  direction:  () => document.getElementById('t-direction'),
  west:       () => document.getElementById('t-west'),
  east:       () => document.getElementById('t-east'),
  button:     () => document.getElementById('t-button'),
  resLabel:   () => document.getElementById('t-res-label'),
  hours:      () => document.getElementById('t-hours'),
  tzUnit:     () => document.getElementById('t-tz-unit'),
  tf:         () => document.getElementById('tf'),
  tz:         () => document.getElementById('tz'),
  k:          () => document.getElementById('k'),
  result:     () => document.getElementById('result'),
  ivsValue:   () => document.getElementById('ivsValue'),
  statusName: () => document.getElementById('status-name'),
  info:       () => document.getElementById('info'),
  dot:        () => document.getElementById('dot'),
};

/* ─── Language switch ────────────────────────────────────── */
function switchLang(newLang) {
  lang = newLang;
  const l = DICT[lang];

  els.btnEn().classList.toggle('active', lang === 'en');
  els.btnRu().classList.toggle('active', lang === 'ru');

  els.title().textContent      = l.title;
  els.subtitle().textContent   = l.subtitle;
  els.flight().textContent     = l.flight;
  els.zones().textContent      = l.zones;
  els.direction().textContent  = l.direction;
  els.west().textContent       = l.west;
  els.east().textContent       = l.east;
  els.button().querySelector('.cta-text').textContent = l.button;
  els.resLabel().textContent   = l.resLabel;
  els.hours().textContent      = l.hours;
  els.tzUnit().textContent     = l.tzUnit;

  // Re-render result if visible
  if (els.result().classList.contains('visible')) {
    renderResult(parseFloat(els.ivsValue().textContent));
  }
}

/* ─── Number counter animation ───────────────────────────── */
function animateNumber(target, duration = 700) {
  const el = els.ivsValue();
  const start = performance.now();
  const from  = parseFloat(el.textContent) || 0;

  if (animFrame) cancelAnimationFrame(animFrame);

  el.classList.add('counting');

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4); // easeOutQuart
    const current = from + (target - from) * ease;
    el.textContent = current.toFixed(2);

    if (t < 1) {
      animFrame = requestAnimationFrame(step);
    } else {
      el.textContent = target.toFixed(2);
      el.classList.remove('counting');
      animFrame = null;
    }
  }

  animFrame = requestAnimationFrame(step);
}

/* ─── Apply result colors & text ─────────────────────────── */
function renderResult(ivs) {
  const l = DICT[lang];
  const numEl  = els.ivsValue();
  const dotEl  = els.dot();
  const statEl = els.statusName();
  const infoEl = els.info();

  let color, status, desc;

  if (ivs < 0.7) {
    color  = 'var(--green)';
    status = l.stable;
    desc   = l.stableDesc;
  } else if (ivs <= 1.0) {
    color  = 'var(--yellow)';
    status = l.caution;
    desc   = l.cautionDesc;
  } else {
    color  = 'var(--red)';
    status = l.critical;
    desc   = l.criticalDesc;
  }

  numEl.style.color          = color;
  dotEl.style.background     = color;
  dotEl.style.color          = color;   // for ::after pseudo (ring color)
  statEl.style.color         = color;
  statEl.textContent         = status;
  infoEl.textContent         = desc;
}

/* ─── Main compute ───────────────────────────────────────── */
function analyze() {
  const tf = parseFloat(els.tf().value);
  const tz = parseFloat(els.tz().value);
  const k  = parseFloat(els.k().value);

  if (!tf || tf <= 0 || isNaN(tz) || tz < 0) {
    shakeInvalid();
    return;
  }

  const ivs = k * (tz / tf);

  // Show result panel
  const resultEl = els.result();
  if (!resultEl.classList.contains('visible')) {
    resultEl.classList.add('visible');
  }

  renderResult(ivs);
  animateNumber(ivs, 800);
}

/* ─── Shake invalid inputs ───────────────────────────────── */
function shakeInvalid() {
  const tf = els.tf();
  const tz = els.tz();
  const inputs = [];
  if (!parseFloat(tf.value) || parseFloat(tf.value) <= 0) inputs.push(tf);
  if (isNaN(parseFloat(tz.value)) || parseFloat(tz.value) < 0) inputs.push(tz);

  inputs.forEach(input => {
    input.parentElement.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(6px)' },
      { transform: 'translateX(-4px)' },
      { transform: 'translateX(4px)' },
      { transform: 'translateX(0)' },
    ], { duration: 360, easing: 'ease-out' });

    input.style.borderColor = 'var(--red)';
    input.style.boxShadow   = '0 0 0 3px rgba(255,69,58,0.15)';

    setTimeout(() => {
      input.style.borderColor = '';
      input.style.boxShadow   = '';
    }, 1400);
  });
}

/* ─── Enter key support ──────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') analyze();
});

/* ─── Init ───────────────────────────────────────────────── */
switchLang('en');
