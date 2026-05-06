# Case Study Restructure Plan

Target structure for every case study:
1. Hero
2. Meta block — Role / Timeline / Team / Skills
3. Overview — 2-3 sentences on what the product is and what I owned
4. Key metrics — large type, real numbers only; omit entirely where none exist
5. Problem framing — what was hard, tradeoffs named
6. Approach — actual design moves, not textbook process
7. Selected work — visuals with captions that say what each thing is and why it matters
8. Reflection — what I'd do differently, what I learned, where it goes next

Voice rules applied throughout all draft copy below:
- No em dashes. Period or comma.
- No "not X but Y" constructions.
- "I shipped," "I led," "I designed." No "I was involved in" or "I helped with."
- No "seamless," "leveraged," "passionate," "user-centered," "stakeholder."
- Section labels and institution lines: regular hyphen with spaces, e.g. "Microsoft - Product Lead."

---

## ACS — Microsoft ACS UI Library and Calling SDK

### Audit against target structure

| Target section | Current state | Status |
|---|---|---|
| Hero | Present, strong | ✓ Keep |
| Meta block | 5-col: Company / Timeline / Role / Team size / Status | Needs trim |
| Overview | 3 paragraphs, ~120 words | Needs tighten |
| Key metrics | "Results" section with 6 impact cells | ✓ Present, reorder |
| Problem framing | Blended across Overview + "Context" section | Needs extraction |
| Approach | Implicit in 6 work items | Needs a light framing section |
| Selected work | 6 work items with decision copy | ✓ Strong as-is |
| Reflection | Missing entirely | Must add |

### What's weak

**Meta block:** "Status" column always says "Shipped / Maintained." Cut it. "Team size" is an org detail, not portfolio context. Replace with Skills: "React / Component APIs / Accessibility / Cross-platform (Web, iOS, Android)."

**Overview order:** Currently Overview → Context → Results. The metrics should come before the narrative context. A recruiter should see the numbers on the first scroll. Move Results immediately after Overview.

**Context section:** Good content, wrong label. "Context" makes it sound like background. This section actually frames the central design challenge (platform abstraction vs developer experience floor). Rename "Problem framing" and trim.

**4 missing PHOTO placeholders:** The most important images in the RTT section are both absent (acs.html:500-501, 513-514). The consent dialog image is absent (acs.html:579-581). The post-call loading state image is absent (acs.html:537-539). These are the four most visually distinctive decisions in the case study. Until these are in, the case study is structurally incomplete.

**Special Projects section:** Brief text, no visuals, no decision framing. Either cut or give it a work-item treatment matching the six main items.

**Reflection:** Missing entirely. ACS is the most complete case study and has no reflection. That signals a portfolio that documents output but not judgment.

### Proposed new section order

1. Hero — keep as-is
2. Meta block — Role / Timeline / Team / Skills (cut Company and Status columns, which are redundant with the eyebrow and context)
3. Overview — tighten to 2-3 sentences
4. Key metrics — move Results section here, directly below Overview
5. Problem framing — rename Context, trim to one focused block
6. Selected work — 6 work items, keep all decision copy, add real images when available
7. Reflection — new section, draft below

### Content plan

**Meta block (proposed):**
- Role: Product Lead
- Timeline: 2022 - Present
- Company: Microsoft - Azure Communication Services
- Skills: React, Component APIs, Accessibility, Cross-platform

**Overview — current copy (acs.html:~330):**
> "I was the Product Lead and designer for the Azure Communication Services UI Library and Calling SDK for four years. ACS is Microsoft's developer platform for embedding real-time communication — calling, chat, screen sharing — into third-party products. The UI Library is the component and composite layer on top of it: a pre-built set of React/iOS/Android controls that developers can drop into their products and ship production-ready communication experiences."

**Problems:** "communication — calling" contains an em dash. Three sentences is fine but the third is a definition, not a value statement. No personal ownership voice.

**Draft replacement:**
> ACS is Microsoft's developer platform for embedding real-time calling, chat, and screen sharing into third-party products. I led product and design for the UI Library layer, a pre-built set of React, iOS, and Android components that let developers ship production-ready communication features without building the UI from scratch. I owned strategy, design direction, and cross-functional execution across six shipped product surfaces over four years.

**Problem framing — current copy (Context section, ~200 words):**
The core tension is well-articulated inside the individual work items but the Context section itself is mostly descriptive. The paragraph about "three kinds of users" is useful background but doesn't name the tension. What was actually hard: the UI Library serves both developers (who want minimal API surface) and the products they build (which want full customization), and those two needs pull in opposite directions. Extract this conflict into the Problem framing section.

