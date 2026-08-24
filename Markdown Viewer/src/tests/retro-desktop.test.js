import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_RETRO_DESKTOP,
  RETRO_DESKTOP_COLORS,
  resolveRetroDesktop,
  retroDesktopNames
} from '../components/retroDesktop.js';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/SettingsController.js');
});

describe('retro desktop palette', () => {
  it.each(retroDesktopNames())('resolves %s to its colour', (name) => {
    expect(resolveRetroDesktop(name)).toBe(RETRO_DESKTOP_COLORS[name]);
  });

  it.each([undefined, null, '', 'chartreuse'])('falls back to the default for %s', (name) => {
    expect(resolveRetroDesktop(name)).toBe(RETRO_DESKTOP_COLORS[DEFAULT_RETRO_DESKTOP]);
  });

  it('stays inside the sixteen-colour VGA palette', () => {
    const vga = new Set(['#000000', '#800000', '#008000', '#808000', '#000080',
      '#800080', '#008080', '#c0c0c0', '#808080', '#ff0000', '#00ff00',
      '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff']);
    for (const entry of Object.values(RETRO_DESKTOP_COLORS)) {
      expect(vga.has(entry.value)).toBe(true);
    }
  });

  it('gives every colour a legible text colour', () => {
    // The welcome screen draws its heading straight onto this background, so a
    // dark desktop has to carry light text and the light one dark text.
    for (const entry of Object.values(RETRO_DESKTOP_COLORS)) {
      expect(['#ffffff', '#000000']).toContain(entry.text);
    }
    expect(RETRO_DESKTOP_COLORS.gray.text).toBe('#000000');
    expect(RETRO_DESKTOP_COLORS.black.text).toBe('#ffffff');
  });

  it('offers distinct colours', () => {
    const values = Object.values(RETRO_DESKTOP_COLORS).map((entry) => entry.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('SettingsController desktop colour', () => {
  const swatchMarkup = retroDesktopNames()
    .map((name) => `<button class="retro-desktop-swatch" data-desktop="${name}"></button>`)
    .join('');

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty('--retro-desktop');
    document.documentElement.style.removeProperty('--retro-desktop-text');
    document.body.className = '';
    document.body.innerHTML = `
      <div class="retro-desktop-setting" style="display: none;">
        <div class="setting-control">${swatchMarkup}</div>
      </div>
      <div class="retro-sound-setting" style="display: none;"></div>
    `;
  });

  function createSettings() {
    const settings = new window.SettingsController();
    settings.loadSettings();
    settings.setupSettingsControls();
    return settings;
  }

  const currentDesktop = () =>
    document.documentElement.style.getPropertyValue('--retro-desktop');
  const currentText = () =>
    document.documentElement.style.getPropertyValue('--retro-desktop-text');

  it('defaults to teal', () => {
    const settings = createSettings();
    settings.applySettings();

    expect(settings.getRetroDesktop()).toBe('teal');
    expect(currentDesktop()).toBe(RETRO_DESKTOP_COLORS.teal.value);
  });

  it('applies a chosen colour immediately, with its text colour', () => {
    createSettings();

    document.querySelector('[data-desktop="maroon"]').click();
    expect(currentDesktop()).toBe(RETRO_DESKTOP_COLORS.maroon.value);
    expect(currentText()).toBe(RETRO_DESKTOP_COLORS.maroon.text);

    document.querySelector('[data-desktop="gray"]').click();
    expect(currentDesktop()).toBe(RETRO_DESKTOP_COLORS.gray.value);
    expect(currentText()).toBe('#000000');
  });

  it('persists the choice and restores it on the next launch', () => {
    createSettings();
    document.querySelector('[data-desktop="navy"]').click();
    expect(localStorage.getItem('markdownViewer_retroDesktop')).toBe('navy');

    document.documentElement.style.removeProperty('--retro-desktop');
    const restored = new window.SettingsController();
    restored.loadSettings();
    restored.applySettings();

    expect(restored.getRetroDesktop()).toBe('navy');
    expect(currentDesktop()).toBe(RETRO_DESKTOP_COLORS.navy.value);
  });

  it('ignores a colour it does not know', () => {
    const settings = createSettings();
    settings.setRetroDesktop('chartreuse');

    expect(settings.getRetroDesktop()).toBe(DEFAULT_RETRO_DESKTOP);
    expect(currentDesktop()).toBe(RETRO_DESKTOP_COLORS[DEFAULT_RETRO_DESKTOP].value);
  });

  it('marks the chosen swatch and only that one', () => {
    const settings = createSettings();
    settings.setRetroDesktop('olive');

    const active = document.querySelectorAll('.retro-desktop-swatch.active');
    expect(active).toHaveLength(1);
    expect(active[0].dataset.desktop).toBe('olive');
    expect(active[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('shows the setting only under the Retro theme', () => {
    const settings = createSettings();
    const row = document.querySelector('.retro-desktop-setting');

    settings.isRetroTheme = false;
    settings.updateSettingsDisplay();
    expect(row.style.display).toBe('none');

    settings.isRetroTheme = true;
    settings.updateSettingsDisplay();
    expect(row.style.display).toBe('flex');
  });
});
