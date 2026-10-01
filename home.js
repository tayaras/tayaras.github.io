/* Strummable-strings home: bind each stack string to the shared GuitarString
   engine, and use the first strum to slide the stack open (and reveal the
   header mute button via the shared PortfolioApp). */
document.addEventListener('DOMContentLoaded', function () {
  var frets = [].slice.call(document.querySelectorAll('.home-fret'));
  var collapse = document.getElementById('stackCollapse');
  // the stack starts open on entry (body has .stack-open); the arrow collapses
  // and re-expands it. strumming the strings only plays sound — it never opens.
  var opened = true;
  var strumArmed = false;
  var homeStrings = [];   // GuitarString instances, retuned by the chord keys

  function syncToggle() {
    if (!collapse) return;
    collapse.setAttribute('aria-expanded', opened ? 'true' : 'false');
    collapse.setAttribute('aria-label', opened ? 'Collapse sections' : 'Expand sections');
    collapse.setAttribute('title', opened ? 'Collapse' : 'Expand');
  }

  function openStack() {
    if (opened) return;
    opened = true;
    document.body.classList.add('stack-open');
    document.body.classList.remove('chords-visible');   // chords only while compressed
    syncToggle();
    // reveal the header mute button on the top string, per the shared UI
    if (window.__portfolioApp) window.__portfolioApp.showControls();
    // showControls() also un-hides the header "more" dropdown chevron, which we
    // don't use on this page — the stack IS the expanded view — so keep it hidden
    var eb = document.getElementById('expandBtn');
    if (eb) { eb.style.display = 'none'; eb.setAttribute('aria-hidden', 'true'); }
  }
  function closeStack() {
    if (!opened) return;
    opened = false;
    strumArmed = false;   // once compressed, strumming won't reopen — arrow only
    document.body.classList.remove('stack-open');
    document.body.classList.add('chords-visible');      // chords only while compressed
    syncToggle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // strum triggers route through here so they respect the one-time arming
  function strumOpen() { if (strumArmed) openStack(); }

  /* Compressed, the stack must read as a real six-string guitar — exactly six
     strings, in the tuning the top six sections carry. Sections past the sixth
     keep their string while the stack is open, and fold it away on collapse.
     Same rule project.js enforces with .proj-string-row--over. */
  var STRINGS = 6;

  frets.forEach(function (fret, i) {
    var zone = fret.querySelector('.home-string');
    var path = zone.querySelector('.string-path');
    var freq = parseFloat(fret.dataset.freq) || 329.63;
    if (i >= STRINGS) fret.classList.add('home-fret--over');
    // reuse the shared engine — vibration, velocity, audio, a11y all included
    if (typeof GuitarString !== 'undefined') homeStrings.push(new GuitarString(zone, path, freq));
    // any strum opens the stack the first time — a press/tap OR a drag across
    // the string (pointermove is the actual strum motion; pointerdown/click a tap)
    ['pointerdown', 'click', 'pointermove'].forEach(function (ev) {
      zone.addEventListener(ev, strumOpen, { passive: true });
    });
    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') strumOpen();
    });
  });

  // the arrow is always present: it expands when compressed, collapses when open
  if (collapse) collapse.addEventListener('click', function (e) {
    e.stopPropagation();
    collapse.classList.remove('pulse');   // stop the glow once it's been used
    if (opened) closeStack(); else openStack();
  });
  syncToggle();

  // Shared by the hover rows below. `pointer` is where the mouse last really
  // was: a pointermove whose position hasn't changed is the browser re-testing
  // hover after a scroll, not the reader moving. Updated on the document, so it
  // still holds the previous position while a row's own listener runs.
  var pointer = {
    x: -1, y: -1,
    moved: function (e) { return e.clientX !== pointer.x || e.clientY !== pointer.y; }
  };
  document.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; });
  // the reader scrolling cancels any row that was about to open under the
  // cursor — but not holdStill's own correcting scroll
  var pendingOpens = [];
  var anchoring = 0;
  window.addEventListener('scroll', function () {
    if (!anchoring) pendingOpens.forEach(function (fn) { fn(); });
  }, { passive: true });
  // keep `el` at the same spot on screen for `ms`, scrolling by however far
  // the layout above it moves it — a manual scroll anchor (CSS scroll anchoring
  // is off on this page so the two don't both correct; Safari has none anyway)
  function holdStill(el, ms) {
    var start = el.getBoundingClientRect().top;
    var end = performance.now() + ms;
    anchoring++;
    (function step() {
      var d = el.getBoundingClientRect().top - start;
      // instant: the page's scroll-behavior: smooth would otherwise turn each
      // frame's correction into an animation that the next one interrupts
      if (d) window.scrollBy({ top: d, behavior: 'instant' });
      if (performance.now() < end) requestAnimationFrame(step);
      else setTimeout(function () { anchoring--; }, 50);   // let the last scroll event land first
    })();
  }

  // The four main projects open in place on hover: the compact row grows to
  // its full size and adds the rest of the description. A click goes to the
  // project's page, like every other row (below).
  document.querySelectorAll('.home-content--expandable').forEach(function (content) {
    var fret = content.closest('.home-fret');

    // Resting on a row for HOVER_OPEN ms opens it, and it closes HOVER_CLOSE ms
    // after the pointer leaves — the delays keep a pass down the page from
    // opening every row it crosses.
    var HOVER_OPEN = 450, HOVER_CLOSE = 300;
    var openTimer = null, closeTimer = null;
    function cancelOpen() { clearTimeout(openTimer); openTimer = null; }
    function cancelClose() { clearTimeout(closeTimer); closeTimer = null; }
    pendingOpens.push(cancelOpen);

    // Closing a row shrinks it, which pulls everything under it up the page.
    // When the reader is below the row (the pointer left through its bottom, or
    // the row sits in the top half of the screen), hold the next section still
    // through the collapse instead, so what they're looking at doesn't move.
    function setOpen(open) {
      if (open === content.classList.contains('is-open')) return;
      var rect = content.getBoundingClientRect();
      var below = pointer.y > rect.bottom || rect.bottom < window.innerHeight / 2;
      content.classList.toggle('is-open', open);
      if (!open && below && fret.nextElementSibling) holdStill(fret.nextElementSibling, 800);
    }

    // opens on the mouse actually moving over the row — not on the page
    // scrolling a row under a mouse that's standing still
    content.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !pointer.moved(e)) return;
      cancelClose();   // came back before it closed
      if (openTimer || content.classList.contains('is-open')) return;
      openTimer = setTimeout(function () { openTimer = null; setOpen(true); }, HOVER_OPEN);
    });
    content.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse') return;
      cancelOpen();
      if (!content.classList.contains('is-open')) return;
      cancelClose();
      closeTimer = setTimeout(function () { closeTimer = null; setOpen(false); }, HOVER_CLOSE);
    });
  });

  // make each project section clickable → open its project page. Strumming the
  // string and real links/buttons still work; the "View project" link stays for
  // keyboard/screen-reader users.
  document.querySelectorAll('.home-fret:not([data-primary])').forEach(function (fret) {
    var link = fret.querySelector('.home-cta[href]');
    if (!link || link.getAttribute('href') === '#') return;   // no dead clicks on placeholder links
    fret.classList.add('is-linked');
    fret.addEventListener('click', function (e) {
      if (e.target.closest('.home-string, a, button')) return;   // don't hijack strums or real links
      if (window.getSelection && String(window.getSelection())) return;   // allow text selection
      window.location.href = link.getAttribute('href');
    });
  });

  // this page has no top header — the Tay Aras line IS the header. The mute
  // button + nav are in the markup; the shared theme toggle is created by
  // shared.js but not auto-placed (no .header-bar here), so drop it in before
  // the nav → [mute][theme] WORK ABOUT [collapse]. shared.js runs first on
  // DOMContentLoaded, so __portfolioApp already exists.
  var app = window.__portfolioApp;
  var controls = document.querySelector('.home-fret .home-controls');
  if (app && controls) {
    var nav = controls.querySelector('.main-nav');
    var themeBtn = app.theme && app.theme.btn;
    if (themeBtn) controls.insertBefore(themeBtn, nav || collapse);
    if (app.muteBtn) app.muteBtn.show();
  }

  // The page loads muted (the button red). When a string click turns sound
  // on, the mute button glows like the collapse arrow beside it, pointing at
  // the way back to quiet, until someone clicks it.
  var muteEl = document.getElementById('muteBtn');
  if (muteEl) document.addEventListener('tay:mute', function (e) {
    if (e.detail.source === 'string') muteEl.classList.add('pulse');
    else if (e.detail.source === 'button') muteEl.classList.remove('pulse');
  });

  // ── Scroll strum: while compressed, a two-finger scroll over the strings
  //    moves a pick across them. Each string sounds as the pick crosses it,
  //    so the scroll's speed is the strum's speed — and how hard it's hit.
  //    Reversing mid-gesture strums back the other way (down-up-down), and
  //    a fresh swipe the same way starts a new stroke from the top again
  //    (down-down-down), or the bottom (up-up-up).
  (function () {
    var PX_PER_STRING = 34;   // scroll distance between one string and the next
    var MIN_DELTA = 2;        // smaller scroll events (trackpad jitter) are ignored
    var REVERSE_PX = 18;      // scroll the other way this far before the pick turns
    var GAP_MS = 70;          // a pause this long between scroll events ends a swipe
    // Fingers moving down the trackpad strum down (top string first). With
    // macOS natural scrolling that's a negative deltaY; flip to 1 if not.
    var DOWN = -1;
    var EDGE = 1;             // how far past the outer strings the pick rests — a
                              // string's worth of run-up before the first one sounds
    var pick = -EDGE, lastT = 0;
    // A trackpad keeps sending momentum events after the fingers lift, so the
    // next swipe often arrives with no pause at all. Momentum only ever slows;
    // a swipe speeds up. So: once the deltas have fallen to half their peak,
    // a jump back up off their low point is a new swipe.
    var peak = 0, trough = Infinity, decaying = false;
    var queueEnd = 0;         // when the last scheduled pluck sounds
    var moveDir = 0, reverse = 0;   // the pick's direction, and travel banked against it

    function pluckNow(gs, v) {
      var r = gs.zone.getBoundingClientRect();
      // seed the velocity tracker so pluck() reads exactly speed v (0–1)
      gs.lastT = performance.now() - 30;
      gs.lastX = 60 - v * 54;
      gs.pluck(r.left + 60, r.top + r.height / 2);
    }

    // One queue, played strictly in order by a single timer — separate
    // setTimeouts a few ms apart can fire out of order, which scrambles a
    // fast strum. Each entry waits for its own time, or the one before it.
    var queue = [], running = false;
    function pluckAt(gs, v, at) {
      queue.push({ gs: gs, v: v, at: at });
      if (!running) run();
    }
    function run() {
      if (!queue.length) { running = false; return; }
      running = true;
      var wait = queue[0].at - performance.now();
      if (wait > 1) { setTimeout(run, wait); return; }
      var next = queue.shift();
      pluckNow(next.gs, next.v);
      run();
    }

    window.addEventListener('wheel', function (e) {
      if (opened || e.ctrlKey) return;   // expanded page scrolls normally; ctrl = pinch zoom
      if (!e.target.closest || !e.target.closest('.strum-home')) return;
      var strings = homeStrings.slice(0, STRINGS);
      if (!strings.length) return;
      e.preventDefault();

      var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      if (Math.abs(dy) < MIN_DELTA) return;
      var dir = Math.sign(dy) === DOWN ? 1 : -1;   // +1 = toward the bottom string
      var now = performance.now();
      var dt = now - lastT;
      lastT = now;

      var abs = Math.abs(dy);
      // only movement the way the pick is already going can read as a new
      // swipe by speeding up; a twitch the other way is left to REVERSE_PX
      var sameWay = !moveDir || dir === moveDir;
      var newSwipe = dt > GAP_MS || (sameWay && decaying && abs > trough * 2 && abs - trough >= 4);
      if (newSwipe) { peak = abs; trough = Infinity; decaying = false; }
      else if (sameWay) {
        peak = Math.max(peak, abs);
        if (abs < peak * 0.5) decaying = true;
        if (decaying) trough = Math.min(trough, abs);
      }

      var last = strings.length - 1;
      // a new swipe the same way as the stroke before it starts afresh from the
      // other side — that's what makes down-down-down. "Same way" is the pick
      // sitting past the middle in the direction it's going, so a short swipe
      // that only reached string 4 or 5 still resets rather than finishing off.
      if (newSwipe) {
        if (dir > 0 && pick > last / 2) pick = -EDGE;
        if (dir < 0 && pick < last / 2) pick = last + EDGE;
      }

      // Mid-swipe, a turn the other way has to add up to REVERSE_PX before the
      // pick follows it — so a wobble in the fingers doesn't strum back. Once
      // it does, the banked distance counts, so nothing is lost. A new swipe
      // turns at once: there the change of direction is the point.
      var travel = abs;
      if (moveDir && dir !== moveDir && !newSwipe) {
        reverse += abs;
        if (reverse < REVERSE_PX) return;
        travel = reverse;
        peak = abs; trough = Infinity; decaying = false;   // a new direction, a new swipe shape
      }
      reverse = 0;
      moveDir = dir;

      var from = pick;
      pick = Math.max(-EDGE, Math.min(last + EDGE, pick + dir * travel / PX_PER_STRING));

      // speed of this movement, 0–1, which sets how hard each string is hit
      var v = Math.min(1, Math.abs(dy) / Math.max(8, Math.min(dt, 60)) / 2.5);
      // a new gesture shouldn't wait on the tail of the last one
      if (newSwipe) queueEnd = 0;

      // every string the pick crossed, in the order it crossed them, spaced by
      // how long the pick takes to travel one string at this speed — so a fast
      // flick still ripples. Queued behind anything already scheduled, so two
      // quick scroll events can never sound their strings out of order.
      var hit = [];
      for (var i = 0; i <= last; i++) {
        if (dir > 0 ? (from < i && i <= pick) : (pick <= i && i < from)) hit.push(i);
      }
      if (dir < 0) hit.reverse();
      var rate = Math.abs(dy) / Math.max(8, Math.min(dt, 60));      // px per ms
      var gap = Math.max(4, Math.min(60, PX_PER_STRING / rate));    // ms per string
      var at = Math.max(now, queueEnd);
      hit.forEach(function (i, k) {
        if (k) at += gap;
        pluckAt(strings[i], v, at);
      });
      if (hit.length) queueEnd = at + 4;
    }, { passive: false });
  })();

  // ── Chord keys: while compressed, A–G retune the strings to a chord and the
  //    pads mirror it for touch. Shared with the project pages via chords.js.
  var chordKeys = window.initChordKeys && window.initChordKeys({
    strings: function () { return homeStrings.slice(0, STRINGS); },
    isActive: function () { return !opened; }
  });

  // ── Arrow keys strum too, while compressed: ↓ a downstroke (top string
  //    first), ↑ an upstroke — the same strum the on-screen pads play. A held
  //    key doesn't machine-gun; each press is one stroke.
  if (chordKeys) document.addEventListener('keydown', function (e) {
    if (opened || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    if (e.target && e.target.matches && e.target.matches('input, textarea, select')) return;
    e.preventDefault();   // the compressed page has nothing to scroll to
    // a quick flick across the strings — about a third the pads' stagger
    if (!e.repeat) chordKeys.strum(e.key === 'ArrowDown' ? 'down' : 'up', 18);
  });
});

