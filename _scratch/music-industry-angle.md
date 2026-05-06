# Music Industry Angle

Target roles: Patreon, CD Baby, music ticketing (DICE, Songkick, Bandsintown), music hardware, music tech.

---

## Part 1: Reframings for existing case studies

Criteria for each: Does an honest thread exist, or would surfacing it be a stretch? Only the honest ones are included.

---

### ACS — Honest thread exists, currently invisible

**What the case study says now:** Developer platform for enterprise communication. Customers are healthcare companies, financial institutions, automotive, retail.

**The honest thread:** The exact design problem at the center of ACS — how do you build a component library that serves both developers who want low-friction integration and the end products they're building, each with their own brand and feature requirements — is the same problem facing any music platform that exposes an embedded communication layer. Patreon needs fan-to-creator calling. StageIt, Maestro, and Bandsintown Live all built calling or livestream layers on top of existing infrastructure. The "200+ businesses, each with different brand requirements, how prebuilt is prebuilt enough" question is not enterprise-specific. It is platform-infrastructure design.

The customization tension is also relevant to music hardware. A company building a speaker with a companion app faces the same API surface question: how much do you abstract, and at what cost to developer experience?

**What makes this honest:** The design principles are genuinely domain-agnostic. The failure mode I avoided (an API so flexible it requires weeks to implement) is the same failure mode a music company's SDK team would be navigating.

**What to add:** A single sentence in the Overview, and a callout in the Context section that names creator platforms alongside healthcare and finance as a customer type. Nothing invented. The same skills apply.

**Draft addition for Overview:**
> The same abstraction tradeoff shows up anywhere a platform embeds communication into a third-party product — telehealth, financial services, or a fan-to-artist video channel. The design problem is identical: how prebuilt is prebuilt enough?

**What not to claim:** Do not imply any actual music company was a customer or that I built for the music industry directly. That would be false. The reframe is about recognizing transferable domain structure, not asserting domain experience.

---

### CIQ — Honest thread exists, but it is narrow

**What the case study says now:** Enterprise AI product for Microsoft 365. Meeting summaries. Organizational trust.

**The honest thread:** The trust model at the center of CIQ — requiring a human review before an AI-generated document reaches a large audience irreversibly — is the same design problem any creator platform faces when introducing AI-generated content. An artist reviewing AI-generated liner notes before they publish to 50K fans has the same structure: AI output, one human decision point, irreversible distribution. The "preview before share" mechanic is domain-agnostic.

The stat card that says "50K+ user target" is also resonant in a creator economy context. That is the size of a mid-tier independent artist's fan base.

**What makes this honest:** The design reasoning around irreversibility and trust is genuinely applicable. It is not a stretch to say that any product where a creator decides what content reaches their audience has the same consent model.

**What is a stretch:** Calling CIQ a "creator economy" product would be false. The organizational knowledge domain is enterprise-specific. The reframe should be narrow: one sentence in the Reflection drawing the parallel, not a repositioning of the whole case study.

**Draft addition for Reflection:**
> The same trust problem appears anywhere a person makes an irreversible publishing decision about AI-generated content. The design solution is the same regardless of whether the audience is an organization of fifty thousand or a fan base of fifty thousand.

**Recommendation:** Add that sentence to the Reflection. Do not change the framing of the case study itself.

---

### Now Here — Already a music case study. Needs to claim it.

**What the case study says now:** "Location-first event discovery." The hero eyebrow reads "Concept project · Mobile · Location." The word "music" does not appear in the Overview. "Shows" appears once in the Problem section.

**The honest thread:** This is already a show discovery case study. The Problem section includes: "I go to over a hundred shows a year. I play in bands. I organize DIY events across Seattle, Chicago, and Pittsburgh." The data model Layer 02 (host submitted, blue pin) is specifically built for DIY show organizers. The flyer scan feature is specifically about show flyers. The Bandsintown integration is one of six named platforms. The product is built around a use case that is majority music.

**What to change:**

Hero eyebrow: Change "Concept project · Mobile · Location" to "Concept project · Mobile · Show discovery."

