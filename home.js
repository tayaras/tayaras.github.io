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

  // ── Chord keys: while compressed, A–G retune the strings to a chord and the
  //    pads mirror it for touch. Shared with the project pages via chords.js.
  if (window.initChordKeys) {
    window.initChordKeys({
      strings: function () { return homeStrings.slice(0, STRINGS); },
      isActive: function () { return !opened; }
    });
  }
});

/* "More about me" / "See less" — toggles the bio in place (no navigation).
   The current copy wipes up, the content is swapped while it's hidden, then the
   new copy wipes back down. Instant swap for reduced motion / no-JS fallback. */
(function () {
  var start = document.getElementById('aboutExpand');
  if (!start) return;
  var copy = start.closest('.home-copy');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false;
  var afterRender = null;   // one-shot callback fired once the new copy is in place

  var EXPAND_CTA = '<a class="home-cta" id="aboutExpand" href="about.html">More about me →</a>';
  var COLLAPSE_CTA = '<a class="home-cta" id="aboutCollapse" href="#">See less ←</a>';

  var SHORT = [
    "Howdy! I'm Tay Aras, a designer &amp; product lead with eight+ years of experience. My work explores how technology shapes our interactions with each other, and our connections to both the tangible and digital worlds. Currently at <a href='https://microsoft.com' target='_blank' rel='noopener'>Microsoft</a>, building virtual communication platforms and multimodal interfaces. Also <a href='https://nowhereinteresting.online' target='_blank' rel='noopener'>Nowhere Interesting</a>, a design studio &amp; lab. I studied (and taught) <a href='https://design.cmu.edu/about-our-programs/undergraduate-degrees/environments' target='_blank' rel='noopener'>Hybrid Environments Design</a> at <a href='https://design.cmu.edu' target='_blank' rel='noopener'>Carnegie Mellon University</a>.",
    "Outside of work, I play in bands and organize DIY shows across New York, Seattle, Chicago, and Pittsburgh. If you have any interesting ideas or want to chat about music, please <a href='mailto:tayaras@outlook.com'>reach out</a>!"
  ];

  var ABOUT = [
    "I'm Tay Aras, a designer and product lead with 8+ years of experience, focused on emergent technologies, hybrid environments, and interaction design. My work explores how technology shapes our interactions with each other, and our connections to both the tangible and digital worlds. I studied (and taught) <a href='https://design.cmu.edu/about-our-programs/undergraduate-degrees/environments' target='_blank' rel='noopener'>Hybrid Environments Design</a> at <a href='https://design.cmu.edu' target='_blank' rel='noopener'>Carnegie Mellon University</a>, where I focused on interactive experiences and speculative technology.",
  
    "Currently <a href='https://microsoft.com' target='_blank' rel='noopener'>@Microsoft</a>, building virtual communication platforms and multimodal interfaces. I'm the design lead for <a href='collective-iq.html'>Collective IQ</a> and the product lead for the <a href='acs.html'>ACS UI Library</a>. I also run <a href='https://nowhereinteresting.online' target='_blank' rel='noopener'>Nowhere Interesting</a>, a Design Studio &amp; Lab exploring how what we make shapes how we live. Through the studio I've worked on in-house projects and advised on design and product strategy, branding, product conceptualization, and futures thinking. Past clients include Microsoft, <a href='https://0xparc.org' target='_blank' rel='noopener'>0xPARC</a>, Idler, Widget Factory, musicians, artists, and non-profit organizations.",
 
    "Outside of work, I play in bands and organize DIY shows across Seattle, Chicago, NYC, and Pittsburgh. I went to <span class='kw' data-photos='shows'>100+ sets in 2025</span>, play <span class='kw' data-photos='bass'>guitar and bass</span>, and I'm becoming an avid CD collector (to rip onto my modded 5.5-gen iPod Classic), with a little record collecting maybe creeping back in. I also <span class='kw' data-photos='outdoors'>climb</span>, play soccer, cook pasta (and gnocchi), find cool jackets (and pants too, now), and dig for new artists.",

    "If you're working on something at the intersection of design, technology, and the physical world — or you just want to talk about music — <a href='mailto:tayaras@outlook.com'>reach out</a>."
  ];

  // contact links — shown only on the expanded view, sitting at the bottom of
  // the bio text column so they align with the photo beside it
  var LINKS =
    "<div class='home-about-links'>" +
      "<a href='mailto:tayaras@outlook.com'>Email</a>" +
      "<a href='https://www.linkedin.com/in/tayaras/' target='_blank' rel='noopener'>LinkedIn ↗</a>" +
      "<a href='https://nowhereinteresting.online' target='_blank' rel='noopener'>Studio ↗</a>" +
    "</div>";

  var PHOTO = "<div class='home-bio-photo'><img loading='lazy' src='images/main/IMG_4965.webp' alt='Tay Aras'></div>";

  function paraHTML(paras) {
    return paras.map(function (h) { return '<p>' + h + '</p>'; }).join('');
  }
  function bioHTML(paras, photo) {
    if (!photo) return paraHTML(paras);
    return "<div class='home-bio-cols'><div class='home-bio-text'>" + paraHTML(paras) + LINKS + "</div>" + PHOTO + "</div>";
  }
  function finalHTML(paras, ctaHTML, extra, photo) { return bioHTML(paras, photo) + (extra || '') + ctaHTML; }

  function render(html, expanded) {
    copy.classList.toggle('is-expanded', !!expanded);
    copy.innerHTML = html;
    var ex = copy.querySelector('.home-about-extra');
    if (ex) ex.classList.add('in');   // the wipe reveals it; no separate slide
    bind();
    if (window.__initScatterLinks) window.__initScatterLinks();   // wire hover-photo keywords
    running = false;
    if (afterRender) { var fn = afterRender; afterRender = null; fn(); }
  }

  // collapsing removes a screenful of CV, so bring the reader back to the
  // "More about me" link instead of leaving them stranded further down
  function scrollToCta() {
    var cta = document.getElementById('aboutExpand');
    if (!cta) return;
    requestAnimationFrame(function () {
      cta.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  // Phase 1 — wipe the current copy up: the visible band shrinks from the
  // bottom edge upward while the block lifts slightly and fades.
  function wipeUp(done) {
    var fired = false;
    function finish() { if (fired) return; fired = true; copy.removeEventListener('transitionend', onEnd); done(); }
    function onEnd(e) { if (e.target === copy && e.propertyName === 'clip-path') finish(); }
    copy.addEventListener('transitionend', onEnd);
    setTimeout(finish, 520);                       // fallback if transitionend never lands
    requestAnimationFrame(function () { copy.classList.add('wipe-out'); });
  }

  // Phase 2 — swap the content while it's hidden, then wipe it back down.
  function wipeDown(paras, ctaHTML, extra, photo) {
    copy.classList.remove('wipe-out');
    copy.classList.add('wipe-primed');             // hidden, and not yet animating
    render(finalHTML(paras, ctaHTML, extra, photo), photo);
    // two frames: one for the new layout to settle, one to start the transition
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        copy.classList.remove('wipe-primed');
        copy.classList.add('wipe-in');
        setTimeout(function () { copy.classList.remove('wipe-in'); }, 700);
      });
    });
  }

  function toggle(paras, ctaHTML, extra, photo, done) {
    if (running) return;
    running = true;
    afterRender = done || null;
    if (reduce) { copy.classList.toggle('is-expanded', !!photo); render(finalHTML(paras, ctaHTML, extra, photo), photo); return; }
    function go() { wipeUp(function () { wipeDown(paras, ctaHTML, extra, photo); }); }
    var openExtra = copy.querySelector('.home-about-extra.in');
    if (openExtra && !extra) {
      openExtra.classList.remove('in');   // collapse: slide the CV/contacts closed first
      setTimeout(go, 480);
    } else {
      go();
    }
  }

  function bind() {
    var ex = document.getElementById('aboutExpand');
    var col = document.getElementById('aboutCollapse');
    if (ex) ex.addEventListener('click', function (e) { e.preventDefault(); toggle(ABOUT, COLLAPSE_CTA, '', true); });
    if (col) col.addEventListener('click', function (e) { e.preventDefault(); toggle(SHORT, EXPAND_CTA, '', false, scrollToCta); });
  }

  bind();
})();

