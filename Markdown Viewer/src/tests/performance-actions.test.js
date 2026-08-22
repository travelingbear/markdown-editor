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
