# ACS UI Library — Call & Chat Showcase

A single-page, **non-functional** showcase of a full Azure Communication Services
calling-and-chat experience, assembled from the UI Library's individual
components — `VideoGallery`, `MessageThread`, `SendBox`, `TypingIndicator`,
`ControlBar` and the control buttons — rather than from the composites
(`CallComposite`, `CallWithChatComposite`) and without hand-rolled recreations.

It deploys as static files on its own and embeds in a portfolio page via an
iframe.

## What is real and what is not

| | |
| --- | --- |
| **Real** | The camera button. It calls `navigator.mediaDevices.getUserMedia({ video: true })` and renders your live webcam in the local self-tile. |
| **Real** | The device dropdowns. They populate from `navigator.mediaDevices.enumerateDevices()`, and picking a different camera re-acquires the stream with that `deviceId`. |
| **Real** | The send box. Typed messages are appended to local React state and appear in the thread. |
| **Real** | The light/dark toggle, which swaps the theme passed to `FluentThemeProvider`. |
| **Real** | The Real-Time Text interaction, through the library's own `CaptionsBanner`, `StartRealTimeTextButton` and `RealTimeTextModal`. The other participants' lines are seeded and type themselves in; the consent flow is the shipped one, and what you type in the banner really lands there. |
| **Not real** | The remote participants and the seeded conversation. Both are static fixtures. |
| **Not real** | The microphone and screen-share buttons. They toggle visual state only — no audio is captured. |
| **Not real** | Everything to do with Azure. There is no ACS connection, no adapter, no access token, no backend, and no call. Camera frames never leave the browser. |

## Install

```bash
npm install
```

The UI Library's peer dependencies are pinned to versions
`@azure/communication-react@1.34.0` expects, so a plain `npm install` resolves
without `--legacy-peer-deps`:

- `@azure/communication-calling@1.40.1`
- `@azure/communication-calling-effects@1.3.2`
- `@azure/communication-chat@1.6.0`
- `@azure/communication-common@2.3.1`

React is pinned to 18.3.1 for the same reason — `@azure/communication-react` 1.34
declares `react: >=16.8.0 <19.0.0` and will not install against React 19.

## Dev

```bash
npm run dev
```

Vite serves on `http://localhost:5173`. `getUserMedia` requires a secure context;
`localhost` counts as one, so the camera works in dev without HTTPS.

## Build

```bash
npm run build     # type-checks, then emits static files to ../acs-demo/
npm run preview   # serves the built output locally
```

`outDir` is `../acs-demo`, so the build lands directly in the portfolio site's
tree and GitHub Pages serves it at `/acs-demo/` — the same origin as
`ui-library.html`, which iframes it. `acs-demo/` is committed; `acs-showcase/`
is the source beside it.

`base` is `'./'`, so the output can also be dropped at any path on any static
host and the asset URLs still resolve.

## Single-component demos

The same build also serves one component at a time, addressed by a query param:

| URL | Component |
| --- | --- |
| `acs-demo/?component=video-gallery` | `VideoGallery`, with a layout switcher |
| `acs-demo/?component=control-bar` | `ControlBar` across all ten preset layouts, labelled or icon-only |
| `acs-demo/?component=message-thread` | `MessageThread` |
| `acs-demo/?component=send-box` | `SendBox` + `TypingIndicator` |
| `acs-demo/?component=participant-list` | `ParticipantList`, with a working per-participant menu |
| `acs-demo/?component=device-buttons` | `CameraButton` / `MicrophoneButton` split buttons + `DevicesButton` |
| `acs-demo/?component=rtt` | `RealTimeText` in the banner, with its consent modal |

`main.tsx` reads `?component=` and renders `DemoPage` instead of `App`. One
bundle serves both, so a page embedding all six downloads the library once and
every frame after the first comes from cache. Add a demo by appending to
`DEMOS` in `src/demos/registry.tsx` — nothing else needs to change.

## Where it is embedded

`ui-library.html`, §03 System, which walks the customization ladder top to
bottom: the ladder itself, then the composite tier as one live call surface,
then the seven components you would assemble it from. Each component is its own
`.proj-row` — text in the left rail, its frame in the right — sized by a
`--frame-h` custom property, because one flat height left the short ones
floating in empty space. `project.css` carries `.proj-embed` and
`.proj-demo-frame`; `project.js` §3 carries the theme bridge described below,
which drives all eight frames.

The portfolio's own theme is dark by default and the iframe cannot inherit
`data-theme` through CSS, so the host hands the theme across in two ways:

