/**
 * Markdown Editor - Main Component Orchestrator
 * Manages all components and maintains existing functionality
 */
class MarkdownEditor extends BaseComponent {
  constructor(options = {}) {
    super('MarkdownEditor', options);
    
    // Component instances
    this.documentComponent = null;
    this.editorComponent = null;
    this.previewComponent = null;
    this.toolbarComponent = null;
    this.tabManager = null;
    
    // Application state
    this.currentMode = 'preview';
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    this.isRetroTheme = localStorage.getItem('markdownViewer_retroTheme') === 'true';
    this.defaultMode = localStorage.getItem('markdownViewer_defaultMode') || 'preview';
    this.isDistractionFree = false;
    this.centeredLayoutEnabled = localStorage.getItem('markdownViewer_centeredLayout') === 'true';
    this.suggestionsEnabled = localStorage.getItem('markdownViewer_suggestionsEnabled') === 'true';
    this.isToolbarEnabled = localStorage.getItem('markdownViewer_toolbarEnabled') !== 'false';
    this.isSplashEnabled = localStorage.getItem('markdownViewer_splashEnabled') !== 'false';
    this.splashDuration = parseInt(localStorage.getItem('markdownViewer_splashDuration') || '1');
    this.mainToolbarSize = localStorage.getItem('markdownViewer_mainToolbarSize') || 'medium';
    this.mdToolbarSize = localStorage.getItem('markdownViewer_mdToolbarSize') || 'medium';
    this.statusBarSize = localStorage.getItem('markdownViewer_statusBarSize') || 'medium';
    this.currentPageSize = localStorage.getItem('markdownViewer_pageSize') || 'a4';
    
    // Performance tracking
    this.startupTime = 0;
    this.lastFileOpenTime = 0;
    this.lastModeSwitchTime = 0;
    this.previewUpdateCount = 0;
    this.performanceOptimizer = window.PerformanceOptimizer ? new window.PerformanceOptimizer() : null;
    
    // Status bar elements
    this.cursorPos = null;
    this.filename = null;
  }

  async onInit() {
    const startupStartTime = performance.now();
    
    try {
      // Initialize performance optimizer early
      if (this.performanceOptimizer) {
        this.performanceOptimizer.detectOlderHardware();
        this.performanceOptimizer.optimizeForMultiTabs();
      }
      
      // Update splash screen progress
      this.updateSplashProgress(10, 'Initializing components...');
      
      // Initialize DOM elements
      this.initializeElements();
      
      this.updateSplashProgress(25, 'Creating components...');
      
      // Create and initialize components
      await this.createComponents();
      
      this.updateSplashProgress(50, 'Setting up communication...');
      
      // Set up inter-component communication
      this.setupComponentCommunication();
      
      this.updateSplashProgress(70, 'Applying settings...');
      
      // Apply initial settings
      this.applyInitialSettings();
      
      this.updateSplashProgress(85, 'Setting up event handlers...');
      
      // Set up global event handlers
      this.setupGlobalEventHandlers();
      
      this.updateSplashProgress(95, 'Finalizing...');
      
      // Complete initialization
      this.startupTime = performance.now() - startupStartTime;
      
      this.updateSplashProgress(100, 'Ready!');
      await new Promise(resolve => setTimeout(resolve, 500));
      this.hideSplash();
      
      // Check for startup file
      await this.checkStartupFile();
      
      // Play retro sound if enabled
      if (this.isRetroTheme) {
        this.playRetroStartupSound();
      }
      
      console.log(`[MarkdownEditor] Initialized in ${this.startupTime.toFixed(2)}ms`);
      
    } catch (error) {
      console.error('[MarkdownEditor] Initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  initializeElements() {
    // Status bar elements
    this.cursorPos = document.getElementById('cursor-pos');
    this.filename = document.getElementById('filename');
    
    if (!this.cursorPos || !this.filename) {
      throw new Error('Status bar elements not found');
    }
  }

  async createComponents() {
    // Create tab manager first
    this.tabManager = new TabManager();
    this.addChild(this.tabManager);
    await this.tabManager.init();
    
    // Create document component
    this.documentComponent = new DocumentComponent();
    this.addChild(this.documentComponent);
    await this.documentComponent.init();
    
    // Create editor component
    this.editorComponent = new EditorComponent();
    this.addChild(this.editorComponent);
    await this.editorComponent.init();
    
    // Create preview component
    this.previewComponent = new PreviewComponent();
    this.addChild(this.previewComponent);
    await this.previewComponent.init();
    
    // Create toolbar component
    this.toolbarComponent = new ToolbarComponent();
    this.addChild(this.toolbarComponent);
    await this.toolbarComponent.init();
  }

  setupComponentCommunication() {
    // Tab Manager Events
    this.tabManager.on('tab-created', (data) => {
      this.updateTabUI();
      this.switchToTab(data.tab.id);
    });
    
    this.tabManager.on('tab-removed', (data) => {
      this.updateTabUI();
      if (!this.tabManager.hasTabs()) {
        this.showWelcomePage();
      }
    });
    
    this.tabManager.on('tab-activated', (data) => {
      this.loadTabContent(data.tab);
      this.updateTabUI();
    });
    
    this.tabManager.on('tab-content-updated', (data) => {
      this.updateTabUI();
    });
    
    this.tabManager.on('tab-saved', (data) => {
      this.updateTabUI();
    });
    
    this.tabManager.on('tab-restored', (data) => {
      // Tab restored from persistence
    });
    
    this.tabManager.on('all-tabs-closed', (data) => {
      this.showWelcomePage();
      this.updateTabUI();
    });
    
    // Document Component Events
    this.documentComponent.on('document-opened', (data) => {
      // Open file in new tab or existing tab
      this.tabManager.openFileInTab(data.filePath, data.content);
      this.lastFileOpenTime = performance.now();
    });
    
    this.documentComponent.on('document-new', (data) => {
      // Create new tab
      this.tabManager.createNewTab(data.content);
      this.setMode('code'); // New files start in code mode
    });
    
    this.documentComponent.on('document-closed', () => {
      // Close active tab
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        this.tabManager.closeTab(activeTab.id);
      }
    });
    
    this.documentComponent.on('document-dirty-changed', (data) => {
      // Update active tab dirty state
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        activeTab.isDirty = data.isDirty;
        this.updateTabUI();
        this.updateFilename(null, data.isDirty);
        this.toolbarComponent.emit('document-state-changed', { 
          hasDocument: true, 
          isDirty: data.isDirty 
        });
      }
    });
    
    this.documentComponent.on('document-error', (data) => {
      this.handleError(new Error(data.error), data.type);
    });
    
    // Editor Component Events
    this.editorComponent.on('content-changed', (data) => {
      // Update active tab content
      const activeTab = this.tabManager.getActiveTab();
      if (activeTab) {
        this.tabManager.updateTabContent(activeTab.id, data.content);
      }
      this.documentComponent.emit('content-changed', data);
      this.previewComponent.emit('update-preview', data);
    });
    
    this.editorComponent.on('cursor-position-changed', (data) => {
      this.updateCursorPosition(data.line, data.col);
    });
    
    this.editorComponent.on('monaco-loaded', () => {
      // Monaco editor loaded successfully
    });
    
    this.editorComponent.on('markdown-action', (data) => {
      this.handleMarkdownAction(data.action);
    });
    
    // Preview Component Events
    this.previewComponent.on('task-toggled', (data) => {
      this.updateTaskInMarkdown(data.taskText, data.checked);
    });
    
    this.previewComponent.on('external-link-clicked', (data) => {
      this.openExternalLink(data.href);
    });
    
    this.previewComponent.on('preview-error', (data) => {
      this.handleError(new Error(data.error), 'Preview');
    });
    
    // Toolbar Component Events
    this.toolbarComponent.on('file-new-requested', () => {
      this.newFile();
    });
    
    this.toolbarComponent.on('file-open-requested', () => {
      this.openFile();
    });
    
    this.toolbarComponent.on('file-save-requested', () => {
      this.saveFile();
    });
    
    this.toolbarComponent.on('file-save-as-requested', () => {
      this.saveAsFile();
    });
    
    this.toolbarComponent.on('file-close-requested', () => {
      this.closeFile();
    });
    
    this.toolbarComponent.on('mode-change-requested', (data) => {
      this.setMode(data.mode);
    });
    
    this.toolbarComponent.on('export-html-requested', () => {
      this.exportToHtml();
    });
    
    this.toolbarComponent.on('export-pdf-requested', () => {
      this.exportToPdf();
    });
    
    this.toolbarComponent.on('distraction-free-toggle', () => {
      this.toggleDistractionFree();
    });
    
    this.toolbarComponent.on('theme-toggle', () => {
      this.toggleTheme();
    });
    
    this.toolbarComponent.on('settings-show', () => {
      this.showSettings();
    });
    
    this.toolbarComponent.on('help-show', () => {
      this.showHelp();
    });
    
    this.toolbarComponent.on('font-size-changed', (data) => {
      this.editorComponent.emit('font-size-changed', data);
    });
    
    this.toolbarComponent.on('zoom-changed', (data) => {
      this.previewComponent.emit('zoom-changed', data);
    });
    
    this.toolbarComponent.on('editor-undo', () => {
      this.editorComponent.undo();
    });
    
    this.toolbarComponent.on('editor-redo', () => {
      this.editorComponent.redo();
    });
    
    this.toolbarComponent.on('markdown-action', (data) => {
      this.handleMarkdownAction(data.action);
    });
  }

