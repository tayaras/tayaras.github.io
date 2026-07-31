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
    var notes = VOICINGS[chordMode][letter];
    if (!notes) return;
    lastRoot = letter;
    // voicings read low→high; the rows read high→low, like a chord chart
    var freqs = notes.map(midiFreq).slice().reverse();
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
    if (Object.prototype.hasOwnProperty.call(VOICINGS.major, k)) setChord(k);
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
