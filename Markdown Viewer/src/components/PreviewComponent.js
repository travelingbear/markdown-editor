import { sanitizeRenderedHtml } from '../rendering/security.js';
import { extractMarkdownTasks } from '../rendering/taskSyntax.js';
import {
  applyPreviewPostProcessing,
  validateAndFixLink
} from '../rendering/previewHtml.js';

/**
 * Preview Component
 * Manages markdown rendering and preview functionality
 */
class PreviewComponent extends BaseComponent {
  constructor(options = {}) {
    super('PreviewComponent', options);
    this.rendererRegistry = options.rendererRegistry || null;
    
    // Preview state
    this.currentContent = '';
    this.previewZoom = 1.0;
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    this.advancedRenderingEnabled = localStorage.getItem('markdownViewer_advancedRendering') === 'true';
    
    // Libraries
    this.highlightInitialized = false;
    this.highlighter = null;
    this.renderVersion = 0;
    
    // Task list states
    this.taskListStates = new Map();
    
    // Event handlers
    this.taskChangeHandler = null;
    this.anchorClickHandler = null;
  }

  async onInit() {
    // Initialize DOM elements
    this.initializeElements();
    
    // Load advanced libraries
    await this.initializeAdvancedFeatures();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Apply initial settings
    this.applySettings();
  }

  initializeElements() {
    this.preview = document.getElementById('preview');
    this.welcomePage = document.getElementById('welcome-page');
    
    if (!this.preview) {
      throw new Error('Preview element not found');
    }
  }

  async initializeAdvancedFeatures() {
    // Libraries will be loaded lazily when needed
  }

  setupEventListeners() {
    // Listen for content updates
    this.on('update-preview', (data) => {
      if (data.filePath) {
        this.setCurrentFilePath(data.filePath);
      }
      this.updatePreview(data.content);
    });
    
    // Listen for theme changes
    this.on('theme-changed', (data) => {
      this.updateTheme(data.theme);
    });
    
    // Listen for zoom changes
    this.on('zoom-changed', (data) => {
      this.updateZoom(data.zoom);
    });

    this.on('rendering-mode-changed', (data) => {
      this.advancedRenderingEnabled = data.extended === true;
      this.updatePreview();
    });
    
    // Setup context menu
    this.setupContextMenu();
  }

  /**
   * Update preview with new content
   */
  async updatePreview(markdown = null) {
    const renderVersion = ++this.renderVersion;

    if (markdown === null || markdown === undefined) {
      markdown = this.currentContent;
    }
    
    this.currentContent = markdown;
    
    // Sanitize markdown input
    if (window.SecurityUtils) {
      markdown = window.SecurityUtils.sanitizeMarkdownInput(markdown);
    }
    
    if (typeof marked === 'undefined') {
      console.error('[Preview] marked.js not loaded');
      this.preview.innerHTML = '<p>Markdown parser not loaded</p>';
      return;
    }

    try {
      // Configure marked
      this.configureMarked();
      
      // Renderers own any syntax Markdown would otherwise claim, so they see
      // the source before it is parsed.
      const rendererContext = this.createRendererContext(markdown, renderVersion);
      let source = markdown;
      if (this.rendererRegistry) {
        source = await this.rendererRegistry.transformMarkdown(markdown, rendererContext);
        if (renderVersion !== this.renderVersion) return;
      }

      // Parse markdown to HTML
      let html = marked.parse(source);
      
      html = applyPreviewPostProcessing(html);
      if (this.rendererRegistry) {
        html = await this.rendererRegistry.transformHtml(html, rendererContext);
        if (renderVersion !== this.renderVersion) return;
      }
      html = sanitizeRenderedHtml(html);

      if (renderVersion !== this.renderVersion) return;
      
      // Set the HTML content
      this.preview.innerHTML = html;
      
      if (this.rendererRegistry) {
        await this.rendererRegistry.afterRender(this.preview, { ...rendererContext, html });
        if (renderVersion !== this.renderVersion) return;
      }
      this.setupTaskListInteractions();
      this.setupAnchorLinks();
      if (this.advancedRenderingEnabled) {
        await this.applySyntaxHighlighting();
        if (renderVersion !== this.renderVersion) return;
      }
      this.setupCodeBlockButtons();
      
      // Process images only if there are images in the content
      if (html.includes('<img')) {
        await this.processImages();
        if (renderVersion !== this.renderVersion) return;
      }
      
      this.emit('preview-updated', { content: html });
      
    } catch (error) {
      console.error('[Preview] Error updating preview:', error);
      this.preview.innerHTML = '<p>⚠️ Markdown rendering error</p>';
      this.emit('preview-error', { error: error.message });
    }
  }

