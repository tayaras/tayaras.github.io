/* Chord keys — shared by the home page and the project pages.

   While a page is compressed, A–G retune its strings to a chord (strum to hear
   it), Z sets major, X sets minor, 5 / 7 / 9 make it a power chord, a seventh
   or a ninth, S makes it a sus chord, and the on-screen pads mirror all of it
   for touch devices. The markup lives in each page (.chord-hint / .chord-pads) and
   the styling in chords.css.

   Usage:
     window.initChordKeys({
       strings: [GuitarString, …],   // top row first; may also be a function
       isActive: function () { … }   // true only while the page is compressed
     });

   Pass a function for `strings` when the set changes with the page's state —
   the project pages swap in filler strings when they compress.
*/
window.initChordKeys = function (opts) {
  var source = (opts && opts.strings) || [];
  var isActive = (opts && opts.isActive) || function () { return true; };
  function strings() { return typeof source === 'function' ? source() : source; }
  if (!strings().length && typeof source !== 'function') return null;

  /* Open-position chord voicings, as MIDI notes low string → high string.
     These are the shapes a guitarist actually plays — E is 022100, G is
     320003, and so on — so the strum lands in a guitar's real range
     (E2 82Hz – E4 330Hz) instead of the octave-and-a-bit above it that a
     generic root/3rd/5th stack produces.

     Where the shape mutes a string (A, D, C and B are five- or four-string
     chords) the muted position sounds the root or fifth in the bass, since
     every string here is visible and strummable and silence would read as
     something broken. */
  var VOICINGS = {
    major: {
      e: [40, 47, 52, 56, 59, 64],   // 022100  E2 B2 E3 G#3 B3 E4
      a: [40, 45, 52, 57, 61, 64],   // x02220  low E rings as the 5th
      d: [38, 45, 50, 57, 62, 66],   // xx0232  extended down to D2 A2
      g: [43, 47, 50, 55, 59, 67],   // 320003  G2 B2 D3 G3 B3 G4
      c: [43, 48, 52, 55, 60, 64],   // x32010  over a G bass
      f: [41, 48, 53, 57, 60, 65],   // 133211  F2 C3 F3 A3 C4 F4
      b: [42, 47, 54, 59, 63, 66]    // x24442  over an F# bass
    },
    minor: {
      e: [40, 47, 52, 55, 59, 64],   // 022000
      a: [40, 45, 52, 57, 60, 64],   // x02210
      d: [38, 45, 50, 57, 62, 65],   // xx0231
      g: [43, 50, 55, 58, 62, 67],   // 355333
      c: [43, 48, 55, 60, 63, 67],   // x35543
      f: [41, 48, 53, 56, 60, 65],   // 133111
      b: [42, 47, 54, 59, 62, 66]    // x24432
    }
  };
  /* Everything past major/minor is derived from the open shapes above rather
     than written out by hand — 7 roots × 10 chord types. Each note is read as
     an interval over the root, then moved:
       sus   the 3rd steps up to the 4th
       5     the 3rd becomes the 5th (a power chord: roots and fifths only)
       7     the top root drops to the 7th — the way Cmaj7 x32000, Am7 x02010
             and Gmaj7 320002 come out of their open chords
       9     the top 5th moves to the 7th, and the top root rises to the 9th
     The lowest root never moves, so every chord keeps its bass. */
  var ROOT_PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  // major | minor | null. Z and X toggle: pressing the lit one turns it off.
  // With neither on, the triad is major and a 7 or 9 is the dominant one —
  // E7, E9 — where major on gives maj7 / maj9.
  var chordMode = 'major';
  var chordExt = null;       // null | '5' | '7' | '9'
  var chordSus = false;
  var lastRoot = null;

  function voicing(letter) {
    var minor = chordMode === 'minor' && !chordSus && chordExt !== '5';
    var base = VOICINGS[minor ? 'minor' : 'major'][letter];
    if (!base) return null;
    var notes = base.slice();
    var pc = ROOT_PC[letter];
    function iv(m) { return ((m - pc) % 12 + 12) % 12; }
    var third = minor ? 3 : 4;

    if (chordExt === '5') {
      return notes.map(function (m) { return iv(m) === third ? m + 3 : m; });
    }
    if (chordSus) notes = notes.map(function (m) { return iv(m) === third ? m + 1 : m; });

    // major-seventh over a major chord, flat seventh over minor, sus and
    // the plain (dominant) chord
    var seventh = (!chordSus && chordMode === 'major') ? 11 : 10;
    function highest(interval, skipBass) {
      for (var i = notes.length - 1; i >= (skipBass ? 1 : 0); i--) if (iv(notes[i]) === interval) return i;
      return -1;
    }
    var roots = notes.filter(function (m) { return iv(m) === 0; }).length;

    if (chordExt === '7' && roots > 1) {
      var r7 = highest(0);
      notes[r7] += seventh - 12;
    }
    if (chordExt === '9') {
      var f9 = highest(7, true);
      if (f9 >= 0) notes[f9] += seventh - 7;
      if (roots > 1) notes[highest(0)] += 2;
    }
    return notes;
  }

  // the chord's name as it reads on the display: "E major", "A m7", "D 9sus4"
  function chordName() {
    if (chordExt === '5') return '5';
    var ext = chordExt || '';
    if (chordSus) return (ext || '') + 'sus4';
    if (!ext) return chordMode || '';
    return (chordMode === 'major' ? 'maj' : chordMode === 'minor' ? 'm' : '') + ext;
  }

  var chordNow = document.getElementById('chordNow');
  var chordPads = [].slice.call(document.querySelectorAll('.chord-pad[data-root], .chord-pad[data-mode], .chord-pad[data-ext], .chord-pad[data-sus]'));
  var strumPads = [].slice.call(document.querySelectorAll('.chord-pad[data-strum]'));

  function midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function updateChordDisplay() {
    chordPads.forEach(function (btn) {
      var d = btn.dataset;
      var on = d.root ? d.root === lastRoot
             : d.mode ? d.mode === chordMode
             : d.ext ? d.ext === chordExt
             : chordSus;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (!chordNow) return;
    if (lastRoot) {
      var nm = chordName();
      // "E major", "E m7" — but "E7", "E9", "E5": a bare number joins the letter
      chordNow.textContent = lastRoot.toUpperCase() + (/^\d/.test(nm) || !nm ? '' : ' ') + nm;
      chordNow.classList.add('active');
    }
    else { chordNow.textContent = '—'; chordNow.classList.remove('active'); }
  }

  function refresh() { if (lastRoot) setChord(lastRoot); else updateChordDisplay(); }

  function setMode(mode) { chordMode = chordMode === mode ? null : mode; refresh(); }
  // 5 / 7 / 9 are one choice: pressing another switches, pressing the lit one clears
  function setExt(ext) { chordExt = chordExt === ext ? null : ext; refresh(); }
  function toggleSus() { chordSus = !chordSus; refresh(); }

  function setChord(letter) {
    var notes = voicing(letter);
    if (!notes) return;
    lastRoot = letter;
    // voicings read low→high; the rows read high→low, like a chord chart
    var freqs = notes.map(midiFreq).slice().reverse();
    strings().forEach(function (gs, i) {
      // remember each string's own open note the first time it's retuned
      if (gs.openFreq === undefined) gs.openFreq = gs.freq;
      gs.freq = freqs[i % freqs.length];
    });
    updateChordDisplay();
  }

  // no chord: every string back to its open note
  function clearChord() {
    lastRoot = null;
    strings().forEach(function (gs) { if (gs.openFreq !== undefined) gs.freq = gs.openFreq; });
    updateChordDisplay();
  }

  // the keys and pads toggle, like the other buttons: pick a chord, or pick
  // the one that's already on to let the strings ring open again
  function pickChord(letter) { if (letter === lastRoot) clearChord(); else setChord(letter); }

  // strum: pluck every string in sequence, top→bottom (down) or bottom→top
  // (up), with the same stagger a hand across the strings gives. `gap` is the
  // ms between strings — 55 by default (the pads), less for a quicker stroke.
  function strum(dir, gap) {
    if (gap === undefined) gap = 55;
    var order = strings().slice();
    if (dir === 'up') order.reverse();
    order.forEach(function (gs, i) {
      setTimeout(function () {
        var r = gs.zone.getBoundingClientRect();
        // seed the velocity tracker so pluck() reads this as a sweep, not a tap
        gs.lastX = 0; gs.lastT = performance.now() - 30;
        gs.pluck(r.left + 60, r.top + r.height / 2);
      }, i * gap);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!isActive() || e.metaKey || e.ctrlKey || e.altKey) return;   // only while compressed
    if (e.target && e.target.matches && e.target.matches('input, textarea')) return;
    var k = e.key.toLowerCase();
    if (k === 'z') { setMode('major'); return; }  // major on, or off again
    if (k === 'x') { setMode('minor'); return; }  // minor on, or off again
    if (k === '5' || k === '7' || k === '9') { setExt(k); return; }
    if (k === 's') { toggleSus(); return; }
    if (Object.prototype.hasOwnProperty.call(VOICINGS.major, k)) pickChord(k);
  });

  // …and the same controls as buttons, for touch devices with no keyboard
  chordPads.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var d = btn.dataset;
      if (d.root) pickChord(d.root);
      else if (d.mode) setMode(d.mode);
      else if (d.ext) setExt(d.ext);
      else if ('sus' in d) toggleSus();
    });
  });
  strumPads.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      strum(btn.dataset.strum);
    });
  });

  updateChordDisplay();
  return { setChord: setChord, pickChord: pickChord, clearChord: clearChord, setMode: setMode, setExt: setExt, toggleSus: toggleSus, strum: strum };
};

