import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_WIDTH_VARIABLES,
  resolvePageWidth,
  shouldCenterLayout
} from '../components/pageLayout.js';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/SettingsController.js');
});

describe('resolvePageWidth', () => {
  it.each(Object.keys(PAGE_WIDTH_VARIABLES))('maps %s to its width token', (size) => {
    expect(resolvePageWidth(size)).toBe(PAGE_WIDTH_VARIABLES[size]);
  });

  it('gives every size a distinct width', () => {
    const widths = Object.values(PAGE_WIDTH_VARIABLES);
    expect(new Set(widths).size).toBe(widths.length);
  });

  it.each([undefined, null, '', 'quarto'])('falls back to the default for %s', (size) => {
    expect(resolvePageWidth(size)).toBe(PAGE_WIDTH_VARIABLES[DEFAULT_PAGE_SIZE]);
  });
});

describe('shouldCenterLayout', () => {
  it.each(['code', 'preview', 'welcome'])('centers in %s mode when enabled', (mode) => {
    expect(shouldCenterLayout({ enabled: true, mode })).toBe(true);
  });

  it('never centers in split mode, where two panes share the width', () => {
    expect(shouldCenterLayout({ enabled: true, mode: 'split' })).toBe(false);
  });

  it.each(['code', 'preview', 'split'])('stays off in %s mode when disabled', (mode) => {
    expect(shouldCenterLayout({ enabled: false, mode })).toBe(false);
  });

  it('treats a missing state as off', () => {
    expect(shouldCenterLayout()).toBe(false);
  });
});

describe('SettingsController page size', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty('--current-page-width');
    document.body.className = '';
    document.body.innerHTML = `
      <button id="page-a4-btn"></button>
      <button id="page-letter-btn"></button>
      <button id="page-a3-btn"></button>
      <button id="layout-on-btn"></button>
      <button id="layout-off-btn"></button>
    `;
  });

  function createSettings() {
    const settings = new window.SettingsController();
    settings.loadSettings();
    settings.setupSettingsControls();
    return settings;
  }

  const currentWidth = () =>
    document.documentElement.style.getPropertyValue('--current-page-width');

  it('applies the chosen page size immediately', () => {
    // Previously this only set a data attribute that no rule matched, so the
    // choice did nothing until the next launch.
    const settings = createSettings();

    document.getElementById('page-letter-btn').click();
    expect(currentWidth()).toBe(PAGE_WIDTH_VARIABLES.letter);

    document.getElementById('page-a3-btn').click();
    expect(currentWidth()).toBe(PAGE_WIDTH_VARIABLES.a3);

    document.getElementById('page-a4-btn').click();
    expect(currentWidth()).toBe(PAGE_WIDTH_VARIABLES.a4);
  });

  it('persists the choice and applies it on the next launch', () => {
    createSettings();
    document.getElementById('page-a3-btn').click();
    expect(localStorage.getItem('markdownViewer_pageSize')).toBe('a3');

    document.documentElement.style.removeProperty('--current-page-width');
    const restored = new window.SettingsController();
    restored.loadSettings();
    restored.applySettings();

    expect(restored.getPageSize()).toBe('a3');
    expect(currentWidth()).toBe(PAGE_WIDTH_VARIABLES.a3);
  });

  it('announces a centered layout change rather than applying it directly', () => {
    const settings = createSettings();
    const changed = vi.fn();
    settings.on('centered-layout-changed', changed);

    document.getElementById('layout-on-btn').click();

    expect(settings.getCenteredLayoutEnabled()).toBe(true);
    expect(localStorage.getItem('markdownViewer_centeredLayout')).toBe('true');
    expect(changed).toHaveBeenCalledWith({ enabled: true });
    // The view mode decides whether it actually applies, so the class is not
    // toggled here.
    expect(document.body.classList.contains('centered-layout')).toBe(false);
  });

  it('toggles the body class only when told to', () => {
    const settings = createSettings();

    settings.applyCenteredLayout(true);
    expect(document.body.classList.contains('centered-layout')).toBe(true);

    settings.applyCenteredLayout(false);
    expect(document.body.classList.contains('centered-layout')).toBe(false);
  });
});
