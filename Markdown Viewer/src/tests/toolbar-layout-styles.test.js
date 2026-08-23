import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(process.cwd());

// Checked-in stylesheets use CRLF on Windows; normalize so multi-line
// selectors can be matched literally.
function readStyles(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8').replace(/\r\n/g, '\n');
}

const baseStyles = readStyles('src/styles.css');
const retroStyles = readStyles('src/styles/themes/retro.css');
const toolbarStyles = readStyles('src/styles/features/markdown-toolbar.css');
const shell = readStyles('src/index.html');

/**
 * Return the declaration block for a selector. `mustContain` disambiguates
 * selectors that legitimately appear more than once, such as :root.
 */
function ruleBody(css, selector, mustContain = '') {
  const pattern = new RegExp(
    `${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`,
    'g'
  );
  for (const match of css.matchAll(pattern)) {
    if (match[1].includes(mustContain)) return match[1];
  }
  return expect.fail(`missing rule for ${selector}`);
}

const SIZE_TOKENS = [
  '--main-toolbar-min-height',
  '--main-toolbar-padding',
  '--main-toolbar-btn-min-height',
  '--main-toolbar-btn-padding',
  '--main-toolbar-btn-font-size',
  '--main-toolbar-arrow-width',
  '--main-toolbar-arrow-padding',
  '--main-toolbar-arrow-font-size'
];

const FIXED_HEIGHT = /(^|[^-])height:\s*\d/;

const TIER_MARKERS = {
  condense: '.toolbar-content',
  alignment: 'toolbar-group-alignment',
  code: 'toolbar-group-code',
  structure: 'toolbar-group-structure',
  media: 'toolbar-group-media',
  secondary: 'toolbar-group-headings',
  history: 'toolbar-group-history'
};

/** Every `@container editor-pane (max-width: N)` block with its body. */
function containerBlocks() {
  const pattern = /@container editor-pane \(max-width: (\d+)px\) \{([\s\S]*?)\n\}/g;
  return [...toolbarStyles.matchAll(pattern)].map((match) => ({
    width: Number(match[1]),
    body: match[2]
  }));
}

describe('Main toolbar sizing', () => {
  it('defines the same geometry tokens for every size', () => {
    const scopes = [
      ':root',
      '[data-main-toolbar-size="small"]',
      '[data-main-toolbar-size="large"]'
    ];
    for (const scope of scopes) {
      const body = ruleBody(baseStyles, scope, '--main-toolbar-min-height');
      for (const token of SIZE_TOKENS) {
        expect(body, `${scope} is missing ${token}`).toContain(`${token}:`);
      }
    }
  });

  it('never pins a toolbar button to a fixed height', () => {
    // A fixed height plus the inherited line-height pushed labels and icons
    // outside the button at the Large size.
    const button = ruleBody(baseStyles, '.toolbar-btn,\n.mode-btn', 'min-height');
    expect(button).toContain('min-height: var(--main-toolbar-btn-min-height)');
    expect(button).not.toMatch(FIXED_HEIGHT);
    expect(button).toContain('align-items: center');
    expect(button).toContain('line-height:');

    // Size variants must only redefine tokens, never target a control directly.
    expect(baseStyles).not.toMatch(/\[data-main-toolbar-size="[a-z]+"\]\s+\./);
  });

  it('reads the size tokens from the toolbar and split arrows', () => {
    expect(ruleBody(baseStyles, '.toolbar', 'min-height')).toContain(
      'var(--main-toolbar-min-height)'
    );
    const arrow = ruleBody(baseStyles, '.dropdown-arrow', 'min-height');
    expect(arrow).toContain('min-height: var(--main-toolbar-btn-min-height)');
    expect(arrow).not.toMatch(FIXED_HEIGHT);
  });

  it('keeps the Retro theme on the shared tokens so the size setting still applies', () => {
    const retroButton = ruleBody(
      retroStyles,
      'body.retro-theme .toolbar-btn,\nbody.retro-theme .mode-btn',
      'min-height'
    );
    expect(retroButton).toContain('min-height: var(--main-toolbar-btn-min-height)');
    expect(retroButton).toContain('padding: var(--main-toolbar-btn-padding)');
    expect(retroButton).toContain('var(--main-toolbar-btn-font-size)');
    expect(retroButton).not.toMatch(FIXED_HEIGHT);
  });

  it('never pins a Markdown toolbar button to a fixed height', () => {
    const button = ruleBody(toolbarStyles, '.md-btn', 'min-height');
    expect(button).toContain('min-height:');
    expect(button).not.toMatch(FIXED_HEIGHT);
    for (const size of ['small', 'large']) {
      const body = ruleBody(toolbarStyles, `[data-md-toolbar-size="${size}"] .md-btn`, 'min-height');
      expect(body).toContain('min-height:');
      expect(body).not.toMatch(FIXED_HEIGHT);
    }
  });
});

