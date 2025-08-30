const { invoke } = window.__TAURI__.tauri;

class MarkdownViewer {
    constructor() {
        this.currentFile = null;
        this.isDirty = false;
        this.currentMode = 'code';
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.initElements();
        this.initEventListeners();
        this.applyTheme();
        this.updatePreview();
    }
    
    initElements() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.filenameSpan = document.getElementById('filename');
        this.cursorInfo = document.getElementById('cursor-info');
        
        this.openBtn = document.getElementById('open-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.closeBtn = document.getElementById('close-btn');
        this.codeBtn = document.getElementById('code-btn');
        this.previewBtn = document.getElementById('preview-btn');
        this.splitBtn = document.getElementById('split-btn');
        this.themeBtn = document.getElementById('theme-btn');
    }
    
    initEventListeners() {
        this.openBtn.addEventListener('click', () => this.openFile());
        this.saveBtn.addEventListener('click', () => this.saveFile());
        this.closeBtn.addEventListener('click', () => this.closeFile());
        
        this.codeBtn.addEventListener('click', () => this.setMode('code'));
        this.previewBtn.addEventListener('click', () => this.setMode('preview'));
        this.splitBtn.addEventListener('click', () => this.setMode('split'));
        
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        
        this.editor.addEventListener('input', () => {
            this.isDirty = true;
            this.updatePreview();
            this.updateCursorInfo();
        });
        
        this.editor.addEventListener('keyup', () => this.updateCursorInfo());
        this.editor.addEventListener('click', () => this.updateCursorInfo());
    }
    
    async openFile() {
        try {
            const result = await invoke('open_file');
            const [content, filename] = result;
            
            this.editor.value = content;
            this.currentFile = filename;
            this.isDirty = false;
            this.filenameSpan.textContent = filename;
            this.updatePreview();
            this.updateCursorInfo();
        } catch (error) {
            console.error('Failed to open file:', error);
        }
    }
    
    async saveFile() {
        try {
            const content = this.editor.value;
            const filename = await invoke('save_file', { content });
            
            this.currentFile = filename;
            this.isDirty = false;
            this.filenameSpan.textContent = filename;
        } catch (error) {
            console.error('Failed to save file:', error);
        }
    }
    
    closeFile() {
        if (this.isDirty) {
            const confirmed = confirm('You have unsaved changes. Are you sure you want to close?');
            if (!confirmed) return;
        }
        
        this.editor.value = '';
        this.currentFile = null;
        this.isDirty = false;
        this.filenameSpan.textContent = 'Untitled';
        this.updatePreview();
        this.updateCursorInfo();
    }
    
    setMode(mode) {
        this.currentMode = mode;
        
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}-btn`).classList.add('active');
        
        // Update view classes
        document.body.className = `${mode}-view`;
        document.body.setAttribute('data-theme', this.theme);
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
    }
    
    applyTheme() {
        document.body.setAttribute('data-theme', this.theme);
        this.themeBtn.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }
    
    updatePreview() {
        const content = this.editor.value;
        if (content.trim()) {
            this.preview.innerHTML = marked.parse(content);
        } else {
            this.preview.innerHTML = '<p style="color: #656d76; font-style: italic;">Preview will appear here...</p>';
        }
    }
    
    updateCursorInfo() {
        const textarea = this.editor;
        const text = textarea.value;
        const cursorPos = textarea.selectionStart;
        
        const lines = text.substring(0, cursorPos).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        
        this.cursorInfo.textContent = `Line ${line}, Col ${col}`;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownViewer();
});