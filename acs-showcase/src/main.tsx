import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerIcons } from '@fluentui/react';
import { DEFAULT_COMPONENT_ICONS } from '@azure/communication-react';
import { App } from './App';
import { DemoPage } from './DemoPage';
import './index.css';

// The UI Library components draw from the Fluent icon registry. The composites do
// this for you; when you assemble from the components you have to do it yourself.
// The chevrons and checkmark (split-button caret, submenu arrows, the selected
// device tick) and PeopleAdd (our system message) live in the MDL2 font set
// rather than in DEFAULT_COMPONENT_ICONS, and initializing that set would pull an
// icon font off a CDN — so they are supplied inline instead.
registerIcons({
  icons: {
    ...DEFAULT_COMPONENT_ICONS,
    ChevronDown: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
        <path d="M2.22 4.22a.75.75 0 0 1 1.06 0L6 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.53 8.53a.75.75 0 0 1-1.06 0L2.22 5.28a.75.75 0 0 1 0-1.06Z" fill="currentColor" />
      </svg>
    ),
    ChevronRight: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
        <path d="M4.22 2.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06L6.94 6 4.22 3.28a.75.75 0 0 1 0-1.06Z" fill="currentColor" />
      </svg>
    ),
    ChevronUp: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
        <path d="M5.47 3.47a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 1 1-1.06 1.06L6 5.06 3.28 7.78a.75.75 0 0 1-1.06-1.06l3.25-3.25Z" fill="currentColor" />
      </svg>
    ),
    Cancel: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
        <path d="M2.72 2.72a.75.75 0 0 1 1.06 0L6 4.94l2.22-2.22a.75.75 0 1 1 1.06 1.06L7.06 6l2.22 2.22a.75.75 0 1 1-1.06 1.06L6 7.06 3.78 9.28a.75.75 0 0 1-1.06-1.06L4.94 6 2.72 3.78a.75.75 0 0 1 0-1.06Z" fill="currentColor" />
      </svg>
    ),
    Checkmark: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
        <path d="M10.28 3.22a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 0 1-1.06 0L1.72 6.78a.75.75 0 0 1 1.06-1.06l1.97 1.97 4.47-4.47a.75.75 0 0 1 1.06 0Z" fill="currentColor" />
      </svg>
    ),
    PeopleAdd: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
        <path
          d="M8 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 7c2.5 0 4.5.9 4.5 2.5v1.25a.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V12.5C3.5 10.9 5.5 10 8 10Zm7.5-4a.6.6 0 0 1 .6.6V8h1.4a.6.6 0 0 1 0 1.2h-1.4v1.4a.6.6 0 0 1-1.2 0V9.2h-1.4a.6.6 0 0 1 0-1.2h1.4V6.6a.6.6 0 0 1 .6-.6Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
});

// One bundle serves both the full call surface and the single-component demos,
// so a page embedding several of them downloads the library once.
const component = new URLSearchParams(window.location.search).get('component');

createRoot(document.getElementById('root')!).render(
  <StrictMode>{component ? <DemoPage slug={component} /> : <App />}</StrictMode>
);
