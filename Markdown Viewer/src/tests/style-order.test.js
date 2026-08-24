import { beforeEach, describe, expect, it } from 'vitest';

/**
 * Cascade position of the theme stylesheet.
 *
 * jsdom has no layout engine, but it does resolve the cascade: sheet order and
 * selector specificity both decide getComputedStyle here exactly as a browser
 * would. That makes this verifiable rather than a matter of opinion.
 */

// The module installs a singleton rather than exporting the class.
let manager;

beforeEach(async () => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  if (!manager) {
    await import('../core/StyleManager.js');
    manager = window.styleManager;
  }
});

/** A <link> cannot fetch in jsdom, so stand in with an inline sheet. */
function sheet(css, attribute, value) {
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute(attribute, value);
  document.head.appendChild(style);
  return style;
}

function orderOf() {
  return Array.from(document.head.children).map(
    (node) => node.getAttribute('data-theme') || node.getAttribute('data-feature')
  );
}

describe('theme stylesheet position', () => {
  it('a later sheet beats an earlier one at equal specificity', () => {
    // The premise the fix rests on. If this ever fails, the fix is pointless.
    sheet('.probe { color: rgb(1, 1, 1); }', 'data-theme', 'retro');
    sheet('.probe { color: rgb(2, 2, 2); }', 'data-feature', 'settings-modal');

    const el = document.createElement('div');
    el.className = 'probe';
    document.body.appendChild(el);

    expect(getComputedStyle(el).color).toBe('rgb(2, 2, 2)');
  });

  it('moveThemeLast puts the theme back in front of a feature sheet', () => {
    sheet('.probe { color: rgb(1, 1, 1); }', 'data-theme', 'retro');
    sheet('.probe { color: rgb(2, 2, 2); }', 'data-feature', 'settings-modal');

    const el = document.createElement('div');
    el.className = 'probe';
    document.body.appendChild(el);

    manager.moveThemeLast();

    expect(orderOf()).toEqual(['settings-modal', 'retro']);
    expect(getComputedStyle(el).color).toBe('rgb(1, 1, 1)');
  });

  it('keeps the theme last across several feature sheets', () => {
    sheet('.probe { color: rgb(1, 1, 1); }', 'data-theme', 'retro');

    for (const feature of ['markdown-toolbar', 'settings-modal', 'tab-system']) {
      sheet(`.probe { color: rgb(9, 9, 9); }`, 'data-feature', feature);
      manager.moveThemeLast();
    }

    expect(orderOf()).toEqual([
      'markdown-toolbar', 'settings-modal', 'tab-system', 'retro'
    ]);

    const el = document.createElement('div');
    el.className = 'probe';
    document.body.appendChild(el);
    expect(getComputedStyle(el).color).toBe('rgb(1, 1, 1)');
  });

  it('does nothing when no theme is loaded', () => {
    sheet('.probe { color: rgb(2, 2, 2); }', 'data-feature', 'settings-modal');

    manager.moveThemeLast();

    expect(orderOf()).toEqual(['settings-modal']);
  });

  it('still cannot save a theme rule of lower specificity', () => {
    // Order only settles ties. A feature rule that is more specific keeps
    // winning, which is why `!important` cannot be removed wholesale.
    sheet('.probe { color: rgb(1, 1, 1); }', 'data-theme', 'retro');
    sheet('div.probe.probe { color: rgb(2, 2, 2); }', 'data-feature', 'settings-modal');

    const el = document.createElement('div');
    el.className = 'probe';
    document.body.appendChild(el);

    manager.moveThemeLast();

    expect(getComputedStyle(el).color).toBe('rgb(2, 2, 2)');
  });
});