/* Hover-photo keywords — same scatter effect as the about page. Keywords live in
   the expanded "more about me" bio; photos are lazy-loaded on first hover. */
(function () {
  var stage = document.getElementById('scatterStage');
  if (!stage) return;

  var configs = {
    shows: [
      { src: 'images/live-music/IMG_2143.webp', caption: 'Native Sun · Bowery Ballroom · 2026' },
      { src: 'images/live-music/IMG_2174.webp', caption: 'Cab Ellis · Bowery Ballroom · 2026' },
      { src: 'images/live-music/IMG_3408.webp', caption: 'Telescreens · Irving Plaza · 2025' },
      { src: 'images/live-music/IMG_4485.webp', caption: "The Dare · Baby's All Right · 2025" },
      { src: 'images/live-music/bw-crowd.webp', caption: 'Geese · Brooklyn Paramount · 2025' }
    ],
    bass: [
      { src: 'images/guitar-bass/DSCN0830.webp' },
      { src: 'images/guitar-bass/DSCN0982.webp' },
      { src: 'images/guitar-bass/DSCN0738.webp' },
      { src: 'images/guitar-bass/IMG_2529.webp' },
      { src: 'images/guitar-bass/IMG_9192.webp' }
    ],
    outdoors: [
      { src: 'images/climb/IMG_7417-2.webp', caption: 'Mt. St. Helens · Summit · 2024' },
      { src: 'images/climb/IMG_7603-2.jpg',  caption: 'Mt. St. Helens · Above the Clouds · 2024' },
      { src: 'images/climb/IMG_6573.webp',   caption: 'Cascade Pass · 2024' },
      { src: 'images/climb/IMG_6991.webp',   caption: 'Snoqualmie Area · 2024' },
      { src: 'images/climb/IMG_0211.webp',   caption: 'Oahu · 2024' }
    ]
  };
  var zoneLayouts = {
    shows:    [ {top:5,left:6,w:232,rot:-1},{top:4,left:75,w:250,rot:3},{top:44,left:8,w:226,rot:-3},{top:47,left:74,w:242,rot:2},{top:58,left:41,w:236,rot:-2} ],
    bass:     [ {top:5,left:7,w:230,rot:-3},{top:4,left:73,w:248,rot:2},{top:46,left:9,w:224,rot:2},{top:48,left:72,w:240,rot:-2},{top:58,left:39,w:234,rot:1} ],
    outdoors: [ {top:5,left:7,w:234,rot:2},{top:3,left:74,w:249,rot:-2},{top:45,left:8,w:227,rot:-2},{top:46,left:73,w:242,rot:3},{top:56,left:40,w:236,rot:-1} ]
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
      img.addEventListener('click', function (e) { e.stopPropagation(); if (window.__lbOpen) window.__lbOpen(img.src, img.dataset.caption); });
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
  function preloadPools() { Object.keys(configs).forEach(loadPool); }
  if ('requestIdleCallback' in window) requestIdleCallback(preloadPools, { timeout: 4000 });
  else setTimeout(preloadPools, 2500);
  function applyZoneLayout(key) {
    var zones = shuffled(zoneLayouts[key]);
    pools[key].forEach(function (el, i) {
      var z = zones[i];
      el.style.top = jitter(z.top,1) + '%';
      el.style.left = jitter(z.left,1) + '%';
      el.style.width = jitter(z.w,10) + 'px';
      el.style.height = 'auto';
      el.style.setProperty('--rot', jitter(z.rot,1.5) + 'deg');
    });
  }
  function show(key) { loadPool(key); applyZoneLayout(key); pools[key].forEach(function (el) { el.classList.add('visible'); }); }
  function hide(key) { pools[key].forEach(function (el) { el.classList.remove('visible'); }); }

  var pinnedKey = null;
  function unpin() { if (!pinnedKey) return; hide(pinnedKey); pinnedKey = null; }

  window.__initScatterLinks = function () {
    document.querySelectorAll('.kw').forEach(function (kw) {
      if (kw.getAttribute('data-scatter-bound')) return;
      var key = kw.dataset.photos;
      if (!pools[key]) return;
      kw.setAttribute('data-scatter-bound', '1');
      kw.addEventListener('mouseenter', function () { if (pinnedKey && pinnedKey !== key) unpin(); show(key); });
      kw.addEventListener('mouseleave', function () { if (pinnedKey === key) return; hide(key); });
      kw.addEventListener('click', function () { if (pinnedKey === key) unpin(); else { if (pinnedKey) unpin(); pinnedKey = key; show(key); } });
    });
  };

  document.addEventListener('click', function (e) {
    if (!pinnedKey) return;
    if (e.target.closest('.scatter-img img') || e.target.closest('.kw')) return;
    unpin();
  });
})();