/* Amp dials — Gain, Volume, Overdrive, Low, Mid, High, Reverb — drawn under
   the chord pads on every page that has them, wired to window.tayAmp
   (shared.js). Drag up/down to turn one (hold Shift for fine steps), use the
   scroll wheel or the arrow keys over it, double-click to reset. */
(function () {
  var hint = document.querySelector('.chord-hint');
  if (!hint || !window.tayAmp) return;
  var amp = window.tayAmp;
  var DIALS = [
    ['gain', 'Gain'], ['volume', 'Volume'], ['drive', 'Overdrive'],
    ['low', 'Low'], ['mid', 'Mid'], ['high', 'High'], ['reverb', 'Reverb']
  ];
  var SWEEP = 270;   // degrees from fully down to fully up, like a real pot
  var R = 16, ARC = 2 * Math.PI * R * SWEEP / 360;

  var row = document.createElement('div');
  row.className = 'amp-dials';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', 'Amp');
  var pads = hint.querySelector('.chord-pads');
  hint.insertBefore(row, pads ? pads.nextSibling : null);
  row.id = 'ampDials';

  // On short screens (chords.css) the dials are tucked away so the guitar
  // fits on one screen; this button opens and closes them. Elsewhere it's
  // hidden and the dials always show.
  var ampToggle = document.createElement('button');
  ampToggle.type = 'button';
  ampToggle.className = 'amp-toggle';
  ampToggle.textContent = 'Amp';
  ampToggle.setAttribute('aria-controls', 'ampDials');
  ampToggle.setAttribute('aria-expanded', 'false');
  ampToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = row.classList.toggle('is-open');
    ampToggle.classList.toggle('is-open', open);
    ampToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  hint.insertBefore(ampToggle, row);

  // Acoustic / Electric — the guitar, ahead of the amp's knobs. Acoustic
  // bypasses the overdrive, so that dial dims while it's on.
  if (amp.setType) {
    var type = document.createElement('div');
    type.className = 'amp-type';
    type.setAttribute('role', 'group');
    type.setAttribute('aria-label', 'Guitar');
    ['acoustic', 'electric'].forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'amp-type-btn';
      b.dataset.type = t;
      b.textContent = t === 'acoustic' ? 'Acoustic' : 'Electric';
      b.addEventListener('click', function (e) { e.stopPropagation(); amp.setType(t); });
      type.appendChild(b);
    });
    row.appendChild(type);
    var syncType = function () {
      var cur = amp.getType();
      [].forEach.call(type.children, function (b) { b.setAttribute('aria-pressed', b.dataset.type === cur ? 'true' : 'false'); });
      var od = row.querySelector('.amp-dial[data-key="drive"]');
      if (od) { od.classList.toggle('is-off', cur === 'acoustic'); od.title = cur === 'acoustic' ? 'Overdrive is for the electric' : ''; }
    };
    document.addEventListener('tay:guitar', syncType);
    // run once the dials below exist
    setTimeout(syncType, 0);
  }

  DIALS.forEach(function (d) {
    var key = d[0], name = d[1];
    var el = document.createElement('div');
    el.className = 'amp-dial';
    el.dataset.key = key;
    el.tabIndex = 0;
    el.setAttribute('role', 'slider');
    el.setAttribute('aria-label', name);
    el.setAttribute('aria-valuemin', '0');
    el.setAttribute('aria-valuemax', '10');
    el.innerHTML =
      '<svg viewBox="0 0 40 40" aria-hidden="true">' +
        // the track and the lit part of it both start at the 7-o'clock stop
        '<circle class="amp-dial-track" cx="20" cy="20" r="' + R + '" transform="rotate(135 20 20)"' +
          ' stroke-dasharray="' + ARC + ' 999"/>' +
        '<circle class="amp-dial-level" cx="20" cy="20" r="' + R + '" transform="rotate(135 20 20)"/>' +
        '<circle class="amp-dial-cap" cx="20" cy="20" r="11"/>' +
        '<line class="amp-dial-pointer" x1="20" y1="20" x2="20" y2="11"/>' +
      '</svg>' +
      '<span class="amp-dial-label">' + name + '</span>';
    row.appendChild(el);

    var level = el.querySelector('.amp-dial-level');
    var pointer = el.querySelector('.amp-dial-pointer');
    var label = el.querySelector('.amp-dial-label');
    var showing = false;   // the label reads the value while the dial is in use

    function draw() {
      var v = amp.get(key);
      level.setAttribute('stroke-dasharray', (ARC * v) + ' 999');
      pointer.setAttribute('transform', 'rotate(' + (v * SWEEP - SWEEP / 2) + ' 20 20)');
      var shown = (v * 10).toFixed(1);
      el.setAttribute('aria-valuenow', shown);
      label.textContent = showing ? shown : name;
    }
    function set(v) { amp.set(key, v); draw(); }
    function show(on) { showing = on; draw(); }

    // drag: up turns it up — 150px is the whole sweep, Shift makes it 5× finer
    var startY = 0, startV = 0, dragging = false, wheelRest = null;
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      startY = e.clientY; startV = amp.get(key);
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-active');
      el.focus({ preventScroll: true });
      show(true);
    });
    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      set(startV + (startY - e.clientY) / (e.shiftKey ? 750 : 150));
    });
    function end() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-active');
      if (document.activeElement !== el) show(false);
    }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    // a click on the dial is the dial's — not the page's
    el.addEventListener('click', function (e) { e.stopPropagation(); });

    // the wheel turns the dial, and stops here so it doesn't strum the strings
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      e.stopPropagation();
      set(amp.get(key) - e.deltaY / (e.shiftKey ? 2000 : 400));
      show(true);
      // the wheel has no "let go", so the name comes back once it settles
      clearTimeout(wheelRest);
      wheelRest = setTimeout(function () {
        if (!dragging && document.activeElement !== el && !el.matches(':hover')) show(false);
      }, 900);
    }, { passive: false });

    // keys: arrows step (Shift for fine), Home/End to the stops — stopped
    // here so the arrows don't also strum. Chord letters still pass through.
    el.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 0.01 : 0.05, v = amp.get(key);
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') set(v + step);
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') set(v - step);
      else if (e.key === 'Home') set(0);
      else if (e.key === 'End') set(1);
      else return;
      e.preventDefault();
      e.stopPropagation();
    });

    el.addEventListener('dblclick', function (e) { e.stopPropagation(); set(amp.defaults[key]); });
    el.addEventListener('pointerenter', function () { show(true); });
    el.addEventListener('pointerleave', function () { if (!dragging && document.activeElement !== el) show(false); });
    el.addEventListener('focus', function () { show(true); });
    el.addEventListener('blur', function () { if (!dragging) show(false); });
    draw();
  });
})();

