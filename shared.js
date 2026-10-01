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
// every page starts muted, whatever the last visit chose — sound comes on when
// someone clicks a string or the mute button. Nothing is remembered, and the
// old saved setting is cleared so it can't linger.
let isMuted = true;
try { localStorage.removeItem('tayMuteState'); } catch(e) {}
// Clicking a string unmutes — but only until someone uses the mute button
// themselves. After that the button alone decides.
let muteTouched = false;

/* ─── AMP ───
   The sound runs through an amp-style chain, each stage set by a dial
   (chords.js draws them):
     note → GAIN → [electric: OVERDRIVE + speaker tone | acoustic: wooden body]
          → LOW / MID / HIGH (EQ) → REVERB → VOLUME → out
   Dial values are 0–1. The defaults are the sound the site always had — gain
   and drive at its old fixed settings, EQ flat — plus a touch of reverb.
   `type` is the Acoustic / Electric switch. Settings are kept in the browser,
   so the tone carries across pages. */
const AMP_DEFAULTS = { gain: 0.5, low: 0.5, mid: 0.5, high: 0.5, volume: 0.55, reverb: 0.15, drive: 0.5 };
let amp = Object.assign({}, AMP_DEFAULTS);
let guitarType = 'electric';   // 'electric' | 'acoustic'
try {
  const savedAmp = JSON.parse(localStorage.getItem('tayAmp') || 'null');
  if (savedAmp) {
    Object.keys(AMP_DEFAULTS).forEach(k => {
      if (typeof savedAmp[k] === 'number') amp[k] = Math.min(1, Math.max(0, savedAmp[k]));
    });
    if (savedAmp.type === 'acoustic' || savedAmp.type === 'electric') guitarType = savedAmp.type;
  }
} catch (e) {}
const ampNodes = {};
function saveAmp() {
  try { localStorage.setItem('tayAmp', JSON.stringify(Object.assign({ type: guitarType }, amp))); } catch (e) {}
}

// soft-clip curve; k = 0 is clean (a straight line), higher k breaks up harder.
// 0.5 on the dial is k = 14, the site's original fixed drive.
function driveCurve(v) {
  const k = 56 * v * v;
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = i * 2 / curve.length - 1;
    curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
  }
  return curve;
}

