# Portfolio Audit — tayaras.com
Target: senior product/experience/interaction/UX/UI roles at music companies (Patreon, CD Baby, music tech, music hardware, ticketing, creator tools)

---

## 1. Site Map

### Primary pages (in footer nav order)

| Page | URL | Auth | Appears on index |
|---|---|---|---|
| Work index | index.html | auth.js | — |
| ACS UI Library | acs.html | auth.js | Card 01 |
| Collective IQ | collective-iq.html | auth.js + CIQ gate | Card 02 |
| Physicalization of AR/XR | cmu-thesis.html | auth.js | Card 03 |
| Now Here | now-here.html | auth.js | Card 04 |
| Soundmap | soundmap.html | auth.js | Card 05 |
| Orbit: Growing Together | orbit.html | auth.js | Archive |
| HP Sustainability Experience | hp.html | auth.js | Archive |
| About | about.html | auth.js | Nav only |

### How pages link to each other

**Main nav (every page):** Work → index.html, About → about.html

**Index cards:** ACS → acs.html, CIQ → collective-iq.html, CMU → cmu-thesis.html, Now Here → now-here.html, Soundmap → soundmap.html

**Dark CTA "next project" chain:** ACS → CIQ, CIQ → CMU Thesis, CMU Thesis → CIQ (circular), Now Here → ACS, Orbit → HP, HP → Orbit

**Footer nav inconsistencies:**
- `orbit.html` footer is missing `now-here.html` and `soundmap.html`
- `hp.html` footer is missing `now-here.html` and `soundmap.html`
- `collective-iq.html`, `cmu-thesis.html`, `now-here.html`, `about.html` footers are all missing `soundmap.html`
- Only `index.html` has the complete footer nav

### Orphan files (not linked from main nav)
`acs-call-summary.html`, `acs-copilot.html`, `acs-overview.html`, `acs-rtt.html`, `extras.html`, `index-cds.html`, `index2.html`, `nowhere.html`, `cmu-thesis-v2.html`, `style.css`, `style2.css`, `script.js`, `horizontalscroll.js`

---

## 2. Case Study Inventory

### ACS — Microsoft ACS UI Library & Calling SDK

**Sections (in order):**
1. Hero + eyebrow ("Microsoft · 2022–2025 / Azure Communication Services / UI Library · Calling SDK") — strong context immediately
2. 5-col meta strip: Company / Timeline / Role / Team size / Status
3. Overview — 3 paragraphs, ~120 words
4. Context — 2-col layout with spectrum cards ("Builders to Products"), ~200 words
5. Results — 6 impact cells: **11.1M+ minutes**, **5×**, **265M+**, **200+ devs**, **40+ languages**, **1st AI feature**
6. Selected Work — 6 items: Core Calling UI, Sample Builder, Mobile, RTT, AI Summary/Transcription, Consent
7. Clients — 10 logos
8. Special Projects — brief
9. Dark CTA → CIQ

**Hook in first scroll:** Meta strip + "11.1M+ minutes of calling enabled" in Results immediately below. Metrics are on screen before any narrative.

**Metrics/outcomes:** Excellent — dedicated Results section, positioned near the top. Each work item has a concrete decision articulated (e.g., "A variable-length control bar would have meant 200+ businesses making incompatible decisions about what 'important' means." — acs.html:406).

**Visuals:** 4 image areas still contain `<span>PHOTO</span>` with no actual image:
- `acs.html:500-501` — color vs. opacity model comparison for RTT (described in comment as "most important image in this section")
- `acs.html:513-514` — RTT across Web/iOS/Android
- `acs.html:537-539` — post-call loading state for AI Summary
- `acs.html:579-581` — consent dialog with capability gating

**Senior-level gaps:** These four missing images are the only material gap. The writing is the strongest in the portfolio — product tradeoffs are named, constraints are visible, decisions are explained. The CIQ dark CTA says "Details available under NDA. Reach out to discuss." which undersells the actual depth on that page.

---

### Collective IQ — Microsoft AI Meeting Summary for Teams