**Draft problem framing:**
> The Library serves two audiences at once: developers who need a low-friction integration path, and the products they build, which each have their own brand, layout constraints, and feature requirements. Designing for both without betraying either meant every decision had to hold across 200-plus business customers and their end users. The failure mode was a configurable system so flexible it required a PhD to use. I held the line on developer experience as the primary constraint.

**Reflection — draft (new section, to be added):**
> Two things I'd do differently.
>
> First, I spent too long optimizing for API elegance before focusing on developer mental models. The callback structure I built was technically clean and also too abstract for the majority of developers who needed a working call experience in an afternoon. The shift to purpose-specific composites, CallComposite and CallWithChatComposite, was the right call. It took six months of developer feedback to get there. I should have listened earlier.
>
> Second, the RTT cross-platform work exposed something I now look for proactively: unspoken divergence between platform teams. Building the same interaction model three times, across web, iOS, and Android, forced alignment that would have taken months of coordination if I had delegated it across platform teams. I would start with that cross-surface audit on day one of any cross-platform project now.
>
> AI Summary is where I'd invest more time if the project continued. The gap between call-end and summary-ready is an unsolved product moment. The skeleton treatment works, but the real answer is reducing that gap at the infrastructure level. That is an engineering and product priority I'd push harder on.

---

## Collective IQ — Microsoft AI Meeting Summary

### Audit against target structure

| Target section | Current state | Status |
|---|---|---|
| Hero | Present, hero visible before password gate | ✓ Keep |
| Meta block | 4-col: Company / Timeline / Role / Status | Needs trim |
| Overview | "My Role" section, ~150 words | Needs rewrite |
| Key metrics | Stat cards: 0→1 / 50K+ / Org-wide | ✓ Present |
| Problem framing | "Context" section, ~150 words | ✓ Good, rename |
| Approach | 6 phase sections (Phase 0-5) | Consolidate |
| Selected work | "Final Design" section + images in phases | Consolidate |
| Reflection | "What I Learned," 3 paragraphs | ✓ Strong, trim |

### What's weak

**"My Role" section:** Opens with "I was recruited onto CIQ from my work on ACS." Passive, external framing. Positions you as a candidate who passed a screen rather than a designer who built something. The actual ownership is in paragraphs 2-3 of that section. Move the ownership information up and cut the backstory.

**"The team wanted someone who could bring both design craft and product understanding" (collective-iq.html:423):** This is hiring-manager language, not case study language. Cut it.

**"It also meant operating across two registers simultaneously" (collective-iq.html:426):** Unnecessary. The section before it already established this. Cut.

**6 phase sections:** Phase 0 through Phase 5 is a process diary. The narrative moves in sequence but each phase requires the reader to hold the previous phases in mind to understand why a decision matters. The actual design thinking is three things: (1) the surface strategy decision, choosing dedicated app over chat-only; (2) the trust model, requiring preview before share; (3) the share interaction model, moving from split button to three explicit buttons. Restructure around those three decisions. Keep the phase images, move them into a consolidated Approach section.

**Stat cards say "50K+ user target for next testing expansion."** That reads as a projection. When actual usage data exists, update to a factual number.

**"Where It Stands" section:** Positioned after six phase sections. It contains the closest thing to outcome metrics this page has. Move it immediately after the stat cards.

### Proposed new section order

1. Hero — keep as-is
2. Meta block — Role / Timeline / Status (cut Company column, which duplicates eyebrow)
3. Key metrics — stat cards
4. Where It Stands — move here, directly after metrics
5. Overview — rewrite My Role with direct ownership framing
6. Problem framing — rename Context to "The Problem," keep most copy
7. Approach — collapse phases 0-5 into three named design moves
8. Selected work — Final Design section with v6 screens, pull key images from phases
9. Reflection — keep What I Learned, trim

### Content plan

**Overview — current "My Role" section (collective-iq.html:421-428):**

Copy flagged:
- "I was recruited onto CIQ from my work on ACS" (line 422) — passive
- "The team wanted someone who could bring both design craft and product understanding" (line 423) — external framing
- "That's exactly the kind of problem I'd been solving on ACS" (line 423) — defensive framing, implies doubt

**Draft replacement:**
> CIQ had no settled spec, no design system, and no prior design history when I joined as design lead. I owned the design workstream end to end: translating a moving strategy into an interaction model, producing Figma flows, and running design reviews with engineering, legal, and trust and compliance partners. On specific surfaces I collaborated with designers from the Copilot and Teams organizations. Design direction for the project was mine.

This is 3 sentences. It establishes scope, ownership, and collaboration without passive framing.

**Approach — current 6 phases, proposed collapse to 3 design moves:**

*Design move 1: Surface strategy*
Phase 2/3 contains the most important structural insight on the page: recognizing that chat-first was the wrong primary model. The bot thread implies conversation. What organizers needed was a queue. This decision is currently buried inside a process narrative. Surface it as the first named design move.

