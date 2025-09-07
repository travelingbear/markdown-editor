/**
 * Preview Component
 * Manages markdown rendering and preview functionality
 */
class PreviewComponent extends BaseComponent {
  constructor(options = {}) {
    super('PreviewComponent', options);
    
    // Preview state
    this.currentContent = '';
    this.previewZoom = 1.0;
    this.theme = localStorage.getItem('markdownViewer_defaultTheme') || 'light';
    
    // Libraries
    this.mermaidInitialized = false;
    this.katexInitialized = false;
    this.mermaid = null;
    this.katex = null;
    
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
    try {
      // Load Mermaid
      try {
        const mermaidModule = await import('https://cdn.jsdelivr.net/npm/mermaid@11.4.0/dist/mermaid.esm.min.mjs');
        this.mermaid = mermaidModule.default;
        this.mermaid.initialize({
          startOnLoad: false,
          theme: this.theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          pie: { useMaxWidth: true }
        });
        this.mermaidInitialized = true;
      } catch (error) {
        console.warn('[Preview] Failed to load Mermaid:', error);
        this.mermaidInitialized = false;
      }
      
      // Load KaTeX
      try {
        const katexModule = await import('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.mjs');
        this.katex = katexModule.default;
        this.katexInitialized = true;
      } catch (error) {
        console.warn('[Preview] Failed to load KaTeX:', error);
        this.katexInitialized = false;
      }
      
    } catch (error) {
      console.error('[Preview] Error initializing advanced features:', error);
    }
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
  }

  /**
   * Update preview with new content
   */
  async updatePreview(markdown = '') {
    if (!markdown && markdown !== '') {
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
      
      // Parse markdown to HTML
      let html = marked.parse(markdown);
      
      // Process advanced features
      html = this.processMathInHtml(html);
      html = this.processMermaidInHtml(html);
      html = this.processTaskListsInHtml(html);
      html = this.processFootnotesInHtml(html);
      html = this.processSupSubScript(html);
      html = this.processLinksInHtml(html);
      html = this.postProcessHtmlImages(html);
      
      // Set the HTML content
      this.preview.innerHTML = html;
      
      // Remove disabled attribute from checkboxes and ensure they're properly set up
      this.preview.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.removeAttribute('disabled');
        // Ensure checkbox has proper attributes for accessibility
        if (!checkbox.id && checkbox.nextElementSibling?.tagName === 'LABEL') {
          const id = 'task-' + Math.random().toString(36).substring(2, 11);
          checkbox.id = id;
          checkbox.nextElementSibling.setAttribute('for', id);
        }
      });
      
      // Render advanced features
      await this.renderMermaidDiagrams();
      this.setupTaskListInteractions();
      this.setupAnchorLinks();
      this.applySyntaxHighlighting();
      this.setupCodeBlockButtons();
      
      // Process images only if there are images in the content
      if (html.includes('<img')) {
        await this.processImages();
      }
      
