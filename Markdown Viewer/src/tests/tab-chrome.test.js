import { describe, expect, it } from 'vitest';
import {
  TAB_CHROME_LIMITS,
  clampMenuPosition,
  matchesTabSearch,
  resolveContextMenuState,
  resolveTabModalKey
} from '../components/tabChrome.js';

const VIEWPORT = { width: 1000, height: 800 };
const MENU = { width: 200, height: 300 };
const MARGIN = TAB_CHROME_LIMITS.viewportMargin;

describe('clampMenuPosition', () => {
  it('opens at the pointer when there is room', () => {
    expect(clampMenuPosition({ pointer: { x: 300, y: 200 }, menu: MENU, viewport: VIEWPORT }))
      .toEqual({ left: 300, top: 200 });
  });

  it('pulls back from the right edge', () => {
    const { left } = clampMenuPosition({ pointer: { x: 950, y: 100 }, menu: MENU, viewport: VIEWPORT });
    expect(left).toBe(VIEWPORT.width - MENU.width - MARGIN);
    expect(left + MENU.width).toBeLessThanOrEqual(VIEWPORT.width);
  });

  it('pulls back from the bottom edge', () => {
    const { top } = clampMenuPosition({ pointer: { x: 100, y: 780 }, menu: MENU, viewport: VIEWPORT });
    expect(top).toBe(VIEWPORT.height - MENU.height - MARGIN);
    expect(top + MENU.height).toBeLessThanOrEqual(VIEWPORT.height);
  });

  it('pulls back from both edges at once', () => {
    const result = clampMenuPosition({ pointer: { x: 995, y: 795 }, menu: MENU, viewport: VIEWPORT });
    expect(result).toEqual({ left: 790, top: 490 });
  });

  it('keeps a margin rather than going off the near edge', () => {
    expect(clampMenuPosition({ pointer: { x: 0, y: 0 }, menu: MENU, viewport: VIEWPORT }))
      .toEqual({ left: MARGIN, top: MARGIN });
  });

  it('prefers the near edge when the menu cannot fit at all', () => {
    const result = clampMenuPosition({
      pointer: { x: 50, y: 50 },
      menu: { width: 2000, height: 2000 },
      viewport: VIEWPORT
    });
    expect(result).toEqual({ left: MARGIN, top: MARGIN });
  });

  it('survives being called before anything is measured', () => {
    expect(clampMenuPosition()).toEqual({ left: MARGIN, top: MARGIN });
  });
});

describe('resolveContextMenuState', () => {
  const tabs = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('disables moving a tab to the position it already occupies', () => {
    const state = resolveContextMenuState({ tabs, tabId: 'b', tab: tabs[1] });

    expect(state.tabIndex).toBe(1);
    expect(state.positions[0].disabled).toBe(false);
    expect(state.positions[1].disabled).toBe(true);
    expect(state.positions[2].disabled).toBe(false);
  });

  it('offers nine direct positions', () => {
    const state = resolveContextMenuState({ tabs, tabId: 'a', tab: tabs[0] });

    expect(state.positions).toHaveLength(TAB_CHROME_LIMITS.directMovePositions);
    expect(state.positions.at(-1).position).toBe(9);
  });

  it('disables Close Others for a lone tab', () => {
    expect(resolveContextMenuState({ tabs: [{ id: 'a' }], tabId: 'a', tab: { id: 'a' } })
      .closeOthersDisabled).toBe(true);
    expect(resolveContextMenuState({ tabs, tabId: 'a', tab: tabs[0] })
      .closeOthersDisabled).toBe(false);
  });

  it('disables Close All only with nothing open', () => {
    expect(resolveContextMenuState({ tabs: [], tabId: null }).closeAllDisabled).toBe(true);
    expect(resolveContextMenuState({ tabs, tabId: 'a', tab: tabs[0] }).closeAllDisabled).toBe(false);
  });

  it('disables Reveal until the document exists on disk', () => {
    expect(resolveContextMenuState({ tabs, tabId: 'a', tab: { id: 'a' } }).revealDisabled).toBe(true);
    expect(resolveContextMenuState({ tabs, tabId: 'a', tab: null }).revealDisabled).toBe(true);
    expect(resolveContextMenuState({ tabs, tabId: 'a', tab: { id: 'a', filePath: 'C:\\a.md' } })
      .revealDisabled).toBe(false);
  });

  it('reports an unknown tab as unplaced', () => {
    expect(resolveContextMenuState({ tabs, tabId: 'missing' }).tabIndex).toBe(-1);
  });
});

