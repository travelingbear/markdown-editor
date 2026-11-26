import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inlineImports } from '../../scripts/css-order.mjs';

/**
 * The Retro theme has to win against feature stylesheets without `!important`.
 *
 * Features load on first use, so at runtime they arrive AFTER the theme and
 * would outrank it at equal specificity. `StyleManager.moveThemeLast()` puts
 * the theme back in front; these tests load the real stylesheets in that order
 * and check which rule actually wins.
 *
 * jsdom has no layout engine, but it does resolve the cascade, which is all
 * this needs. Custom properties come back unresolved, and that is useful here:
 * a value of `var(--win-…)` is proof the Retro rule won rather than the
 * feature rule's literal.
 */

const root = resolve(__dirname, '..', '..');
const load = (file) => inlineImports(resolve(root, file));

function addSheet(css, marker) {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute(marker[0], marker[1]);
  document.head.appendChild(style);
  return style;
}

beforeAll(() => {
  document.head.innerHTML = '';
  // Production order: base first, then features as they load on demand.
  addSheet(load('src/styles.css'), ['data-base', 'true']);
  addSheet(load('src/styles/features/settings-modal.css'), ['data-feature', 'settings-modal']);
  addSheet(load('src/styles/features/markdown-toolbar.css'), ['data-feature', 'markdown-toolbar']);
  addSheet(load('src/styles/features/tab-system.css'), ['data-feature', 'tab-system']);
  // The theme arrived first in reality; moveThemeLast() is what puts it here.
  addSheet(load('src/styles/themes/retro.css'), ['data-theme', 'retro']);

  document.body.className = 'retro-theme';
});

function styleOf(html) {
  document.body.querySelectorAll('.probe-host').forEach((n) => n.remove());
  const host = document.createElement('div');
  host.className = 'probe-host';
  host.innerHTML = html;
  document.body.appendChild(host);
  return getComputedStyle(host.firstElementChild);
}

describe('Retro wins over feature stylesheets', () => {
  it('a settings button keeps the theme background, not the feature one', () => {
    const style = styleOf('<button class="setting-btn">A4</button>');
    // settings-modal.css sets `background: var(--bg-secondary)` at lower
    // specificity; Retro sets the face colour and must win on order alone.
    expect(style.background || style.backgroundColor).toContain('--win-');
  });

  it('a settings button takes its radius from the token, not a literal', () => {
    // The base and feature stylesheets must not hardcode a radius, or a theme
    // cannot square the interface without shadowing every rule again.
    const style = styleOf('<button class="setting-btn">A4</button>');
    expect(style.borderRadius).toContain('var(--radius-');
  });

  it('the theme squares the interface by redefining the radius tokens', () => {
    // jsdom does not resolve custom properties, so assert the mechanism: the
    // theme sets every radius token to zero, which is what replaced 44
    // `border-radius: 0` declarations.
    const theme = readFileSync(resolve(root, 'src/styles/themes/retro.css'), 'utf8');
    const zeroed = theme.match(/--radius-[\w-]+:\s*0\s*;/g) || [];
    expect(zeroed.length).toBe(11);
    expect(/border-radius\s*:/.test(theme.replace(/\/\*[\s\S]*?\*\//g, ''))).toBe(false);
  });

  it('the markdown toolbar takes its background from the theme', () => {
    const style = styleOf('<div class="markdown-toolbar"></div>');
    expect(style.background || style.backgroundColor).toContain('--win-');
  });

  it('a status bar button takes its background from the theme', () => {
    const style = styleOf('<button class="status-btn">Code</button>');
    expect(style.background || style.backgroundColor).toContain('--win-');
  });

  it('modal headers are the navy title bar', () => {
    const style = styleOf('<div class="settings-header"><h2>Settings</h2></div>');
    expect(style.background || style.backgroundColor).toContain('--win-navy');
  });
});

describe('Retro stylesheet hygiene', () => {
  const css = readFileSync(resolve(root, 'src/styles/themes/retro.css'), 'utf8');

  it('draws no bevel with border-style outset or inset', () => {
    // Their light and dark sides are derived by an implementation-defined
    // algorithm, so they are not guaranteed to match across the engines the
    // application ships on.
    expect(/border[a-z-]*:[^;]*\b(outset|inset)\b/.test(css)).toBe(false);
  });

  it('never declares box-shadow twice in one rule', () => {
    // The second silently wins and the bevel disappears with nothing to show
    // for it. Seventeen rules were in this state during the conversion.
    const offenders = [];
    for (const match of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
      if ((match[2].match(/box-shadow\s*:/g) || []).length > 1) {
        offenders.push(match[1].trim().split('\n').pop());
      }
    }
    expect(offenders).toEqual([]);
  });
});
