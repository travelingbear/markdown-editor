import { describe, expect, it } from 'vitest';
import { createMermaidConfig, resolveMermaidTheme } from '../plugins/mermaidConfig.js';

describe('Mermaid configuration', () => {
  it('uses sanitizer-compatible native SVG labels', () => {
    const config = createMermaidConfig('light');

    expect(config.htmlLabels).toBe(false);
    expect(config.securityLevel).toBe('strict');
    expect(config.startOnLoad).toBe(false);
    expect(config.flowchart.useMaxWidth).toBe(true);
  });

  it('selects the Mermaid dark theme only for the application dark theme', () => {
    expect(createMermaidConfig('dark').theme).toBe('dark');
    expect(createMermaidConfig('light').theme).toBe('default');
    expect(createMermaidConfig('retro').theme).toBe('default');
  });

  it('supports a fixed plugin theme and configurable maximum width', () => {
    const config = createMermaidConfig('light', { theme: 'forest', useMaxWidth: false });

    expect(config.theme).toBe('forest');
    expect(config.flowchart.useMaxWidth).toBe(false);
    expect(config.pie.useMaxWidth).toBe(false);
    expect(resolveMermaidTheme('dark', 'neutral')).toBe('neutral');
  });
});