Overview: Add one sentence that names shows explicitly.

Current Overview:
> Existing event apps assume you already know what you're looking for. Now Here is built for the moment you don't...

**Draft addition to Overview:**
> Existing event apps assume you already know what you're looking for. Now Here is built for the moment you don't. It is most useful for finding shows — especially DIY and smaller venue events that never get indexed by the mainstream platforms.

Data model section: In Layer 02, add "DIY show organizers" to the source list more prominently. It is currently listed but not emphasized.

**What not to claim:** Do not imply Now Here has shipping screens (it does not) or that it solves the full show discovery problem (it is a concept). The honest version is: the problem is real, the design direction is informed by firsthand experience, the screens are in progress.

---

### Soundmap — Already a music case study. No reframe needed.

**What the case study says now:** Map-based music discovery concept. Music product through and through. Specific artist lists (Geese, MJ Lenderman, Waxahatchee, Fred again.., The Strokes). Specific neighborhood analysis (Bushwick vs. SoHo). Clear product thesis.

**What it needs:** Screens. Not a reframe.

**One thread to surface more explicitly:** The Decisions section names "Hybrid signals — user, curated, and behavioral" as one of four key decisions. This is directly the tension between algorithmic discovery (what Spotify does) and taste-led curation (what Pitchfork does). Soundmap's bet is that neither alone is sufficient for place-based identity. That argument would resonate with anyone at a streaming company thinking about discovery features. It is currently one line in a list. It should be framed as a product thesis.

**Draft expansion of that decision:**
> Hybrid signals. Relying entirely on user pins produces inconsistency — high-traffic places like SoHo flood with pins while quieter neighborhoods go silent. Relying entirely on editorial curation produces rigidity — the map reflects someone's taste, not the place. The hybrid approach (user-generated plus editorially weighted plus behavioral) is how the map stays alive across the full range of neighborhoods. It is the same tension between algorithm and editorial that every discovery product faces.

---

### Orbit — Honest thread exists. Currently undersells the music argument.

**What the case study says now:** "Interactive wall speaker for two people to connect and bond over music." Framed as a relationship product. "Growing Together." The music is described as a mechanism for connection, not the subject.

**The honest thread:** Orbit's core design thesis — that music sharing should be a durable artifact, not a stream — is a direct critique of how every major music platform currently works. Spotify, Apple Music, and every other streaming platform treat sharing as ephemeral: you send a song, the other person plays it, it is gone. Orbit proposes that shared music should accumulate weight over time, physically. That is a genuine product argument about what music means.

This is relevant to:
- Music hardware companies (the physical artifact thesis)
- Streaming platforms thinking about social/sharing features (the "sharing should have weight" thesis)
- Bandcamp (which already argues for ownership over streaming)

The Spotify integration decision is also specifically savvy: rather than building a competing catalog, Orbit uses Spotify as the music layer and adds the social and physical layer on top. That is exactly the kind of platform thinking a music tech product designer would be expected to have.

**What makes this honest:** This is the actual product argument of the project. It is already there. It is just labeled as a relationship product rather than a music product argument.

**What to change:** The Overview paragraph 2 and the Reflection (which does not currently exist) should name this argument explicitly. See case-study-plan.md for the draft Reflection.

**What not to claim:** Orbit was a class project with two collaborators. The collaboration is clearly disclosed. Do not imply it was a solo build.

---

### CMU Thesis and HP — No honest reframe for music.

The CMU thesis is about AR/XR tools. The HP project is about a sustainability brand activation. Neither has a thread that connects to music industry work without significant creative license. Leave both as they are. Their value is demonstrating range: physical computing, spatial interaction, research-driven design. That range is worth having, and music companies that build hardware or live experiences would find the physical computing credible. But the connection does not need to be stated explicitly — let the work speak for itself.

---

## Part 2: New case study proposals

Criteria: Problems you'd have firsthand context on from attending 100+ shows a year, playing in bands, and organizing DIY shows in Seattle, Chicago, and Pittsburgh.

---