// a reverb tail made rather than loaded: two channels of noise, decaying
function reverbImpulse(ctx, seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

// push one setting into the running chain (a short ramp, so turning a dial
// mid-note doesn't click)
function applyAmp(key) {
  if (!audioCtx) return;
  const n = ampNodes, v = amp[key], t = audioCtx.currentTime;
  const to = (param, value) => param.setTargetAtTime(value, t, 0.02);
  const db = x => (x - 0.5) * 24;   // EQ: ±12 dB, flat at the middle
  if (key === 'gain') to(n.pre.gain, 0.25 * Math.pow(16, v));   // ×0.25 – ×4, ×1 at the middle
  if (key === 'drive') n.drive.curve = driveCurve(v);
  if (key === 'low') to(n.low.gain, db(v));
  if (key === 'mid') to(n.mid.gain, db(v));
  if (key === 'high') to(n.high.gain, db(v));
  if (key === 'reverb') { to(n.wet.gain, v * 0.9); to(n.dry.gain, 1 - v * 0.35); }
  if (key === 'volume') to(masterGain.gain, v);
}

// Acoustic / Electric. Electric runs the overdrive and a speaker-cabinet top
// end; acoustic skips the overdrive, adds the body, and opens the top end up.
// Both paths always exist — the switch crossfades between them.
function applyType(instant) {
  if (!audioCtx) return;
  const n = ampNodes, e = guitarType === 'electric';
  const t = audioCtx.currentTime;
  const to = (param, value) => instant ? (param.value = value) : param.setTargetAtTime(value, t, 0.03);
  // the overdrive squashes everything to about the same loudness, so its
  // level is trimmed after it, to sit with the acoustic and the old sound
  to(n.electric.gain, e ? 0.62 : 0);
  // the overdrive lifts a quiet note a lot, so the clean acoustic path is
  // given the gain to land at about the same loudness
  to(n.acoustic.gain, e ? 0 : 3.4);
  to(n.hp.frequency, e ? 65 : 60);       // under the low E (82Hz), so it keeps its fundamental
  to(n.cab.frequency, e ? 3800 : 9000);  // a 12" speaker rolls off early; air doesn't
}

window.tayAmp = {
  defaults: AMP_DEFAULTS,
  get: key => amp[key],
  set(key, v) {
    if (!(key in AMP_DEFAULTS)) return;
    amp[key] = Math.min(1, Math.max(0, v));
    applyAmp(key);
    saveAmp();
  },
  getType: () => guitarType,
  setType(type) {
    if (type !== 'acoustic' && type !== 'electric') return;
    guitarType = type;
    applyType(false);
    saveAmp();
    document.dispatchEvent(new CustomEvent('tay:guitar', { detail: { type: type } }));
  }
};

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtx, n = ampNodes;
    const biquad = (type, freq, gain, q) => {
      const f = ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq;
      if (gain !== undefined) f.gain.value = gain;
      if (q !== undefined) f.Q.value = q;
      return f;
    };
    n.pre = ctx.createGain();
    // electric: overdrive
    n.drive = ctx.createWaveShaper();
    n.drive.oversample = '2x';
    n.electric = ctx.createGain();
    // acoustic: the body — the air cavity's boom near 100Hz, the top plate
    // near 200Hz, and a little pick presence up high
    n.acoustic = ctx.createGain();
    const air = biquad('peaking', 100, 5, 1.6);
    const plate = biquad('peaking', 210, 3, 1.3);
    const presence = biquad('peaking', 3200, 2.5, 0.8);
    n.hp = biquad('highpass', 65);
    n.low = biquad('lowshelf', 150, 0);
    n.mid = biquad('peaking', 700, 0, 0.9);
    n.high = biquad('highshelf', 2500, 0);
    n.cab = biquad('lowpass', 3800);
    n.dry = ctx.createGain();
    n.wet = ctx.createGain();
    const verb = ctx.createConvolver();
    verb.buffer = reverbImpulse(ctx, 2.2);
    masterGain = ctx.createGain();
    // a limiter at the very end: loud dial settings (or the acoustic's sharp
    // transients) get held just under full scale instead of clipping
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20;
    limiter.attack.value = 0.002; limiter.release.value = 0.15;

    n.pre.connect(n.drive); n.drive.connect(n.electric); n.electric.connect(n.hp);
    n.pre.connect(air); air.connect(plate); plate.connect(presence); presence.connect(n.acoustic); n.acoustic.connect(n.hp);
    n.hp.connect(n.low); n.low.connect(n.mid); n.mid.connect(n.high); n.high.connect(n.cab);
    n.cab.connect(n.dry); n.dry.connect(masterGain);
    n.cab.connect(verb); verb.connect(n.wet); n.wet.connect(masterGain);
    masterGain.connect(limiter); limiter.connect(ctx.destination);

    // set every stage straight to its value — no ramp on the first note
    n.pre.gain.value = 0.25 * Math.pow(16, amp.gain);
    n.drive.curve = driveCurve(amp.drive);
    n.low.gain.value = (amp.low - 0.5) * 24;
    n.mid.gain.value = (amp.mid - 0.5) * 24;
    n.high.gain.value = (amp.high - 0.5) * 24;
    n.wet.gain.value = amp.reverb * 0.9;
    n.dry.gain.value = 1 - amp.reverb * 0.35;
    masterGain.gain.value = amp.volume;
    applyType(true);
    window.__fxIn = n.pre;
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/* ─── THE STRING ───
   Each note is a plucked string, modelled rather than sampled (an extended
   Karplus–Strong): the string's starting shape runs round a loop one period
   of the note long, and a gentle filter in the loop takes a little of the top
   off every pass, so it starts bright and mellows as it rings.

   What makes it a guitar rather than a mandolin or a harp:
     the pluck   a pick pulls the string into a triangle and lets go — a
                 warm start — with only a little scrape of noise on top.
                 Plain noise (the textbook version) is what sounds plinky.
     sustain     guitar strings ring for seconds. The loop's damping is eased
                 off on the higher strings, which otherwise lose their tone
                 in well under a second.
     pickup      on the electric, the sound is taken from one point along the
                 string, which carves out the harmonics that have a node
                 there — the electric's character.
   Per pluck: velocity (louder and brighter), pick position (a little random),
   and a couple of cents of detune (in playNote). Rendered to a buffer up
   front — a few ms — then played. */
function renderString(ctx, freq, velocity, acoustic) {
  const sr = ctx.sampleRate;
  // how long the fundamental rings (to -60 dB): low strings longer than high,
  // the electric (solid body, no soundboard soaking up energy) longest
  const t60 = acoustic ? 7 * Math.pow(82.41 / freq, 0.45) : 10 * Math.pow(82.41 / freq, 0.35);
  const len = Math.floor(sr * Math.min(t60 * 0.75, acoustic ? 5 : 6.5));
  const buf = ctx.createBuffer(1, len, sr);
  const out = buf.getChannelData(0);

  // loop filter y = (1-S)·x + S·x[-1]. S = 0.5 is the textbook average and
  // damps hardest; the high strings take a lighter touch so their upper
  // harmonics last like a guitar's do
  const S = 0.5 * Math.pow(82.41 / freq, acoustic ? 0.55 : 0.75);
  // the loop is one period long, less the S samples that filter delays; the
  // leftover fraction is made up by an allpass, so every note stays in tune
  const delay = sr / freq - S;
  const L = Math.max(2, Math.floor(delay));
  const frac = delay - L;
  const C = (1 - frac) / (1 + frac);
  const rho = Math.pow(0.001, 1 / (freq * t60));   // loss per trip round the loop

  // the pluck: a triangle peaked at the pick point, softened for a gentle
  // pluck (one-pole lowpass, run twice round so the loop's start and end
  // meet smoothly), plus a touch of pick noise
  const ring = new Float32Array(L);
  const pickAt = 0.1 + Math.random() * 0.12;
  const apex = Math.max(1, Math.floor(L * pickAt));
  for (let i = 0; i < L; i++) ring[i] = i < apex ? i / apex : (L - i) / (L - apex);
  const noise = acoustic ? 0.16 : 0.06;
  for (let i = 0; i < L; i++) ring[i] += (Math.random() * 2 - 1) * noise * (0.4 + velocity);
  const soft = (acoustic ? 0.5 : 0.22) + (acoustic ? 0.45 : 0.4) * velocity;   // one-pole coefficient
  let lp = 0;
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < L; i++) { lp += soft * (ring[i] - lp); if (pass) ring[i] = lp; }
  let mean = 0, peak = 0;
  for (let i = 0; i < L; i++) mean += ring[i] / L;
  for (let i = 0; i < L; i++) { ring[i] -= mean; peak = Math.max(peak, Math.abs(ring[i])); }
  // a triangle carries far more energy than noise of the same peak, so the
  // level sits lower to land where the site's sound always has
  const level = 0.13 * (0.35 + 0.65 * velocity) / (peak || 1);
  for (let i = 0; i < L; i++) ring[i] *= level;

  // electric pickup: hear the string at one point, a little way from the
  // bridge — a comb that thins the harmonics with a node there
  const pickupGap = acoustic ? 0 : Math.max(1, Math.round(L * 0.2));
  const hist = new Float32Array(pickupGap + 1);
  let h = 0;

  let idx = 0, prev = 0, apX = 0, apY = 0;
  for (let n = 0; n < len; n++) {
    const cur = ring[idx];
    if (pickupGap) {
      out[n] = cur - 0.75 * hist[h];
      hist[h] = cur;
      if (++h > pickupGap) h = 0;
    } else out[n] = cur;
    const lpf = rho * ((1 - S) * cur + S * prev);   // the loop's lowpass, and its loss
    prev = cur;
    const ap = C * lpf + apX - C * apY;              // fractional delay, for tuning
    apX = lpf; apY = ap;
    ring[idx] = ap;
    if (++idx === L) idx = 0;
  }
  // ease the very end to silence so a cut-off tail never clicks
  const fade = Math.min(len, Math.floor(sr * 0.25));
  for (let n = 0; n < fade; n++) out[len - 1 - n] *= n / fade;
  return buf;
}