**Sections (in order):**
1. Hero + eyebrow ("Microsoft · Collective IQ · Microsoft 365 / 2025–2026")
2. 4-col meta: Company / Timeline / Role / Status
3. Stat cards: **0→1**, **50K+**, **Org-wide**
4. My Role — ~150 words
5. Context / Problem — ~150 words
6. **Final Design** (shown early, before process) — main v6 screens
7. Phase 0: Flow Definition
8. Phase 1: Card + Share UX
9. Phase 2/3: Multi-Modal Exploration
10. Phase 4: Share Model Definition
11. Phase 5: Production-Ready System
12. Where It Stands
13. What I Learned — 3 paragraphs, ~300 words

**Hook in first scroll:** Stat cards arrive within the first viewport. Showing final design before process is the right call.

**Metrics/outcomes:** Stat cards are strong but the numbers are targets, not actuals. "50K+ user target for next testing expansion" reads weaker than "50K+ users in testing." Once actual usage data exists, update these.

**Visuals:** All real images from `images/ciq/MVP/` directory. Detailed captions. 4 design decision callout blocks — the strongest structural feature in the portfolio. The two-col image grids (v6 state comparison) are well-executed.

**Senior-level gaps:**
- `collective-iq.html:422` — "I was recruited onto CIQ from my work on ACS" — passive framing, distances ownership. Rewrite as what you built, not how you got there.
- "The team wanted someone who could bring both design craft and product understanding" — same issue, external framing. Start with the problem you solved.
- Uses entirely custom CSS (`.cs-meta`, `.cs-stats`, `.cs-section`) instead of shared layout primitives (`.meta-strip`, `.section-row`). Doesn't affect visual quality but is a maintenance inconsistency.

---

### CMU Thesis — Physicalization of AR/XR Experiences

**Sections (in order):**
1. Hero + eyebrow ("Carnegie Mellon University · Bachelor of Design / 2021–2022")
2. 4-col meta: Institution / Program / Role / Tools
3. Overview — 2 paragraphs using `.overview-p`
4. How It Started — 2-col layout with image
5. Methods — `.did-grid` list
6. The Prototyping Tools — 6 cells with video + caption
7. What We Learned — 3-cell grid
8. The First Attempt — process photos
9. Process: Form → Material → Assembly → In Use — 4 gallery sections
10. Outcomes — 3 impact cells: **6** tools, **4** disciplines, **1** live exhibition
11. Reflection — 2 paragraphs using `.overview-p`
12. Dark CTA → CIQ

**Hook in first scroll:** "AR experience design in 2021 was rich in theory and thin in practice." Direct and credible. Sets up the thesis well.

**Metrics/outcomes:** 6/4/1 in the Outcomes section is fine for a thesis. Weak for industry.

**Visuals:** 6 working prototype videos (unique in the portfolio — the only page with real demo video content outside CIQ). Extensive process photography. Journey from concept sketch to physical tool is well-documented.

**Senior-level gaps:**
- "We" language throughout — this was a collaborative project (3 contributors listed in Methods), which undermines the "sole designer" signal. Consider clarifying your specific role within the collaboration.
- No product tradeoffs articulated. Six different mechanics could each have a "I made X decision because Y constraint" moment — none do.
- Music industry relevance: minimal. AR/XR spatial computing is transferable to "creative technologies" but requires framing.
- Dark CTA links to Collective IQ, which is correct, but the CTA copy ("A research-driven set of physicalized prototyping tools for augmented reality") is the meta description, not page-specific CTA copy.

---

### Now Here — Location-first event discovery app

**Sections (in order):**
1. Hero + eyebrow ("Concept project · Mobile · Location / 2024")
2. SVG map cover art (code-drawn, no image dependency)
3. 4-col meta: Role / Platform / Type / Status
4. Overview — 1 paragraph, ~60 words using `.overview-p`
5. Featured Screens — 1 wide + 2 portrait placeholders ("Hi-fi to be added")
6. The Problem — 3 paragraphs + pull quote, ~200 words
7. Atmospheric photo placeholder (flyer wall)
8. Research — journey map (4-step) + 1 paragraph
9. IA diagram — code-drawn SVG
10. Wireframe ideation — placeholder grid
11. Decision Showcase — 3 decisions (Map as home / Scan a flyer / Directions exit), each with a placeholder screen
12. Data Strategy — intro paragraph
13. Data model visual — 3-col code-drawn component
14. System overview placeholder
15. In-context photo placeholder
16. Reflection — 3 paragraphs