### Proposal 1: The Door

**Subtitle:** Ticketing for shows that do not fit the platform model

**Problem statement:**

Every ticketing platform is built for the same customer: a professional promoter at a venue with a fixed address, a predictable capacity, stable ticket prices, and enough margin to justify a per-ticket fee. That is the right customer for Eventbrite, DICE, and Ticketmaster. It is the wrong customer for a DIY house show.

A DIY show has different constraints: the address is often withheld until the day of the show (fire code compliance, or the booker does not want strangers showing up at their house in advance). Capacity is 30-80 people, not 300. Ticket prices are $8-12. Cash at the door is normal. The promoter is often the same person collecting at the door. The show can be cancelled on two days' notice. And critically: fans who buy early are supporting the band, not just reserving a seat. The presale-versus-door mechanic is culturally meaningful in a way that an Eventbrite "early bird" discount is not.

No existing ticketing tool was built for this. Bands use Venmo links with a memo field, PayPal.me, Instagram DMs, or nothing at all and just say "cash at the door." The friction and loss are real: shows go over capacity, people who paid do not get in, organizers cannot track who is coming.

**Who the user is and what they are trying to do today:**

Two users:

*The organizer* is booking and promoting a show they put together themselves. They need to: set a headcount cap, take payment from fans who want to secure a spot, send the address the day-of, manage a guest list on their phone at the door, track what they took in to pay the bands correctly at the end of the night. Currently: a combination of Venmo, Notes, and a mental model. Settlement at 1am involves Venmo transaction histories and arithmetic.

*The fan* wants to support the band by buying in advance, confirm they have a spot, and find out where to go the day of the show. Currently: they DM the band, hope for a response, or just show up and risk not getting in.

**The angle or insight that makes it worth reading:**

The dominant design insight is that the "door" is not just a payment mechanism — it is a trust relationship between the organizer and the community they are building. The friction points in existing ticketing tools are not bugs. They are built for a different trust model: anonymous buyers, large capacities, professional promoters. Designing for DIY shows requires designing for a community trust model instead.

The product thesis: the gate between "I am interested" and "I have a spot" is the most important moment in a DIY show's life cycle, and it currently happens in the worst possible interface (a Venmo memo field).

Specific design problems this would resolve:
- Secret address reveal at day-of (push notification, not a static confirmation email)
- Guest list management at the door (phone-based, offline-capable)
- End-of-night settlement flow (how much did we take in, how do we split it between bands and expenses)
- The cultural mechanic of "presale vs. door" (presale is $8, door is $10 or "if there's room") — how do you build that mechanic into a product without making it feel like an Eventbrite feature?

**Why this is honest:**

You have organized DIY shows. You have been at the door collecting cash. You have settled up at 1am. You have had people DM you asking if there's room. You have the firsthand research material.

**Rough scope:**

4-6 weeks. Artifacts needed:
- Product brief (one page defining the user, the problem, the design bet)
- 2-3 quotes from organizers or fans captured in interviews
- Journey map or service blueprint for the current state (organizer view)
- 10-12 screens covering: create show (private address, capacity, price), share link, attendee confirmation with address reveal, door list on the night, end-of-night settlement
- Decisions doc or callout blocks (3-4 named decisions)

No need to design the full platform. Focus on one organizer's end-to-end for a single show.

---

### Proposal 2: Float

**Subtitle:** Fan membership for independent artists who are not brands

**Problem statement:**

Patreon was built on a model where the creator is a content producer and the fan is a subscriber to a content pipeline. That model works for YouTubers, podcasters, and writers. It works less well for bands. A band does not produce content on a schedule. A band plays shows, makes records, rehearses, tours, breaks up, gets back together, goes silent for six months, and then releases a song at 11pm on a Tuesday because that is when it felt right.

The artists who sustain themselves on fan support do not have a content calendar. They have a relationship with the people who care about their work. The product that serves that relationship does not exist. Patreon turns it into a subscription. Bandcamp turns it into a store. Neither one captures the feeling of being someone who actually supports a band — who shows up to the shows, who buys the record before it comes out, who feels like they are part of what makes it possible.

