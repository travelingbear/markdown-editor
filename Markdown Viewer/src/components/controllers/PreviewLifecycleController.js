/**
 * Owns PreviewComponent output events and routes preview interactions to the
 * services responsible for tasks, files, exports, scrolling, and native UI.
 */
class PreviewLifecycleController extends BaseComponent {
  constructor(options = {}) {
    super('PreviewLifecycleController', options);
    this.previewComponent = null;
    this.editorComponent = null;
    this.documentComponent = null;
    this.tabManager = null;
    this.modeController = null;
    this.settingsController = null;
    this.markdownActionController = null;
    this.fileController = null;
    this.exportController = null;
    this.scrollCoordinator = null;
    this.handleError = () => {};
    this.previewEventHandlers = [];
    this.pendingTimers = new Set();
  }

  setDependencies(dependencies) {
    Object.assign(this, dependencies);
  }

  async onInit() {
    this.listen('task-toggled', (data) => this.handleTaskToggled(data));
    this.listen('external-link-clicked', ({ href }) => this.openExternalLink(href));
    this.listen('preview-error', ({ error }) => this.handleError(new Error(error), 'Preview'));
    this.listen('preview-updated', () => this.scrollCoordinator.alignPreviewToActiveTab());
    this.listen('mermaid-loaded', () => this.refreshSystemInfo());
    this.listen('katex-loaded', () => this.refreshSystemInfo());
    this.listen('reload-file-requested', () => this.reloadCurrentFile());
    this.listen('sync-from-code-requested', () => this.syncFromCode());
    this.listen('restart-app-requested', () => this.restartApplication());
    this.listen('export-html-requested', () => this.exportController.exportToHtml());
    this.listen('export-pdf-requested', () => this.exportController.exportToPdf());
  }

  listen(event, handler) {
    this.previewComponent.on(event, handler);
    this.previewEventHandlers.push({ event, handler });
  }

  schedule(callback, delay) {
    const timer = setTimeout(() => {
      this.pendingTimers.delete(timer);
      callback();
    }, delay);
    this.pendingTimers.add(timer);
    return timer;
  }

  handleTaskToggled({ taskText, checked, sourceLine = null }) {
    // Preserve the short post-render delay used by interactive task lists.
    const expectedTabId = this.tabManager.getActiveTab()?.id;
    this.schedule(() => {
      if (!expectedTabId || this.tabManager.getActiveTab()?.id !== expectedTabId) return;
      this.markdownActionController.updateTaskInMarkdown(taskText, checked, sourceLine);
    }, 10);
  }

  refreshSystemInfo() {
    this.settingsController.updateSystemInfo(
      this.editorComponent,
      this.previewComponent,
      this.modeController.getCurrentMode()
    );
  }

  reloadCurrentFile() {
    return this.fileController.reloadCurrentFile(
      this.documentComponent,
      this.tabManager,
      this.editorComponent,
      this.previewComponent
    );
  }

  syncFromCode() {
    const activeTab = this.tabManager.getActiveTab();
    this.previewComponent.emit('update-preview', {
      content: this.editorComponent.getContent(),
      filePath: activeTab?.filePath
    });
    this.schedule(() => {
      if (!activeTab || this.tabManager.getActiveTab()?.id !== activeTab.id) return;
      this.scrollCoordinator.alignPreviewFromEditor();
    }, 100);
  }

  async openExternalLink(href) {
    try {
      if (window.__TAURI__?.core?.invoke) {
        await window.__TAURI__.core.invoke('plugin:opener|open_url', { url: href });
      } else {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('[PreviewLifecycleController] Error opening external link:', error);
    }
  }

  async restartApplication() {
    try {
      if (window.__TAURI__?.process?.relaunch) {
        await window.__TAURI__.process.relaunch();
      } else {
        location.reload();
      }
    } catch (error) {
      console.error('[PreviewLifecycleController] Failed to restart application:', error);
      location.reload();
    }
  }

  onDestroy() {
    for (const { event, handler } of this.previewEventHandlers) {
      this.previewComponent?.off(event, handler);
    }
    this.previewEventHandlers = [];
    for (const timer of this.pendingTimers) clearTimeout(timer);
    this.pendingTimers.clear();
  }
}

window.PreviewLifecycleController = PreviewLifecycleController;
export { PreviewLifecycleController };