**Hook in first scroll:** "Existing event apps assume you already know what you're looking for." Personal credibility follows: "I go to over a hundred shows a year. I play in bands. I organize DIY events across Seattle, Chicago, and Pittsburgh." This is the single strongest hook in the portfolio for a music industry audience.

**Metrics/outcomes:** None — concept project. The data strategy section has the most analytical depth (three-layer data model, pin color trust encoding), which partially compensates.

**Visuals:** The SVG map cover and IA diagram are strong concept-level work. **All screen areas are placeholders with "Hi-fi to be added."** The three decision showcase panels have text only. For a music company reviewer, this is the most relevant project and has the least visual evidence.

**Senior-level gaps:**
- **Critical: no screens.** The product concept is well-articulated but invisible. A hiring manager at a music-adjacent company will click this first and find nothing to zoom into.
- The decision showcase format is the right structure for a senior portfolio — it shows tradeoff thinking. But without accompanying screens, the decisions read as theoretical.
- `now-here.html:886` — "The deeper documentation — sixteen design decisions with full rationale, the strategic and competitive analysis, the validation plan — is available on request." Offer it on the page. "Available on request" sounds like there's nothing to show.

---

### Soundmap — Map-based music discovery concept

**Sections (in order):**
1. Hero + eyebrow ("Independent concept · Mobile · Music & Maps / 2025")
2. 4-col meta: Type / Role / Timeline / Platform
3. Overview — 2 paragraphs
4. The Idea — two-question compare cards + diagram placeholder
5. The Interaction — Preview/Live state pair + interaction sequence placeholder
6. Map Overview — placeholder
7. Neighborhoods — Bushwick (preview + live, artist list, screen placeholders) + SoHo (same)
8. The System — comparison placeholder
9. Movement — placeholder
10. Decisions — 4 items (Soft unlock / Neighborhood-level / Contextual pins / Hybrid signals)
11. Scope — Included/Excluded
12. Closing

**Hook in first scroll:** "Soundmap is a map-based music experience that treats place as the primary interface for discovery." Hero placeholder covers the first scroll.

**Metrics/outcomes:** None — concept only.

**Visuals:** All placeholders — every media block is a beige box with filename text.

**Senior-level gaps:**
- **Critical: no screens.** Like Now Here, the concept reasoning is present but the product is invisible.
- The Decisions section has good structure (Soft unlock, Neighborhood-level, Contextual pins, Hybrid signals) — but without screens to anchor the decisions to, they read as bullet points.
- Strongest music industry signal in the portfolio: specific artists (Geese, MJ Lenderman, Waxahatchee, Fred again.., The Strokes), specific venues (Elsewhere, Bowery Ballroom), specific New York neighborhoods. That specificity is credible. Bury it behind a placeholder hero and you've wasted it.
- The Preview/Live mechanic is the most novel product idea in the portfolio. It deserves a visible interaction sequence.

---

### Orbit — Interactive wall speaker, CMU 2021

**Sections:** Hero → Demo (Vimeo) → Walkthrough (journey map + 6 grid slides + Spotify UI) → Visual System (5 emotion GIFs) → Systems Diagram → Physical Form → Dark CTA

**Hook:** Vimeo video loads early. "A shared artifact that accumulates meaning as the relationship does."

**Metrics:** None.

**Visuals:** The strongest visual page in the portfolio by assets-per-section — hero GIF, demo video, emotion GIFs, journey map, physical prototype photos. Everything loads.

**Senior-level gaps:** Collaborative project (Dorcas Lin, Franklin Guttman). No individual design decisions surfaced. No tradeoffs. 2021 project. Music relevance: implicit (Spotify integration, song sharing) but not positioned for a music industry audience.