The design problem is not "how do you monetize a fan relationship." It is "what makes a fan feel like a supporter, not a subscriber."

**Who the user is and what they are trying to do today:**

Two users:

*The artist* is an independent musician with 500-5,000 committed fans and no label. They want to offer their fans a way to support the work and get something real in return. "Something real" might mean: hearing the record before it is out, a voice note about where a song came from, access to the ticket presale before the general public, an occasional behind-the-scenes update from the road. Currently: Patreon (but the content calendar model feels wrong), Bandcamp (transactional, not relational), newsletter (no payment layer), or nothing.

*The committed fan* already buys the records, goes to the shows, and follows the band's accounts. They want to give more and get closer. Not closer in a fan-club transactional way. Closer in a "I am one of the people who makes this possible" way. Currently: they buy merch, go to multiple shows on a tour, maybe Patreon if the band has one.

**The angle or insight that makes it worth reading:**

The key insight is about the difference between access and belonging. Patreon trades access for money: pay $5/month, get the bonus content. That is a subscription. Belonging is different. Belonging is: you knew about this before anyone else did. You were there when it was being made. Your name is in the thank-yous on the record sleeve.

The product design challenge is building an interaction model that generates belonging, not just access. This is not a new tier structure or a new pricing page. It is a fundamentally different way of thinking about what a music fan relationship is.

Specific design problems:
- The "inner circle" moment: how does a fan cross from casual listener to committed supporter in a way that feels meaningful?
- The release lifecycle from a fan's perspective: how does a supporter experience a record coming into existence, from first signal to release?
- The "I was there" artifact: what does a fan have after supporting an album that makes them feel like they were part of it?
- The communication model: how does the artist communicate with supporters in a way that feels like the band talking, not content being produced?

**Why this is honest:**

You play in bands. You have been on the artist side of the question "how do we let people support what we're doing without making it feel gross." You have been on the fan side of deciding to buy a record before it comes out on Bandcamp as a way of saying "I want this to exist." You have the emotional texture of this problem from both directions.

**Rough scope:**

6-8 weeks. Artifacts needed:
- Product brief
- Competitive landscape map (Patreon, Bandcamp memberships, Substack, Ko-fi, NSynth, Ghost — how each one frames the creator-fan relationship and where each falls short for musicians)
- 2-3 user archetypes (the committed fan who would pay $10/month; the artist with 2,000 listeners who makes records every 18 months; the casual fan who goes to one show a year)
- Core membership flow: discovery, on-ramp, the "inner circle" state, the record release lifecycle experience
- 12-15 screens
- Named decisions (3-4): the inner circle mechanic, the communication model, the release cycle interaction, what the fan "has" at the end

Note on naming: "Float" is a placeholder. The right name is part of the design.

---

## Which to build first

**The Door** (Proposal 1) is narrower, more actionable, and more directly demonstrable. The problem is concrete, the user journey is short enough to show end-to-end in 12 screens, and the firsthand research is real. For companies like DICE, Bandsintown, or Songkick, it signals direct familiarity with the DIY end of the market that their current products underserve.

**Float** (Proposal 2) is higher concept and more competitive (Patreon exists, CD Baby has thought about this, others have too). It requires a stronger product argument to differentiate from what already exists. The insight is real, but the case study would need to do more work to prove that the design direction is distinct from existing tools.

If time allows one: build The Door. If time allows both: build The Door first, Float second. The two together tell a clear story — you understand the DIY ecosystem from both the live show (The Door) and the recorded music / fan relationship (Float) perspectives.

---

## About page note

One quick change to consider that is not a new case study: the visible bio copy on about.html does not mention music. The guitar string interaction and the music easter eggs are present in the UI, but a hiring manager at a music company reading the bio will not see music mentioned. One sentence in the bio — something like "I play in bands and organize DIY shows in Seattle, Chicago, and Pittsburgh" — would make the personal context for Now Here and Soundmap immediately legible without requiring the reader to find the easter egg.