// play one plucked note; returns a handle whose stop() damps it, for when the
// same string is plucked again (a real string can only ring one note)
function playNote(freq, velocity = 0.5) {
  if (isMuted) return null;
  const ctx = getAudioCtx();
  const now = ctx.currentTime;
  const f = freq * (1 + (Math.random() - 0.5) * 0.003);   // ±2.6 cents
  const src = ctx.createBufferSource();
  src.buffer = renderString(ctx, f, Math.min(1, Math.max(0, velocity)), guitarType === 'acoustic');
  const env = ctx.createGain();
  // low strings a little left, high strings a little right, like sitting in
  // front of the guitar
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (pan) pan.pan.value = Math.max(-0.4, Math.min(0.4, Math.log2(freq / 160) * 0.3));
  src.connect(env);
  if (pan) { env.connect(pan); pan.connect(window.__fxIn || masterGain); }
  else env.connect(window.__fxIn || masterGain);
  src.start(now);
  src.onended = () => { try { src.disconnect(); env.disconnect(); if (pan) pan.disconnect(); } catch (e) {} };
  return {
    stop() {
      const t = ctx.currentTime;
      env.gain.setTargetAtTime(0, t, 0.015);
      try { src.stop(t + 0.1); } catch (e) {}
    }
  };
}