  createRendererContext(markdown, renderVersion) {
    return {
      markdown,
      mode: this.advancedRenderingEnabled ? 'extended' : 'pure',
      theme: this.theme,
      filePath: this.currentFilePath || null,
      renderVersion,
      isCurrent: () => renderVersion === this.renderVersion
    };
  }

  configureMarked() {
    // Reset marked configuration first
    marked.setOptions(marked.getDefaults());
    
    if (marked.use) {
      marked.use({
        breaks: true,
        gfm: true,
        renderer: {
          image(href, title, text) {
            const titleAttr = title ? ` title="${title}"` : '';
            const altAttr = text ? ` alt="${text}"` : '';
            const hrefStr = typeof href === 'object' ? (href.href || href.raw || '') : String(href || '');
            const escapedHref = hrefStr.replace(/"/g, '&quot;');
            
            return `<img data-original-src="${escapedHref}" src="${escapedHref}"${altAttr}${titleAttr} style="max-width: 100%; height: auto;" class="markdown-image">`;
          }
        }
      });
    } else {
      // Legacy API
      const renderer = new marked.Renderer();
      
      renderer.image = function(href, title, text) {
        const titleAttr = title ? ` title="${title}"` : '';
        const altAttr = text ? ` alt="${text}"` : '';
        const hrefStr = typeof href === 'object' ? (href.href || href.raw || '') : String(href || '');
        const escapedHref = hrefStr.replace(/"/g, '&quot;');
        
        return `<img data-original-src="${escapedHref}" src="${escapedHref}"${altAttr}${titleAttr} style="max-width: 100%; height: auto;" class="markdown-image">`;
      };
      
      marked.setOptions({
        breaks: true,
        gfm: true,
        renderer: renderer
      });
    }
  }

  setupTaskListInteractions() {
    // Marked task inputs are disabled before activation, while the fallback
    // renderer wraps its generated inputs in task-list-item. This avoids
    // attaching Markdown behavior to unrelated raw HTML checkboxes.
    const checkboxes = this.preview.querySelectorAll(
      'input[disabled][type="checkbox"], .task-list-item input[type="checkbox"]'
    );
    const sourceTasks = extractMarkdownTasks(this.currentContent);

    checkboxes.forEach((checkbox, taskIndex) => {
      const sourceTask = sourceTasks[taskIndex];
      const taskLabel = this.prepareTaskLabel(checkbox);
      checkbox.classList.add('markdown-task-checkbox');
      checkbox.removeAttribute('disabled');
      if (sourceTask) checkbox.dataset.sourceLine = String(sourceTask.lineIndex);
      checkbox.addEventListener('change', (e) => {
        const taskText = sourceTask?.text
          || taskLabel?.textContent.trim()
          || e.target.parentElement.textContent.trim();
        const sourceLine = Number.parseInt(e.target.dataset.sourceLine, 10);
        
        this.emit('task-toggled', {
          taskText: taskText,
          checked: e.target.checked,
          sourceLine: Number.isInteger(sourceLine) ? sourceLine : null
        });
      });
    });
  }

  prepareTaskLabel(checkbox) {
    const existingLabel = checkbox.nextElementSibling;
    if (existingLabel?.tagName === 'LABEL') {
      existingLabel.classList.add('markdown-task-label');
      return existingLabel;
    }

    const container = checkbox.parentElement;
    if (!container) return null;

    const label = document.createElement('span');
    label.className = 'markdown-task-label';
    const labelNodes = [];
    let sibling = checkbox.nextSibling;

    while (sibling) {
      const nextSibling = sibling.nextSibling;
      const isNestedList = sibling.nodeType === 1
        && (sibling.tagName === 'UL' || sibling.tagName === 'OL');
      if (isNestedList) break;
      labelNodes.push(sibling);
      sibling = nextSibling;
    }

    labelNodes.forEach((node) => label.appendChild(node));
    checkbox.after(label);
    return label;
  }

  setupAnchorLinks() {
    // Add IDs to headers
    const headers = this.preview.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headers.forEach(header => {
      if (!header.id) {
        const id = header.textContent.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
        header.id = id;
      }
    });
    
    // Handle link clicks
    if (this.anchorClickHandler) {
      this.preview.removeEventListener('click', this.anchorClickHandler);
    }
    
    this.anchorClickHandler = (e) => {
      let linkElement = null;
      let href = null;
      
      if (e.target.tagName === 'A') {
        linkElement = e.target;
        href = linkElement.getAttribute('href');
      } else if (e.target.tagName === 'IMG' && e.target.parentElement.tagName === 'A') {
        linkElement = e.target.parentElement;
        href = linkElement.getAttribute('href');
      }
      
      if (!href || !linkElement) return;
      
      try {
        // Handle internal anchor links
        if (href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = this.preview.querySelector(`#${targetId}`);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          return;
        }
        
        // Validate and fix common link issues
        let validHref = validateAndFixLink(href);
        
        if (validHref) {
          e.preventDefault();
          this.emit('external-link-clicked', { href: validHref });
        }
      } catch (error) {
        console.warn('[Preview] Link handling error:', error, 'for href:', href);
        e.preventDefault(); // Prevent navigation on error
      }
    };
    
    this.preview.addEventListener('click', this.anchorClickHandler);
  }
  
  async applySyntaxHighlighting() {
    const codeBlocks = this.preview.querySelectorAll('pre code:not([data-highlighted])');
    if (codeBlocks.length === 0) return;

    if (!this.highlightInitialized) {
      try {
        const [highlightModule] = await Promise.all([
          import('highlight.js/lib/common'),
          import('highlight.js/styles/github.css')
        ]);
        this.highlighter = highlightModule.default;
        this.highlightInitialized = true;
      } catch (error) {
        console.warn('[Preview] Failed to load syntax highlighting:', error);
        return;
      }
    }

    if (this.highlighter) {
      codeBlocks.forEach((block) => {
        try {
          // Store original text content if not already stored
          if (!block.hasAttribute('data-original-text')) {
            block.setAttribute('data-original-text', block.textContent || '');
          }
          
          // Reset to original text content to remove any HTML
          const originalText = block.getAttribute('data-original-text') || '';
          block.textContent = originalText;
          
          // Remove all hljs classes
          block.className = block.className.replace(/\bhljs[\w-]*\b/g, '').trim();
          
          this.highlighter.highlightElement(block);
          block.setAttribute('data-highlighted', 'yes');
        } catch (error) {
          // Silently handle highlighting errors
          block.setAttribute('data-highlighted', 'error');
        }
      });
    }
  }

  setupCodeBlockButtons() {
    this.preview.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.code-block-buttons')) return;
      
      const codeElement = pre.querySelector('code');
      if (!codeElement) return;
      
      const originalText = codeElement.textContent || codeElement.innerText;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'code-block-buttons';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-btn copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.title = 'Copy code';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(originalText).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => copyBtn.textContent = 'Copy', 1000);
        });
      });
      
      const breakBtn = document.createElement('button');
      breakBtn.className = 'code-btn break-btn';
      breakBtn.textContent = 'Wrap';
      breakBtn.title = 'Toggle line wrapping';
      breakBtn.addEventListener('click', () => {
        const isWrapped = codeElement.style.whiteSpace === 'pre-wrap';
        if (isWrapped) {
          codeElement.style.whiteSpace = '';
          codeElement.style.wordBreak = '';
          breakBtn.textContent = 'Wrap';
        } else {
          codeElement.style.whiteSpace = 'pre-wrap';
          codeElement.style.wordBreak = 'break-word';
          breakBtn.textContent = 'Unwrap';
        }
      });
      
      buttonContainer.appendChild(copyBtn);
      buttonContainer.appendChild(breakBtn);
      pre.appendChild(buttonContainer);
    });
  }

  async processImages() {
    const images = this.preview.querySelectorAll('img.markdown-image');
    
    if (images.length === 0) {
      return;
    }
    
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < images.length; i += batchSize) {
      batches.push(Array.from(images).slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      const batchPromises = batch.map(img => this.processImage(img));
      
      try {
        await Promise.race([
          Promise.all(batchPromises),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Batch timeout')), 3000))
        ]);
      } catch (error) {
        console.warn('[Preview] Image batch processing timeout:', error);
      }
    }
  }

  async processImage(img) {
    let originalSrc = img.getAttribute('data-original-src');
    
    if (!originalSrc) {
      return;
    }
    
    if (originalSrc.includes('%')) {
      try {
        const decodedSrc = decodeURIComponent(originalSrc);
        originalSrc = decodedSrc;
      } catch (e) {
        return;
      }
    }
    
    try {
      const isLocalFile = !originalSrc.startsWith('http://') && !originalSrc.startsWith('https://') && !originalSrc.startsWith('data:');
      
      if (isLocalFile && window.__TAURI__?.core?.invoke) {
        try {
          let resolvedPath = originalSrc;
          
          const isAbsolutePath = originalSrc.startsWith('/') || originalSrc.match(/^[A-Za-z]:/);
          
          if (!isAbsolutePath) {
            let baseDir = null;
            if (this.currentFilePath) {
              const pathSeparator = this.currentFilePath.includes('\\') ? '\\' : '/';
              const pathParts = this.currentFilePath.split(pathSeparator);
              pathParts.pop();
              baseDir = pathParts.join(pathSeparator);
            }
            
            if (!baseDir) {
              const projectDir = await this.getCurrentWorkingDirectory();
              baseDir = projectDir;
            }
            
            if (!this.currentFilePath && (baseDir.endsWith('/src-tauri') || baseDir.endsWith('\\src-tauri'))) {
              baseDir = baseDir.replace(/[\/\\]Markdown Viewer[\/\\]src-tauri$/, '');
            }
            
            const pathSeparator = baseDir.includes('\\') ? '\\' : '/';
            const normalizedSrc = originalSrc.replace(/[\/\\]/g, pathSeparator);
            resolvedPath = `${baseDir}${pathSeparator}${normalizedSrc}`;
          }
          
          const dataUrl = await window.__TAURI__.core.invoke('convert_local_image_path', { filePath: resolvedPath });
          
          if (dataUrl && typeof dataUrl === 'string') {
            img.src = dataUrl;
            img.classList.add('local-image');
          } else {
            throw new Error('Invalid image data returned');
          }
        } catch (error) {
          img.classList.add('image-error');
          img.title = `Image not found: ${originalSrc}`;
          img.alt = `[Image not found: ${originalSrc}]`;
        }
      } else {
        img.classList.add('remote-image');
      }
    } catch (error) {
      console.error('[Preview] Image processing error:', error);
      img.classList.add('image-error');
      img.title = `Error loading image: ${error.message}`;
    }
  }
  
  async getCurrentWorkingDirectory() {
    try {
      if (window.__TAURI__?.core?.invoke) {
        const currentDir = await window.__TAURI__.core.invoke('get_current_dir');
        return currentDir;
      }
    } catch (error) {
      console.warn('[Preview] Failed to get current directory:', error);
    }
    
    return '.';
  }

  /**
   * Update theme
   */
  updateTheme(theme) {
    this.theme = theme;
    // Re-render the generic pipeline so theme-aware renderer plugins receive
    // fresh context without the preview core knowing which plugins use it.
    if (this.currentContent) this.updatePreview();
  }

  /**
   * Update zoom
   */
  updateZoom(zoom) {
    this.previewZoom = zoom;
    
    if (this.preview) {
      this.preview.style.setProperty('--zoom-scale', this.previewZoom);
    }
    
    this.emit('zoom-updated', { zoom: this.previewZoom });
  }

  /**
   * Apply current settings
   */
  applySettings() {
    this.updateZoom(this.previewZoom);
  }
  
  /**
   * Set current file path for resolving relative image paths
   */
  setCurrentFilePath(filePath) {
    this.currentFilePath = filePath;
    if (filePath) {
      const pathSeparator = filePath.includes('\\') ? '\\' : '/';
      const pathParts = filePath.split(pathSeparator);
      pathParts.pop();
      this.currentFileDirectory = pathParts.join(pathSeparator);
    } else {
      this.currentFileDirectory = null;
    }
  }

  /**
   * Show welcome page
   */
  showWelcome() {
    if (this.welcomePage && this.preview) {
      this.welcomePage.style.display = 'flex';
      this.preview.style.display = 'none';
      // Ensure the preview pane is visible to contain the welcome page
      const previewPane = document.querySelector('.preview-pane');
      if (previewPane) {
        previewPane.style.display = 'block';
      }
    }
  }

  /**
   * Show preview
   */
  showPreview() {
    if (this.welcomePage && this.preview) {
      this.welcomePage.style.display = 'none';
      this.preview.style.display = 'block';
      const previewPane = document.querySelector('.preview-pane');
      if (previewPane) {
        previewPane.style.display = 'block';
      }
    }
  }

  setupContextMenu() {
    // Create context menu
    this.contextMenu = document.createElement('div');
    this.contextMenu.className = 'preview-context-menu';
    this.contextMenu.style.display = 'none';
    this.contextMenu.innerHTML = `
      <div class="context-menu-item" data-action="reload-file">Reload File</div>
      <div class="context-menu-item" data-action="sync-from-code">Sync from Code</div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item submenu-parent" data-action="export">
        Export
        <span class="submenu-arrow">▶</span>
        <div class="context-submenu">
          <div class="context-menu-item" data-action="export-html">HTML</div>
          <div class="context-menu-item" data-action="export-pdf">PDF</div>
        </div>
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" data-action="restart-app">Restart Application</div>
    `;
    document.body.appendChild(this.contextMenu);
    
    // Context menu event handlers
    this.preview.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY);
    });
    
    // Hide context menu on click outside
    document.addEventListener('click', () => {
      this.hideContextMenu();
    });
    
    // Context menu item clicks
    this.contextMenu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action && action !== 'export') {
        this.handleContextMenuAction(action);
        this.hideContextMenu();
      }
    });
  }
  
  showContextMenu(x, y) {
    this.contextMenu.style.left = x + 'px';
    this.contextMenu.style.top = y + 'px';
    this.contextMenu.style.display = 'block';
    
    // Adjust position if menu goes off screen
    const rect = this.contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.contextMenu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      this.contextMenu.style.top = (y - rect.height) + 'px';
    }
  }
  
  hideContextMenu() {
    this.contextMenu.style.display = 'none';
  }
  
  handleContextMenuAction(action) {
    switch (action) {
      case 'reload-file':
        this.emit('reload-file-requested');
        break;
      case 'sync-from-code':
        this.emit('sync-from-code-requested');
        break;
      case 'export-html':
        this.emit('export-html-requested');
        break;
      case 'export-pdf':
        this.emit('export-pdf-requested');
        break;
      case 'restart-app':
        this.emit('restart-app-requested');
        break;
    }
  }

  onDestroy() {
    // Clean up event handlers
    if (this.taskChangeHandler) {
      this.preview.removeEventListener('change', this.taskChangeHandler);
      this.preview.removeEventListener('click', this.taskChangeHandler);
      this.taskChangeHandler = null;
    }
    
    if (this.anchorClickHandler) {
      this.preview.removeEventListener('click', this.anchorClickHandler);
      this.anchorClickHandler = null;
    }
    
    // Clean up context menu
    if (this.contextMenu) {
      document.body.removeChild(this.contextMenu);
      this.contextMenu = null;
    }
    
    // Clear task list states
    this.taskListStates.clear();
    
    // Reset state
    this.currentContent = '';
    this.previewZoom = 1.0;
  }
}

// Export for use in other components
window.PreviewComponent = PreviewComponent;