/* Guide — the keyboard how-to line ("Press A–G to select a chord…") stays
   folded away behind a small Guide button, which glows until it has been
   opened once. Remembered in the browser, so it stops asking on every page. */
(function () {
  var instr = document.querySelector('.chord-hint .chord-instr');
  if (!instr) return;
  var seen = false;
  try { seen = localStorage.getItem('tayGuideSeen') === '1'; } catch (e) {}

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chord-guide' + (seen ? '' : ' pulse');
  btn.textContent = 'Guide';
  btn.setAttribute('aria-expanded', 'false');
  if (!instr.id) instr.id = 'chordInstr';
  btn.setAttribute('aria-controls', instr.id);
  instr.parentNode.insertBefore(btn, instr);
  // it was aria-hidden as a visual hint; now it's the thing the button opens
  instr.removeAttribute('aria-hidden');
  instr.hidden = true;

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = instr.hidden;
    instr.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('is-open', open);
    btn.classList.remove('pulse');
    try { localStorage.setItem('tayGuideSeen', '1'); } catch (e2) {}
  });
})();

/* The guitar's controls — pads, dials, the guitar switch, Guide — only work
   while the guitar is showing (body.chords-visible, which each page sets when
   it compresses). Hidden, the whole block is made inert: nothing in it can be
   clicked, tabbed to or typed into, and if focus was inside, it leaves. */
(function () {
  var hint = document.querySelector('.chord-hint');
  if (!hint) return;
  function sync() {
    var on = document.body.classList.contains('chords-visible');
    if (!on && hint.contains(document.activeElement)) document.activeElement.blur();
    hint.inert = !on;
    if (on) hint.removeAttribute('aria-hidden'); else hint.setAttribute('aria-hidden', 'true');
  }
  sync();
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();