describe('matchesTabSearch', () => {
  const tab = { name: 'Release Notes.md', path: 'C:\\projects\\docs\\release.md' };

  it('matches everything when nothing is typed', () => {
    expect(matchesTabSearch(tab, '')).toBe(true);
    expect(matchesTabSearch(tab, '   ')).toBe(true);
  });

  it('matches the name regardless of case', () => {
    expect(matchesTabSearch(tab, 'RELEASE')).toBe(true);
    expect(matchesTabSearch(tab, 'notes')).toBe(true);
  });

  it('matches the path so same-named files can be told apart', () => {
    expect(matchesTabSearch(tab, 'projects')).toBe(true);
  });

  it('rejects a term in neither', () => {
    expect(matchesTabSearch(tab, 'invoice')).toBe(false);
  });

  it('handles a tab with no path', () => {
    expect(matchesTabSearch({ name: 'untitled.md' }, 'untitled')).toBe(true);
    expect(matchesTabSearch({ name: 'untitled.md' }, 'docs')).toBe(false);
  });
});

describe('resolveTabModalKey', () => {
  const list = { currentIndex: 1, itemCount: 4 };

  it('moves down the list', () => {
    expect(resolveTabModalKey('ArrowDown', list)).toEqual({ handled: true, action: 'focus', index: 2 });
  });

  it('stops at the last entry rather than wrapping', () => {
    expect(resolveTabModalKey('ArrowDown', { currentIndex: 3, itemCount: 4 }))
      .toEqual({ handled: true, action: 'none', index: 3 });
  });

  it('moves up the list', () => {
    expect(resolveTabModalKey('ArrowUp', list)).toEqual({ handled: true, action: 'focus', index: 0 });
  });

  it('stops at the first entry rather than wrapping', () => {
    expect(resolveTabModalKey('ArrowUp', { currentIndex: 0, itemCount: 4 }))
      .toEqual({ handled: true, action: 'none', index: 0 });
  });

  it('jumps to the last entry when nothing is focused yet', () => {
    // Arrowing up from a fresh modal reaches the bottom of the list.
    expect(resolveTabModalKey('ArrowUp', { currentIndex: -1, itemCount: 4 }))
      .toEqual({ handled: true, action: 'focus', index: 3 });
  });

  it('starts at the top when arrowing down from nothing focused', () => {
    expect(resolveTabModalKey('ArrowDown', { currentIndex: -1, itemCount: 4 }))
      .toEqual({ handled: true, action: 'focus', index: 0 });
  });

  it('opens the focused tab on Enter', () => {
    expect(resolveTabModalKey('Enter', list)).toEqual({ handled: true, action: 'select', index: 1 });
  });

  it('does nothing on Enter with nothing focused, but still consumes the key', () => {
    expect(resolveTabModalKey('Enter', { currentIndex: -1, itemCount: 4 }))
      .toEqual({ handled: true, action: 'none', index: -1 });
  });

  it('closes on Escape', () => {
    expect(resolveTabModalKey('Escape', list)).toEqual({ handled: true, action: 'close', index: 1 });
  });

  it('leaves other keys to the search field', () => {
    for (const key of ['a', 'Tab', 'Backspace', ' ']) {
      expect(resolveTabModalKey(key, list).handled).toBe(false);
    }
  });

  it('ignores every key while the list is empty', () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Enter', 'Escape']) {
      expect(resolveTabModalKey(key, { currentIndex: -1, itemCount: 0 }).handled).toBe(false);
    }
  });
});
