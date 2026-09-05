import { FluentThemeProvider, darkTheme, lightTheme } from '@azure/communication-react';
import { useHostTheme } from './hooks/useHostTheme';
import { DEMOS, findDemo } from './demos/registry';

/**
 * One component on its own, addressed by ?component=<slug>. Each of these is
 * embedded in its own iframe on the case study page, so the chrome around the
 * component stays to a heading and whatever props that component can switch.
 */
export const DemoPage = ({ slug }: { slug: string | null }): JSX.Element => {
  const [isDark] = useHostTheme();
  const demo = findDemo(slug);
  // The embedding page labels each frame in its own left rail, so it asks for
  // the heading to come off rather than saying everything twice.
  const showChrome = new URLSearchParams(window.location.search).get('chrome') !== 'off';

  if (!demo) {
    return (
      <FluentThemeProvider fluentTheme={isDark ? darkTheme : lightTheme}>
        <div className={`demo ${isDark ? 'app--dark' : ''}`}>
          <h1 className="demo__name">Unknown component</h1>
          <p className="demo__note">
            Pick one of: {DEMOS.map((entry) => entry.slug).join(', ')}.
          </p>
        </div>
      </FluentThemeProvider>
    );
  }

  return (
    <FluentThemeProvider fluentTheme={isDark ? darkTheme : lightTheme}>
      <div className={`demo ${isDark ? 'app--dark' : ''}`}>
        {showChrome && (
          <header className="demo__head">
            <h1 className="demo__name">{demo.name}</h1>
            <p className="demo__note">{demo.note}</p>
          </header>
        )}
        <div className="demo__body">{demo.render(isDark)}</div>
      </div>
    </FluentThemeProvider>
  );
};
