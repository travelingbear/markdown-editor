/**
 * Page width and centered-layout decisions.
 *
 * Centered layout constrains content to a page width. Only the width is used —
 * the document scrolls continuously — so paper sizes that share a width are
 * indistinguishable on screen.
 */

// Matches the --page-width-* tokens declared in styles/base/foundation.css.
export const PAGE_WIDTH_VARIABLES = Object.freeze({
  a4: 'var(--page-width-a4)',
  letter: 'var(--page-width-letter)',
  a3: 'var(--page-width-a3)'
});

export const DEFAULT_PAGE_SIZE = 'a4';

/** The CSS width for a page size, falling back to the default. */
export function resolvePageWidth(pageSize) {
  return PAGE_WIDTH_VARIABLES[pageSize] || PAGE_WIDTH_VARIABLES[DEFAULT_PAGE_SIZE];
}

/**
 * Centered layout applies to a single pane of content. Split shows two panes
 * side by side, where constraining each to a page width would leave the reader
 * with two narrow columns and a gap.
 */
export function shouldCenterLayout({ enabled = false, mode = null } = {}) {
  return enabled === true && mode !== 'split';
}