Draft heading: "Surface strategy. Chat alone wasn't enough."
Draft copy:
> The first design pass treated the Teams chat card as the entire product surface. After v2 it became clear that summaries buried in message history created exactly the disorientation the product was supposed to solve. For organizers managing multiple meetings per week, a feed of pending cards in chat had no orientation, no expiration visibility, and no way to understand what was still waiting for action. I pushed for a dedicated CIQ app inside Teams with a structured queue, alongside the chat card as the action trigger. The chat card remained the primary interaction point. The app gave organizers a way to manage across meetings at a glance.

*Design move 2: Trust model*
Phase 4/5 contain the preview-before-share decision. This is the strongest design reasoning in the entire portfolio. Currently framed as a callout box inside Phase 4. It should be a named design move with visible images.

Draft heading: "Trust model. Review before share is not friction."
Draft copy:
> Sharing an AI-generated summary with an entire organization is an irreversible action. The v5 design required organizers to preview the summary before the share controls became available. That is deliberate friction. For content that could reach fifty thousand people, the delay before action is the right design. The constraint made the trust model visible rather than implied.

*Design move 3: Share interaction model*
The split button to three-button progression (v5 to v6) is well-documented in Phase 5. The callout box reasoning is good. Keep it, move it into this section.

Draft heading: "Share interaction. Three buttons instead of one."
Draft copy:
> v5 used a split button: one click to share with everyone, a dropdown to reach specific people. The split button carries an implicit default. For a decision with permanent consequences, implicit defaults are the wrong model. v6 moved to three explicit buttons: Everyone, Select users, Decline, with a "Share with:" label above the group. More visual weight. No ambiguity about what pressing the left button does. Ambiguity about permanent actions costs more than an extra button.

**Reflection — current "What I Learned" section:**

The three paragraphs are strong. The surface selection insight ("A bot thread implies conversation. What contributors needed was a queue.") is one of the best lines in the portfolio. Trim the passive framing in paragraph 1.

Current paragraph 1 (collective-iq.html:674):
> "The modality exploration early in this project changed how I think about surface selection. I spent time designing within the chat-based card model before recognizing that the mental model underneath it was wrong."

"Before recognizing that the mental model underneath it was wrong" reads as gradual discovery rather than a design decision. Rewrite to claim the insight:

Draft replacement:
> The modality exploration on this project changed how I think about surface selection. I designed several versions of the chat-only model before concluding that the model itself was wrong. A bot thread implies conversation. What organizers needed was a queue. You can execute a surface well and still be solving the wrong problem. I now ask the surface question before I ask the UI question.

---

## CMU Thesis — Physicalization of AR/XR Experiences

### Audit against target structure

| Target section | Current state | Status |
|---|---|---|
| Hero | Present, strong hook | ✓ Keep |
| Meta block | 4-col: Institution / Program / Role / Tools | ✓ Keep |
| Overview | 2 paragraphs | ✓ Keep |
| Key metrics | Outcomes section (6/4/1) positioned near end | Move earlier |
| Problem framing | "How It Started" section | ✓ Good, rename |
| Approach | Methods section (list) + implicit in tools section | Methods must go |
| Selected work | 6 prototype tools with videos | ✓ Keep, anchor the page |
| Reflection | 2 paragraphs | ✓ Keep |

### What's weak

**Methods section:** Lists six activities: "AR landscape research and tool exploration / 3D modeling and virtual environment development / Physical computing and sensor integration / Fabrication via laser cutting and 3D printing / Iterative prototyping and material testing / Capstone presentation and exhibition." This is a process list, not an approach. It says what happened, not why or how. Cut it. The information it contains (Unity, Cinema 4D, Arduino, ESP32) is already in the meta block Tools column.

**Four separate process gallery sections (Form, Material, Assembly, In Use):** Thirty-plus photos across four labeled chapters. This documents the process in more detail than the output, which inverts the case study's value. Collapse to one "Process" section with 8-10 selected photos.

**"We" language throughout:** "We built modular cubes," "we tested," "we learned," "we built." This was a collaborative thesis with two other people (per the Methods list, which credits three contributors implicitly). The case study never says who did what. For a portfolio targeting individual hire, clarify your specific contribution. If you designed the system and your collaborators built specific tools, say that.

**"What We Learned" section label:** The label uses "We." Change to "Findings" or rewrite to first person.

**Outcomes section (6/4/1) positioned at end:** These three numbers are the only metrics on the page. They should appear near the top, after the overview.

**Dark CTA copy:** "A research-driven set of physicalized prototyping tools for augmented reality, covering image mapping, 3D masking, shader effects, and physical sensor inputs." This is the meta description, copied verbatim. It reads as generated. Write an actual CTA that names what makes the CMU thesis interesting as a preceding project to CIQ.