/* "More about me" / "See less" — opens the bio in place (no navigation). The
   two short paragraphs stay put; the rest of the bio slides down beneath them,
   and the contact links fade in beside "See less". Closing slides it back up.
   Without JS the link simply goes to about.html. */
(function () {
  var cta = document.getElementById('aboutExpand');
  if (!cta) return;
  var copy = cta.closest('.home-copy');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SLIDE_MS = 550;   // matches .home-about-extra's transition

  // the rest of the bio — the first two paragraphs live in index.html
  var MORE = [
    "Through the studio he\u2019s worked on in-house projects and advised on design and product strategy, branding, product conceptualization, and speculative design.",

    "He studied (and taught) <a href='https://design.cmu.edu/about-our-programs/undergraduate-degrees/environments' target='_blank' rel='noopener'>Hybrid Environments Design</a> at <a href='https://design.cmu.edu' target='_blank' rel='noopener'>Carnegie Mellon University</a>, where he focused on interactive experiences and speculative technology.",

    "Outside of work, Tay is very into music and loves connecting with people and the world through it. He went to <span class='kw' data-photos='shows'>100+ sets in 2025</span>, plays <span class='kw' data-photos='bass'>guitar and bass</span>, and is becoming an avid CD collector (to rip onto his modded 5.5-gen iPod Classic), with a little record collecting and DJing back in. He plays in bands and has organized small DIY events across Seattle, Chicago, NYC, and Pittsburgh.",

    "He loves <span class='kw' data-photos='outdoors'>climbing and the outdoors</span>, soccer, cooking (and eating) pasta and gnocchi, a cool jacket, and digging for new artists.",

    "If you\u2019re working on something cool, or just want to talk about music, <a href='mailto:tayaras@outlook.com'>reach out</a>."
  ];

  // contact links — shown only on the expanded view, sitting at the bottom of
  // the bio text column so they align with the photo beside it
  var LINKS =
    "<div class='home-about-links'>" +
      // Shelved for now — uncomment this line and the exhibitsModal dialog in
      // index.html to bring the list back. It opens in a dialog rather than a
      // page (it is a credits list, not a destination), styled as a link
      // because it sits in a row of them.
      // "<button type='button' class='home-about-link-btn' data-exhibits-open>Exhibitions &amp; Performances</button>" +
      "<a href='mailto:tayaras@outlook.com'>Email ↗</a>" +
      "<a href='https://www.linkedin.com/in/tayaras/' target='_blank' rel='noopener'>LinkedIn ↗</a>" +
      "<a href='https://nowhereinteresting.online' target='_blank' rel='noopener'>Studio ↗</a>" +
    "</div>";

  /* What's on rotation, shown above the contact links in the expanded bio.
     Three kinds of entry, and a list can mix them:
       { art, title, artist, url }  → a cover tile that links out (the default)
       { spotify: '…' }             → Spotify's own player, with its controls
       { title, artist, url }       → a plain text line
     Cover art is kept locally in images/albums rather than hotlinked; grab it
     and the exact title from Spotify's oEmbed endpoint:
       curl -s "https://open.spotify.com/oembed?url=<album url>" */
  var ALBUMS = [
    // Shelved for now — uncomment to bring the section back. The artwork is
    // already in images/albums.
    // {
    //   art: 'images/albums/live-at-mercury-lounge.webp',
    //   title: 'Live at Mercury Lounge',
    //   artist: 'Cab Ellis',
    //   url: 'https://open.spotify.com/album/2ArFbBajsiwGionqmJkqZ4'
    // },
    // {
    //   art: 'images/albums/role-model-hermit.webp',
    //   title: 'Role Model Hermit',
    //   artist: 'mary in the junkyard',
    //   url: 'https://open.spotify.com/album/0r5nmjIvD8FmcgWsILF1Eh'
    // },
    // {
    //   art: 'images/albums/mount-zero.webp',
    //   title: 'Mount Zero',
    //   artist: 'Swapmeet',
    //   url: 'https://open.spotify.com/album/6MkGAjdvZDLijPcPBVQQFQ'
    // }
  ];

  // open.spotify.com/album/ID → open.spotify.com/embed/album/ID
  function embedSrc(url) {
    var src = url.split('?')[0].replace('open.spotify.com/', 'open.spotify.com/embed/');
    return src + '?utm_source=generator';
  }

  function albumsHTML() {
    if (!ALBUMS.length) return '';

    var tiles = ALBUMS.filter(function (a) { return a.art; }).map(function (a) {
      var inner =
        "<img loading='lazy' src='" + a.art + "' alt='" + a.title + " — " + a.artist + "'>" +
        "<span class='album-title'>" + a.title + "</span>" +
        "<span class='album-artist'>" + a.artist + "</span>";
      return "<li>" + (a.url
        ? "<a href='" + a.url + "' target='_blank' rel='noopener'>" + inner + "</a>"
        : inner) + "</li>";
    }).join('');

    var players = ALBUMS.filter(function (a) { return a.spotify; }).map(function (a) {
      return "<iframe src='" + embedSrc(a.spotify) + "' loading='lazy' " +
             "allow='clipboard-write; encrypted-media; fullscreen; picture-in-picture' " +
             "title='Spotify player'></iframe>";
    }).join('');

    var lines = ALBUMS.filter(function (a) { return !a.art && !a.spotify && a.title; }).map(function (a) {
      var name = "<span class='album-title'>" + a.title + "</span>" +
                 "<span class='album-artist'>" + a.artist + "</span>";
      // linked albums carry the same ↗ the other outbound links use
      return "<li>" + (a.url
        ? "<a href='" + a.url + "' target='_blank' rel='noopener'>" + name + " ↗</a>"
        : name) + "</li>";
    }).join('');

    return "<div class='home-listening'>" +
             "<span class='home-listening-label'>Current favorite albums</span>" +
             (tiles ? "<ul class='home-listening-tiles'>" + tiles + "</ul>" : '') +
             (players ? "<div class='home-listening-players'>" + players + "</div>" : '') +
             (lines ? "<ul>" + lines + "</ul>" : '') +
           "</div>";
  }

  /* Built once: the extra paragraphs (and the albums, if any) in a slider
     after the short copy, and a footer line holding the CTA with the contact
     links beside it, which only show while the bio is open. */
  var extra = document.createElement('div');
  extra.className = 'home-about-extra';
  extra.innerHTML = "<div class='home-about-inner'>" +
    MORE.map(function (h) { return '<p>' + h + '</p>'; }).join('') + albumsHTML() + "</div>";
  var inner = extra.firstChild;
  var footer = document.createElement('div');
  footer.className = 'home-bio-footer';
  copy.insertBefore(extra, cta);
  copy.insertBefore(footer, cta);
  footer.appendChild(cta);
  footer.insertAdjacentHTML('beforeend', LINKS);
  var links = footer.querySelector('.home-about-links');
  if (links) links.setAttribute('aria-hidden', 'true');
  // wire the hover-photo keywords — deferred a tick, since the scatter code
  // that defines this sits further down the file
  setTimeout(function () { if (window.__initScatterLinks) window.__initScatterLinks(); }, 0);
  extra.inert = true;   // closed: nothing in it can be tabbed to

  /* The photo sits beside the copy. Collapsed it's a band as tall as the
     short copy; open, it grows toward its own aspect but stops at a square,
     and never ends shorter than the text — so both columns finish on the same
     line, which puts "See less" on the photo's bottom edge. */
  var photoEl = document.getElementById('bioPhoto');
  var PHOTO_RATIO = 2023 / 1914;  // natural aspect of images/main/IMG_beach.webp
  var bioRow = photoEl && photoEl.closest('.home-content');

  // how tall the copy will be once the slide finishes — measured now, with
  // the copy's min-height lifted and the slider counted at its full height
  function openTextHeight() {
    copy.style.minHeight = '0';
    var h = copy.offsetHeight - extra.offsetHeight + inner.scrollHeight;
    copy.style.minHeight = '';
    return h;
  }
  function sizePhoto(open) {
    if (!photoEl) return;
    var h;
    if (open) {
      var w = photoEl.clientWidth;
      h = Math.max(Math.min(w / PHOTO_RATIO, w), openTextHeight());
    } else {
      h = copy.offsetHeight;
    }
    photoEl.classList.toggle('is-full', !!open);
    if (h) (bioRow || photoEl).style.setProperty('--bio-photo-h', h + 'px');
  }

  var open = false;
  function setOpen(next) {
    open = next;
    copy.classList.toggle('is-expanded', open);
    extra.classList.toggle('in', open);
    extra.inert = !open;
    if (links) links.setAttribute('aria-hidden', open ? 'false' : 'true');
    cta.textContent = open ? 'See less \u2190' : 'More about me \u2192';
    cta.setAttribute('href', open ? '#' : 'about.html');
    cta.setAttribute('aria-expanded', open ? 'true' : 'false');
    sizePhoto(open);
    // closing takes a screenful away — bring the reader back to the link
    if (!open) setTimeout(function () {
      cta.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    }, reduce ? 0 : SLIDE_MS);
  }
  cta.setAttribute('aria-expanded', 'false');
  cta.addEventListener('click', function (e) { e.preventDefault(); setOpen(!open); });

  // keep the photo matched to the copy as it reflows — the panel opening, a
  // resize, a late webfont, the slide closing all change the copy's height
  window.addEventListener('resize', function () { sizePhoto(open); });
  sizePhoto(false);
  if (window.ResizeObserver) {
    new ResizeObserver(function () { if (!open) sizePhoto(false); }).observe(copy);
  }
})();

