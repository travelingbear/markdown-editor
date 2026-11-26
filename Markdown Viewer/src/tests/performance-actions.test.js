import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(async () => {
  await import('../performance-optimizer.js');
});

let optimizer;

afterEach(() => {
  optimizer?.destroy();
  optimizer = null;
  delete window.markdownEditor;
  document.body.innerHTML = '';
});

function createOptimizer() {
  optimizer = new window.PerformanceOptimizer();
  optimizer.setupTabVirtualization();
  optimizer.setupPreviewCaching();
  optimizer.setupLazyTabLoading();
  optimizer.setupSmartTabUnloading();
  return optimizer;
}

describe('performance settings actions', () => {
  it('manual memory cleanup clears regenerable caches and inactive editor documents', () => {
    const instance = createOptimizer();
    instance.setCachedPreview('# cached', '<h1>cached</h1>');
    const active = { id: 'active', editorDocument: {} };
    const inactive = { id: 'inactive', editorDocument: {}, disposeEditorDocument: vi.fn(function () {
      this.editorDocument = null;
    }) };
    window.markdownEditor = {
      editorComponent: { getEditorAdapter: () => ({}) },
      tabManager: {
        getActiveTab: () => active,
        getAllTabs: () => [active, inactive],
        getTabsCount: () => 2
      }
    };

    const result = instance.performMemoryCleanup({ aggressive: true });

    expect(result).toEqual({ previewEntriesCleared: 1, editorDocumentsDisposed: 1 });
    expect(inactive.disposeEditorDocument).toHaveBeenCalledOnce();
    expect(instance.virtualizedTabs.has('inactive')).toBe(true);
  });

  it('clearing virtual tabs restores their UI state and reports the count', () => {
    const instance = createOptimizer();
    window.markdownEditor = {
      tabManager: {
        getAllTabs: () => Array.from({ length: 20 }, (_, index) => ({ id: `tab-${index + 1}` }))
      }
    };
    instance.virtualizedTabs.add('tab-1');
    instance.virtualizedTabs.add('tab-2');
    const restore = vi.spyOn(instance, 'restoreTab');

    const result = instance.clearAllVirtualTabs();

    expect(result).toEqual({ virtualTabsCleared: 2 });
    expect(restore).toHaveBeenCalledTimes(2);
    expect(instance.virtualizedTabs.size).toBe(0);
    instance.forceVirtualization(20);
    expect(instance.virtualizedTabs.size).toBe(0);
  });

  it('shows visible confirmation when either settings action runs', () => {
    const instance = createOptimizer();
    document.body.innerHTML = `
      <button id="perf-cleanup-btn"></button>
      <button id="perf-clear-virtual-btn"></button>
      <div id="perf-action-status"></div>
      <span id="perf-tab-count"></span>
    `;
    window.markdownEditor = {
      tabManager: { getTabsCount: () => 0, getAllTabs: () => [], getActiveTab: () => null }
    };
    instance.createPerformanceDashboard();

    document.getElementById('perf-cleanup-btn').click();

    const status = document.getElementById('perf-action-status');
    expect(status.classList.contains('show')).toBe(true);
    expect(status.textContent).toContain('Memory cleaned');
  });
});

