import { describe, expect, it } from 'vitest';
import { sanitizeRenderedHtml, sanitizeRenderedSvg } from '../rendering/security.js';

describe('render output sanitization', () => {
  it('removes executable HTML while preserving Markdown content', () => {
    const html = sanitizeRenderedHtml(
      '<h1>Hello</h1><img src="x" onerror="window.compromised = true"><script>alert(1)</script>'
    );

    expect(html).toContain('<h1>Hello</h1>');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<script');
  });

  it('removes unsafe link protocols', () => {
    const html = sanitizeRenderedHtml('<a href="javascript:alert(1)">bad link</a>');

    expect(html).toContain('bad link');
    expect(html).not.toContain('javascript:');
  });

  it('preserves generated task-list and rendering metadata', () => {
    const html = sanitizeRenderedHtml(
      '<input type="checkbox" checked><div data-mermaid-code="graph%20TD">diagram</div>'
    );

    expect(html).toContain('type="checkbox"');
    expect(html).toContain('data-mermaid-code="graph%20TD"');
  });

  it('sanitizes generated SVG before insertion', () => {
    const svg = sanitizeRenderedSvg(
      '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><text>node</text></a></svg>'
    );

    expect(svg).toContain('<svg');
    expect(svg).toContain('node');
    expect(svg).not.toContain('javascript:');
  });
});
