import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyPreviewPostProcessing,
  isInsideCodeBlock,
  markMarkdownImages,
  normalizeLinks,
  processFootnotes,
  processSupSubScript,
  processTaskLists,
  validateAndFixLink
} from '../rendering/previewHtml.js';

// Deterministic ids keep the expected task markup readable.
const sequentialIds = { createId: (index) => `task-${index}` };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isInsideCodeBlock', () => {
  it('detects an open code element', () => {
    const html = '<p>a</p><code>HERE';
    expect(isInsideCodeBlock(html, html.indexOf('HERE'))).toBe(true);
  });

  it('detects an open pre element', () => {
    const html = '<pre class="x">HERE';
    expect(isInsideCodeBlock(html, html.indexOf('HERE'))).toBe(true);
  });

  it('is false once the element has closed', () => {
    const html = '<code>a</code><p>HERE</p>';
    expect(isInsideCodeBlock(html, html.indexOf('HERE'))).toBe(false);
  });

  it('is false at the start of a document', () => {
    expect(isInsideCodeBlock('<p>x</p>', 0)).toBe(false);
  });
});

describe('processTaskLists', () => {
  it('leaves markup the renderer already produced untouched', () => {
    const html = '<div class="task-list-item"><input type="checkbox" id="a"><label for="a">Done</label></div>';
    expect(processTaskLists(html, sequentialIds)).toBe(html);
  });

  it('converts a standalone checkbox paragraph', () => {
    // GFM task syntax only applies inside list items, so a bare "[x] text"
    // line reaches Preview as an ordinary paragraph. This is the only case
    // this function exists for.
    const result = processTaskLists('<p>[x] Standalone</p>', sequentialIds);

    expect(result).toContain('class="task-list-item"');
    expect(result).toContain('<input type="checkbox" id="task-0" checked>');
    expect(result).toContain('<label for="task-0">Standalone</label>');
  });

  it('converts an unchecked standalone paragraph', () => {
    const result = processTaskLists('<p>[ ] Not done yet</p>', sequentialIds);

    expect(result).toContain('<input type="checkbox" id="task-0" >');
    expect(result).toContain('<label for="task-0">Not done yet</label>');
  });

  it('is inert for the list markup marked actually produces', () => {
    // marked converts "- [ ]" to <input> itself, so lists never arrive here
    // with bracket syntax intact.
    const gfm = [
      '<ul>',
      '<li><input disabled="" type="checkbox"> Parent</li>',
      '</ul>'
    ].join('\n');
    expect(processTaskLists(gfm, sequentialIds)).toBe(gfm);
  });

  it('leaves bracket syntax in hand-written HTML lists alone', () => {
    // Converting these used to emit malformed markup for nested lists, and
    // nothing in the Markdown pipeline produces them. Anyone writing raw HTML
    // can write a real <input> instead.
    const raw = '<ul><li>[ ] Raw parent<ul><li>[x] Raw child</li></ul></li></ul>';
    expect(processTaskLists(raw, sequentialIds)).toBe(raw);
  });

  it('leaves an ordinary paragraph alone', () => {
    const html = '<p>Just a sentence.</p>';
    expect(processTaskLists(html, sequentialIds)).toBe(html);
  });

  it('keeps a bracketed paragraph inside code literal', () => {
    const html = '<pre><code><p>[ ] Not a task</p></code></pre>';
    expect(processTaskLists(html, sequentialIds)).toBe(html);
  });

  it('generates unique ids by default', () => {
    const result = processTaskLists('<p>[ ] A</p><p>[x] B</p>');
    const ids = [...result.matchAll(/id="(task-[^"]+)"/g)].map((match) => match[1]);

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});

describe('processFootnotes', () => {
  it('links a reference to its definition and appends the section', () => {
    const result = processFootnotes('<p>Claim[^1]</p><p>[^1]: The evidence</p>');

    expect(result).toContain('href="#footnote-1"');
    expect(result).toContain('id="footnote-ref-1"');
    expect(result).toContain('<li id="footnote-1">The evidence');
    expect(result).toContain('class="footnote-backref"');
    // The definition paragraph is consumed, not left in the body.
    expect(result).not.toContain('<p>[^1]:');
  });

  it('leaves a reference with no definition as written', () => {
    const result = processFootnotes('<p>Dangling[^missing]</p>');

    expect(result).toContain('[^missing]');
    expect(result).not.toContain('class="footnotes"');
  });

  it('adds no section when there are no footnotes', () => {
    const html = '<p>Plain text</p>';
    expect(processFootnotes(html)).toBe(html);
  });

  it('keeps multiple definitions in order', () => {
    const result = processFootnotes('<p>A[^a] B[^b]</p><p>[^a]: First</p><p>[^b]: Second</p>');
    expect(result.indexOf('First')).toBeLessThan(result.indexOf('Second'));
  });
});

describe('processSupSubScript', () => {
  it.each([
    ['x^2^', '<sup>2</sup>'],
    ['^(long run)^', '<sup>long run</sup>'],
    ['H~2~O', '<sub>2</sub>'],
    ['~(sub text)~', '<sub>sub text</sub>']
  ])('converts %s', (input, expected) => {
    expect(processSupSubScript(input)).toContain(expected);
  });

  it('leaves unpaired markers alone', () => {
    expect(processSupSubScript('2 ^ 3')).toBe('2 ^ 3');
  });
});

describe('normalizeLinks', () => {
  it('gives a bare email a mailto scheme', () => {
    expect(normalizeLinks('<a href="a@b.com">mail</a>'))
      .toBe('<a href="mailto:a@b.com">mail</a>');
  });

  it('gives a bare domain https', () => {
    expect(normalizeLinks('<a href="example.com">site</a>'))
      .toBe('<a href="https://example.com">site</a>');
  });

  it.each([
    '<a href="https://example.com">site</a>',
    '<a href="mailto:a@b.com">mail</a>',
    '<a href="#section">anchor</a>'
  ])('leaves %s unchanged', (html) => {
    expect(normalizeLinks(html)).toBe(html);
  });
});

describe('markMarkdownImages', () => {
  it('tags an image and records its original source', () => {
    const result = markMarkdownImages('<img src="diagram.png">');

    expect(result).toContain('class="markdown-image"');
    expect(result).toContain('data-original-src="diagram.png"');
    expect(result).toContain('max-width: 100%');
  });

  it('leaves an already-tagged image alone', () => {
    const html = '<img class="markdown-image" src="a.png" data-original-src="original.png">';
    expect(markMarkdownImages(html)).toContain('data-original-src="original.png"');
  });

  it('passes through markup with no images', () => {
    expect(markMarkdownImages('<p>text</p>')).toBe('<p>text</p>');
  });
});

describe('validateAndFixLink', () => {
  it.each([
    ['https://example.com', 'https://example.com'],
    ['http://example.com', 'http://example.com'],
    ['mailto:a@b.com', 'mailto:a@b.com'],
    ['file:///C:/notes.md', 'file:///C:/notes.md'],
    ['  https://example.com  ', 'https://example.com'],
    ['a@b.com', 'mailto:a@b.com'],
    ['example.com', 'https://example.com'],
    ['www.example.com', 'https://www.example.com']
  ])('accepts %s', (input, expected) => {
    expect(validateAndFixLink(input)).toBe(expected);
  });

  it.each([null, undefined, '', 42, 'not a link'])('refuses %s', (input) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(validateAndFixLink(input)).toBeNull();
  });
});

describe('applyPreviewPostProcessing', () => {
  it('runs every stage in the order Preview expects', () => {
    const result = applyPreviewPostProcessing(
      '<p>[x] Ship[^1]</p><p>[^1]: Note</p><p>H~2~O <a href="example.com">site</a></p><img src="a.png">',
      sequentialIds
    );

    expect(result).toContain('class="task-list-item"');
    expect(result).toContain('class="footnote-ref"');
    expect(result).toContain('<sub>2</sub>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('class="markdown-image"');
  });

  it('leaves plain prose untouched', () => {
    expect(applyPreviewPostProcessing('<p>Nothing to do here.</p>'))
      .toBe('<p>Nothing to do here.</p>');
  });
});