      this.emit('preview-updated', { content: html });
      
    } catch (error) {
      console.error('[Preview] Error updating preview:', error);
      this.preview.innerHTML = '<p>⚠️ Markdown rendering error</p>';
      this.emit('preview-error', { error: error.message });
    }
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

  processMathInHtml(html) {
    if (this.katexInitialized && this.katex) {
      // Process display math: $$...$$
      html = html.replace(/\$\$([^$]+)\$\$/g, (match, math, offset, string) => {
        if (this.isInsideCodeBlock(string, offset, match.length)) {
          return match;
        }
        
        try {
          const rendered = this.katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false
          });
          return `<div class="math-display">${rendered}</div>`;
        } catch (error) {
          return `<div class="math-display math-error"><code>${math.trim()}</code></div>`;
        }
      });
      
      // Process inline math: $...$
      html = html.replace(/\$([^$\n]+)\$/g, (match, math, offset, string) => {
        if (this.isInsideCodeBlock(string, offset, match.length)) {
          return match;
        }
        
        try {
          const rendered = this.katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false
          });
          return `<span class="math-inline">${rendered}</span>`;
        } catch (error) {
          return `<span class="math-inline math-error"><code>${math.trim()}</code></span>`;
        }
      });
    } else {
      // Fallback styling
      html = html.replace(/\$\$([^$]+)\$\$/g, (match, math, offset, string) => {
        if (this.isInsideCodeBlock(string, offset, match.length)) {
          return match;
        }
        return `<div class="math-display math-fallback"><code>${math.trim()}</code></div>`;
      });
      
      html = html.replace(/\$([^$\n]+)\$/g, (match, math, offset, string) => {
        if (this.isInsideCodeBlock(string, offset, match.length)) {
          return match;
        }
        return `<span class="math-inline math-fallback"><code>${math.trim()}</code></span>`;
      });
    }
    
    return html;
  }

  processMermaidInHtml(html) {
    if (this.mermaidInitialized && this.mermaid) {
      html = html.replace(/<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/gs, (match, code) => {
        const decodedCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
        const id = 'mermaid-' + Math.random().toString(36).substring(2, 11);
        return `<div class="mermaid-diagram" id="${id}" data-mermaid-code="${encodeURIComponent(decodedCode.trim())}"></div>`;
      });
    } else {
      html = html.replace(/<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/gs, (match, code) => {
        const decodedCode = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'");
        return `<div class="mermaid-placeholder mermaid-fallback">
          <div class="placeholder-header">📊 Mermaid Diagram</div>
          <pre class="diagram-code">${decodedCode}</pre>
          <div class="placeholder-note">Mermaid.js not loaded - showing code instead</div>
        </div>`;
      });
    }
    
    return html;
  }

  processTaskListsInHtml(html) {
    // Check if we have task list items from our renderer
    const hasTaskListClass = html.includes('task-list-item');
    const hasCheckboxInputs = html.includes('<input') && html.includes('checkbox');
    
    // If we already have task lists from our renderer, we're good
    if (hasTaskListClass && hasCheckboxInputs) {
      return html;
    }
    
    // Fallback: Handle any remaining task list patterns
    let taskCount = 0;
    
    // Only process lists that actually contain task items
    html = html.replace(/<(ul|ol)([^>]*)>([\s\S]*?)<\/(ul|ol)>/g, (match, tag, attrs, content) => {
      // Check if this list contains any task items
      const hasTaskItems = content.includes('[ ]') || content.includes('[x]');
      
      if (!hasTaskItems) {
        return match; // Return unchanged if no task items
      }
      
      const processedContent = content.replace(/<li>\s*\[([ x])\]\s*(.*?)<\/li>/gs, (liMatch, checked, liContent) => {
        const isChecked = checked === 'x';
        const id = 'task-' + Math.random().toString(36).substring(2, 11) + '-' + taskCount;
        taskCount++;
        
        // Preserve HTML content including links
        const processedLiContent = liContent.replace(/<(ul|ol)([^>]*)>([\s\S]*?)<\/(ul|ol)>/g, (nestedMatch, nestedTag, nestedAttrs, nestedContent) => {
          const processedNestedContent = nestedContent.replace(/<li>\s*\[([ x])\]\s*(.*?)<\/li>/gs, (nestedLiMatch, nestedChecked, nestedLiContent) => {
            const nestedIsChecked = nestedChecked === 'x';
            const nestedId = 'task-' + Math.random().toString(36).substring(2, 11) + '-' + taskCount;
            taskCount++;
            return `<div class="task-list-item nested"><input type="checkbox" id="${nestedId}" ${nestedIsChecked ? 'checked' : ''}><label for="${nestedId}">${nestedLiContent}</label></div>`;
          });
          return `<div class="task-list-nested"><${nestedTag}${nestedAttrs}>${processedNestedContent}</${nestedTag}></div>`;
        });
        
        return `<div class="task-list-item"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}><label for="${id}">${processedLiContent}</label></div>`;
      });
      
      // Only wrap if we actually processed task items
      if (processedContent !== content && processedContent.includes('task-list-item')) {
        return `<div class="task-list-container">${processedContent}</div>`;
      }
      
      return match;
    });
    
    // Handle remaining task lists in li elements (only if not already processed)
    html = html.replace(/<li>\s*\[([ x])\]\s*(.*?)<\/li>/gs, (match, checked, content, offset, string) => {
      if (this.isInsideCodeBlock(string, offset, match.length)) {
        return match;
      }
      
      // Skip if already inside a processed task list container
      const beforeMatch = string.substring(0, offset);
      const isInsideTaskContainer = beforeMatch.includes('task-list-container') && !beforeMatch.includes('</div>');
      
      if (isInsideTaskContainer) {
        return match;
      }
      
      const isChecked = checked === 'x';
      const id = 'task-' + Math.random().toString(36).substring(2, 11) + '-' + taskCount;
      taskCount++;
      
      return `<div class="task-list-item"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}><label for="${id}">${content}</label></div>`;
    });
    
    // Handle standalone checkbox patterns
    html = html.replace(/<p>\[([ x])\]\s*([^<]*?)<\/p>/g, (match, checked, content, offset, string) => {
      if (this.isInsideCodeBlock(string, offset, match.length)) {
        return match;
      }
      
      const isChecked = checked === 'x';
      const cleanContent = content.trim();
      const id = 'task-' + Math.random().toString(36).substring(2, 11) + '-' + taskCount;
      taskCount++;
      
      return `<div class="task-list-item"><input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''}><label for="${id}">${cleanContent}</label></div>`;
    });
    
    return html;
  }

  processFootnotesInHtml(html) {
    const footnotes = new Map();
    
    // Collect definitions
    html.replace(/\[\^([^\]]+)\]:\s*(.+?)(?=\n|$)/g, (match, id, definition) => {
      footnotes.set(id, definition.trim());
    });
    
    // Remove definition paragraphs
    html = html.replace(/<p>\[\^[^\]]+\]:[^<]*<\/p>/g, '');
    
    // Process references
    html = html.replace(/\[\^([^\]]+)\]/g, (match, id) => {
      return footnotes.has(id) ? 
        `<sup><a href="#footnote-${id}" id="footnote-ref-${id}" class="footnote-ref">${id}</a></sup>` : 
        match;
    });
    
    // Add footnotes section
    if (footnotes.size > 0) {
      let footnotesHtml = '<div class="footnotes"><hr><ol>';
      for (const [id, definition] of footnotes) {
        footnotesHtml += `<li id="footnote-${id}">${definition} <a href="#footnote-ref-${id}" class="footnote-backref">↩</a></li>`;
      }
      footnotesHtml += '</ol></div>';
      html += footnotesHtml;
    }
    
    return html;
  }

  processSupSubScript(html) {
    // Superscript
    html = html.replace(/\^\(([^)]+)\)\^/g, '<sup>$1</sup>');
    html = html.replace(/\^([^\s^]+)\^/g, '<sup>$1</sup>');
    
    // Subscript
    html = html.replace(/~\(([^)]+)\)~/g, '<sub>$1</sub>');
    html = html.replace(/~([^\s~]+)~/g, '<sub>$1</sub>');
    
    return html;
  }
  
  processLinksInHtml(html) {
    // Fix email links that don't have mailto:
    html = html.replace(/<a href="([^"]+@[^"]+\.[^"]+)">([^<]+)<\/a>/g, (match, href, text) => {
      if (!href.startsWith('mailto:')) {
        return `<a href="mailto:${href}">${text}</a>`;
      }
      return match;
    });
    
    // Fix domain links that don't have protocol
    html = html.replace(/<a href="([^"]+\.[a-zA-Z]{2,}[^"]*)">([^<]+)<\/a>/g, (match, href, text) => {
      if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('#')) {
        return `<a href="https://${href}">${text}</a>`;
      }
      return match;
    });
    
    return html;
  }

  postProcessHtmlImages(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const allImages = tempDiv.querySelectorAll('img');
    allImages.forEach(img => {
      if (!img.classList.contains('markdown-image')) {
        img.classList.add('markdown-image');
        let srcValue = img.getAttribute('src') || img.src;
        img.setAttribute('data-original-src', srcValue);
        if (!img.style.maxWidth) {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        }
      }
    });
    
    return tempDiv.innerHTML;
  }

  isInsideCodeBlock(html, offset, matchLength) {
    const beforeMatch = html.substring(0, offset);
    const codeOpenBefore = (beforeMatch.match(/<code[^>]*>/g) || []).length;
    const codeCloseBefore = (beforeMatch.match(/<\/code>/g) || []).length;
    const preOpenBefore = (beforeMatch.match(/<pre[^>]*>/g) || []).length;
    const preCloseBefore = (beforeMatch.match(/<\/pre>/g) || []).length;
    
    return (codeOpenBefore > codeCloseBefore) || (preOpenBefore > preCloseBefore);
  }

  async renderMermaidDiagrams() {
    if (!this.mermaidInitialized || !this.mermaid) {
      return;
    }
    
    const diagrams = document.querySelectorAll('.mermaid-diagram');
    
    for (let i = 0; i < diagrams.length; i++) {
      const diagram = diagrams[i];
      const code = decodeURIComponent(diagram.getAttribute('data-mermaid-code'));
      
      try {
        diagram.innerHTML = '';
        const { svg } = await this.mermaid.render(diagram.id + '-svg', code);
        diagram.innerHTML = svg;
      } catch (error) {
        console.error(`[Preview] Mermaid error:`, error);
        diagram.innerHTML = `
          <div class="mermaid-error">
            <div class="error-header">⚠️ Mermaid Rendering Error</div>
            <pre class="diagram-code">${code}</pre>
            <div class="error-message">${error.message}</div>
          </div>
        `;
      }
    }
  }

  setupTaskListInteractions() {
    const checkboxes = this.preview.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        // Get the label element which contains the actual task text
        const label = e.target.parentElement.querySelector('label');
        let taskText = '';
        
        if (label) {
          // Get text content from label, preserving inner HTML structure
          taskText = label.textContent || label.innerText || '';
        } else {
          // Fallback: get text from parent element, excluding the checkbox
          const parent = e.target.parentElement;
          const clone = parent.cloneNode(true);
          // Remove the checkbox from the clone
          const checkboxClone = clone.querySelector('input[type="checkbox"]');
          if (checkboxClone) {
            checkboxClone.remove();
          }
          taskText = clone.textContent || clone.innerText || '';
        }
        
        // Clean up the task text
        taskText = taskText.trim();
        
        this.emit('task-toggled', {
          taskText: taskText,
          checked: e.target.checked
        });
      });
    });
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
        let validHref = this.validateAndFixLink(href);
        
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
  
  validateAndFixLink(href) {
    if (!href || typeof href !== 'string') {
      return null;
    }
    
    const trimmedHref = href.trim();
    
    // Already valid URLs
    if (trimmedHref.startsWith('http://') || trimmedHref.startsWith('https://')) {
      return trimmedHref;
    }
    
    // Valid mailto links
    if (trimmedHref.startsWith('mailto:')) {
      return trimmedHref;
    }
    
    // Fix common email patterns without mailto:
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (emailPattern.test(trimmedHref)) {
      return `mailto:${trimmedHref}`;
    }
    
    // Fix URLs missing protocol
    if (trimmedHref.includes('.') && !trimmedHref.includes(' ')) {
      // Looks like a domain, add https://
      if (trimmedHref.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || trimmedHref.startsWith('www.')) {
        return `https://${trimmedHref}`;
      }
    }
    
    // File protocols
    if (trimmedHref.startsWith('file://')) {
      return trimmedHref;
    }
    
    // If we can't fix it, return null to prevent navigation
    console.warn('[Preview] Could not validate link:', href);
    return null;
  }

  applySyntaxHighlighting() {
    if (typeof hljs !== 'undefined') {
      this.preview.querySelectorAll('pre code:not([data-highlighted])').forEach((block) => {
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
          
          hljs.highlightElement(block);
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
    
    if (this.mermaidInitialized && this.mermaid) {
      this.mermaid.initialize({
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit'
      });
      // Re-render diagrams with new theme
      this.updatePreview();
    }
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
    
    // Clear task list states
    this.taskListStates.clear();
    
    // Reset state
    this.currentContent = '';
    this.previewZoom = 1.0;
  }
}

// Export for use in other components
window.PreviewComponent = PreviewComponent;