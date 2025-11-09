/**
 * ExportController - Handles document export functionality
 * Manages HTML/PDF export and provides foundation for future format extensions
 */
class ExportController extends BaseComponent {
  constructor(options = {}) {
    super('ExportController', options);
    
    // Dependencies
    this.editorComponent = null;
  }

  async onInit() {
    // Controller is ready
  }

  setDependencies(editorComponent) {
    this.editorComponent = editorComponent;
  }

  async exportToHtml() {
    try {
      const preview = document.getElementById('preview');
      const cleanHtml = this.cleanPreviewHtml(preview.cloneNode(true));
      
      const htmlDocument = this.createExportHtmlDocument(cleanHtml.innerHTML);
      await this.saveHtmlFile(htmlDocument);
      
    } catch (error) {
      this.emit('export-error', { error, type: 'HTML Export' });
    }
  }

  async exportToPdf() {
    try {
      // Load print styles dynamically and wait for them to be applied
      if (window.styleManager) {
        await window.styleManager.loadPrintStyles();
        // Small delay to ensure CSS is fully applied
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      
      // Hide pinned tabs during print
      const pinnedTabs = document.getElementById('pinned-tabs-bar');
      const originalPinnedDisplay = pinnedTabs?.style.display;
      if (pinnedTabs) pinnedTabs.style.display = 'none';
      
      // For code mode, create temporary HTML version
      const currentMode = document.body.classList.contains('code-mode');
      let tempDiv = null;
      let originalEditor = null;
      
      if (currentMode) {
        const content = this.editorComponent.getContent();
        tempDiv = document.createElement('div');
        tempDiv.innerHTML = `<pre style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; color: black; background: white; padding: 20px; margin: 0;">${this.escapeHtml(content)}</pre>`;
        
        originalEditor = document.querySelector('.monaco-editor-container');
        if (originalEditor) {
          originalEditor.style.display = 'none';
          originalEditor.parentNode.appendChild(tempDiv);
        }
      }
      
      window.print();
      
      // Restore everything
      if (pinnedTabs && originalPinnedDisplay !== undefined) {
        pinnedTabs.style.display = originalPinnedDisplay;
      }
      
      if (tempDiv && originalEditor) {
        tempDiv.remove();
        originalEditor.style.display = '';
      }
      
    } catch (error) {
      this.emit('export-error', { error, type: 'PDF Export' });
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  createExportHtmlDocument(previewHtml) {
    const styles = `body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #24292f;
    }
    h1, h2 { border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
    code { background-color: #f6f8fa; padding: 0.2em 0.4em; border-radius: 6px; }
    pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    blockquote { border-left: 0.25em solid #d0d7de; padding: 0 1em; color: #656d76; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d0d7de; padding: 6px 13px; text-align: left; }
    th { background-color: #f6f8fa; }
    .task-list-item { list-style: none; }
    .mermaid-diagram { text-align: center; margin: 20px 0; }
    .hljs{display:block;overflow-x:auto;padding:0.5em;color:#333;background:#f8f8f8}
    .hljs-comment,.hljs-quote{color:#998;font-style:italic}
    .hljs-keyword,.hljs-selector-tag,.hljs-subst{color:#333;font-weight:bold}
    .hljs-number,.hljs-literal,.hljs-variable,.hljs-template-variable,.hljs-tag .hljs-attr{color:#008080}
    .hljs-string,.hljs-doctag{color:#d14}
    .hljs-title,.hljs-section,.hljs-selector-id{color:#900;font-weight:bold}
    .hljs-subst{font-weight:normal}
    .hljs-type,.hljs-class .hljs-title{color:#458;font-weight:bold}
    .hljs-tag,.hljs-name,.hljs-attribute{color:#000080;font-weight:normal}
    .hljs-regexp,.hljs-link{color:#009926}
    .hljs-symbol,.hljs-bullet{color:#990073}
    .hljs-built_in,.hljs-builtin-name{color:#0086b3}
    .hljs-meta{color:#999;font-weight:bold}
    .hljs-deletion{background:#fdd}
    .hljs-addition{background:#dfd}
    .hljs-emphasis{font-style:italic}
    .hljs-strong{font-weight:bold}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Markdown</title>
    <style>${styles}</style>
</head>
<body>
    ${previewHtml}
</body>
</html>`;
  }

  cleanPreviewHtml(previewClone) {
    // Remove all UI elements from code blocks
    const uiElements = previewClone.querySelectorAll('.copy-btn, .wrap-btn, .code-actions, .code-block-buttons');
    uiElements.forEach(element => element.remove());
    
    return previewClone;
  }

  async saveHtmlFile(htmlDocument) {
    if (!window.__TAURI__) return;
    
    const filePath = await window.__TAURI__.dialog.save({
      filters: [{ name: 'HTML', extensions: ['html'] }]
    });
    
    if (filePath) {
      await window.__TAURI__.fs.writeTextFile(filePath, htmlDocument);
    }
  }
}

// Export for use in main application
window.ExportController = ExportController;