// every mute change goes through here, and announces itself, so the button
// stays in step when something other than the button (a string) unmutes
// `source` says who changed it: 'button' or 'string'
function setMuted(m, source) {
  isMuted = m;
  document.dispatchEvent(new CustomEvent('tay:mute', { detail: { muted: m, source: source } }));
  return isMuted;
}
function toggleMute() { muteTouched = true; return setMuted(!isMuted, 'button'); }

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
    // clicking a string is asking to hear it: unmute first, so this click
    // sounds — unless the mute button has been used, which overrides this
    this.zone.addEventListener('click', () => {
      if (isMuted && !muteTouched) setMuted(false, 'string');
      this.interact();
    });
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

  // velocity 0–1 is how hard it was hit; a hover or a tap with no sweep is a
  // medium pluck. A new pluck damps whatever this string was still ringing.
  sound(velocity = 0.5) {
    if (this.voice) this.voice.stop();
    this.voice = playNote(this.freq, velocity);
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
    this.sound(0.25 + 0.75 * vel);   // even the gentlest brush is heard
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
    // B3 G3 D3 A2 E2 — standard tuning under the header's top E, so the
    // header string plus this grid reads as a normal guitar: E A D G B E
    this.tuning = [246.94, 196.00, 146.83, 110.00, 82.41];
    if (!this.btn) return;   // pages without the header dropdown (e.g. home) skip this
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
    if (!this.btn) return;
    this.btn.addEventListener('click', () => this.toggle());
    document.addEventListener('tay:mute', (e) => this.update(e.detail.muted));
    // M is this same button from the keyboard — a press counts as using it,
    // so it also ends "clicking a string unmutes" and stops the glow. Like the
    // guitar's other keys, it only works while the guitar is showing.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'm' && e.key !== 'M') return;
      if (!document.body.classList.contains('chords-visible')) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const t = e.target;
      if (t && t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
      this.btn.click();
    });
  }

  toggle() { toggleMute(); }   // the tay:mute listener redraws the button

  update(m) {
    this.btn.classList.toggle('muted', m);
    this.btn.querySelectorAll('.sound-on').forEach(el => el.style.display = m ? 'none' : '');
    this.btn.querySelectorAll('.sound-off').forEach(el => el.style.display = m ? '' : 'none');
    this.btn.setAttribute('aria-label', m ? 'Unmute sound' : 'Mute sound');
    document.documentElement.style.setProperty('--nav-active', m ? '#c0392b' : 'var(--accent)');
  }

  show() {
    if (!this.btn) return;
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
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (this.pref === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark');
        this.updateIcon();
      }
    });
  }

  /* Dark is the default: it takes an explicit choice — the visitor's own, or
     their system asking for light — to get the light theme. Mirrors the inline
     script in every page's <head>, which sets the attribute before first paint;
     the two have to agree or the page flashes. */
  isDark() {
    if (this.pref === 'dark') return true;
    if (this.pref === 'light') return false;
    return !window.matchMedia('(prefers-color-scheme: light)').matches;
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
    // mute + theme are now permanent header controls, grouped before the nav
    this.muteBtn.show();
  }

  initMainString() {
    const zone = document.getElementById('singleZone');
    const path = document.getElementById('singlePath');
    if (!zone || !path) return;
    // the top string of a standard-tuned guitar, on every page
    this.mainString = new GuitarString(zone, path, 329.63);
  }

  showControls() {
    if (this.shown) return;
    this.shown = true;
    const eb = document.getElementById('expandBtn');
    if (eb) { eb.style.display = 'inline-flex'; eb.removeAttribute('aria-hidden'); }
    this.muteBtn.show();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();

  // Mark cs-img-wrap loaded once each image finishes fetching
  document.querySelectorAll('.cs-img-wrap > .cs-img').forEach(img => {
    const wrap = img.parentElement;
    const mark = () => wrap.classList.add('img-loaded');
    if (img.complete && img.naturalWidth > 0) { mark(); }
    else { img.addEventListener('load', mark); img.addEventListener('error', mark); }
  });
});

