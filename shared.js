/* ─── THROTTLE ─── */
const throttle = (fn, ms = 16) => {
  let last = 0;
  return (...args) => {
    const t = performance.now();
    if (t - last >= ms) { last = t; fn(...args); }
  };
};

/* ─── AUDIO ENGINE ─── */
let audioCtx, masterGain;
let isMuted = true;

(function loadMuteState() {
  try {
    const saved = localStorage.getItem('tayMuteState');
    if (saved !== null) isMuted = JSON.parse(saved);
  } catch(e) {}
})();

function saveMuteState() {
  try { localStorage.setItem('tayMuteState', JSON.stringify(isMuted)); } catch(e) {}
}

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.55;

    const curve = new Float32Array(1024);
    const k = 14;
    for (let i = 0; i < curve.length; i++) {
      const x = i * 2 / curve.length - 1;
      curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }
    const drive = audioCtx.createWaveShaper();
    drive.curve = curve;
    drive.oversample = '2x';
    window.__fxDrive = drive;

    const hp = audioCtx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 90;
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;

    drive.connect(hp); hp.connect(lp); lp.connect(masterGain);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playNote(freq) {
  if (isMuted) return;
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const oscA = ctx.createOscillator(); oscA.type = 'sawtooth'; oscA.frequency.value = freq;
  const oscB = ctx.createOscillator(); oscB.type = 'square'; oscB.frequency.value = freq;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, now);
  env.gain.exponentialRampToValueAtTime(0.13, now + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
  oscA.connect(env); oscB.connect(env);
  env.connect(window.__fxDrive || masterGain);
  oscA.start(now); oscB.start(now);
  const stop = now + 1.6;
  oscA.stop(stop); oscB.stop(stop);
  setTimeout(() => { try { oscA.disconnect(); oscB.disconnect(); env.disconnect(); } catch(e){} }, (stop - ctx.currentTime) * 1000 + 20);
}

function toggleMute() {
  isMuted = !isMuted;
  saveMuteState();
  return isMuted;
}

// iOS unlock
['touchstart','touchend','click'].forEach(ev => {
  document.addEventListener(ev, function unlock() {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    document.removeEventListener(ev, unlock);
  }, { passive: true, once: true });
});

/* ─── GUITAR STRING CLASS ─── */
class GuitarString {
  constructor(zoneEl, pathEl, freq = 329.63) {
    this.zone = zoneEl;
    this.path = pathEl;
    this.freq = freq;
    this.isDown = false;
    this.lastX = 0;
    this.lastT = 0;
    this.bind();
  }

  bind() {
    const throttledMove = throttle((e) => {
      if (this.isDown || e.pointerType !== 'touch') this.pluck(e.clientX, e.clientY);
    }, 80);

    this.zone.addEventListener('mouseenter', () => this.interact());
    this.zone.addEventListener('click', () => this.interact());
    this.zone.addEventListener('pointermove', throttledMove, { passive: true });
    this.zone.addEventListener('pointerdown', (e) => { this.isDown = true; this.pluck(e.clientX, e.clientY); }, { passive: true });
    this.zone.addEventListener('pointerup', () => this.isDown = false, { passive: true });
    this.zone.addEventListener('pointerleave', () => this.isDown = false, { passive: true });
    this.zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const r = this.zone.getBoundingClientRect();
        this.pluck(r.left + r.width / 2, r.top + r.height / 2);
      }
    });
  }

  interact() {
    this.showControls();
    this.sound();
  }

  sound() {
    playNote(this.freq);
    const cls = isMuted ? 'played-muted' : 'played';
    this.path.classList.add(cls);
    setTimeout(() => this.path.classList.remove('played', 'played-muted'), 500);
  }

  setPath(y) {
    this.path.setAttribute('d', `M0 19 Q 550 ${19 + y} 1100 19`);
  }

  vibrate(amp = 16, vfreq = 6, damp = 2.5) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { this.setPath(0); return; }
    const t0 = performance.now();
    const frame = (t) => {
      const dt = (t - t0) / 1000;
      const env = Math.exp(-damp * dt);
      this.setPath(amp * env * Math.sin(2 * Math.PI * vfreq * dt));
      if (env > 0.01) requestAnimationFrame(frame);
      else this.setPath(0);
    };
    requestAnimationFrame(frame);
  }

  pluck(cx, cy) {
    const r = this.zone.getBoundingClientRect();
    const x = cx - r.left;
    const t = performance.now();
    const pxPerMs = Math.abs(x - this.lastX) / Math.max(1, t - this.lastT);
    this.lastX = x; this.lastT = t;
    const vel = Math.min(1, pxPerMs / 1.8);
    this.vibrate(10 + vel * 22, 5 + vel * 8, 2.6);
    this.sound();
  }

  showControls() {
    if (window.__portfolioApp) window.__portfolioApp.showControls();
  }
}

/* ─── STRINGS PANEL ─── */
class StringsPanel {
  constructor() {
    this.btn = document.getElementById('expandBtn');
    this.panel = document.getElementById('stringsPanel');
    this.grid = document.getElementById('stringsGrid');
    this.open = false;
    this.strings = [];
    const path = window.location.pathname;
    this.tuning = path.includes('about') 
      ? [277.18, 220.00, 164.81, 110.00, 82.41]
      : [246.94, 207.65, 164.81, 123.47, 82.41];
    this.btn.addEventListener('click', () => this.toggle());
  }

  toggle() { this.open ? this.close() : this.expand(); }