describe('Markdown toolbar containment', () => {
  it('clips the inline axis only, so dropdowns can still open downwards', () => {
    const toolbar = ruleBody(toolbarStyles, '.markdown-toolbar', 'overflow-x');
    expect(toolbar).toContain('overflow-x: clip');
    expect(toolbar).toContain('overflow-y: visible');
    // A plain `overflow: hidden` would turn the toolbar into a scroll
    // container and cut off the Markdown dropdown menus.
    expect(toolbar).not.toMatch(/overflow:\s*hidden/);
  });

  it('puts the formatting groups in a shrinkable, inline-clipped region', () => {
    const primary = ruleBody(toolbarStyles, '.toolbar-primary', 'min-width');
    expect(primary).toContain('min-width: 0');
    expect(primary).toMatch(/flex:\s*0 1 auto/);
    expect(primary).toContain('overflow-x: clip');
    expect(primary).toContain('overflow-y: visible');
  });

  it('keeps the pinned controls at the right edge with a growing spacer', () => {
    const spacer = ruleBody(toolbarStyles, '.toolbar-spacer', 'flex');
    expect(spacer).toMatch(/flex:\s*1 1 auto/);
    expect(spacer).toContain('min-width: 0');
  });

  it('pins the overflow and search controls so they cannot be pushed out', () => {
    const pinned = ruleBody(
      toolbarStyles,
      '.toolbar-overflow-group,\n.toolbar-group-search',
      'flex'
    );
    expect(pinned).toMatch(/flex:\s*0 0 auto/);
  });

  it('never pins a row item to a height that could exceed the smallest row', () => {
    // The Small size gives buttons a 22px min-height; a hard 28px here was cut off.
    const arrow = ruleBody(toolbarStyles, '.md-dropdown-arrow', 'min-width');
    expect(arrow).not.toMatch(FIXED_HEIGHT);
  });

  it('offers a command in More exactly when the toolbar hides it', () => {
    // This is what makes More show only what is not already visible: every tier
    // that removes a group reveals that group's section in the same breakpoint.
    const pairs = [
      ['toolbar-group-alignment', 'overflow-section-alignment'],
      ['toolbar-group-code', 'overflow-section-blocks'],
      ['toolbar-group-structure', 'overflow-section-structure'],
      ['toolbar-group-media', 'overflow-section-insert'],
      ['toolbar-group-history', 'overflow-section-history']
    ];

    for (const [group, section] of pairs) {
      for (const block of containerBlocks()) {
        const hidesGroup = new RegExp(`\\.${group}[^{]*\\{[^}]*display:\\s*none`).test(block.body)
          || (block.body.includes(`.${group}`) && block.body.includes('display: none'));
        if (!hidesGroup) continue;
        expect(block.body, `${group} is hidden at ${block.width}px without revealing ${section}`)
          .toContain(section);
      }
    }
  });

  it('reveals the More button in every tier that hides something', () => {
    const hiding = containerBlocks().filter((block) => /toolbar-group-\w+[^{]*\{[^}]*display:\s*none/.test(block.body));
    expect(hiding.length).toBeGreaterThan(0);

    // The first tier per size carries the button; later tiers only add sections.
    const withButton = hiding.filter((block) => block.body.includes('toolbar-overflow-group'));
    expect(withButton).toHaveLength(3);

    // Hidden by default and only ever revealed: no breakpoint may take it back
    // while commands are still missing from the toolbar.
    for (const block of containerBlocks()) {
      if (!block.body.includes('toolbar-overflow-group')) continue;
      expect(block.body, `a tier at ${block.width}px hides the More button`)
        .not.toMatch(/toolbar-overflow-group[^{]*\{[^}]*display:\s*none/);
    }
  });

  it('collapses progressively, and tightens spacing before dropping anything', () => {
    for (const size of ['small', 'medium', 'large']) {
      const widths = {};
      for (const block of containerBlocks()) {
        if (!block.body.includes(`[data-md-toolbar-size="${size}"]`)) continue;
        for (const [tier, marker] of Object.entries(TIER_MARKERS)) {
          if (block.body.includes(marker)) widths[tier] = block.width;
        }
      }

      const order = ['alignment', 'code', 'structure', 'media', 'secondary', 'history'];
      const present = order.filter((tier) => widths[tier] !== undefined);
      expect(present, `${size} is missing collapse tiers`).toEqual(order);

      for (let i = 1; i < order.length; i += 1) {
        expect(widths[order[i]], `${size}: ${order[i]} must collapse after ${order[i - 1]}`)
          .toBeLessThan(widths[order[i - 1]]);
      }
      // Spacing tightens first so groups survive a little longer.
      expect(widths.condense, `${size}: spacing must tighten before groups drop`)
        .toBeGreaterThan(widths.alignment);
    }
  });

  it('sizes the overflow menu against the code pane instead of the window', () => {
    // Viewport units ignore the split, so the menu could exceed the pane.
    expect(toolbarStyles).not.toMatch(/\.md-overflow-menu[\s\S]{0,400}?100vw/);
    expect(toolbarStyles).toMatch(/width:\s*min\(430px,\s*calc\(100cqi - 24px\)\)/);
    expect(toolbarStyles).toContain('container-type: inline-size');
  });
});
