import type { VideoGalleryRemoteParticipant } from '@azure/communication-react';

/**
 * Fabricated participants. Nothing here talks to Azure Communication Services —
 * this is seed data shaped like what the CallClient would hand the VideoGallery.
 */
export interface SeedParticipant {
  userId: string;
  displayName: string;
  isMuted: boolean;
  isSpeaking: boolean;
  cameraOn: boolean;
  /** Background used for the fake "camera feed" placeholder. */
  hue: number;
}

export const SEED_PARTICIPANTS: SeedParticipant[] = [
  { userId: 'p-nadia', displayName: 'Nadia Okonkwo', isMuted: false, isSpeaking: true, cameraOn: true, hue: 210 },
  { userId: 'p-priya', displayName: 'Priya Raman', isMuted: false, isSpeaking: false, cameraOn: true, hue: 276 },
  { userId: 'p-marco', displayName: 'Marco Bellini', isMuted: true, isSpeaking: false, cameraOn: false, hue: 12 },
  { userId: 'p-jules', displayName: 'Jules Vermeer', isMuted: false, isSpeaking: false, cameraOn: true, hue: 158 },
  { userId: 'p-sam', displayName: 'Sam Whitfield', isMuted: true, isSpeaking: false, cameraOn: false, hue: 42 },
  { userId: 'p-hana', displayName: 'Hana Sato', isMuted: true, isSpeaking: false, cameraOn: false, hue: 320 },
];

export const LOCAL_USER_ID = 'local-tay';
export const LOCAL_DISPLAY_NAME = 'Tay Aras';

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

/**
 * Builds a detached container holding an inline SVG image. The UI Library treats
 * `renderElement` as the container the SDK returns and skips any element with no
 * children, so the image is wrapped in a host div. This placeholder stands in for
 * the frames a real remote stream would produce.
 */
const buildFakeFeed = (participant: SeedParticipant, isDark: boolean): HTMLDivElement => {
  const { hue } = participant;
  const light = isDark ? 22 : 88;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180" role="img" aria-label="Simulated video feed for ${participant.displayName}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue} 46% ${light}%)"/>
        <stop offset="100%" stop-color="hsl(${(hue + 38) % 360} 44% ${light - 14}%)"/>
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#g)"/>
    <circle cx="160" cy="78" r="34" fill="hsl(${hue} 32% ${isDark ? 34 : 74}%)"/>
    <text x="160" y="90" text-anchor="middle" font-family="Segoe UI, system-ui, sans-serif"
      font-size="30" font-weight="600" fill="hsl(${hue} 40% ${isDark ? 88 : 26}%)">${initialsOf(participant.displayName)}</text>
    <rect x="0" y="136" width="320" height="44" fill="hsl(${hue} 30% ${isDark ? 16 : 80}%)" opacity="0.55"/>
  </svg>`;

  const img = new Image();
  img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  img.alt = '';
  img.setAttribute('aria-hidden', 'true');
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  img.style.borderRadius = '0.25rem';

  const host = document.createElement('div');
  host.style.width = '100%';
  host.style.height = '100%';
  host.appendChild(img);
  return host;
};

export const buildRemoteParticipants = (
  seeds: SeedParticipant[],
  isDark: boolean
): VideoGalleryRemoteParticipant[] =>
  seeds.map((seed) => ({
    userId: seed.userId,
    displayName: seed.displayName,
    isMuted: seed.isMuted,
    isSpeaking: seed.isSpeaking,
    videoStream: seed.cameraOn
      ? {
          id: 1,
          isAvailable: true,
          isReceiving: true,
          isMirrored: false,
          renderElement: buildFakeFeed(seed, isDark),
        }
      : { isAvailable: false },
  }));