  expand() {
    if (!this.grid.childElementCount) this.build();
    this.panel.removeAttribute('hidden');
    this.panel.classList.add('open');
    this.btn.classList.add('expanded');
    this.btn.setAttribute('aria-expanded', 'true');
    this.open = true;
  }

  close() {
    this.panel.classList.remove('open');
    this.btn.classList.remove('expanded');
    this.btn.setAttribute('aria-expanded', 'false');
    this.panel.setAttribute('hidden', '');
    this.open = false;
  }

  build() {
    this.grid.innerHTML = '';
    const thicknesses = [1, 1.2, 1.5, 1.8, 2.2];
    this.tuning.forEach((freq, i) => {
      const row = document.createElement('div');
      row.className = 'str-row';
      row.setAttribute('aria-label', `String ${i + 1}`);
      row.tabIndex = 0;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 1100 36');
      svg.setAttribute('preserveAspectRatio', 'none');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'string-path');
      path.setAttribute('d', 'M0 19 Q 550 19 1100 19');
      path.setAttribute('stroke-width', thicknesses[i]);
      svg.appendChild(path);
      row.appendChild(svg);
      this.grid.appendChild(row);
      row.addEventListener('mouseenter', () => path.setAttribute('stroke-width', thicknesses[i] * 1.5));
      row.addEventListener('mouseleave', () => path.setAttribute('stroke-width', thicknesses[i]));
      this.strings.push(new GuitarString(row, path, freq));
    });
  }
}

/* ─── MUTE BUTTON ─── */
class MuteButton {
  constructor() {
    this.btn = document.getElementById('muteBtn');
    this.btn.addEventListener('click', () => this.toggle());
  }

  toggle() {
    const m = toggleMute();
    this.update(m);
  }

  update(m) {
    this.btn.classList.toggle('muted', m);
    this.btn.querySelectorAll('.sound-on').forEach(el => el.style.display = m ? 'none' : '');
    this.btn.querySelectorAll('.sound-off').forEach(el => el.style.display = m ? '' : 'none');
    this.btn.setAttribute('aria-label', m ? 'Unmute sound' : 'Mute sound');
    document.documentElement.style.setProperty('--nav-active', m ? '#c0392b' : 'var(--accent)');
  }

  show() {
    this.btn.style.display = 'inline-flex';
    this.update(isMuted);
  }
}

/* ─── MOBILE MENU ─── */
class MobileMenu {
  constructor() {
    this.btn = document.getElementById('mobileMenuBtn');
    this.menu = document.getElementById('mobileMenu');
    if (!this.btn) return;
    this.btn.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
    document.addEventListener('click', (e) => {
      if (!this.menu.contains(e.target) && !this.btn.contains(e.target)) this.close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
  }
  toggle() { this.menu.classList.toggle('open'); }
  close() { this.menu.classList.remove('open'); }
}

/* ─── THEME MANAGER ─── */
class ThemeManager {
  constructor() {
    this.pref = (() => { try { return localStorage.getItem('tayTheme') || 'system'; } catch(e) { return 'system'; } })();
    this.btn = this.createButton();
    this.insertButton();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.pref === 'system') this.updateIcon();
    });
  }

  isDark() {
    if (this.pref === 'dark') return true;
    if (this.pref === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggle() {
    this.pref = this.isDark() ? 'light' : 'dark';
    try { localStorage.setItem('tayTheme', this.pref); } catch(e) {}
    document.documentElement.setAttribute('data-theme', this.pref);
    this.updateIcon();
  }

  createButton() {
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.id = 'themeBtn';
    btn.addEventListener('click', () => this.toggle());
    this.updateIcon(btn);
    return btn;
  }

  updateIcon(btn = this.btn) {
    const dark = this.isDark();
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.innerHTML = dark
      ? `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  insertButton() {
    const nav = document.querySelector('.header-bar .main-nav');
    if (nav) nav.parentElement.insertBefore(this.btn, nav);
  }
}

/* ─── MAIN APP ─── */
class PortfolioApp {
  constructor() {
    this.shown = false;
    window.__portfolioApp = this;
    this.theme = new ThemeManager();
    this.mobileMenu = new MobileMenu();
    this.muteBtn = new MuteButton();
    this.stringsPanel = new StringsPanel();
    this.initMainString();
  }

  initMainString() {
    const zone = document.getElementById('singleZone');
    const path = document.getElementById('singlePath');
    if (!zone || !path) return;
    const path_ = window.location.pathname;
    const freq = path_.includes('about') ? 246.94 : 329.63;
    this.mainString = new GuitarString(zone, path, freq);
  }

  showControls() {
    if (this.shown) return;
    this.shown = true;
    const eb = document.getElementById('expandBtn');
    if (eb) { eb.style.display = 'inline-flex'; eb.removeAttribute('aria-hidden'); }
    this.muteBtn.show();
  }
}

document.addEventListener('DOMContentLoaded', () => new PortfolioApp());

document.addEventListener('visibilitychange', () => {
  if (!audioCtx) return;
  document.hidden ? audioCtx.suspend() : audioCtx.resume();
});

// ── Lightbox ──────────────────────────────────────────────
(function () {
  const overlay = document.createElement('div');
  overlay.id = 'img-lightbox';
  const lbImg = document.createElement('img');
  overlay.appendChild(lbImg);
  document.body.appendChild(overlay);

  function open(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  document.addEventListener('click', function (e) {
    const img = e.target.closest('img');
    if (!img) return;
    if (img.closest('.hero-img')) return;
    if (img.closest('.brand')) return;
    if (img.closest('a[href]')) return;
    open(img.src, img.alt);
  });

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
}());