  applyInitialSettings() {
    // Apply theme
    this.applyTheme();
    
    // Apply centered layout
    this.applyCenteredLayout();
    
    // Apply page size
    this.applyPageSize();
    
    // Apply markdown toolbar visibility
    this.applyMarkdownToolbarVisibility();
    
    // Apply toolbar sizes
    document.body.setAttribute('data-main-toolbar-size', this.mainToolbarSize);
    document.body.setAttribute('data-md-toolbar-size', this.mdToolbarSize);
    document.body.setAttribute('data-status-bar-size', this.statusBarSize);
    
    // Show welcome page initially
    this.previewComponent.showWelcome();
    
    // Set initial mode and ensure proper pane visibility
    this.currentMode = 'preview';
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');
    const splitter = document.getElementById('splitter');
    
    if (editorPane && previewPane && splitter) {
      editorPane.style.display = 'none';
      previewPane.style.display = 'block';
      splitter.style.display = 'none';
    }
    
    // Update main content and body classes
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('code-mode', 'preview-mode', 'split-mode');
      mainContent.classList.add('preview-mode');
    }
    document.body.classList.remove('code-mode', 'preview-mode', 'split-mode');
    document.body.classList.add('preview-mode');
    
    // Update filename
    this.updateFilename('Welcome', false);
    
    // Update cursor position
    this.updateCursorPosition(1, 1);
    
    // Update toolbar state for no document
    this.toolbarComponent.emit('document-state-changed', { 
      hasDocument: false, 
      isDirty: false 
    });
    
    // Notify toolbar of current mode
    this.toolbarComponent.emit('mode-changed', { mode: 'preview' });
    
