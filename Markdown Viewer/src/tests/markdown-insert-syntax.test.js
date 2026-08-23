import { describe, expect, it } from 'vitest';
import {
  altTextFromFileName,
  buildImageMarkdown,
  buildLinkMarkdown
} from '../components/markdownInsertSyntax.js';

describe('buildLinkMarkdown', () => {
  it('uses the given label, URL, and title', () => {
    expect(buildLinkMarkdown({
      text: 'Docs',
      url: 'https://example.com',
      title: 'Reference'
    })).toBe('[Docs](https://example.com "Reference")');
  });

  it('falls back to the URL when no label is given', () => {
    expect(buildLinkMarkdown({ url: 'https://example.com' }))
      .toBe('[https://example.com](https://example.com)');
  });

  it('omits an empty title rather than emitting empty quotes', () => {
    expect(buildLinkMarkdown({ text: 'Docs', url: 'https://example.com', title: '' }))
      .toBe('[Docs](https://example.com)');
  });
});

describe('buildImageMarkdown', () => {
  it('uses the given alt text and title', () => {
    expect(buildImageMarkdown({
      url: 'diagram.png',
      alt: 'Diagram',
      title: 'Architecture'
    })).toBe('![Diagram](diagram.png "Architecture")');
  });

  it('falls back to a generic alt text', () => {
    expect(buildImageMarkdown({ url: 'diagram.png' })).toBe('![Image](diagram.png)');
  });

  it('wraps the image in a link when one is supplied', () => {
    expect(buildImageMarkdown({
      url: 'diagram.png',
      alt: 'Diagram',
      link: 'https://example.com'
    })).toBe('[![Diagram](diagram.png)](https://example.com)');
  });

  it('keeps the title inside the image when it is also linked', () => {
    expect(buildImageMarkdown({
      url: 'diagram.png',
      alt: 'Diagram',
      title: 'Architecture',
      link: 'https://example.com'
    })).toBe('[![Diagram](diagram.png "Architecture")](https://example.com)');
  });
});

describe('altTextFromFileName', () => {
  it('drops the extension', () => {
    expect(altTextFromFileName('architecture-diagram.png')).toBe('architecture-diagram');
  });

  it('keeps a name that has no extension', () => {
    expect(altTextFromFileName('diagram')).toBe('diagram');
  });
});
