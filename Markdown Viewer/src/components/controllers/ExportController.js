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
      const content = this.editorComponent.getContent();
      const previewHtml = document.getElementById('preview').innerHTML;
      
      const htmlDocument = this.createExportHtmlDocument(previewHtml);
      await this.saveHtmlFile(htmlDocument);
      
    } catch (error) {
      this.emit('export-error', { error, type: 'HTML Export' });
    }
  }

  async exportToPdf() {
    try {
      window.print();
    } catch (error) {
      this.emit('export-error', { error, type: 'PDF Export' });
    }
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
    .mermaid-diagram { text-align: center; margin: 20px 0; }`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Markdown</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <style>${styles}</style>
</head>
<body>
    ${previewHtml}
</body>
</html>`;
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