describe('performance dashboard rendering', () => {
  function mountDashboard() {
    document.body.innerHTML = `
      <span id="perf-tab-count"></span>
      <span id="perf-memory"></span>
      <span id="perf-startup"></span>
      <span id="perf-tab-switch"></span>
      <span id="perf-status"></span>
      <span id="active-tabs-count"></span>
      <span id="memory-usage"></span>
      <span id="memory-pressure"></span>
      <span id="tab-switch-avg"></span>
    `;
  }

  it('writes every measurement into both current and retained element ids', () => {
    const instance = createOptimizer();
    mountDashboard();
    window.markdownEditor = {
      startupTime: 42.5,
      tabManager: { getTabsCount: () => 5, getAllTabs: () => [], getActiveTab: () => null }
    };
    instance.performanceMetrics.get('tabSwitches').push({ duration: 20 }, { duration: 40 });

    instance.updatePerformanceDashboard();

    expect(document.getElementById('perf-tab-count').textContent).toBe('5 (0 virtual)');
    expect(document.getElementById('active-tabs-count').textContent).toBe('5 (0 virtual)');
    expect(document.getElementById('perf-startup').textContent).toBe('42.50ms');
    expect(document.getElementById('perf-tab-switch').textContent).toBe('30.0ms');
    expect(document.getElementById('tab-switch-avg').textContent).toBe('30.0ms');
    expect(document.getElementById('tab-switch-avg').className).toBe('perf-value good');
  });

  it('reports a healthy session as good, with the reason on the status', () => {
    const instance = createOptimizer();
    mountDashboard();
    window.markdownEditor = {
      startupTime: 50,
      tabManager: { getTabsCount: () => 1, getAllTabs: () => [], getActiveTab: () => null }
    };

    instance.updatePerformanceDashboard();

    const status = document.getElementById('perf-status');
    expect(status.textContent).toBe('Good');
    expect(status.className).toBe('status-good');
    expect(status.title).toBe('Performance is good');
  });

  it('surfaces slow tab switching as a warning', () => {
    const instance = createOptimizer();
    mountDashboard();
    window.markdownEditor = {
      tabManager: { getTabsCount: () => 1, getAllTabs: () => [], getActiveTab: () => null }
    };
    instance.performanceMetrics.get('tabSwitches').push({ duration: 150 });

    instance.updatePerformanceDashboard();

    const status = document.getElementById('perf-status');
    expect(status.textContent).toBe('Warning');
    expect(status.title).toContain('Slow tab switching');
    expect(document.getElementById('perf-tab-switch').textContent).toBe('150.0ms');
  });

  it('counts virtual tabs and clears them once every tab is gone', () => {
    const instance = createOptimizer();
    mountDashboard();
    instance.virtualizedTabs.add('ghost');
    window.markdownEditor = {
      tabManager: { getTabsCount: () => 0, getAllTabs: () => [], getActiveTab: () => null }
    };

    instance.updatePerformanceDashboard();

    expect(instance.virtualizedTabs.size).toBe(0);
    expect(document.getElementById('perf-tab-count').textContent).toBe('0 (0 virtual)');
  });

  it('falls back to the rendered tab dropdown without an editor', () => {
    const instance = createOptimizer();
    mountDashboard();
    document.body.insertAdjacentHTML('beforeend',
      '<div class="tab-dropdown-item"></div><div class="tab-dropdown-item"></div>');
    delete window.markdownEditor;

    instance.updatePerformanceDashboard();

    expect(document.getElementById('perf-tab-count').textContent).toBe('2 (0 virtual)');
  });

  it('renders nothing and does not throw when the section is absent', () => {
    const instance = createOptimizer();
    document.body.innerHTML = '';

    expect(() => instance.updatePerformanceDashboard()).not.toThrow();
  });
});

describe('lazy tab loading', () => {
  it('loads the first few documents eagerly and the rest on demand', () => {
    const instance = createOptimizer();

    // maxActiveEditors was only ever assigned by low power mode, so this
    // comparison ran against undefined and lazy loading never engaged.
    expect(instance.maxActiveEditors).toBe(5);
    expect(instance.shouldLazyLoadTab(0, 50)).toBe(false);
    expect(instance.shouldLazyLoadTab(4, 50)).toBe(false);
    expect(instance.shouldLazyLoadTab(5, 50)).toBe(true);
    expect(instance.shouldLazyLoadTab(20, 50)).toBe(true);
  });

  it('stays eager until the session is large enough to matter', () => {
    const instance = createOptimizer();

    expect(instance.shouldLazyLoadTab(5, 10)).toBe(false);
    expect(instance.shouldLazyLoadTab(5, 11)).toBe(true);
  });

  it('keeps only one document eager in low power mode', () => {
    const instance = createOptimizer();
    instance.enableLowPowerMode();

    expect(instance.maxActiveEditors).toBe(1);
    expect(instance.shouldLazyLoadTab(1, 50)).toBe(true);
  });
});

describe('teardown', () => {
  it('tears down an instance that was never fully set up', () => {
    // destroy() clears collections the setup methods create, so it used to
    // throw when nothing had run between construction and disposal.
    const bare = new window.PerformanceOptimizer();

    expect(() => bare.destroy()).not.toThrow();
  });

  it('tears down a fully set up instance', () => {
    const instance = createOptimizer();
    instance.trackTabAccess('a');

    expect(() => instance.destroy()).not.toThrow();
    expect(instance.tabAccessPattern.size).toBe(0);
    optimizer = null;
  });
});
