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
    /* normally the spares hang below the last section; on a page that is only
       a header (no sections at all) they hang off the header instead, so the
       count still reaches six. */
    var anchor = document.querySelector('.proj-sec:last-of-type') ||
                 document.querySelector('.proj-head');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(host, anchor.nextSibling);
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

  /* ── 1d · real-time text, typed ──
     A [data-type] element types its lines out character by character and loops.
     One line is the featured module's hook; several is the RTT page's call
     stage, where each message commits and the next begins.

     Two details are the shipped design rather than decoration: in-progress
     text is dimmed and carries an "RTT typing" tag, and both clear the moment
     the message commits.

     Reduced motion gets the last line, in full, with nothing moving. */
  [].slice.call(document.querySelectorAll('[data-type]')).forEach(function (el) {
    var lines;
    try { lines = JSON.parse(el.getAttribute('data-type')); } catch (err) { return; }
    if (!Array.isArray(lines) || !lines.length) return;

    var out = el.querySelector('.proj-type-out') || el;
    var caret = el.querySelector('.proj-caret');
    var tag = el.parentNode && el.parentNode.querySelector('.proj-stage-tag');

    if (reduce) {
      out.textContent = lines[lines.length - 1];
      out.classList.remove('proj-type--live');
      if (caret) caret.remove();
      return;
    }

    var SPEED = 52;        // ms per character, near a fast typist
    var COMMIT = 3000;     // the three-second commit window RTT actually ships
    var CLEAR = 900;       // beat before the next message starts
    var i = 0, n = 0, timer;

    function frame() {
      var line = lines[i];
      if (n <= line.length) {
        out.textContent = line.slice(0, n);
        out.classList.add('proj-type--live');
        if (tag) tag.classList.add('on');
        n++;
        timer = setTimeout(frame, SPEED + Math.random() * 45);
        return;
      }
      // committed: the dimming and the typing tag both come off
      out.classList.remove('proj-type--live');
      if (tag) tag.classList.remove('on');
      timer = setTimeout(function () {
        if (lines.length === 1) { n = 0; frame(); return; }
        i = (i + 1) % lines.length;
        n = 0;
        out.textContent = '';
        timer = setTimeout(frame, CLEAR);
      }, COMMIT);
    }

    /* only type while it's on screen — a loop running behind six screens of
       scroll is wasted work, and it means the reader always catches it from
       the start of a message rather than halfway through one */
    if ('IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (!timer) frame(); }
          else { clearTimeout(timer); timer = null; }
        });
      }, { threshold: 0.2 });
      seen.observe(el);
    } else {
      frame();
    }
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

  /* ── 3 · live embed theme ── */
  /* The ACS showcase and the six single-component frames each run their own
     Fluent theme, so none of them inherits data-theme through CSS. The URL
     carries the theme for the first paint (the frames are lazy, so this lands
     before they load) and a message carries every change after that. */
  var embeds = [].slice.call(
    document.querySelectorAll('.proj-embed-frame iframe, .proj-demo-frame iframe')
  );
  if (embeds.length) {
    var currentTheme = function () {
      return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    };
    embeds.forEach(function (frame) {
      // Keep whatever query the src already carries (?component=…) and add ours.
      var src = frame.getAttribute('src').split('#')[0];
      var join = src.indexOf('?') === -1 ? '?' : '&';
      frame.setAttribute('src', src + join + 'theme=' + currentTheme());
    });
    new MutationObserver(function () {
      var theme = currentTheme();
      embeds.forEach(function (frame) {
        if (!frame.contentWindow) return;
        frame.contentWindow.postMessage(
          { source: 'tay-theme', theme: theme },
          window.location.origin
        );
      });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ── 4 · exit button ── */
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