### Proposed new section order

1. Hero — keep as-is
2. Meta block — update Role to "Designer, Researcher, Fabricator" or similar first-person framing
3. Overview — keep as-is
4. Key metrics — move Outcomes section here (6 tools / 4 disciplines / 1 exhibition)
5. Problem framing — rename "How It Started," reframe as the gap this project responded to
6. Approach — one section: the pivot decision and the system logic. Absorbs Methods entirely.
7. Selected work — 6 prototype tools with videos (keep as-is, strongest section)
8. Process — one combined section with 8-10 photos from the four current galleries
9. Reflection — keep as-is

### Content plan

**Approach — draft (replaces Methods, synthesizes How It Started and the pivot decision):**
> The starting point was a finished AR experience. The first prototype, a 3D masking cube with a virtual office room inside, took three weeks and taught us almost nothing about the design and almost everything about the tool. That gap was the actual finding. I reoriented the thesis around building one prototyping tool per AR mechanic. Six tools, each exposing a different constraint: what a technique can do, where it breaks, and what it demands of the physical environment around it. The decision to document mechanics rather than design experiences meant the thesis could be useful to other designers, not just a record of one project.

**"What We Learned" — rename and rewrite to first person:**

Current first cell (cmu-thesis.html:657-661):
> "In every tool, surface finish, form factor, and contrast directly determined how the digital layer behaved."

This is good. Change the section label to "Findings" and convert "every tool" to first person: "Across all six tools..."

**Reflection — current copy is strong, one flag:**

cmu-thesis.html: "Figma can't simulate what happens when a mapped texture breaks at a physical edge." Keep this line. It's specific and true.

---

## Now Here — Location-first event discovery

### Audit against target structure

| Target section | Current state | Status |
|---|---|---|
| Hero | Present | ✓ Keep |
| SVG cover art | Present | ✓ Keep (immediately after hero) |
| Meta block | 4-col | ✓ Keep |
| Overview | 1 paragraph | ✓ Keep |
| Key metrics | None | Omit. Concept project. |
| Problem framing | "The Problem" section, ~200 words, pull quote | ✓ Strong, move up |
| Approach | IA diagram + Decision Showcase | Needs reorder |
| Selected work | All placeholders | Critical gap |
| Reflection | 3 paragraphs | ✓ Strong, one flag |

### What's weak

**Section order:** Currently: Overview → Featured Screens (placeholder) → The Problem. This puts empty boxes before the argument for why the product matters. A reviewer sees nothing before they know why they should care.

**"Featured Screens" section (before the problem):** Currently positioned as section 4, before The Problem (section 5). It contains three placeholder boxes labeled "Hi-fi to be added." Move this section to position 7 (Selected Work), where it belongs. The placeholder honestly signals work in progress. It should not appear before the case for the product is made.

**"Research" section label:** The current section contains a 4-step journey map for Jordan's experience and one paragraph of text. "Research" sounds like a process section. The journey map is product reasoning (here is the failure state this product responds to). Rename "The gap" or absorb into Problem framing.

**"Wireframe ideation" section:** 10 placeholder cells labeled only with approach names (Search-first, List-first, Bottom tab, etc.) and no screens, no decisions, no rationale. This section has zero content. Cut it now. When wireframes exist, it can return as a named decision section: "Directions I ruled out."

**"System overview" placeholder (section 14) and "In-context photo" placeholder (section 15):** Both are placeholder boxes with descriptive text about what should go there. Cut both from the live page. The placeholder text ("A single composed image showing 4-5 hi-fi screens...") describes an aspiration, not a case study section.

**Reflection, last paragraph (now-here.html:886):**
> "This is a concept project. The deeper documentation — sixteen design decisions with full rationale, the strategic and competitive analysis, the validation plan — is available on request."

Two problems: em dash needs to go. "Available on request" buries material the page should surface. Rewrite:

Draft replacement:
> This is a concept project. The full documentation, sixteen design decisions with rationale, a competitive analysis, and a validation framework, is available on request or can be linked directly from Figma.

Or better: put a compressed version on the page itself. Take five of the sixteen decisions and put them in the Decision Showcase. "Available on request" is the weakest possible call to action.

### Proposed new section order

