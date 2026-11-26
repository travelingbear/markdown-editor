/**
 * Post-processing applied to parsed Markdown before it is sanitized and mounted.
 *
 * Every function here is a pure HTML-to-HTML transform with no component state,
 * so the Preview pipeline can be reasoned about and tested without a live
 * component, a renderer registry, or a mounted document.
 */

/**
 * True when `offset` falls inside a `<code>` or `<pre>` element, where Markdown
 * patterns must be left as literal text.
 */
export function isInsideCodeBlock(html, offset) {
  const before = String(html).slice(0, offset);
  const opened = (tag) => (before.match(new RegExp(`<${tag}[^>]*>`, 'g')) || []).length;
  const closed = (tag) => (before.match(new RegExp(`</${tag}>`, 'g')) || []).length;

  return opened('code') > closed('code') || opened('pre') > closed('pre');
}

function randomTaskId(index) {
  return `task-${Math.random().toString(36).substring(2, 11)}-${index}`;
}

function taskItem(id, checked, content, extraClass = '') {
  const className = extraClass ? `task-list-item ${extraClass}` : 'task-list-item';
  return `<div class="${className}"><input type="checkbox" id="${id}" ${checked ? 'checked' : ''}> `
    + `<label for="${id}">${content}</label></div>`;
}

/**
 * Convert a checkbox written as its own paragraph into a real checkbox row.
 *
 * GFM task syntax only applies inside list items, so `marked` turns `- [ ]`
 * into an `<input>` itself and never sees a bare `[x] text` line. That line
 * arrives here as an ordinary paragraph, and this is what makes standalone
 * task items work.
 *
 * `createId` is injectable so tests can assert exact output; production keeps
 * random ids so two renders cannot collide on a label's `for` target.
 */
export function processTaskLists(html, { createId = randomTaskId } = {}) {
  const result = String(html);

  // Already produced by the renderer.
  if (result.includes('task-list-item') && result.includes('<input') && result.includes('checkbox')) {
    return result;
  }

  let taskCount = 0;

  return result.replace(/<p>\[([ x])\]\s*([^<]*?)<\/p>/g, (match, checked, content, offset, source) => {
    if (isInsideCodeBlock(source, offset)) return match;
    return taskItem(createId(taskCount++), checked === 'x', content.trim());
  });
}

/**
 * Turn `[^id]` references and their definitions into a linked footnotes section.
 */
export function processFootnotes(html) {
  let result = String(html);
  const footnotes = new Map();

  result.replace(/\[\^([^\]]+)\]:\s*(.+?)(?=\n|$)/g, (match, id, definition) => {
    footnotes.set(id, definition.trim());
    return match;
  });

  result = result.replace(/<p>\[\^[^\]]+\]:[^<]*<\/p>/g, '');
  result = result.replace(/\[\^([^\]]+)\]/g, (match, id) => (
    footnotes.has(id)
      ? `<sup><a href="#footnote-${id}" id="footnote-ref-${id}" class="footnote-ref">${id}</a></sup>`
      : match
  ));

  if (footnotes.size === 0) return result;

  const items = [...footnotes]
    .map(([id, definition]) =>
      `<li id="footnote-${id}">${definition} <a href="#footnote-ref-${id}" class="footnote-backref">↩</a></li>`)
    .join('');
  return `${result}<div class="footnotes"><hr><ol>${items}</ol></div>`;
}

/** `^text^` and `~text~`, with parenthesised forms for multi-word runs. */
export function processSupSubScript(html) {
  return String(html)
    .replace(/\^\(([^)]+)\)\^/g, '<sup>$1</sup>')
    .replace(/\^([^\s^]+)\^/g, '<sup>$1</sup>')
    .replace(/~\(([^)]+)\)~/g, '<sub>$1</sub>')
    .replace(/~([^\s~]+)~/g, '<sub>$1</sub>');
}

/** Give bare email and domain hrefs a usable scheme. */
export function normalizeLinks(html) {
  return String(html)
    .replace(/<a href="([^"]+@[^"]+\.[^"]+)">([^<]+)<\/a>/g, (match, href, text) => (
      href.startsWith('mailto:') ? match : `<a href="mailto:${href}">${text}</a>`
    ))
    .replace(/<a href="([^"]+\.[a-zA-Z]{2,}[^"]*)">([^<]+)<\/a>/g, (match, href, text) => {
      const hasScheme = /^(https?:\/\/|mailto:|#)/.test(href);
      return hasScheme ? match : `<a href="https://${href}">${text}</a>`;
    });
}

/** Tag every image so Preview styling and local-path resolution can find it. */
export function markMarkdownImages(html) {
  const holder = document.createElement('div');
  holder.innerHTML = String(html);

  for (const image of holder.querySelectorAll('img')) {
    if (image.classList.contains('markdown-image')) continue;
    image.classList.add('markdown-image');
    image.setAttribute('data-original-src', image.getAttribute('src') || image.src);
    if (!image.style.maxWidth) {
      image.style.maxWidth = '100%';
      image.style.height = 'auto';
    }
  }

  return holder.innerHTML;
}

/**
 * Resolve an href to something safe to navigate to, or null to refuse it.
 */
export function validateAndFixLink(href) {
  if (!href || typeof href !== 'string') return null;

  const trimmed = href.trim();
  if (/^(https?:\/\/|mailto:|file:\/\/)/.test(trimmed)) return trimmed;

  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed) || trimmed.startsWith('www.')) {
      return `https://${trimmed}`;
    }
  }

  console.warn('[Preview] Could not validate link:', href);
  return null;
}

/**
 * The full post-parse pipeline, in the order Preview applies it.
 */
export function applyPreviewPostProcessing(html, options = {}) {
  let result = processTaskLists(html, options);
  result = processFootnotes(result);
  result = processSupSubScript(result);
  result = normalizeLinks(result);
  return markMarkdownImages(result);
}