---

### HP Sustainability Experience — CMU 2020

**Sections:** Hero → Key Insights (3) → Experience Walkthrough (5 steps) → Process → Reflection

**Hook:** "HP has an 80-year history of technology innovation, but its sustainability efforts are largely invisible." 

**Metrics:** None.

**Visuals:** Real images throughout — exterior rendering, interior, physical model, seed card.

**Senior-level gaps:** 2020 class project. No relevance to music or creator tools target. Strength: shows spatial/physical design range. Weakness: lowest priority for music industry positioning.

---

## 3. Visual System

### Fonts
- `--sans: 'Helvetica Neue'` — headings, body, UI
- `--mono: 'Courier New'` — labels, captions, meta, code
- `Pacifico` (Google Fonts, `about.html` only) — "that's a link!" scatter text easter egg

### Colors

**Light mode tokens (shared.css):**
```
--black:        #0a0a0a
--white:        #f5f4f0  (warm off-white)
--mid:          #5e5e5e  (secondary text)
--line:         #d8d6d0  (all borders)
--accent:       #236860  (teal)
--accent-light: #eef5f4
```
Standard placeholder background: `#e0ddd6`

**Dark mode overrides:**
```
--black:  #edeae3
--white:  #141312
--accent: #38b2a5
```

**Page-specific tokens:**
- `now-here.html`: `--nh-warm: #c8552a` (rust/orange), pin colors (`#2563EB`, `#16A34A`, `#E8572A`, `#D97706`)
- `soundmap.html`: `--sm-accent: #0f4c3a` (dark forest green), `--sm-bg: #e0ddd6`
- `collective-iq.html`: no custom tokens

### Border styles
`1px solid var(--line)` used universally. Most components have no border-radius. CIQ stat cards use `border-radius: 8px` — the only rounded element in the site.

### Spacing
- `--pad: 32px` — section horizontal padding
- `--max: 1240px` — max content width
- Section rows: `64px var(--pad)` padding, `80px` column gap
- Meta cells: `20px 24px` padding

### Typography scale
- h1: `clamp(52px, 7vw, 96px)`, weight 500
- h2: `clamp(28px, 3.5vw, 44px)`, weight 500
- h3: 18px
- `.overview-p`: 18px, max-width 760px
- `.impact-n`: 56px (large metrics display)
- Body p: 14px (shared.css default)
- Labels: `font-family: var(--mono)`, 10px, 0.08em letter-spacing, uppercase

### Inconsistencies

1. **Collective IQ uses its own layout system.** `.cs-meta`, `.cs-stats`, `.cs-section`, `.cs-section-inner`, `.cs-section-body`, `.cs-section-label` are all custom, not using shared `.meta-strip`, `.section-row`, `.section-row-inner`, `.section-label-col`. Result: 200px label column + 1fr body matches the shared pattern visually but is duplicated CSS. If shared.css changes, CIQ won't follow.

2. **CIQ stat card background is `#e8e6e0`.** All other page-level placeholder/card backgrounds use `#e0ddd6`. Six-point difference.

3. **CIQ uses a separate password mechanism.** `collective-iq.html` has its own inline gate (localStorage key `ciq_auth`, password `collectiveiq2026`) separate from `auth.js` (sessionStorage key `ta_auth`). The hero is visible before the gate — intentional, but a different UX pattern from all other pages.

4. **Three separate lightbox implementations.** `shared.js` has a global image lightbox. `orbit.html` has its own JS lightbox (gallery-capable, `data-gallery` groups). `hp.html` has a near-identical copy of orbit's lightbox. Both orbit and hp lightboxes have `prev/next` navigation. The shared.js lightbox does not. These will eventually diverge from each other.

5. **Body text font-size varies by page.** `.cs-section-body p` (CIQ): 14px. `.nh-body-col p` (Now Here): 15px. `.sm-body p` (Soundmap): 15px. `.overview-p` (shared): 18px. The 14px/15px difference in secondary text is minor but the gap between 14px and 18px is visible.

