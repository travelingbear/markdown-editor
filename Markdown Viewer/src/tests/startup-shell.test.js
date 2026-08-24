import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

describe('startup shell', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
    document.body.innerHTML = '<div class="app"></div>';
    delete window.splashScreen;
  });

  afterEach(() => {
    vi.useRealTimers();
    window.splashScreen?.splashElement?.remove();
    document.body.classList.remove('splash-visible');
    delete window.splashScreen;
  });

  it('creates the startup cover before the application shell and restores the saved theme', async () => {
    localStorage.setItem('markdownViewer_defaultTheme', 'dark');

    const { SPLASH_IMAGE_URL } = await import('../splash-component.js');

    expect(document.body.firstElementChild.id).toBe('splash-screen');
    expect(document.body.classList.contains('splash-visible')).toBe(true);
    expect(document.querySelector('.splash-image').getAttribute('src')).toBe(SPLASH_IMAGE_URL);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.body.dataset.theme).toBe('dark');
  });

  it('restores the startup theme without creating a cover when splash is disabled', async () => {
    localStorage.setItem('markdownViewer_splashEnabled', 'false');
    localStorage.setItem('markdownViewer_defaultTheme', 'dark');

    await import('../splash-component.js');

    expect(document.getElementById('splash-screen')).toBeNull();
    expect(document.body.firstElementChild.className).toBe('app');
    expect(document.body.dataset.theme).toBe('dark');
  });

  it('keeps the application covered until the splash fade has completed', async () => {
    vi.useFakeTimers();
    localStorage.setItem('markdownViewer_splashDuration', '0');

    await import('../splash-component.js');
    window.splashScreen.hideSplash();
    await vi.advanceTimersByTimeAsync(499);

    expect(document.body.classList.contains('splash-visible')).toBe(true);

    await vi.advanceTimersByTimeAsync(1);

    expect(document.getElementById('splash-screen')).toBeNull();
    expect(document.body.classList.contains('splash-visible')).toBe(false);
  });
});