document.addEventListener('visibilitychange', () => {
  if (!audioCtx) return;
  document.hidden ? audioCtx.suspend() : audioCtx.resume();
});

// ── Lightbox ──────────────────────────────────────────────
(function () {
  const overlay = document.createElement('div');
  overlay.id = 'img-lightbox';
  const lbImg = document.createElement('img');
  const lbCaption = document.createElement('p');
  lbCaption.id = 'img-lightbox-caption';
  overlay.appendChild(lbImg);
  overlay.appendChild(lbCaption);
  document.body.appendChild(overlay);

  function open(src, altOrCaption) {
    lbImg.src = src;
    lbImg.alt = altOrCaption || '';
    lbCaption.textContent = altOrCaption || '';
    lbCaption.style.display = altOrCaption ? '' : 'none';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  window.__lbOpen = open;

  document.addEventListener('click', function (e) {
    const img = e.target.closest('img');
    if (!img) return;
    if (img.closest('.hero-img')) return;
    if (img.closest('.brand')) return;
    if (img.closest('a[href]')) return;
    // project thumbnails and page heroes aren't gallery images — a thumbnail
    // click should follow the project link, not raise a captioned overlay
    if (img.closest('.home-media')) return;
    if (img.closest('.proj-lead-img')) return;
    open(img.src, img.dataset.caption || img.alt);
  });

  overlay.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
}());

/* Autoplaying media (project thumbnails, lead images) holds on its poster frame
   for anyone who has asked for less motion — `autoplay` can't be opted out of
   in CSS, so it has to be paused here. */
(function () {
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function apply() {
    document.querySelectorAll('video[autoplay], video[data-autoplay]').forEach(function (v) {
      if (mq.matches) {
        v.pause();
        v.removeAttribute('autoplay');
        v.setAttribute('data-autoplay', '');   // remember it, in case they switch back
        v.currentTime = 0;
      } else if (v.paused) {
        v.play().catch(function () {});
      }
    });
  }
  apply();
  mq.addEventListener('change', apply);
}());
