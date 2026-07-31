/* Chord keys — shared by the home page and the project pages.

   While a page is compressed, A–G retune its strings to a chord (strum to hear
   it), Z sets major, X sets minor, and the on-screen pads mirror all of it for
   touch devices. The markup lives in each page (.chord-hint / .chord-pads) and
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

  var CHORD_ROOTS = { a: 57, b: 59, c: 48, d: 50, e: 52, f: 53, g: 55 };  // MIDI, C3 octave
  var chordMode = 'major';
  var lastRoot = null;
  var chordNow = document.getElementById('chordNow');
  var chordPads = [].slice.call(document.querySelectorAll('.chord-pad[data-root], .chord-pad[data-mode]'));
  var strumPads = [].slice.call(document.querySelectorAll('.chord-pad[data-strum]'));

  function midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function updateChordDisplay() {
    chordPads.forEach(function (btn) {
      var on = btn.dataset.root ? btn.dataset.root === lastRoot : btn.dataset.mode === chordMode;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (!chordNow) return;
    if (lastRoot) { chordNow.textContent = lastRoot.toUpperCase() + ' ' + chordMode; chordNow.classList.add('active'); }
    else { chordNow.textContent = '—'; chordNow.classList.remove('active'); }
  }

  function setMode(mode) {
    chordMode = mode;
    if (lastRoot) setChord(lastRoot); else updateChordDisplay();
  }

  function setChord(letter) {
    var root = CHORD_ROOTS[letter];
    if (root == null) return;
    lastRoot = letter;
    var third = chordMode === 'minor' ? 3 : 4;
    var offsets = [0, 7, 12, 12 + third, 19, 24];   // root · 5th · oct · 3rd · 5th · 2·oct
    var freqs = offsets.map(function (o) { return midiFreq(root + o); }).reverse();  // top string = highest
    strings().forEach(function (gs, i) { gs.freq = freqs[i % freqs.length]; });
    updateChordDisplay();
  }

  // strum: pluck every string in sequence, top→bottom (down) or bottom→top
  // (up), with the same stagger a hand across the strings gives
  function strum(dir) {
    var order = strings().slice();
    if (dir === 'up') order.reverse();
    order.forEach(function (gs, i) {
      setTimeout(function () {
        var r = gs.zone.getBoundingClientRect();
        // seed the velocity tracker so pluck() reads this as a sweep, not a tap
        gs.lastX = 0; gs.lastT = performance.now() - 30;
        gs.pluck(r.left + 60, r.top + r.height / 2);
      }, i * 55);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (!isActive() || e.metaKey || e.ctrlKey || e.altKey) return;   // only while compressed
    if (e.target && e.target.matches && e.target.matches('input, textarea')) return;
    var k = e.key.toLowerCase();
    if (k === 'z') { setMode('major'); return; }  // re-tune the current chord to major
    if (k === 'x') { setMode('minor'); return; }  // …to minor
    if (Object.prototype.hasOwnProperty.call(CHORD_ROOTS, k)) setChord(k);
  });

  // …and the same controls as buttons, for touch devices with no keyboard
  chordPads.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (btn.dataset.root) setChord(btn.dataset.root); else setMode(btn.dataset.mode);
    });
  });
  strumPads.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      strum(btn.dataset.strum);
    });
  });

  updateChordDisplay();
  return { setChord: setChord, setMode: setMode, strum: strum };
};