    // Initialize tab UI
    this.updateTabUI();
  }

  setupGlobalEventHandlers() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
    
    // Window close handler
    this.setupWindowCloseHandler();
    
    // Single instance handler
    this.setupSingleInstanceHandler();
    
    // Drag and drop
    this.setupDragAndDrop();
    
    // Splitter and scroll sync
    this.setupSplitter();
    this.setupScrollSync();
    
    // Modal event handlers
    this.setupModalEventHandlers();
    
    // Settings controls
    this.setupSettingsControls();
    
    // Tab dropdown
    this.setupTabDropdown();
  }

  handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          this.newFile();
          break;
        case 'o':
          e.preventDefault();
          this.openFile();
          break;
        case 's':
          e.preventDefault();
          if (e.shiftKey) {
            this.saveAsFile();
          } else {
            this.saveFile();
          }
          break;
        case 'w':
          e.preventDefault();
          this.closeFile();
          break;
        case '1':
          e.preventDefault();
          this.setMode('code');
          break;
        case '2':
          e.preventDefault();
          this.setMode('preview');
          break;
        case '3':
          e.preventDefault();
          this.setMode('split');
          break;
        case 't':
        case '/':
          e.preventDefault();
          this.toggleTheme();
          break;
        case ',':
          e.preventDefault();
          this.showSettings();
          break;
        case 'p':
          if (e.shiftKey) {
            e.preventDefault();
            this.exportToPdf();
          }
          break;
        case 'e':
          if (e.shiftKey) {
            e.preventDefault();
            this.exportToHtml();
          }
          break;
      }
    }
    
    // Function keys
    switch (e.key) {
      case 'F1':
        e.preventDefault();
        this.showHelp();
        break;
      case 'F5':
        e.preventDefault();
        this.refreshPreview();
        break;
      case 'F11':
        e.preventDefault();
        if (e.shiftKey) {
          this.toggleDistractionFree();
        } else {
          this.toggleFullscreen();
        }
        break;
      case 'Escape':
        // Close modals first, then exit distraction-free mode
        const settingsModal = document.getElementById('settings-modal');
        const helpModal = document.getElementById('help-modal');
        const aboutModal = document.getElementById('about-modal');
        
        if (settingsModal && settingsModal.style.display === 'flex') {
          this.hideSettings();
        } else if (helpModal && helpModal.style.display === 'flex') {
          this.hideHelp();
        } else if (aboutModal && aboutModal.style.display === 'flex') {
          this.hideAbout();
        } else if (this.isDistractionFree) {
          this.exitDistractionFree();
        } else if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  }

  // File Operations
  async newFile() {
    // Always create new tab for new files
    this.tabManager.createNewTab();
  }

  async openFile() {
    await this.documentComponent.openFile();
  }

  async saveFile() {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      const result = await this.documentComponent.saveFile();
      if (result && result.filePath) {
        this.tabManager.markTabSaved(activeTab.id, result.filePath);
      }
    }
  }

  async saveAsFile() {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      const result = await this.documentComponent.saveAsFile();
      if (result && result.filePath) {
        this.tabManager.markTabSaved(activeTab.id, result.filePath);
      }
    }
  }

  async closeFile() {
    const activeTab = this.tabManager.getActiveTab();
    if (activeTab) {
      await this.tabManager.closeTab(activeTab.id);
    }
  }

  // Mode Management
  async setMode(mode) {
    if (this.currentMode === mode) return;
    
    const startTime = performance.now();
    
    const documentState = this.documentComponent.getDocumentState();
    if (!documentState.hasDocument && (mode === 'code' || mode === 'split')) {
      return;
    }
    
    // Load Monaco Editor lazily when switching to code or split mode
    if ((mode === 'code' || mode === 'split') && !this.editorComponent.isMonacoLoaded) {
      try {
        await this.editorComponent.loadMonacoEditor();
      } catch (error) {
        console.error('[MarkdownEditor] Failed to load Monaco Editor:', error);
        mode = 'preview'; // Fall back to preview mode
      }
    }
    
    this.currentMode = mode;
    
    // Update main content class
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.classList.remove('code-mode', 'preview-mode', 'split-mode');
      mainContent.classList.add(`${mode}-mode`);
    }
    
    // Update body class for CSS selectors
    document.body.classList.remove('code-mode', 'preview-mode', 'split-mode');
    document.body.classList.add(`${mode}-mode`);
    
    // Show/hide appropriate panes based on mode
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');
    const splitter = document.getElementById('splitter');
    
    if (editorPane && previewPane && splitter) {
      switch (mode) {
        case 'code':
          editorPane.style.display = 'block';
          previewPane.style.display = 'none';
          splitter.style.display = 'none';
          break;
        case 'preview':
          editorPane.style.display = 'none';
          previewPane.style.display = 'block';
          splitter.style.display = 'none';
          break;
        case 'split':
          editorPane.style.display = 'block';
          previewPane.style.display = 'block';
          splitter.style.display = 'block';
          break;
      }
    }
    
    // Notify toolbar component
    this.toolbarComponent.emit('mode-changed', { mode });
    
    // Trigger layout update for Monaco if needed
    if (this.editorComponent.isMonacoLoaded && this.editorComponent.monacoEditor) {
      requestAnimationFrame(() => {
        this.editorComponent.monacoEditor.layout();
      });
    }
    
    this.lastModeSwitchTime = performance.now() - startTime;
  }

  // Theme Management
  toggleTheme() {
    const isRetro = document.body.classList.contains('retro-theme');
    if (isRetro) {
      // Exit retro mode and go to light theme
      document.body.classList.remove('retro-theme');
      localStorage.setItem('markdownViewer_retroTheme', 'false');
      this.theme = 'light';
      localStorage.setItem('markdownViewer_defaultTheme', 'light');
      this.isRetroTheme = false;
    } else {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('markdownViewer_defaultTheme', this.theme);
    }
    
    this.applyTheme();
    
    // Notify components
    this.editorComponent.emit('theme-changed', { theme: this.theme });
    this.previewComponent.emit('theme-changed', { theme: this.theme });
    this.toolbarComponent.updateThemeButton(this.theme, this.isRetroTheme);
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    
    if (this.isRetroTheme) {
      document.body.classList.add('retro-theme');
    }
  }

  // Distraction-Free Mode
  toggleDistractionFree() {
    if (this.isDistractionFree) {
      this.exitDistractionFree();
    } else {
      this.enterDistractionFree();
    }
  }

  enterDistractionFree() {
    this.isDistractionFree = true;
    document.body.classList.add('distraction-free');
    document.body.classList.add(`${this.currentMode}-mode`);
    
    this.toolbarComponent.emit('distraction-free-changed', { 
      isDistractionFree: true 
    });
  }

  exitDistractionFree() {
    this.isDistractionFree = false;
    document.body.classList.remove('distraction-free');
    
    this.toolbarComponent.emit('distraction-free-changed', { 
      isDistractionFree: false 
    });
  }

  // Layout Management
  applyCenteredLayout() {
    if (this.centeredLayoutEnabled) {
      document.body.classList.add('centered-layout');
    } else {
      document.body.classList.remove('centered-layout');
    }
  }

  applyPageSize() {
    const pageSizeMap = {
      'a4': 'var(--page-width-a4)',
      'letter': 'var(--page-width-letter)',
      'a3': 'var(--page-width-a3)'
    };
    
    const pageWidth = pageSizeMap[this.currentPageSize] || 'var(--page-width-a4)';
    document.documentElement.style.setProperty('--current-page-width', pageWidth);
  }

  applyMarkdownToolbarVisibility() {
    const markdownToolbar = document.getElementById('markdown-toolbar');
    if (markdownToolbar) {
      if (this.isToolbarEnabled) {
        markdownToolbar.classList.add('visible');
        markdownToolbar.style.display = '';
      } else {
        markdownToolbar.classList.remove('visible');
        markdownToolbar.style.display = 'none';
      }
    }
  }

  // Export Functions
  async exportToHtml() {
    try {
      const content = this.editorComponent.getContent();
      const previewHtml = document.getElementById('preview').innerHTML;
      
      const htmlDocument = this.createExportHtmlDocument(previewHtml);
      await this.saveHtmlFile(htmlDocument);
      
    } catch (error) {
      this.handleError(error, 'HTML Export');
    }
  }

  async exportToPdf() {
    try {
      window.print();
    } catch (error) {
      this.handleError(error, 'PDF Export');
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

  // Utility Functions
  updateCursorPosition(line, col) {
    if (this.cursorPos) {
      this.cursorPos.textContent = `Line ${line}, Col ${col}`;
    }
  }

  updateFilename(name = null, isDirty = null) {
    const filenameBtn = document.getElementById('filename');
    if (!filenameBtn) return;
    
    // If we have tabs, the filename is managed by updateTabUI
    if (this.tabManager && this.tabManager.hasTabs()) {
      return;
    }
    
    const documentState = this.documentComponent.getDocumentState();
    
    if (name === null) {
      if (documentState.currentFile) {
        name = documentState.fileName;
      } else if (documentState.hasDocument) {
        name = 'untitled.md';
      } else {
        name = 'Welcome';
      }
    }
    
    if (isDirty === null) {
      isDirty = documentState.isDirty;
    }
    
    filenameBtn.textContent = `${name}${isDirty ? ' *' : ''}`;
    filenameBtn.classList.remove('has-tabs');
  }

  handleMarkdownAction(action) {
    if (!this.editorComponent.isMonacoLoaded || !this.editorComponent.monacoEditor) return;
    
    const editor = this.editorComponent.monacoEditor;
    const model = editor.getModel();
    const selection = editor.getSelection();
    let selectedText = '';
    
    if (selection && !selection.isEmpty()) {
      selectedText = model.getValueInRange(selection);
    }
    
    let replacement = '';
    
    switch (action) {
      case 'bold':
        replacement = selectedText ? `**${selectedText}**` : '**text**';
        break;
      case 'italic':
        replacement = selectedText ? `*${selectedText}*` : '*text*';
        break;
      case 'h1':
        replacement = selectedText ? `# ${selectedText}` : '# Heading 1';
        break;
      case 'h2':
        replacement = selectedText ? `## ${selectedText}` : '## Heading 2';
        break;
      case 'h3':
        replacement = selectedText ? `### ${selectedText}` : '### Heading 3';
        break;
      case 'code':
        replacement = selectedText ? `\`${selectedText}\`` : '`code`';
        break;
      case 'link':
        replacement = selectedText ? `[${selectedText}](url)` : '[link text](url)';
        break;
      default:
        return;
    }
    
    if (selection && !selection.isEmpty()) {
      editor.executeEdits('markdown-toolbar', [{
        range: selection,
        text: replacement
      }]);
    } else {
      const position = editor.getPosition();
      editor.executeEdits('markdown-toolbar', [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: replacement
      }]);
    }
    
    editor.focus();
    this.documentComponent.handleContentChange(editor.getValue());
  }

  updateTaskInMarkdown(taskText, checked) {
    const content = this.editorComponent.getContent();
    const lines = content.split('\n');
    let inCodeBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      if (inCodeBlock) continue;
      
      if (line.includes(taskText)) {
        if (line.includes('- [ ]') || line.includes('- [x]')) {
          if (checked) {
            lines[i] = line.replace('- [ ]', '- [x]');
          } else {
            lines[i] = line.replace('- [x]', '- [ ]');
          }
          break;
        } else if (line.includes('[ ]') || line.includes('[x]')) {
          if (checked) {
            lines[i] = line.replace('[ ]', '[x]');
          } else {
            lines[i] = line.replace('[x]', '[ ]');
          }
          break;
        }
      }
    }
    
    const newContent = lines.join('\n');
    this.editorComponent.setContent(newContent);
    this.documentComponent.handleContentChange(newContent);
  }

  async openExternalLink(href) {
    try {
      if (window.__TAURI__?.core?.invoke) {
        await window.__TAURI__.core.invoke('plugin:opener|open_url', { url: href });
      } else {
        window.open(href, '_blank');
      }
    } catch (error) {
      console.error('[MarkdownEditor] Error opening external link:', error);
    }
  }

  refreshPreview() {
    const content = this.editorComponent.getContent();
    this.previewComponent.emit('update-preview', { content });
  }

  async toggleFullscreen() {
    try {
      if (window.__TAURI__?.window) {
        const { getCurrentWindow } = window.__TAURI__.window;
        const appWindow = getCurrentWindow();
        const isFullscreen = await appWindow.isFullscreen();
        await appWindow.setFullscreen(!isFullscreen);
      } else {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('[MarkdownEditor] Error toggling fullscreen:', error);
    }
  }

  setupModalEventHandlers() {
    // Settings modal
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    const settingsOverlay = document.querySelector('.settings-overlay');
    if (settingsCloseBtn) {
      settingsCloseBtn.addEventListener('click', () => this.hideSettings());
    }
    if (settingsOverlay) {
      settingsOverlay.addEventListener('click', () => this.hideSettings());
    }
    
    // Help modal
    const helpCloseBtn = document.getElementById('help-close-btn');
    const helpOverlay = document.querySelector('.help-overlay');
    if (helpCloseBtn) {
      helpCloseBtn.addEventListener('click', () => this.hideHelp());
    }
    if (helpOverlay) {
      helpOverlay.addEventListener('click', () => this.hideHelp());
    }
    
    // About modal
    const aboutCloseBtn = document.getElementById('about-close-btn');
    const aboutOverlay = document.querySelector('.about-overlay');
    if (aboutCloseBtn) {
      aboutCloseBtn.addEventListener('click', () => this.hideAbout());
    }
    if (aboutOverlay) {
      aboutOverlay.addEventListener('click', () => this.hideAbout());
    }
    
    // Welcome page buttons
    const welcomeNewBtn = document.getElementById('welcome-new-btn');
    const welcomeOpenBtn = document.getElementById('welcome-open-btn');
    const welcomeHelpBtn = document.getElementById('welcome-help-btn');
    const welcomeAboutBtn = document.getElementById('welcome-about-btn');
    const welcomeSettingsBtn = document.getElementById('welcome-settings-btn');
    
    if (welcomeNewBtn) {
      welcomeNewBtn.addEventListener('click', () => this.newFile());
    }
    if (welcomeOpenBtn) {
      welcomeOpenBtn.addEventListener('click', () => this.openFile());
    }
    if (welcomeHelpBtn) {
      welcomeHelpBtn.addEventListener('click', () => this.showHelp());
    }
    if (welcomeAboutBtn) {
      welcomeAboutBtn.addEventListener('click', () => this.showAbout());
    }
    if (welcomeSettingsBtn) {
      welcomeSettingsBtn.addEventListener('click', () => this.showSettings());
    }
    
    // Clear history button
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => this.clearFileHistory());
    }
  }

  showSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.style.display = 'flex';
      this.updateSettingsDisplay();
    }
  }
  
  hideSettings() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.style.display = 'none';
    }
  }

  showHelp() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
      helpModal.style.display = 'flex';
    }
  }
  
  hideHelp() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
      helpModal.style.display = 'none';
    }
  }
  
  showAbout() {
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) {
      aboutModal.style.display = 'flex';
    }
  }
  
  hideAbout() {
    const aboutModal = document.getElementById('about-modal');
    if (aboutModal) {
      aboutModal.style.display = 'none';
    }
  }
  
  updateSettingsDisplay() {
    const themeButtons = {
      'theme-light-btn': this.theme === 'light' && !this.isRetroTheme,
      'theme-dark-btn': this.theme === 'dark' && !this.isRetroTheme,
      'theme-retro-btn': this.isRetroTheme
    };
    
    Object.entries(themeButtons).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // Show/hide retro sound setting
    const retroSoundSetting = document.querySelector('.retro-sound-setting');
    if (retroSoundSetting) {
      retroSoundSetting.style.display = this.isRetroTheme ? 'flex' : 'none';
    }
    
    // Update retro sound checkbox
    const retroSoundCheckbox = document.getElementById('retro-sound-checkbox');
    if (retroSoundCheckbox) {
      const soundEnabled = localStorage.getItem('markdownViewer_retroSound') !== 'false';
      retroSoundCheckbox.checked = soundEnabled;
    }
    
    // Update mode buttons
    const modeButtons = {
      'mode-code-btn': this.defaultMode === 'code',
      'mode-preview-btn': this.defaultMode === 'preview',
      'mode-split-btn': this.defaultMode === 'split'
    };
    
    Object.entries(modeButtons).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // Update all other settings buttons
    const allSettings = {
      'suggestions-on-btn': this.suggestionsEnabled,
      'suggestions-off-btn': !this.suggestionsEnabled,
      'layout-on-btn': this.centeredLayoutEnabled,
      'layout-off-btn': !this.centeredLayoutEnabled,
      'toolbar-on-btn': this.isToolbarEnabled,
      'toolbar-off-btn': !this.isToolbarEnabled,
      'splash-on-btn': this.isSplashEnabled,
      'splash-off-btn': !this.isSplashEnabled
    };
    
    Object.entries(allSettings).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // Update splash duration buttons
    for (let i = 1; i <= 5; i++) {
      const btn = document.getElementById(`splash-${i}s-btn`);
      if (btn) {
        btn.classList.toggle('active', this.splashDuration === i);
      }
    }
    
    // Show/hide splash duration setting
    const durationSetting = document.getElementById('splash-duration-setting');
    if (durationSetting) {
      durationSetting.style.display = this.isSplashEnabled ? 'flex' : 'none';
    }
    
    // Update page size buttons
    const pageSizeButtons = {
      'page-a4-btn': this.currentPageSize === 'a4',
      'page-letter-btn': this.currentPageSize === 'letter',
      'page-a3-btn': this.currentPageSize === 'a3'
    };
    
    Object.entries(pageSizeButtons).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // Update toolbar size buttons
    const toolbarSizeButtons = {
      'main-toolbar-small': this.mainToolbarSize === 'small',
      'main-toolbar-medium': this.mainToolbarSize === 'medium',
      'main-toolbar-large': this.mainToolbarSize === 'large',
      'md-toolbar-small': this.mdToolbarSize === 'small',
      'md-toolbar-medium': this.mdToolbarSize === 'medium',
      'md-toolbar-large': this.mdToolbarSize === 'large',
      'status-bar-small': this.statusBarSize === 'small',
      'status-bar-medium': this.statusBarSize === 'medium',
      'status-bar-large': this.statusBarSize === 'large'
    };
    
    Object.entries(toolbarSizeButtons).forEach(([id, active]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.toggle('active', active);
      }
    });
    
    // Update system info
    const systemInfo = {
      'info-default-mode': this.defaultMode,
      'info-current-mode': this.currentMode,
      'info-monaco': this.editorComponent.isMonacoLoaded ? 'Loaded' : 'Not Loaded',
      'info-mermaid': this.previewComponent.mermaidInitialized ? 'Loaded' : 'Not Loaded',
      'info-katex': this.previewComponent.katexInitialized ? 'Loaded' : 'Not Loaded'
    };
    
    Object.entries(systemInfo).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
    
    // Update performance stats
    const perfElements = {
      'perf-startup': `${this.startupTime.toFixed(2)}ms`,
      'perf-file-open': `${this.lastFileOpenTime.toFixed(2)}ms`,
      'perf-mode-switch': `${this.lastModeSwitchTime.toFixed(2)}ms`,
      'perf-preview-update': '0ms',
      'perf-memory': this.getMemoryUsage(),
      'perf-update-count': this.previewUpdateCount.toString()
    };
    
    Object.entries(perfElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });
  }
  
  getMemoryUsage() {
    if (performance.memory) {
      const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
      return `${used}MB / ${total}MB`;
    }
    return 'N/A';
  }
  
  async playRetroStartupSound() {
    const soundEnabled = localStorage.getItem('markdownViewer_retroSound') !== 'false';
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const response = await fetch('assets/windows95_startup_hifi.mp3');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = 0.5;
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start(0);
    } catch (error) {
      console.warn('[MarkdownEditor] Retro sound failed:', error);
    }
  }
  
  clearFileHistory() {
    this.documentComponent.fileHistory = [];
    localStorage.removeItem('markdownViewer_fileHistory');
    this.documentComponent.updateFileHistoryDisplay();
  }
  
  setupSettingsControls() {
    // Theme controls
    const themeBtns = ['theme-light-btn', 'theme-dark-btn', 'theme-retro-btn'];
    themeBtns.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          if (id === 'theme-light-btn') {
            this.theme = 'light';
            this.isRetroTheme = false;
            document.body.classList.remove('retro-theme');
          } else if (id === 'theme-dark-btn') {
            this.theme = 'dark';
            this.isRetroTheme = false;
            document.body.classList.remove('retro-theme');
          } else {
            this.theme = 'light';
            this.isRetroTheme = true;
            document.body.classList.add('retro-theme');
            this.playRetroStartupSound();
          }
          localStorage.setItem('markdownViewer_defaultTheme', this.theme);
          localStorage.setItem('markdownViewer_retroTheme', this.isRetroTheme.toString());
          this.applyTheme();
          this.editorComponent.emit('theme-changed', { theme: this.theme });
          this.previewComponent.emit('theme-changed', { theme: this.theme });
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Mode controls
    ['mode-code-btn', 'mode-preview-btn', 'mode-split-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          const mode = id.replace('mode-', '').replace('-btn', '');
          this.defaultMode = mode;
          localStorage.setItem('markdownViewer_defaultMode', mode);
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Retro sound controls
    const retroSoundCheckbox = document.getElementById('retro-sound-checkbox');
    const testSoundBtn = document.getElementById('test-startup-sound-btn');
    
    if (retroSoundCheckbox) {
      retroSoundCheckbox.addEventListener('change', (e) => {
        localStorage.setItem('markdownViewer_retroSound', e.target.checked.toString());
      });
    }
    
    if (testSoundBtn) {
      testSoundBtn.addEventListener('click', () => {
        this.playRetroStartupSound();
      });
    }
    
    // Suggestions controls
    ['suggestions-on-btn', 'suggestions-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.suggestionsEnabled = id === 'suggestions-on-btn';
          localStorage.setItem('markdownViewer_suggestionsEnabled', this.suggestionsEnabled.toString());
          this.editorComponent.emit('suggestions-changed', { enabled: this.suggestionsEnabled });
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Layout controls
    ['layout-on-btn', 'layout-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.centeredLayoutEnabled = id === 'layout-on-btn';
          localStorage.setItem('markdownViewer_centeredLayout', this.centeredLayoutEnabled.toString());
          this.applyCenteredLayout();
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Toolbar controls
    ['toolbar-on-btn', 'toolbar-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.isToolbarEnabled = id === 'toolbar-on-btn';
          localStorage.setItem('markdownViewer_toolbarEnabled', this.isToolbarEnabled.toString());
          this.applyMarkdownToolbarVisibility();
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Splash controls
    ['splash-on-btn', 'splash-off-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.isSplashEnabled = id === 'splash-on-btn';
          localStorage.setItem('markdownViewer_splashEnabled', this.isSplashEnabled.toString());
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Splash duration controls
    for (let i = 1; i <= 5; i++) {
      const btn = document.getElementById(`splash-${i}s-btn`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.splashDuration = i;
          localStorage.setItem('markdownViewer_splashDuration', i.toString());
          this.updateSettingsDisplay();
        });
      }
    }
    
    // Page size controls
    ['page-a4-btn', 'page-letter-btn', 'page-a3-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.currentPageSize = id.replace('page-', '').replace('-btn', '');
          localStorage.setItem('markdownViewer_pageSize', this.currentPageSize);
          this.applyPageSize();
          this.updateSettingsDisplay();
        });
      }
    });
    
    // Toolbar size controls
    ['main-toolbar-small', 'main-toolbar-medium', 'main-toolbar-large'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.mainToolbarSize = id.replace('main-toolbar-', '');
          localStorage.setItem('markdownViewer_mainToolbarSize', this.mainToolbarSize);
          document.body.setAttribute('data-main-toolbar-size', this.mainToolbarSize);
          this.updateSettingsDisplay();
        });
      }
    });
    
    ['md-toolbar-small', 'md-toolbar-medium', 'md-toolbar-large'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.mdToolbarSize = id.replace('md-toolbar-', '');
          localStorage.setItem('markdownViewer_mdToolbarSize', this.mdToolbarSize);
          document.body.setAttribute('data-md-toolbar-size', this.mdToolbarSize);
          this.updateSettingsDisplay();
        });
      }
    });
    
    ['status-bar-small', 'status-bar-medium', 'status-bar-large'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.statusBarSize = id.replace('status-bar-', '');
          localStorage.setItem('markdownViewer_statusBarSize', this.statusBarSize);
          document.body.setAttribute('data-status-bar-size', this.statusBarSize);
          this.updateSettingsDisplay();
        });
      }
    });
  }

  async handleUnsavedChanges() {
    try {
      if (window.__TAURI__) {
        return await window.__TAURI__.dialog.confirm(
          'Close without saving changes?',
          { title: 'Unsaved Changes' }
        );
      }
      return confirm('Close without saving changes?');
    } catch (error) {
      return false;
    }
  }

  async setupWindowCloseHandler() {
    if (!window.__TAURI__?.window) return;
    
    try {
      const { getCurrentWindow } = window.__TAURI__.window;
      const appWindow = getCurrentWindow();
      
      await appWindow.onCloseRequested(async (event) => {
        const documentState = this.documentComponent.getDocumentState();
        if (documentState.isDirty) {
          event.preventDefault();
          
          const shouldClose = await this.handleUnsavedChanges();
          if (shouldClose) {
            await appWindow.close();
          }
        }
      });
    } catch (error) {
      console.error('[MarkdownEditor] Error setting up close handler:', error);
    }
  }

  async setupSingleInstanceHandler() {
    if (!window.__TAURI__?.event) return;
    
    try {
      const { listen } = window.__TAURI__.event;
      
      // Listen for single instance events
      await listen('single-instance-args', (event) => {
        console.log('[MarkdownEditor] Single instance event received:', event.payload);
        
        const files = event.payload;
        if (Array.isArray(files) && files.length > 0) {
          console.log('[MarkdownEditor] Opening files from single instance:', files);
          
          // Open each file in a new tab
          files.forEach(filePath => {
            this.documentComponent.openFile(filePath);
          });
        }
        
        // Focus the window
        this.focusWindow();
      });
      
      console.log('[MarkdownEditor] Single instance handler set up successfully');
    } catch (error) {
      console.error('[MarkdownEditor] Error setting up single instance handler:', error);
    }
  }

  async focusWindow() {
    try {
      if (window.__TAURI__?.window) {
        const { getCurrentWindow } = window.__TAURI__.window;
        const appWindow = getCurrentWindow();
        await appWindow.setFocus();
        await appWindow.unminimize();
        console.log('[MarkdownEditor] Window focused successfully');
      }
    } catch (error) {
      console.error('[MarkdownEditor] Error focusing window:', error);
    }
  }

  setupDragAndDrop() {
    let dragCounter = 0;
    
    document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      document.body.classList.add('drag-over');
    });
    
    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        document.body.classList.remove('drag-over');
      }
    });
    
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    
    document.addEventListener('drop', async (e) => {
      e.preventDefault();
      dragCounter = 0;
      document.body.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length === 0) return;
      
      try {
        const documentState = this.documentComponent.getDocumentState();
        
        // Welcome screen: open .md files
        if (!documentState.hasDocument) {
          const mdFile = files.find(f => /\.(md|markdown|txt)$/i.test(f.name));
          if (mdFile) {
            const content = await mdFile.text();
            this.documentComponent.setContent(content);
            this.documentComponent.emit('document-new', { content });
          }
          return;
        }
        
        // Code mode: insert file paths
        if (this.currentMode === 'code') {
          const filePaths = files.map(f => f.name);
          const insertText = filePaths.join('\n');
          
          // Insert at current cursor position
          const currentContent = this.editorComponent.getContent();
          const newContent = currentContent + '\n' + insertText;
          this.editorComponent.setContent(newContent);
          this.documentComponent.handleContentChange(newContent);
        }
      } catch (error) {
        console.error('[MarkdownEditor] Error processing drop:', error);
      }
    });
  }

  async checkStartupFile() {
    try {
      if (window.__TAURI__?.core?.invoke) {
        const startupFile = await window.__TAURI__.core.invoke('get_startup_file');
        
        if (startupFile && typeof startupFile === 'string' && startupFile.trim()) {
          await this.documentComponent.openFile(startupFile);
          
          try {
            await window.__TAURI__.core.invoke('clear_startup_file');
          } catch (clearError) {
            console.warn('[MarkdownEditor] Failed to clear startup file:', clearError);
          }
          return true;
        }
      }
    } catch (error) {
      console.error('[MarkdownEditor] Error checking startup file:', error);
    }
    
    return false;
  }

  updateSplashProgress(progress, message) {
    if (window.splashScreen) {
      window.splashScreen.updateProgress(progress, message);
    }
  }

  hideSplash() {
    if (window.splashScreen) {
      window.splashScreen.hideSplash();
    }
  }

  handleInitializationError(error) {
    this.hideSplash();
    console.error('[MarkdownEditor] Initialization error:', error);
    
    // Show basic interface even if advanced features fail
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
      welcomePage.style.display = 'flex';
    }
  }

  handleError(error, context = 'Unknown') {
    console.error(`[MarkdownEditor] ${context} error:`, error);
    
    if (window.__TAURI__?.dialog) {
      window.__TAURI__.dialog.message(
        `${context} Error: ${error.message}`,
        { title: 'Error', type: 'error' }
      ).catch(() => console.error('[MarkdownEditor] Failed to show error dialog'));
    }
  }

  setupSplitter() {
    const splitter = document.getElementById('splitter');
    const mainContent = document.querySelector('.main-content');
    if (!splitter || !mainContent) return;
    
    let isResizing = false;
    
    splitter.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const containerRect = mainContent.getBoundingClientRect();
      const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (percentage > 20 && percentage < 80) {
        mainContent.style.setProperty('--editor-width', `${percentage}%`);
        mainContent.style.setProperty('--preview-width', `${100 - percentage}%`);
        
        if (this.editorComponent.isMonacoLoaded && this.editorComponent.monacoEditor) {
          requestAnimationFrame(() => {
            this.editorComponent.monacoEditor.layout();
          });
        }
      }
    });
    
    document.addEventListener('mouseup', () => {
      isResizing = false;
      document.body.style.cursor = 'default';
    });
  }
  
  setupScrollSync() {
    // Basic scroll sync - will be enhanced later
  }

  // Tab Management Methods
  switchToTab(tabId) {
    this.tabManager.switchToTab(tabId);
  }
  
  loadTabContent(tab) {
    // Load tab content into editor and preview
    this.editorComponent.emit('set-content', { content: tab.content });
    this.previewComponent.emit('update-preview', { content: tab.content });
    this.previewComponent.showPreview();
    
    // Update filename and document state
    this.updateFilename(tab.fileName, tab.isDirty);
    this.toolbarComponent.emit('document-state-changed', { 
      hasDocument: true, 
      isDirty: tab.isDirty 
    });
    
    // Restore cursor position if available
    if (tab.cursorPosition && this.editorComponent.isMonacoLoaded) {
      setTimeout(() => {
        this.editorComponent.setCursorPosition(tab.cursorPosition.line, tab.cursorPosition.col);
      }, 100);
    }
  }
  
  showWelcomePage() {
    this.editorComponent.emit('set-content', { content: '' });
    this.previewComponent.emit('update-preview', { content: '' });
    this.previewComponent.showWelcome();
    this.updateFilename('Welcome', false);
    this.toolbarComponent.emit('document-state-changed', { 
      hasDocument: false, 
      isDirty: false 
    });
    this.setMode('preview');
  }
  
  updateTabUI() {
    const filenameBtn = document.getElementById('filename');
    const tabDropdownList = document.getElementById('tab-dropdown-list');
    const tabMoreBtn = document.getElementById('tab-more-btn');
    
    if (!filenameBtn || !tabDropdownList || !tabMoreBtn) return;
    
    const tabs = this.tabManager.getAllTabs();
    const activeTab = this.tabManager.getActiveTab();
    
    if (tabs.length === 0) {
      // No tabs - show default filename
      filenameBtn.textContent = 'Welcome';
      filenameBtn.classList.remove('has-tabs');
      return;
    }
    
    // Update filename button to show active tab
    if (activeTab) {
      const displayName = `${activeTab.fileName}${activeTab.isDirty ? ' *' : ''}`;
      filenameBtn.textContent = displayName;
      filenameBtn.classList.add('has-tabs');
    }
    
    // Clear existing dropdown items
    tabDropdownList.innerHTML = '';
    
    // Show up to 5 most recent tabs in dropdown
    const visibleTabs = tabs.slice(-5);
    const showMoreBtn = tabs.length > 5;
    
    visibleTabs.forEach(tab => {
      const tabElement = this.createDropdownTabElement(tab, activeTab);
      tabDropdownList.appendChild(tabElement);
    });
    
    // Show/hide more button
    tabMoreBtn.style.display = showMoreBtn ? 'block' : 'none';
  }
  
  createDropdownTabElement(tab, activeTab) {
    const tabElement = document.createElement('div');
    tabElement.className = `tab-dropdown-item ${tab.id === activeTab?.id ? 'active' : ''}`;
    tabElement.title = tab.filePath || tab.fileName;
    
    // Tab info
    const tabInfo = document.createElement('div');
    tabInfo.className = 'tab-dropdown-info';
    
    const tabName = document.createElement('div');
    tabName.className = `tab-dropdown-name ${tab.isDirty ? 'dirty' : ''}`;
    tabName.textContent = tab.fileName;
    tabInfo.appendChild(tabName);
    
    tabElement.appendChild(tabInfo);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-dropdown-close';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close tab';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.tabManager.closeTab(tab.id);
      this.hideTabDropdown();
    };
    tabElement.appendChild(closeBtn);
    
    // Click to switch tab
    tabElement.onclick = () => {
      this.switchToTab(tab.id);
      this.hideTabDropdown();
    };
    
    return tabElement;
  }
  
  setupTabDropdown() {
    const filenameBtn = document.getElementById('filename');
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    const tabMoreBtn = document.getElementById('tab-more-btn');
    const tabModal = document.getElementById('tab-modal');
    const tabModalClose = document.getElementById('tab-modal-close');
    const tabModalOverlay = document.querySelector('.tab-modal-overlay');
    
    // Filename button click to toggle dropdown
    if (filenameBtn) {
      filenameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.tabManager.hasTabs()) {
          this.toggleTabDropdown();
        }
      });
    }
    
    // More button click to show modal
    if (tabMoreBtn) {
      tabMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideTabDropdown();
        this.showTabModal();
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (tabDropdownMenu && !tabDropdownMenu.contains(e.target) && e.target !== filenameBtn) {
        this.hideTabDropdown();
      }
    });
    
    // Tab modal handlers
    if (tabModalClose) {
      tabModalClose.addEventListener('click', () => {
        this.hideTabModal();
      });
    }
    
    if (tabModalOverlay) {
      tabModalOverlay.addEventListener('click', () => {
        this.hideTabModal();
      });
    }
  }
  
  toggleTabDropdown() {
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    if (tabDropdownMenu) {
      const isVisible = tabDropdownMenu.classList.contains('show');
      if (isVisible) {
        this.hideTabDropdown();
      } else {
        this.showTabDropdown();
      }
    }
  }
  
  showTabDropdown() {
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    if (tabDropdownMenu) {
      tabDropdownMenu.classList.add('show');
    }
  }
  
  hideTabDropdown() {
    const tabDropdownMenu = document.getElementById('tab-dropdown-menu');
    if (tabDropdownMenu) {
      tabDropdownMenu.classList.remove('show');
    }
  }
  
  showTabModal() {
    const tabModal = document.getElementById('tab-modal');
    const tabModalList = document.getElementById('tab-modal-list');
    
    if (!tabModal || !tabModalList) return;
    
    const tabs = this.tabManager.getAllTabs();
    const activeTab = this.tabManager.getActiveTab();
    
    // Clear existing items
    tabModalList.innerHTML = '';
    
    tabs.forEach(tab => {
      const item = this.createTabModalItem(tab, activeTab);
      tabModalList.appendChild(item);
    });
    
    tabModal.style.display = 'flex';
  }
  
  hideTabModal() {
    const tabModal = document.getElementById('tab-modal');
    if (tabModal) {
      tabModal.style.display = 'none';
    }
  }
  
  createTabModalItem(tab, activeTab) {
    const item = document.createElement('div');
    item.className = `tab-modal-item ${tab.id === activeTab?.id ? 'active' : ''}`;
    
    const info = document.createElement('div');
    info.className = 'tab-modal-info';
    
    const name = document.createElement('div');
    name.className = 'tab-modal-name';
    name.textContent = `${tab.fileName}${tab.isDirty ? ' •' : ''}`;
    info.appendChild(name);
    
    if (tab.filePath) {
      const path = document.createElement('div');
      path.className = 'tab-modal-path';
      path.textContent = tab.filePath;
      info.appendChild(path);
    }
    
    item.appendChild(info);
    
    const actions = document.createElement('div');
    actions.className = 'tab-modal-actions';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-modal-close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close tab';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      this.tabManager.closeTab(tab.id);
      // Update modal content
      setTimeout(() => {
        if (this.tabManager.getAllTabs().length === 0) {
          this.hideTabModal();
        } else {
          this.showTabModal();
        }
      }, 100);
    };
    actions.appendChild(closeBtn);
    
    item.appendChild(actions);
    
    // Click to switch tab
    item.onclick = () => {
      this.switchToTab(tab.id);
      this.hideTabModal();
    };
    
    return item;
  }

  onDestroy() {
    // Clean up all child components
    if (this.tabManager) {
      this.tabManager.destroy();
    }
    if (this.documentComponent) {
      this.documentComponent.destroy();
    }
    if (this.editorComponent) {
      this.editorComponent.destroy();
    }
    if (this.previewComponent) {
      this.previewComponent.destroy();
    }
    if (this.toolbarComponent) {
      this.toolbarComponent.destroy();
    }
    
    // Reset state
    this.currentMode = 'preview';
    this.isDistractionFree = false;
  }
}

// Export for use in main application
window.MarkdownEditor = MarkdownEditor;