1. Hero
2. SVG cover art
3. Meta block
4. Overview
5. Problem framing ("The Problem" — keep existing copy, it's the strongest section)
6. Approach (IA diagram as centerpiece, plus the three Design decisions)
7. Data model (3-layer model visual, distinct enough to warrant its own section)
8. Selected work (screens when available, clearly labeled "In design" until then)
9. Reflection

**Cut entirely:** Featured Screens placeholder (pre-problem position), Atmospheric photo placeholder, Research section label (absorb content into Problem), Wireframe ideation placeholder grid, System overview placeholder, In-context photo placeholder.

### Content plan

**Approach section — pull from IA diagram + Decision Showcase:**

The IA diagram is genuinely strong. It is a complete information architecture rendered in code-drawn SVG. It communicates the product's structural bet (map as persistent base layer, everything else slides up over it) without requiring a screen. Position it as the anchor for the Approach section.

Caption for the IA diagram (currently: "The map is the only true home screen. Sheets slide up over it. Notifications auto-trigger the relevant event sheet."):
Keep this. It's the right level of specificity.

The three Decision Showcase sections (Map as home / Scan a flyer / Directions exit) currently each have a placeholder screen and strong decision copy. The copy does not need rewriting. The structure (decision label, decision name, decision rationale, tradeoff) is exactly right. When screens arrive, drop them in. Until then, the three text-only blocks are more honest than three placeholder boxes.

One flag in the Decision Showcase text:

now-here.html: "The bet is that the spontaneous user is a much larger segment, and that intent-driven users adapt quickly."

"The bet is that" is appropriately hedged for a concept project. Keep.

---

## Soundmap — Map-based music discovery

### Audit against target structure

| Target section | Current state | Status |
|---|---|---|
| Hero | Present, placeholder image | Needs real image |
| Meta block | 4-col | ✓ Keep |
| Overview | 2 short paragraphs | Needs third sentence |
| Key metrics | None | Omit. Concept project. |
| Problem framing | "The Idea" section with compare cards | ✓ Good structure |
| Approach | "The Interaction" (Preview/Live) | ✓ Best section |
| Selected work | All placeholders | Critical gap |
| Reflection | Missing entirely | Must add |

### What's weak

**Three overlapping placeholder sections:** Map Overview (section 6), The System (section 9), and Movement (section 10) are all placeholder boxes doing similar work (showing the product in context at a city/map scale). Collapse to one section: "The Product," which holds the Bushwick vs SoHo comparison and the map overview visual. All three become one visual block.

**Decisions section (section 10) buried after three placeholders:** The four named decisions (Soft unlock, Neighborhood-level, Contextual pins, Hybrid signals) are the strongest structured content on the page. Currently they appear after Map Overview, Neighborhoods, The System, and Movement. Move them to position 5, before the visual work. Let the decisions frame what the visuals are going to show.

**Neighborhoods section:** Bushwick and SoHo with full artist lists and placeholder screens. The artist specificity (Geese, MJ Lenderman, Waxahatchee, Fred again.., The Strokes) is the most credible signal on the page. For a music industry audience, naming specific artists in specific neighborhoods is the evidence that this product idea is informed by real scene knowledge. Do not cut this section. When screens arrive, this is the section that will most differentiate the page.

**"Closing" section** (the final three-bullet section):
> - spatial instead of feed-based
> - contextual instead of purely personalized
> - exploratory instead of optimized

Three parallel fragments with no elaboration. This should be the Reflection section. Replace with a proper paragraph.

**Scope section (Included/Excluded):** This is good and should stay. It signals prioritization. Position it after the Decisions section.

### Proposed new section order

1. Hero
2. Meta block
3. Overview (add one sentence on the design challenge)
4. Problem framing ("The Idea" — the two-question compare)
5. Key decisions (the four named decisions, move from position 10)
6. The Interaction (Preview/Live mechanic, keep as-is)
7. The Product (collapse Map Overview + Neighborhoods + System + Movement into one section)
8. Scope (Included/Excluded)
9. Reflection (replace "Closing" with a proper section)

### Content plan

**Overview — add third sentence:**

Current:
> Soundmap is a map-based music experience that treats place as the primary interface for discovery. Instead of browsing playlists, you explore neighborhoods.

Draft addition:
> Soundmap is a map-based music experience that treats place as the primary interface for discovery. Instead of browsing playlists, you explore neighborhoods. The design question was how to make location meaningful without making physical presence a hard requirement.

**Reflection — draft (replaces "Closing"):**
> The Preview/Live split was the right core mechanic. Defining where a neighborhood begins and ends turned out to be harder than expected. GPS coordinates are precise. Social context is not. I settled on loose polygon boundaries rather than exact location checks, which means arrival is approximate. That is more honest to how people actually experience neighborhoods than a hard coordinate boundary would be.
>
> The scope cut was the hardest decision. Routes, social graph, and listening history all felt like natural extensions. I cut them because Soundmap's value is discovery in the moment. Adding persistence and social features pulls the product toward a different use case. The version that does one thing is more useful than the version that tries to do five.
>
> What I want to prove next is whether the Preview/Live mechanic actually changes behavior. The hypothesis is that a constrained preview creates motivation to show up. Whether it drives physical movement is an empirical question a live test would answer.

---

## Orbit — Interactive wall speaker, CMU 2021

### Audit against target structure

| Target section | Current state | Status |
|---|---|---|
| Hero | Present, hero GIF | ✓ Keep |
| Meta block | 4-col: Role / Collaborators / Year / Tools | ✓ Keep |
| Overview | 2 paragraphs | Needs rewrite |
| Key metrics | None | Omit. Class project. |
| Problem framing | Implicit in Overview | Extract |
| Approach | Implicit in Walkthrough | Extract |
| Selected work | Walkthrough + Visual System + Physical Form | ✓ Strong assets |
| Reflection | Missing | Must add |

### What's weak

**Overview paragraph 2 (orbit.html:455-456):**
> "The project began with a question: how might we preserve close relationships impacted by a lack of in-person interaction? With distance a persistent reality for many friendships, we wanted to design something that made the emotional texture of a relationship visible and lasting."

Three problems: "How might we" is design-school framing. "We wanted to design" is vague. "Impacted by a lack of in-person interaction" is clunky.

**Experience Walkthrough — framed as a product tour:**
The walkthrough describes what the product does ("one person shares a song, the other reacts with an emotion") rather than what design decisions were made. The visual assets (journey map, 6 slides, Spotify UI slides) are strong. They need decision framing, not a tour.

**"Emotions made visible" section label:** Good section, weak label. The content is about encoding emotional states into a light animation system. The label doesn't say why that decision was made.

**Visual System section — no rationale:**
> "Over time, the accumulated reactions build a visual history of the relationship: which songs moved you, when, and how."

This is good product framing but it's in the wrong section. It should be in the Approach section as the central design idea, not in the Visual System section as a description.

**No Reflection section.** Orbit has the best visual coverage in the portfolio. It has no reflection. That means it reads as a showcase, not a case study.

### Proposed new section order

1. Hero — keep as-is
2. Meta block — keep, note collaborators explicitly ("Dorcas Lin, Franklin Guttman")
3. Overview — rewrite, tighten, separate from problem framing
4. Problem framing — extract from Overview, name the design challenge
5. Approach — pull from Walkthrough: 3 design decisions (emotional encoding, Spotify as music layer, physical artifact as record)
6. Selected work — demo video, emotion GIFs, physical form photos, Spotify UI slides (keep existing assets)
7. Systems Diagram — keep, move after Selected Work
8. Reflection — new section, draft below

### Content plan

**Overview — current copy (orbit.html:454-456):**
> "Orbit is an interactive wall speaker for two people to connect and bond over music: discovering songs together, sharing reactions, and building a physical record of the relationship over time."

First sentence is fine. Keep it.

> "The project began with a question: how might we preserve close relationships impacted by a lack of in-person interaction? With distance a persistent reality for many friendships, we wanted to design something that made the emotional texture of a relationship visible and lasting. A shared artifact that accumulates meaning as the relationship does."

**Draft replacement for paragraph 2:**
> The question was how to make shared music feel present between two people in different places. Most existing approaches (shared playlists, tagged songs, music reactions in chat) produce artifacts that are passive. Orbit was designed to feel like something actively happening, with a physical record that accumulates as the relationship does.

**Problem framing — draft (new section):**
> Every music sharing mechanism already existed: texting a song, adding to a shared playlist, using Spotify's friend activity feed. None of them felt significant. The problem was not discovery or distribution. It was presence and weight. How do you make sharing a song between two specific people feel different from every other way music travels on the internet?

**Approach — pull from Walkthrough and reframe as decisions:**

*Decision 1: Emotional encoding as the core mechanic*
Current Walkthrough copy describes the experience. Reframe as a decision:
> I chose to encode emotional reactions rather than text or emoji. Text is already everywhere. An emoji attached to a song adds noise. A distinct visual state, a light animation that runs on a physical speaker in your home, creates a different kind of signal. The output is ambient and persistent. You do not have to open an app to see that someone responded.

*Decision 2: Spotify as the music layer*
Current section (orbit.html:511-514) describes the integration without framing why. Add:
> Orbit uses Spotify as the music source rather than building a separate catalog. The decision kept the product focused on the sharing and reaction layer. It also meant every song shared through Orbit was a song the sender already knew and chose, from their existing listening context. The music is personal before it is shared.

*Decision 3: Physical form as the output*
> The speaker sits on a wall and displays the accumulated light record passively. It is not a screen you open. It is an object that changes over time. The choice of a physical artifact rather than a digital feed was intentional: feeds disappear, screens require attention, objects persist.

**Reflection — draft (new section):**
> Working on a collaborative project with two others clarified something about design ownership. I took the lead on the emotional encoding system and the physical form design. I was less involved in the Spotify integration engineering. That division worked for building the prototype. If I were presenting this as sole work I would not. What this project actually shows is a specific range: physical computing, emotional design systems, and music as a medium. That range is real regardless of what is on the collaboration line.
>
> The biggest gap is feedback loop. Orbit is a physical object that sits on your wall, but we never tested it with two people in different cities over an extended period of time. We tested it as a demo. The experience of a relationship accumulating on a speaker over months is the actual thesis of the product. We built the proof of concept and not the longitudinal experience. That would be the next test.

---

## HP Sustainability Experience — CMU 2020

### Audit against target structure

| Target section | Current state | Status |
|---|---|---|
| Hero | Present | ✓ Keep |
| Meta block | 4-col: Role / Collaborator / Year / Tools | ✓ Keep |
| Overview | 2-3 paragraphs | Needs one rewrite |
| Key metrics | None | Omit. Class project. |
| Problem framing | "Key Insights" section, 3 cells | ✓ Good, rename |
| Approach | "Process" section | ✓ Keep, rename |
| Selected work | "Experience Walkthrough" 5 steps | ✓ Good |
| Reflection | 4 paragraphs | ✓ Keep, fix inline styles |

### What's weak

HP is the closest to the target structure of any case study on the site. The main issues are labeling, one copy problem in the Overview, and inline styles in the Reflection section.

**Overview paragraph 3 (hp.html:369):**
> "Two research questions drove the response: how do you remind people to think about sustainability when buying technology, and how do you connect a brand's existing environmental work to its public identity?"

"Two research questions drove the response" is process framing. Research questions come from a design brief, not from a case study. Rewrite to frame this as the design challenge, not the research process.

Draft replacement:
> The design challenge had two parts: making HP's sustainability work visible without making it feel like advertising, and creating a moment that implicates the visitor rather than lectures them. A room full of plants that react to your camera does both.

**"Key Insights" section label:** This is the problem framing section. Rename to "Problem framing" or "The brief" for consistency with the target structure.

**"Process" section label:** This is the Approach section. Rename.

**Reflection inline styles (hp.html:564-569):** Four paragraphs use inline `style="margin-top: 24px; font-size: 14px; line-height: 1.7;"`. These should be classes. Low priority for content but creates maintenance debt.

**Dark CTA at end links back to Orbit, which links back to HP.** This is a circular loop. One of them should break to Now Here or ACS. Recommend HP dark CTA → Now Here, Orbit dark CTA → Soundmap. Both of those redirects improve music industry coherence.

### Proposed new section order

HP's current order is already correct. Changes are labeling and one copy rewrite:

1. Hero — keep
2. Meta block — keep
3. Overview — rewrite paragraph 3
4. Problem framing — rename "Key Insights"
5. Selected work — keep "Experience Walkthrough" label (it's specific enough)
6. Approach — rename "Process"
7. Reflection — keep, fix inline styles

---

## Cross-cutting flags

### Em dashes to replace across all pages

The following are prose em dashes (not in CSS comments or code). Each needs to become a period or comma:

**acs.html:**
- Line ~340: "I held the line on purpose-specific composites: CallComposite, CallWithChatComposite, each with a clear, low-friction entry point. The decision created real platform tension as scenarios multiplied, but kept the developer experience honest" — the "but" construction is fine, the em dash before "a team could get..." is in a separate sentence, check on revision.
- Line ~440: "not as a visual flourish but because" — remove the em dash in the surrounding sentence
- Line ~502: `<small>Color approach (left) vs. opacity model (right) — both shown on a dark customer-branded background...` — replace with comma
- Line ~515: `<small>RTT across Web, iOS, and Android — same interaction model...` — replace with comma
- Line ~535: "Speaker by speaker, as Azure AI Speech completes its attribution pass. Users have something real to read immediately" — no em dash here, good
- Line ~582: `<small>Consent dialog with capability gating — controls disabled until...` — replace with comma

**collective-iq.html:**
- Line 467: "first-class states — not absence of action, but recorded decisions with timestamps and SharePoint links" — replace with period: "...first-class states. They are recorded decisions with timestamps and SharePoint links, not the absence of action."
- Line 505: "led to adding explicit messaging about external participants and org relevance" — no em dash issue here
- Line 541: "is noise — there's no way to get oriented at a glance" — replace: "is noise. There is no way to get oriented at a glance"
- Line 569: "partially resolved — chat card as action trigger" — replace: "partially resolved. The chat card remained the action trigger"
- Line 573: "reviewing the content before it goes org-wide" — no em dash here
- Line 600: "isn't friction — it's the trust model made visible" — this is the strongest line in the portfolio. Replace with period: "A mandatory review moment before an irreversible decision is not friction. It is the trust model made visible."
- Line 647: "Everyone, Select users, Decline — with a 'Share with:' label" — replace with comma
- Line 652: "document governance — without requiring a redesign" — replace: "document governance, without requiring a redesign of Teams native surfaces."
- Line 663: "50,000 users — a milestone on the path toward" — replace with comma or period

**now-here.html:**
- Line 628: "it leaves an entire mode of being completely unserved: the spontaneous mode. Already out. No fixed plan." — no em dash here, good
- Line 635: "awareness after the moment has passed — or never at all" — replace: "awareness after the moment has passed. Or never."
- Line 655: "Who feels this — and how." — replace: "Who feels this, and how."
- Line 656: "built workarounds — newsletters, artist alerts, weekly routines" — replace with comma
- Line 657: "Current state — Jordan's experience before Now Here" — replace with hyphen-space: "Current state - Jordan's experience before Now Here"
- Line 780: "no intent yet — they have a location" — replace: "no intent yet. They have a location."
- Line 791: "data quality — bad scans become bad data" — replace with colon: "data quality: bad scans become bad data."
- Line 815: "genuinely difficult. Now Here aggregates..." — no em dash, good
- Line 884: "too many fields. But the deeper friction was" — no em dash, good
- Line 885: "already out, open to anything, right now — made every product decision easier" — replace with comma
- Line 886: "the strategic and competitive analysis, the validation plan — is available on request" — replace: "the strategic and competitive analysis, and the validation plan, is available on request."

**soundmap.html:**
- Audit when HTML is opened for edits

### "Not X but Y" constructions to replace

- `collective-iq.html:467` — "not absence of action, but recorded decisions" — replace: "They are recorded decisions with timestamps and SharePoint links."
- `collective-iq.html:517` — "not just a single template" — replace: "needed to be state-aware rather than a single template."
- `collective-iq.html:600` — "isn't friction — it's the trust model made visible" — see em dash flag above
- `acs.html:440` — "not as a visual flourish but because" — replace: "The live preview existed because most developers arriving at the builder could not visualize the output from a form alone."
- `soundmap.html:638` — "not just preference" — replace: "The system adapts to context. Not only to preference."

### Section label format fixes

Eyebrow lines and institution references should use regular hyphen with spaces throughout.

Current formats across the site include:
- "Carnegie Mellon University · Bachelor of Design" (uses middle dot, fine for eyebrow)
- "Microsoft · Collective IQ · Microsoft 365" (uses middle dot, fine for eyebrow)
- CV rows in about.html: "Design Lead, Collective IQ — Microsoft" (em dash, needs fix)
- Footer nav: plain text, fine

CV rows in about.html that use em dash:
- "Design Lead, Collective IQ — Microsoft" → "Design Lead, Collective IQ - Microsoft"
- "Product Lead, Web Experiences — Microsoft" → "Product Lead, Web Experiences - Microsoft"
- "Product Lead, UI Library — Microsoft" → "Product Lead, UI Library - Microsoft"
- "Studio Director — Nowhere Interesting" → "Studio Director - Nowhere Interesting"
- "Design / PM Intern — Microsoft" → "Design / PM Intern - Microsoft"
- "Teaching Assistant — Carnegie Mellon University" → "Teaching Assistant - Carnegie Mellon University"
- "Bachelor of Design, Hybrid Environments" (no dash needed here, fine)

---

## Implementation priority order

Based on effort-to-impact ratio for the music industry target:

1. **Now Here: remove placeholder sections, reorder.** No screens needed. Just cut the empty sections (Featured Screens pre-problem, Wireframe ideation, System overview placeholder, In-context photo placeholder) and reorder. This is pure HTML restructure, no new content. Estimated: 1-2 hours.

2. **ACS: add Reflection section.** Draft is above. Drop it in before the Dark CTA. Estimated: 30 minutes.

3. **Collective IQ: rewrite "My Role" opening, collapse phases to 3 named design moves.** The draft copy above replaces the passive framing. The phase collapse requires restructuring HTML but the copy exists in the current phases. Estimated: 2-3 hours.

4. **CMU Thesis: cut Methods section, collapse 4 process galleries to 1.** Mostly cuts, minimal new content. Change section label to first person. Estimated: 1-2 hours.

5. **HP: rename 2 sections, fix paragraph 3 of Overview, fix inline styles.** Minimal changes, high consistency return. Estimated: 30 minutes.

6. **Orbit: add Problem framing section, add Reflection section.** New content. Draft above. Estimated: 1 hour.

7. **Soundmap: reorder sections, add Reflection, condense placeholders.** Estimated: 1-2 hours. Screens remain a separate priority.

8. **All pages: em dash pass.** Mechanical find/replace on all flagged lines. Estimated: 1 hour.

9. **All pages: footer nav update.** Add soundmap.html to all footer navs, add now-here.html to orbit.html and hp.html. Estimated: 20 minutes.
