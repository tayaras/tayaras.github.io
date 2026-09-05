import { useEffect, useState } from 'react';

const readInitialTheme = (): boolean => {
  const requested = new URLSearchParams(window.location.search).get('theme');
  if (requested === 'dark') {
    return true;
  }
  if (requested === 'light') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Every one of these pages can be embedded in a portfolio page whose own theme
 * is dark by default, so the first paint has to match: the host passes ?theme=
 * when it builds the iframe URL, then posts a message whenever it is toggled.
 * A visitor opening a page directly gets their system preference instead.
 */
export const useHostTheme = (): [boolean, (dark: boolean) => void] => {
  const [isDark, setIsDark] = useState(readInitialTheme);

  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      // Same-origin only — an arbitrary framer must not be able to drive this.
      if (event.origin !== window.location.origin) {
        return;
      }
      const data = event.data as { source?: string; theme?: string } | null;
      if (data?.source === 'tay-theme' && (data.theme === 'dark' || data.theme === 'light')) {
        setIsDark(data.theme === 'dark');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return [isDark, setIsDark];
};
