/**
 * Decisions behind the tab context menu and the tab search modal.
 *
 * These are the parts that are easy to get subtly wrong — keeping a menu on
 * screen, deciding which commands apply to a tab, and the arrow-key edges in a
 * filtered list — so they are kept free of the DOM and measured values are
 * passed in.
 */

// Smallest gap left between the menu and the edge of the window.
const VIEWPORT_MARGIN = 10;

// The context menu offers a direct "move to position N" for the first nine.
const DIRECT_MOVE_POSITIONS = 9;

/**
 * Place the menu at the pointer, pulled back so it stays fully on screen.
 */
export function clampMenuPosition({
  pointer = { x: 0, y: 0 },
  menu = { width: 0, height: 0 },
  viewport = { width: 0, height: 0 },
  margin = VIEWPORT_MARGIN
} = {}) {
  let left = pointer.x;
  let top = pointer.y;

  if (left + menu.width > viewport.width) left = viewport.width - menu.width - margin;
  if (top + menu.height > viewport.height) top = viewport.height - menu.height - margin;

  return {
    left: Math.max(margin, left),
    top: Math.max(margin, top)
  };
}

/**
 * Which context-menu commands apply to this tab.
 *
 * `positions` is indexed from zero and disables the tab's current slot, since
 * moving a tab to where it already is does nothing.
 */
export function resolveContextMenuState({ tabs = [], tabId = null, tab = null } = {}) {
  const tabIndex = tabs.findIndex((candidate) => candidate.id === tabId);

  return {
    tabIndex,
    positions: Array.from({ length: DIRECT_MOVE_POSITIONS }, (_, index) => ({
      position: index + 1,
      disabled: tabIndex === index
    })),
    closeOthersDisabled: tabs.length <= 1,
    closeAllDisabled: tabs.length === 0,
    // Nothing to reveal until the document exists on disk.
    revealDisabled: !tab || !tab.filePath
  };
}

/** A tab matches when the search term appears in its name or its path. */
export function matchesTabSearch({ name = '', path = '' } = {}, searchTerm = '') {
  const term = String(searchTerm).toLowerCase().trim();
  if (!term) return true;

  return String(name).toLowerCase().includes(term)
    || String(path).toLowerCase().includes(term);
}

/**
 * What a key press means for the filtered tab list.
 *
 * `currentIndex` is -1 when nothing is focused yet, which is why ArrowUp from
 * that state selects the last entry rather than doing nothing.
 */
export function resolveTabModalKey(key, { currentIndex = -1, itemCount = 0 } = {}) {
  const ignored = { handled: false, action: 'none', index: currentIndex };
  if (itemCount === 0) return ignored;

  switch (key) {
    case 'ArrowDown':
      return currentIndex < itemCount - 1
        ? { handled: true, action: 'focus', index: currentIndex + 1 }
        : { handled: true, action: 'none', index: currentIndex };

    case 'ArrowUp':
      if (currentIndex > 0) return { handled: true, action: 'focus', index: currentIndex - 1 };
      if (currentIndex === -1) return { handled: true, action: 'focus', index: itemCount - 1 };
      return { handled: true, action: 'none', index: currentIndex };

    case 'Enter':
      return currentIndex >= 0
        ? { handled: true, action: 'select', index: currentIndex }
        : { handled: true, action: 'none', index: currentIndex };

    case 'Escape':
      return { handled: true, action: 'close', index: currentIndex };

    default:
      return ignored;
  }
}

export const TAB_CHROME_LIMITS = Object.freeze({
  viewportMargin: VIEWPORT_MARGIN,
  directMovePositions: DIRECT_MOVE_POSITIONS
});
