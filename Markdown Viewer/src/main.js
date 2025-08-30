// Using global marked from CDN
// const { invoke } = window.__TAURI__.core;

console.log('JavaScript file loaded!');

class MarkdownViewer {
  constructor() {
    this.currentFile = null;
    this.isDirty = false;
    this.theme = 'light';
    this.currentMode = 'preview';
    
    console.log('[MarkdownViewer] Constructor started');
    this.initializeElements();
    this.setupEventListeners();
    this.setMode('preview');
    this.updatePreview();
    this.updateCursorPosition();
    console.log('[MarkdownViewer] Constructor completed');
  }

  initializeElements() {
    this.editor = document.getElementById('editor');
    this.preview = document.getElementById('preview');
    this.openBtn = document.getElementById('open-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.closeBtn = document.getElementById('close-btn');
    this.themeBtn = document.getElementById('theme-btn');
    this.codeBtn = document.getElementById('code-btn');
    this.previewBtn = document.getElementById('preview-btn');
    this.splitBtn = document.getElementById('split-btn');
    this.cursorPos = document.getElementById('cursor-pos');
    this.filename = document.getElementById('filename');
    this.mainContent = document.querySelector('.main-content');

    this.splitter = document.getElementById('splitter');
  }

  setupEventListeners() {
    // File operations
    this.openBtn.addEventListener('click', () => this.openFile());
    this.saveBtn.addEventListener('click', () => this.saveFile());
    this.closeBtn.addEventListener('click', () => this.closeFile());
    
    // Theme toggle
    this.themeBtn.addEventListener('click', () => this.toggleTheme());
    
    // Mode switching
    this.codeBtn.addEventListener('click', () => this.setMode('code'));
    this.previewBtn.addEventListener('click', () => this.setMode('preview'));
    this.splitBtn.addEventListener('click', () => this.setMode('split'));
    
    // Editor events
    this.editor.addEventListener('input', () => {
      this.updatePreview();
      this.markDirty();
      this.updateCursorPosition();
    });
    
    this.editor.addEventListener('keyup', () => {
      this.updateCursorPosition();
    });
    this.editor.addEventListener('click', () => {
      this.updateCursorPosition();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'o':
            e.preventDefault();
            this.openFile();
            break;
          case 's':
            e.preventDefault();
            this.saveFile();
            break;
          case 'w':
            e.preventDefault();
            this.closeFile();
            break;
        }
      }
    });
    
    // Splitter functionality
    this.setupSplitter();
    
  }

  setupSplitter() {
    let isResizing = false;
    
    this.splitter.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const containerRect = this.mainContent.getBoundingClientRect();
      const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (percentage > 20 && percentage < 80) {
        this.mainContent.style.setProperty('--editor-width', `${percentage}%`);
        this.mainContent.style.setProperty('--preview-width', `${100 - percentage}%`);
      }
    });
    
    document.addEventListener('mouseup', () => {
      isResizing = false;
      document.body.style.cursor = 'default';
    });
  }

  async openFile() {
    // Phase 1: Placeholder for file operations
    alert('File operations will be implemented in Phase 2. For now, you can edit the sample content.');
  }

  async saveFile() {
    // Phase 1: Placeholder for file operations
    alert('File operations will be implemented in Phase 2. Your content is preserved in the editor.');
    this.isDirty = false;
    this.updateFilename();
  }

  closeFile() {
    if (this.isDirty) {
      const save = confirm('You have unsaved changes. Do you want to save before closing?');
      if (save) {
        this.saveFile().then(() => this.doClose());
        return;
      }
    }
    this.doClose();
  }

  doClose() {
    this.currentFile = null;
    this.editor.value = '# Welcome to Markdown Viewer\n\nStart typing your markdown here...';
    this.updatePreview();
    this.updateFilename();
    this.isDirty = false;
  }

  updatePreview() {
    const markdown = this.editor.value || '# Welcome to Markdown Viewer\n\nStart typing your markdown here...';
    if (typeof marked !== 'undefined') {
      // Configure marked for GitHub-style line breaks
      marked.setOptions({
        breaks: true,
        gfm: true
      });
      this.preview.innerHTML = marked.parse(markdown);
    }
  }

  updateCursorPosition() {
    const textarea = this.editor;
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    const lines = text.substring(0, cursorPos).split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    
    this.cursorPos.textContent = `Line ${line}, Col ${col}`;
  }

  updateFilename() {
    if (this.currentFile) {
      const filename = this.currentFile.split(/[\\\/]/).pop();
      this.filename.textContent = filename + (this.isDirty ? ' *' : '');
    } else {
      this.filename.textContent = 'untitled.md' + (this.isDirty ? ' *' : '');
    }
  }

  markDirty() {
    if (!this.isDirty) {
      this.isDirty = true;
      this.updateFilename();
    }
  }

  setMode(mode) {
    // Remove active class from all mode buttons
    this.codeBtn.classList.remove('active');
    this.previewBtn.classList.remove('active');
    this.splitBtn.classList.remove('active');
    
    // Add active class to current mode button
    switch (mode) {
      case 'code':
        this.codeBtn.classList.add('active');
        break;
      case 'preview':
        this.previewBtn.classList.add('active');
        break;
      case 'split':
        this.splitBtn.classList.add('active');
        break;
    }
    
    // Update main content class
    this.mainContent.className = `main-content ${mode}-mode`;
    this.currentMode = mode;
  }



  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.themeBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
  }
}

// Initialize the app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new MarkdownViewer();
});
