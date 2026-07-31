/* Project page template behaviour. shared.js does the heavy lifting — it wires
   the header string (#singleZone), the mute button, the theme toggle, and the
   mobile menu — so this file only adds the page's own three touches:
     1. the project name and every section title carry a strummable string,
        bound to the same engine the home page rows use
     2. blocks rise in once as they're scrolled to
     3. the exit ✕ fades in after the header has scrolled away, so there's
        always a way back to the work without scrolling to the bottom
   The latter two respect prefers-reduced-motion. */
document.addEventListener('DOMContentLoaded', function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0 · header controls ──
     shared.js only auto-places the theme button next to a .main-nav, and this
     page has no nav — so drop it into the cluster ahead of the collapse arrow,
     the same way the home page does it. */
  var controls = document.querySelector('.proj-controls');
  var collapse = document.getElementById('projCollapse');
  var app = window.__portfolioApp;
  if (app && controls) {
    var themeBtn = app.theme && app.theme.btn;
    if (themeBtn) controls.insertBefore(themeBtn, collapse);
    if (app.muteBtn) app.muteBtn.show();
  }

  /* the arrow packs the page down to its strings and back out again */
  if (collapse) {
    collapse.addEventListener('click', function () {
      var open = !document.body.classList.toggle('proj-collapsed');
      // the chord keys ride along: available only while compressed, like home
      document.body.classList.toggle('chords-visible', !open);
      collapse.setAttribute('aria-expanded', open ? 'true' : 'false');
      collapse.setAttribute('aria-label', open ? 'Collapse sections' : 'Expand sections');
      collapse.setAttribute('title', open ? 'Collapse' : 'Expand');
      if (!open) {
        // nothing should keep playing behind a collapsed page
        [].forEach.call(document.querySelectorAll('.proj-vid video'), function (v) { v.pause(); });
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  }

  /* ── 1 · strings on the name row and each section title ── */
  /* Six strings total when compressed, counting the header's — the same six the
     home page packs down to. So the article itself contributes five. */
  var STRINGS = 6;
  var IN_ARTICLE = STRINGS - 1;          // the header supplies the sixth
  var SCALE = [277.18, 246.94, 207.65, 185.00, 164.81];
  var rows = [].slice.call(document.querySelectorAll('.proj-string-row'));
  var projStrings = [];                  // one GuitarString per real row
  var fillerStrings = [];                // the spares that appear when compressed

  function bind(row, freq) {
    var zone = row.querySelector('.string-zone');
    var path = row.querySelector('.string-path');
    if (!zone || !path || typeof GuitarString === 'undefined') return null;
    return new GuitarString(zone, path, freq);
  }

  rows.forEach(function (row, i) {
    var gs = bind(row, parseFloat(row.dataset.freq) || SCALE[i % SCALE.length]);
    if (gs) projStrings.push(gs);
  });

  /* Compressed, the page should always read as a six-string guitar: too few
     rows and we add plain strings to make up the count, too many and the
     extras fade out. */
  if (rows.length > IN_ARTICLE) {
    rows.slice(IN_ARTICLE).forEach(function (row) { row.classList.add('proj-string-row--over'); });
  } else if (rows.length && rows.length < IN_ARTICLE) {
    var host = document.createElement('div');
    host.className = 'proj-fillers';
    for (var i = rows.length; i < IN_ARTICLE; i++) {
      var row = document.createElement('div');
      row.className = 'proj-string-row proj-string-row--filler';
      row.innerHTML = '<div class="string-zone" tabindex="0" aria-label="Strum">' +
        '<svg class="string-svg" viewBox="0 0 1100 36" preserveAspectRatio="none">' +
        '<path class="string-path" d="M0 19 Q 550 19 1100 19"/></svg></div>';
      host.appendChild(row);
      var gs = bind(row, SCALE[i % SCALE.length]);
      if (gs) fillerStrings.push(gs);
    }
    var lastSec = document.querySelector('.proj-sec:last-of-type');
    if (lastSec && lastSec.parentNode) lastSec.parentNode.insertBefore(host, lastSec.nextSibling);
  }

  /* the six strings the chords play: the header's on top, then the real rows
     (capped) and any fillers — top to bottom, so the voicing runs high to low */
  function activeStrings() {
    var head = app && app.mainString ? [app.mainString] : [];
    return head.concat(projStrings.slice(0, IN_ARTICLE), fillerStrings);
  }

  /* chord keys — A–G retune those six while the page is compressed, with the
     on-screen pads for touch. Same module the home page uses. */
  if (window.initChordKeys) {
    window.initChordKeys({
      strings: activeStrings,
      isActive: function () { return document.body.classList.contains('proj-collapsed'); }
    });
  }

  /* ── 1b · click-to-play video tiles ── */
  [].slice.call(document.querySelectorAll('.proj-vid')).forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var btn = wrap.querySelector('.vid-btn');
    if (!video || !btn) return;
    function sync() {
      wrap.classList.toggle('vid-playing', !video.paused);
      btn.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (video.paused) video.play(); else video.pause();
    });
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('ended', sync);
  });

  /* ── 2 · reveal on scroll ── */
  var blocks = [].slice.call(document.querySelectorAll('.proj-reveal'));
  if (blocks.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      blocks.forEach(function (b) { b.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      blocks.forEach(function (b) { io.observe(b); });
    }
  }

  /* ── 3 · exit button ── */
  var exit = document.querySelector('.proj-exit');
  var header = document.querySelector('.proj-header');
  if (!exit) return;

  function syncExit() {
    // show it once the header row is off screen — never both at once
    var past = header ? window.scrollY > header.getBoundingClientRect().height : window.scrollY > 120;
    exit.classList.toggle('in', past);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { syncExit(); ticking = false; });
  }, { passive: true });
  syncExit();
});
