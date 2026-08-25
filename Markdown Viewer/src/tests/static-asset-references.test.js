import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = resolve(process.cwd(), 'src');

describe('static application shell assets', () => {
  it('references only local files that exist', () => {
    const html = readFileSync(resolve(sourceRoot, 'index.html'), 'utf8');
    const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((reference) => !/^(?:https?:|#|data:)/.test(reference));

    for (const reference of references) {
      const localPath = reference.split(/[?#]/, 1)[0].replace(/^\//, '');
      expect(existsSync(resolve(sourceRoot, localPath)), reference).toBe(true);
    }
  });

  it('reuses the compact branded favicon on the welcome screen', () => {
    const html = readFileSync(resolve(sourceRoot, 'index.html'), 'utf8');

    expect(html).toContain('src="favicons/favicon-96x96.png"');
    expect(html).not.toContain('assets/icon.svg');
  });

  it('uses bundled SVG markup instead of platform-dependent emoji in buttons', () => {
    const html = readFileSync(resolve(sourceRoot, 'index.html'), 'utf8');
    const toolbarSource = readFileSync(resolve(sourceRoot, 'components/ToolbarComponent.js'), 'utf8');
    const buttonMarkup = [...html.matchAll(/<button\b[\s\S]*?<\/button>/g)]
      .map((match) => match[0])
      .join('\n');
    const emoji = /[\u{1F300}-\u{1FAFF}]/u;

    expect(buttonMarkup).not.toMatch(emoji);
    expect(toolbarSource).not.toMatch(emoji);
    expect(html).toContain('class="ui-icon"');
  });
});
