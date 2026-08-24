import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/TabUIController.js');
});

let controller;

beforeEach(() => {
  document.body.innerHTML = `
    <button id="filename"></button>
    <div id="tab-dropdown-list"></div>
    <button id="tab-more-btn" style="display: none;">More...</button>
  `;
});

afterEach(() => {
  controller?.destroy();
  controller = null;
});

function withTabs(count) {
  const tabs = Array.from({ length: count }, (_, index) => ({
    id: `tab-${index}`,
    fileName: `file-${index}.md`,
    isDirty: false
  }));
  const tabManager = {
    getAllTabs: () => tabs,
    getActiveTab: () => tabs[0] || null,
    hasTabs: () => tabs.length > 0,
    getTabsCount: () => tabs.length,
    on: vi.fn(),
    off: vi.fn()
  };

  controller = new window.TabUIController();
  controller.setDependencies(tabManager, { getPinnedTabsEnabled: () => false }, null);
  controller.updateTabUI();
  return tabs;
}

const moreButtonShown = () =>
  document.getElementById('tab-more-btn').style.display !== 'none';

describe('status bar tab manager button', () => {
  it('stays hidden for a single document', () => {
    withTabs(1);
    expect(moreButtonShown()).toBe(false);
  });

  it('appears as soon as there is somewhere to switch to', () => {
    // The tab manager offers search, reordering, and per-tab commands, so it is
    // useful well before the dropdown runs out of room at nine.
    withTabs(2);
    expect(moreButtonShown()).toBe(true);
  });

  it.each([3, 5, 9, 12, 40])('stays available with %s tabs', (count) => {
    withTabs(count);
    expect(moreButtonShown()).toBe(true);
  });

  it('still lists only the nine most recent tabs in the dropdown', () => {
    withTabs(12);
    expect(document.querySelectorAll('#tab-dropdown-list .tab-dropdown-item')).toHaveLength(9);
  });
});