/* The bio photo's moving frame. It stays paused so it never runs unseen, and
   starts from the top each time the photo is hovered — an animated image could
   only ever be revealed mid-loop, which is why this is a video. */
(function () {
  var box = document.getElementById('bioPhoto');
  var clip = box && box.querySelector('.home-bio-photo-motion');
  if (!clip || !clip.play) return;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  box.addEventListener('mouseenter', function () {
    if (still.matches) return;
    clip.currentTime = 0;
    var p = clip.play();
    if (p && p.catch) p.catch(function () {});   // autoplay policy; nothing to do
  });
  box.addEventListener('mouseleave', function () { clip.pause(); });
})();

/* Hover title — each full-size project gets a copy of its own label placed at
   the foot of its meta column, where CSS slides it out from the column's left
   edge on hover and lands it under the years line. Built here rather
   than in the markup so the name lives in exactly one place. The
   .has-media-title class is what lets the string row collapse its small label.
   The Additional sections do the same: their meta column is the same width as
   a full section's, so there is room for the name to ride into. */
(function () {
  [].forEach.call(document.querySelectorAll('.home-fret:not([data-primary])'), function (fret) {
    var label = fret.querySelector('.home-label');
    var copy = fret.querySelector('.home-copy');
    if (!label || !copy || copy.querySelector('.home-hover-title')) return;

    var mask = document.createElement('span');
    mask.className = 'home-hover-title';
    mask.setAttribute('aria-hidden', 'true');   // the row label already says it
    var text = document.createElement('span');
    // data-hover-title lets a section show something other than its row label
    // in display type — a URL reads fine as a small label, badly as a headline
    text.textContent = (label.getAttribute('data-hover-title') || label.textContent).trim();
    mask.appendChild(text);

    // it belongs to the meta column now, as the line under the years — the
    // copy column is only the fallback for a section without a meta block
    var meta = fret.querySelector('.home-meta');
    if (meta) {
      meta.appendChild(mask);
    } else {
      var cta = copy.querySelector('.home-cta');
      if (cta) copy.insertBefore(mask, cta); else copy.appendChild(mask);
    }
    fret.classList.add('has-media-title');

    // Stacked on a phone there is no hover for the name to ride out on, so the
    // same name is also placed at the top of the card, above the photo, where
    // it reads as the section's heading. CSS shows one or the other, and the
    // small row label collapses either way (the has-media-title class).
    var content = fret.querySelector('.home-content');
    if (content) {
      var lead = document.createElement('span');
      lead.className = 'home-lead-title';
      lead.setAttribute('aria-hidden', 'true');
      lead.textContent = text.textContent;
      content.insertBefore(lead, content.firstChild);
    }

    // a long name (someoneinteresting.online) would run past the column and be
    // cut off by the mask, so scale it down to fit. Measured on first hover:
    // off-screen sections are skipped by content-visibility until then.
    function fit() {
      text.style.fontSize = '';
      var room = mask.clientWidth;
      var needs = text.scrollWidth;
      if (room <= 0 || needs <= 0 || needs <= room) return;
      var size = parseFloat(getComputedStyle(text).fontSize);
      text.style.fontSize = (size * room / needs) + 'px';
    }
    fret.addEventListener('pointerenter', fit);
    window.addEventListener('resize', function () { if (text.style.fontSize) fit(); });
  });
})();