- **First paint** — `project.js` rewrites the iframe `src` to
  `acs-demo/?theme=dark|light` before the lazy frame loads. `App.tsx` reads that
  query param for its initial state, falling back to `prefers-color-scheme` for
  anyone opening the demo directly.
- **Afterwards** — a `MutationObserver` on `data-theme` posts
  `{ source: 'tay-theme', theme }` into the frame. The app only accepts
  same-origin messages, so an arbitrary embedder cannot drive it.

Compressed view (the guitar-string state) hides the figure through the existing
`body.proj-collapsed .proj-sec > *:not(.proj-sec-title)` rule — no new rule
needed — and `loading="lazy"` means the 1.1MB bundle is not fetched until the
reader actually scrolls to it.

## Embedding

**The embedding iframe must carry `allow="camera; microphone"`.** Without it the
browser blocks `getUserMedia` inside the frame, the camera button fails with a
`NotAllowedError`, and the visitor sees the "Camera blocked" tile instead of
their webcam. Permissions Policy does not inherit into a cross-origin frame by
default.

```html
<iframe
  src="https://your-host.example/acs-showcase/"
  title="ACS UI Library call and chat showcase"
  allow="camera; microphone"
  style="width: 100%; aspect-ratio: 16 / 10; border: 0;"
></iframe>
```

The page still works without the attribute — the gallery, chat, theming and
every other control behave normally. Only the live self-view is lost.

## Accessibility and responsiveness

- Focus is visible on every interactive element in both themes; it is restyled,
  never removed.
- `prefers-reduced-motion: reduce` collapses animation and transition durations.
- Below `48rem` the chat panel stacks under the video stage instead of squeezing
  it; below `26rem` the control-bar buttons drop their text labels and tighten so
  the bar fits a 320px viewport without horizontal scrolling.
- Camera failures are reported both in the local tile (short form) and in a
  wider notice above the control bar (the full explanation, including the iframe
  caveat above).

## Notes for anyone reading the source

Two things about assembling from components rather than composites are worth
knowing, because both fail silently:

1. **Icons are not registered for you.** The composites call `registerIcons`
   internally; components do not. `src/main.tsx` registers
   `DEFAULT_COMPONENT_ICONS` plus a handful of MDL2 icons the library reaches for
   (the split-button chevrons, the selected-device checkmark) as inline SVG —
   initializing the MDL2 font set would pull an icon font off a CDN.
2. **`renderElement` must be a container with children.** `LocalVideoTile` and
   `RemoteVideoTile` both skip a `renderElement` whose `childElementCount` is 0,
   because the real calling SDK returns a wrapper div around the video. A bare
   `<video>` or `<img>` renders as the avatar placeholder instead, with no error.
   Both the webcam element and the fabricated remote feeds are wrapped
   accordingly.

## Layout

```
src/
  main.tsx                  entry point, icon registration
  App.tsx                   layout, state, ControlBar
  index.css                 app chrome, responsive rules, focus, reduced motion
  DemoPage.tsx              chrome for one component on its own
  demos/registry.tsx        the single-component demos and their seed props
  components/ChatPanel.tsx  MessageThread + TypingIndicator + SendBox
  data/participants.ts      fabricated participants and their placeholder feeds
  data/messages.ts          seeded conversation
  hooks/useLocalCamera.ts   getUserMedia lifecycle for the self-tile
  hooks/useMediaDevices.ts  enumerateDevices for the device pickers
  hooks/useMediaQuery.ts    breakpoint state for props (not just styles)
  hooks/useHostTheme.ts     ?theme= plus the host's postMessage theme bridge
  hooks/useRealTimeTextFeed.ts  replays the seeded RTT, a character at a time
```



## Video effects, and why there are none

Worth knowing if you go looking. `CaptionsBanner`, `CaptionsSettingsModal`,
`RealTimeText`, `RealTimeTextModal`, `StartCaptionsButton` and
`StartRealTimeTextButton` are all **public**. RTT uses the real ones.

Live captions were built and then taken back out: the only browser-native path
is `SpeechRecognition`, which is absent in Firefox, unreliable in Safari, inert
in Chromium builds without Google's API key (it accepts `start()` and emits no
events at all, not even an error), and it streams microphone audio to the
browser vendor. Too shaky to stand in a portfolio page.

The **video effects picker is not**. `VideoBackgroundEffectsPicker` and
`VideoEffectsItem` live only under `dist-esm`; the only public export is
`onResolveVideoEffectDependency`, which hands
`@azure/communication-calling-effects` to a `LocalVideoStream` that exists only
inside a connected call. There is no way to show real ACS background blur
without a token, so this app does not have background effects at all.
