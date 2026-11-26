import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/SettingsController.js');
});

const THEME_BUTTONS = [
  'theme-light-btn',
  'theme-dark-btn',
  'theme-retro-btn',
  'theme-contrast-btn'
];

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `
    ${THEME_BUTTONS.map((id) => `<button id="${id}"></button>`).join('')}
    <div class="retro-sound-setting"></div>
    <input id="retro-sound-checkbox" type="checkbox">
  `;
});

function activeThemeButton() {
  return THEME_BUTTONS.find((id) => document.getElementById(id).classList.contains('active'));
}

function createSettings(stored = {}) {
  for (const [key, value] of Object.entries(stored)) localStorage.setItem(key, value);
  const settings = new window.SettingsController();
  settings.loadSettings();
  settings.setupSettingsControls();
  settings.updateSettingsDisplay();
  return settings;
}

describe('Settings theme state', () => {
  it('highlights the theme chosen in Settings', () => {
    const settings = createSettings();

    document.getElementById('theme-retro-btn').click();

    expect(activeThemeButton()).toBe('theme-retro-btn');
    expect(settings.getTheme()).toEqual({ theme: 'light', isRetroTheme: true });
    expect(document.querySelector('.retro-sound-setting').style.display).toBe('flex');
  });

  it('adopts a theme applied outside Settings', () => {
    const settings = createSettings();
    document.getElementById('theme-retro-btn').click();

    // The toolbar button and Ctrl+T both change the theme through
    // UIController, which SettingsController never hears about directly.
    settings.syncTheme({ theme: 'dark', isRetroTheme: false });

    expect(activeThemeButton()).toBe('theme-dark-btn');
    expect(settings.getTheme()).toEqual({ theme: 'dark', isRetroTheme: false });
    // Retro-only settings must follow the applied theme too.
    expect(document.querySelector('.retro-sound-setting').style.display).toBe('none');
  });

  it('stays silent so an adopted theme cannot be re-applied in a loop', () => {
    const settings = createSettings();
    const themeChanged = vi.fn();
    settings.on('theme-changed', themeChanged);

    settings.syncTheme({ theme: 'contrast', isRetroTheme: false });

    expect(themeChanged).not.toHaveBeenCalled();
    expect(activeThemeButton()).toBe('theme-contrast-btn');
  });

  it('treats a missing retro flag as not retro', () => {
    const settings = createSettings({ markdownViewer_retroTheme: 'true' });
    expect(settings.getTheme().isRetroTheme).toBe(true);

    settings.syncTheme({ theme: 'light' });

    expect(settings.getTheme()).toEqual({ theme: 'light', isRetroTheme: false });
    expect(activeThemeButton()).toBe('theme-light-btn');
  });
});