6. **Footer nav is incomplete on 7 of 9 pages.** See Site Map section above.

7. **`<skip-link>` is missing on `collective-iq.html` and `index.html`.** All other pages have `<a href="#main" class="skip-link">Skip to main content</a>`.

---

## 4. Writing

### Em dashes
Em dashes are used correctly and consistently throughout. No issues. Prevalent in `collective-iq.html` and `now-here.html` where they perform a clarifying/contrasting function.

### "Not X but Y" / "not just X but Y" constructions

- `collective-iq.html:467` — "not absence of action, but recorded decisions" — intentional and strong
- `collective-iq.html:517` — "not just a single template" — fine
- `collective-iq.html:600` — "A mandatory review moment before an irreversible decision isn't friction — it's the trust model made visible." — the strongest line in the portfolio
- `acs.html:440` — "not as a visual flourish but because..." — effective
- `soundmap.html:638` — "not just preference" — fine

No overuse. These are well-deployed.

### Passive voice

- `collective-iq.html:422` — "I was recruited onto CIQ from my work on ACS, where I'd spent years as a design-oriented PM..." — opens the My Role section with passive framing. Leads with how you arrived rather than what you built.
- `collective-iq.html:423` — "The team wanted someone who could bring both design craft and product understanding..." — positions you as a candidate being evaluated rather than a designer with authority.

**Suggested rewrite for CIQ My Role opening:** Start with "I joined CIQ as design lead with a specific mandate: translate an unsettled strategy into an interaction model, from scratch." or similar.

### Generic designer-speak

Zero hits for "seamless," "leveraged," "passionate," "user-centered" across all HTML files. This is one of the portfolio's real strengths — the writing avoids every cliché.

**One exception to flag:**
- `about.html:229` — "His work explores how technology shapes our interactions with each other, and our connections to both the tangible and digital worlds." — vague and generic relative to the rest of the site. Doesn't say anything specific about music, physical computing, or the actual kind of work shown.

---

## 5. Craft Basics

### Alt text coverage

Most images have substantive alt text. Problem cases:

- `about.html` — Three `<img alt="">` in `.who-side-photo` (intentionally empty — decorative atmospheric photos picked randomly). Acceptable.
- `orbit.html:541` — One `<img alt="">` in the emotion GIFs section. Should describe the animation.
- `hp.html` — One `<img alt="">` (the `data-still` fallback for hover GIF on index card). Verify.
- `acs.html:500-581` — Four PHOTO placeholders use `role="img"` with `aria-label` on the wrapper div, no actual `<img>` tag. When real images are added, confirm alt text matches the detailed comments.

### Heading hierarchy

- `index.html` — h1 "Designer & Product Lead" → h2 project card titles. Clean. The archive section uses h2 for card titles also, which is correct.
- `acs.html` — h1 → work section titles are `<h3>` — no h2 in body copy. The label column uses `<p class="label">`. No heading hierarchy gap — the structure is label + paragraph, not heading-based.
- `collective-iq.html` — h1 → all section labels are `<p class="cs-section-label">`. No h2 anywhere below the hero. Callout boxes have no heading. Low severity — the visual hierarchy holds — but screen reader navigation finds nothing below h1.
- `cmu-thesis.html` — h1 → h2 ("You can't design with a tool you don't understand", "The original direction") → h3 in tool cells. Correct.
- `now-here.html` — h1 → h2 per section → h3 for step labels. Correct.
- `soundmap.html` — h1 → h2 per section → h3 for subsections. Correct.
- `orbit.html` — h1 → h2 ("Emotions made visible"). Light.
- `hp.html` — h1 → h2 per walkthrough step. Correct.

**Flag:** `collective-iq.html` has no h2. Any screen reader navigating by heading finds the h1 and then nothing until the footer.

### Semantic HTML

Good across the board:
- `<main id="main">`, `<header>`, `<footer>`, `<nav aria-label="Primary">` consistent
- `<section aria-label="...">` used selectively and correctly
- Skip links on 7/9 pages (missing: `index.html`, `collective-iq.html`)
- `<nav aria-label="Footer">` on footer nav consistently

