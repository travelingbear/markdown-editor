import DOMPurify from 'dompurify';

const DOCUMENT_SANITIZER_OPTIONS = {
  USE_PROFILES: { html: true, mathMl: true },
  ADD_ATTR: ['data-original-src', 'data-mermaid-code', 'data-original-text']
};

const SVG_SANITIZER_OPTIONS = {
  USE_PROFILES: { svg: true, svgFilters: true }
};

export function sanitizeRenderedHtml(html) {
  return DOMPurify.sanitize(html, DOCUMENT_SANITIZER_OPTIONS);
}

export function sanitizeRenderedSvg(svg) {
  return DOMPurify.sanitize(svg, SVG_SANITIZER_OPTIONS);
}