/* Hover-photo keywords — same scatter effect as the about page. Keywords live in
   the expanded "more about me" bio; photos are lazy-loaded on first hover. */
(function () {
  var stage = document.getElementById('scatterStage');
  if (!stage) return;

  var configs = {
    // the live-music collage — its photos, and the parts of each the
    // collage must leave uncovered, are in live-music.js
    shows: window.LIVE_MUSIC || [],
    // guitar and bass — a collage too, from guitar-bass.js
    bass: window.GUITAR_BASS || [],
    // climbing and the outdoors — a collage too, from outdoors.js
    outdoors: window.OUTDOORS || []
  };
  function shuffled(a){ a = a.slice(); for (var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function jitter(b,r){ return b + (Math.random()-0.5)*2*r; }

  var pools = {}, loaded = {};
  Object.keys(configs).forEach(function (key) {
    pools[key] = configs[key].map(function (cfg) {
      var el = document.createElement('div');
      el.className = 'scatter-img';
      var img = document.createElement('img');
      img.dataset.src = cfg.src;
      img.fetchPriority = 'low';   // never compete with the initial page load
      img.alt = cfg.caption || '';
      img.dataset.caption = cfg.caption || '';
      el.appendChild(img);
      stage.appendChild(el);
      return el;
    });
  });

  function loadPool(key) {
    if (loaded[key]) return; loaded[key] = true;
    pools[key].forEach(function (el) { var img = el.querySelector('img'); if (img && !img.src) img.src = img.dataset.src; });
  }

  // warm the photos during idle time so the first keyword hover is instant,
  // without adding weight to the initial (critical) page load
  // Each collage is dozens of photos, so nothing loads up front. A set
  // starts loading when the pointer reaches the paragraph its keyword sits
  // in — a moment before the keyword itself is hovered (see __initScatterLinks)

  /* ─── THE COLLAGE ───
     Each keyword fills the whole screen with a fresh collage on every hover,
     built from a shuffled pick of its photos. The screen is tracked as a grid
     of cells; each photo is aimed at a cell nothing covers yet and placed
     where it fills the most of the empty screen. It may hang off the edge, but
     never covers the parts of an earlier photo that matter — faces and the
     main subject, the `keep` boxes from live-music.js, guitar-bass.js and
     outdoors.js — and never buries more than COVER of one. Later photos sit
     on top, so only their predecessors need protecting; photos that find no
     spot on top fill the remaining gaps from underneath (second pass, below).
     Each photo shows at most once; the size is chosen so the set has enough
     area to fill the screen with room to spare. */
  var TRIES = 220, COVER = 0.6, CELL = 40;
  function layoutCollage(key) {
    var W = window.innerWidth, H = window.innerHeight;
    var cfgs = configs[key], N = cfgs.length;
    // a portrait photo's width, sized so the whole pool has ~3.2 screens of
    // area to work with, within sensible bounds
    var base = Math.max(W * 0.18, Math.min(W * 0.3, H * 0.42, Math.sqrt(3.2 * W * H / N * 0.75)));
    var bleed = 0.25;                       // how far a photo may hang off an edge
    var pad = 6;                            // room for the tilt
    var cols = Math.ceil(W / CELL), rows = Math.ceil(H / CELL);
    var filled = new Uint8Array(cols * rows), left = cols * rows;
    function area(r) { return Math.max(0, r.w) * Math.max(0, r.h); }
    function inter(a, b) {
      var x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
      return { x: x, y: y, w: Math.min(a.x + a.w, b.x + b.w) - x, h: Math.min(a.y + a.h, b.y + b.h) - y };
    }
    function cellsIn(r, mark) {
      var c0 = Math.max(0, Math.floor(r.x / CELL)), c1 = Math.min(cols - 1, Math.floor((r.x + r.w - 1) / CELL));
      var r0 = Math.max(0, Math.floor(r.y / CELL)), r1 = Math.min(rows - 1, Math.floor((r.y + r.h - 1) / CELL));
      var n = 0;
      for (var y = r0; y <= r1; y++) for (var x = c0; x <= c1; x++) {
        var i = y * cols + x;
        if (!filled[i]) { n++; if (mark) { filled[i] = 1; left--; } }
      }
      return n;
    }
    function emptyCell() {
      var k = Math.floor(Math.random() * left);
      for (var i = 0; i < filled.length; i++) if (!filled[i] && k-- === 0) return i;
      return -1;
    }
    var placed = [];
    var order = shuffled(cfgs.map(function (c, i) { return i; }));
    pools[key].forEach(function (el) { el.classList.remove('visible'); el.hidden = true; });
    for (var n = 0; n < order.length && left > 0; n++) {
      var cfg = cfgs[order[n]], r = cfg.r || 0.75;
      var w = base * jitter(1, 0.1) * (r > 1 ? 1.3 : 1);   // landscapes a little wider
      var h = w / r;
      var best = null;
      for (var t = 0; t < TRIES; t++) {
        var cell = emptyCell(); if (cell < 0) break;
        var cx = (cell % cols + Math.random()) * CELL, cy = (Math.floor(cell / cols) + Math.random()) * CELL;
        var x = Math.max(-w * bleed, Math.min(W - w * (1 - bleed), cx - Math.random() * w));
        var y = Math.max(-h * bleed, Math.min(H - h * (1 - bleed), cy - Math.random() * h));
        var c = { x: x, y: y, w: w, h: h };
        // its own faces and subject stay on screen
        var self = (cfg.keep || []).every(function (b) {
          var kx = x + b[0] * w, ky = y + b[1] * h;
          return kx >= 0 && ky >= 0 && kx + b[2] * w <= W && ky + b[3] * h <= H;
        });
        if (!self) continue;
        var grown = { x: c.x - pad, y: c.y - pad, w: c.w + 2 * pad, h: c.h + 2 * pad };
        var ok = true;
        for (var p = 0; p < placed.length && ok; p++) {
          var P = placed[p], o = area(inter(grown, P.rect));
          if (!o) continue;
          if (o > P.free) { ok = false; break; }
          for (var k = 0; k < P.keep.length; k++) if (area(inter(grown, P.keep[k])) > 0) { ok = false; break; }
        }
        if (!ok) continue;
        var gain = cellsIn(c, false);
        if (!best || gain > best.gain) best = { rect: c, gain: gain };
      }
      if (!best || !best.gain) continue;
      var R = best.rect;
      cellsIn(R, true);
      placed.forEach(function (P) { var o = area(inter(R, P.rect)); if (o) P.free -= o; });
      placed.push({
        idx: order[n], rect: R, free: area(R) * COVER,
        keep: (cfg.keep || []).map(function (b) { return { x: R.x + b[0] * R.w, y: R.y + b[1] * R.h, w: b[2] * R.w, h: b[3] * R.h }; })
      });
    }
    /* Second pass: whatever's left still shows through. The photos that found
       no spot on top go underneath instead, aimed at the gaps — under
       everything they cover nothing, so the only rules are that their own
       faces and subject aren't hidden and enough of them shows to read. */
    var under = [];
    var used = {}; placed.forEach(function (P) { used[P.idx] = 1; });
    var spare = order.filter(function (i) { return !used[i]; });
    for (var s2 = 0; s2 < spare.length && left > 0; s2++) {
      var cfg2 = cfgs[spare[s2]], r2 = cfg2.r || 0.75;
      var w2 = base * jitter(1.1, 0.1) * (r2 > 1 ? 1.3 : 1), h2 = w2 / r2;
      var above = placed.concat(under), best2 = null;
      for (var t2 = 0; t2 < TRIES; t2++) {
        var cell2 = emptyCell(); if (cell2 < 0) break;
        var gx = (cell2 % cols + Math.random()) * CELL, gy = (Math.floor(cell2 / cols) + Math.random()) * CELL;
        var x2 = Math.max(-w2 * bleed, Math.min(W - w2 * (1 - bleed), gx - Math.random() * w2));
        var y2 = Math.max(-h2 * bleed, Math.min(H - h2 * (1 - bleed), gy - Math.random() * h2));
        var c2 = { x: x2, y: y2, w: w2, h: h2 };
        var keep2 = (cfg2.keep || []).map(function (b) { return { x: x2 + b[0] * w2, y: y2 + b[1] * h2, w: b[2] * w2, h: b[3] * h2 }; });
        var ok2 = keep2.every(function (k) {
          return k.x >= 0 && k.y >= 0 && k.x + k.w <= W && k.y + k.h <= H &&
            above.every(function (A) { return !area(inter(k, A.rect)); });
        });
        if (!ok2) continue;
        var hidden2 = 0; above.forEach(function (A) { hidden2 += area(inter(c2, A.rect)); });
        if (hidden2 > area(c2) * 0.85) continue;   // at least a sixth of it shows
        var gain2 = cellsIn(c2, false);
        if (!best2 || gain2 > best2.gain) best2 = { rect: c2, keep: keep2, gain: gain2 };
      }
      if (!best2 || !best2.gain) continue;
      cellsIn(best2.rect, true);
      under.push({ idx: spare[s2], rect: best2.rect, keep: best2.keep });
    }
    // bottom of the stack first: the last photo slid under is the lowest
    placed = under.reverse().concat(placed);

    placed.forEach(function (P, i) {
      var el = pools[key][P.idx];
      el.hidden = false;
      el.style.left = P.rect.x + 'px';
      el.style.top = P.rect.y + 'px';
      el.style.width = P.rect.w + 'px';
      el.style.height = P.rect.h + 'px';
      el.style.zIndex = i + 1;
      el.style.transitionDelay = Math.min(i * 14, 260) + 'ms';   // they land one after another
      el.style.setProperty('--rot', jitter(0, 2.2) + 'deg');
      var img = el.querySelector('img');
      if (img && !img.src) img.src = img.dataset.src;
    });
    return placed.map(function (P) { return pools[key][P.idx]; });
  }

  // while a collage is up, body.collage-on hides the rest of the page, so
  // only the photos and the hovered keyword (.is-active) are left on screen
  var showing = {}, current = null;
  function show(key, kw) {
    if (current && current !== key) hide(current);
    current = key;
    showing[key] = layoutCollage(key);
    document.body.classList.add('collage-on');
    if (kw) kw.classList.add('is-active');
    // fade in on the next frame — unless the pointer has already left, in
    // which case a late fade-in would strand the photos on screen
    // read a layout first: the photos were display:none a moment ago, and
    // without this the browser applies "shown" and "visible" in one go, so
    // there's nothing to fade from and they just appear
    void stage.offsetWidth;
    requestAnimationFrame(function () {
      if (current !== key) return;
      showing[key].forEach(function (el) { el.classList.add('visible'); });
    });
  }
  function hide(key) {
    if (current === key) current = null;
    document.body.classList.remove('collage-on');
    document.querySelectorAll('.kw.is-active').forEach(function (el) { el.classList.remove('is-active'); });
    pools[key].forEach(function (el) { el.style.transitionDelay = '0ms'; el.classList.remove('visible'); });
  }

  // hover only — a click on a keyword does nothing
  window.__initScatterLinks = function () {
    document.querySelectorAll('.kw').forEach(function (kw) {
      if (kw.getAttribute('data-scatter-bound')) return;
      var key = kw.dataset.photos;
      if (!pools[key]) return;
      kw.setAttribute('data-scatter-bound', '1');
      var para = kw.closest('p');
      if (para) para.addEventListener('pointerenter', function () { loadPool(key); }, { once: true });
      kw.addEventListener('mouseenter', function () { loadPool(key); show(key, kw); });
      kw.addEventListener('mouseleave', function () { hide(key); });
    });
  };
})();


/* Exhibitions & performances dialog — opened from the contact line in the bio.
   A native <dialog> so Esc and the focus trap come for free; the only things
   left to wire are the open button, the close button and a click on the
   backdrop (which lands on the dialog element itself, never on its contents). */
(function () {
  var modal = document.getElementById('exhibitsModal');
  if (!modal || !modal.showModal) return;   // no dialog support: leave the button inert
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-exhibits-open]')) {
      e.preventDefault();
      e.stopPropagation();   // the bio section is clickable — don't let it through
      modal.showModal();
      return;
    }
    if (e.target.closest('[data-exhibits-close]')) modal.close();
  });
  // click outside the panel closes it
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
})();