### Focus states

Default browser focus rings apply. `shared.css` defines `.skip-link:focus` with a visible outline. Guitar string zone has `tabindex="0"` and `aria-label`. CIQ password gate input has `:focus { border-color: var(--accent) }`.

No custom focus style suppression (`outline: none` without replacement) found in shared.css. Individual page styles should be checked — CIQ input has `outline: none` (`collective-iq.html:205`) but replaces it with border color change, which is acceptable.

### Mobile breakpoints

**Shared.css:** 1024px, 768px, 480px

**Per-page overrides:**
- `collective-iq.html`: 720px (non-standard — between 768 and 480)
- `now-here.html`: 900px, 600px (custom, for showcase grid and journey map)
- `cmu-thesis.html`: 768px, 560px, 480px (mostly aligned)
- `orbit.html`: 768px, 600px
- `hp.html`: 768px, 600px

No layout breakage expected — each page responds at the right point for its content. The 720px breakpoint in CIQ is the only one that could produce unexpected layout shifts if site-wide breakpoints are ever standardized.

### Image weight (concern areas)

- `cmu-thesis.html` — Process sections contain multiple `.gif` files (`image44.gif`, `image50.gif`, `image55.gif`, `image57.gif`, `image60.gif`, `image61.gif`). GIFs are uncompressed. Each is likely 1-5MB. Six GIFs in one scroll area = potential performance issue.
- `orbit.html` — `hero.gif` in the hero-img, five `emotion-0X.gif` files. Same concern.
- `index.html` — Loads `hero.gif` and `hero.gif` for orbit/hp on-demand via mouseenter (good pattern — not eager-loaded).
- `about.html` — Pre-creates scatter images in JS but uses `src=""` until mouseenter (good — lazy-ish by behavior).

---

## 6. Music Industry Relevance Assessment

For the stated target (Patreon, CD Baby, music tech, music hardware, ticketing, creator tools):

### Current portfolio signal

| Project | Relevance | Visual evidence | Action required |
|---|---|---|---|
| Now Here | **Highest** (event discovery, DIY music scene, 100+ shows/yr credibility) | Zero screens | Get screens in |
| Soundmap | **High** (map-based music discovery, specific artists/neighborhoods) | Zero screens | Get screens in |
| Orbit | **Medium** (music sharing, emotional music product, Spotify integration) | Full — video, GIFs, photos | Good as-is |
| ACS | Low (large-scale comms platform, transferable PM/design skills) | Full | No change needed |
| CIQ | Low (enterprise AI, trust design — transferable but not music) | Full | No change needed |
| CMU Thesis | Low (AR/XR spatial computing, creative technology) | Full (videos) | Optional framing addition |
| HP | Low | Full | Low priority |

### The critical gap

Now Here and Soundmap are the two most music-relevant projects in the portfolio, and both are entirely placeholder. A music company hiring manager clicking through the index will see two concept projects with nothing to look at, and two full Microsoft case studies. The portfolio currently reads as a Microsoft enterprise portfolio with some concept project names attached to it.

**The about.html bio doesn't mention music.** "live music," "playing guitar and bass," "playing in bands" appear in the scatter hover keywords but not in the visible bio text. A recruiter from a music company reading the above-the-fold bio sees: "designer and product lead... focused on emergent and creative technologies, hybrid environments, and interaction design." Nothing about music.

### Recommended priority fixes

1. **Now Here screens** — Even lo-fi Figma screens would transform this page. The product concept is better-articulated than most shipped products. Show it.
2. **Soundmap screens** — The Preview/Live mechanic is specific and novel. One interaction sequence screenshot makes this credible.
3. **Bio line for music** — Add one sentence to the about.html visible bio that names the music connection explicitly. E.g., "I've been to over a hundred shows a year for the past decade and build music-adjacent products on the side."
4. **Index ordering** — If targeting music roles, consider whether Now Here or Soundmap should be card 01 or 02 instead of the fourth or fifth position.
5. **ACS 4 missing images** — Straightforward to fix, highest completeness impact for the senior Microsoft case study.
