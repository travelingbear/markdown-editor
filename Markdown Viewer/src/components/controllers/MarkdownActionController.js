/**
 * MarkdownActionController - Handles markdown formatting actions
 * Manages text insertion, task list updates, and multi-line formatting
 */
class MarkdownActionController extends BaseComponent {
  constructor(options = {}) {
    super('MarkdownActionController', options);
    
    // Dependencies
    this.editorComponent = null;
    this.documentComponent = null;
  }

  async onInit() {
    // Controller is ready
    this.setupExtensionPoints();
  }

  setupExtensionPoints() {
    // Markdown action extension points
    this.addHook('beforeMarkdownAction', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.beforeMarkdownAction) {
          await ext.instance.beforeMarkdownAction(data);
        }
      }
    });

    this.addHook('afterMarkdownAction', async (data) => {
      const extensions = this.getExtensions().filter(ext => ext.active);
      for (const ext of extensions) {
        if (ext.instance.afterMarkdownAction) {
          await ext.instance.afterMarkdownAction(data);
        }
      }
    });
  }

  setDependencies(editorComponent, documentComponent) {
    this.editorComponent = editorComponent;
    this.documentComponent = documentComponent;
  }

  async handleMarkdownAction(action) {
    if (!this.editorComponent.isMonacoLoaded || !this.editorComponent.monacoEditor) return;
    
    await this.executeHook('beforeMarkdownAction', { action });
    
    const editor = this.editorComponent.monacoEditor;
    const model = editor.getModel();
    const selection = editor.getSelection();
    const position = editor.getPosition();
    let selectedText = '';
    let isMultiLine = false;
    
    if (selection && !selection.isEmpty()) {
      selectedText = model.getValueInRange(selection);
      isMultiLine = selection.startLineNumber !== selection.endLineNumber;
    }
    
    // Handle multi-line selections
    if (isMultiLine && ['bold', 'italic', 'strikethrough', 'underline', 'h1', 'h2', 'h3', 'ul', 'ol', 'task', 'quote', 'code'].includes(action)) {
      this.handleMultiLineFormatting(editor, selection, action);
      return;
    }
    
    let replacement = '';
    let insertAtNewLine = false;
    let cursorOffset = 0;
    
    switch (action) {
      // Text formatting
      case 'bold':
        replacement = selectedText ? `**${selectedText}**` : '**text**';
        cursorOffset = selectedText ? 0 : -6;
        break;
      case 'italic':
        replacement = selectedText ? `*${selectedText}*` : '*text*';
        cursorOffset = selectedText ? 0 : -5;
        break;
      case 'strikethrough':
        replacement = selectedText ? `~~${selectedText}~~` : '~~text~~';
        cursorOffset = selectedText ? 0 : -6;
        break;
      case 'underline':
        replacement = selectedText ? `<u>${selectedText}</u>` : '<u>text</u>';
        cursorOffset = selectedText ? 0 : -7;
        break;
        
      // Headings - with cycling support
      case 'h1':
      case 'h2':
      case 'h3':
        if (isMultiLine) {
          this.handleMultiLineFormatting(editor, selection, action);
          return;
        }
        
        const targetLevel = parseInt(action.substring(1));
        if (selectedText) {
          // Check if selected text already has heading
          const headingMatch = selectedText.match(/^(#{1,6})\s*(.*)$/);
          if (headingMatch) {
            const currentLevel = headingMatch[1].length;
            const content = headingMatch[2];
            if (currentLevel === targetLevel) {
              // Same level - remove heading
              replacement = content;
            } else {
              // Different level - change to target level
              replacement = '#'.repeat(targetLevel) + ' ' + content;
            }
          } else {
            // No existing heading - add new one
            replacement = '#'.repeat(targetLevel) + ' ' + selectedText;
          }
        } else {
          replacement = '#'.repeat(targetLevel) + ` Heading ${targetLevel}`;
        }
        insertAtNewLine = true;
        break;
        
      // Links and media
      case 'link':
        replacement = selectedText ? `[${selectedText}](url)` : '[link text](url)';
        cursorOffset = selectedText ? -4 : -4;
        break;
      case 'image':
        replacement = selectedText ? `![${selectedText}](image-url)` : '![alt text](image-url)';
        cursorOffset = selectedText ? -12 : -12;
        break;
        
      // Lists
      case 'ul':
        replacement = selectedText ? `- ${selectedText}` : '- List item';
        insertAtNewLine = true;
        break;
      case 'ol':
        replacement = selectedText ? `1. ${selectedText}` : '1. List item';
        insertAtNewLine = true;
        break;
      case 'task':
        replacement = selectedText ? `- [ ] ${selectedText}` : '- [ ] Task item';
        insertAtNewLine = true;
        break;
        
      // Table
      case 'table':
        replacement = `| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |`;
        insertAtNewLine = true;
        break;
        
      // Code
      case 'code':
        replacement = selectedText ? `\`${selectedText}\`` : '`code`';
        cursorOffset = selectedText ? 0 : -5;
        break;
      case 'codeblock':
        replacement = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```\ncode block\n```';
        cursorOffset = selectedText ? 0 : -15;
        insertAtNewLine = true;
        break;
        
      // Quote
      case 'quote':
        replacement = selectedText ? `> ${selectedText}` : '> Quote text';
        insertAtNewLine = true;
        break;
        
      // Text alignment
      case 'align-left':
      case 'align-center':
      case 'align-right':
      case 'align-justify':
        if (isMultiLine) {
          this.handleMultiLineAlignment(editor, selection, action);
          return;
        }
        
        if (action === 'align-left') {
          if (selectedText) {
            let cleanText = selectedText
              .replace(/<div align="(center|right|justify)">([\s\S]*?)<\/div>/gi, '$2')
              .replace(/^\s+|\s+$/g, '');
            replacement = cleanText;
          } else {
            return;
          }
        } else {
          const alignType = action.replace('align-', '');
          if (selectedText) {
            let cleanText = selectedText
              .replace(/<div align="(left|center|right|justify)">([\s\S]*?)<\/div>/gi, '$2')
              .replace(/^\s+|\s+$/g, '');
            replacement = `<div align="${alignType}">${cleanText}</div>`;
          } else {
            replacement = `<div align="${alignType}">Text aligned ${alignType}</div>`;
          }
        }
        break;
        
      default:
        return;
    }
    
    // Handle insertion
    if (insertAtNewLine && !selectedText) {
      const lineContent = model.getLineContent(position.lineNumber);
      if (lineContent.trim() === '') {
        editor.executeEdits('markdown-toolbar', [{
          range: new monaco.Range(position.lineNumber, 1, position.lineNumber, position.column),
          text: replacement
        }]);
      } else {
        editor.executeEdits('markdown-toolbar', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
          text: `\n${replacement}`
        }]);
      }
    } else if (selection && !selection.isEmpty()) {
      editor.executeEdits('markdown-toolbar', [{
        range: selection,
        text: replacement
      }]);
    } else {
      editor.executeEdits('markdown-toolbar', [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: replacement
      }]);
      
      if (cursorOffset !== 0) {
        const newPosition = editor.getPosition();
        const targetColumn = newPosition.column + cursorOffset;
        editor.setPosition({
          lineNumber: newPosition.lineNumber,
          column: Math.max(1, targetColumn)
        });
      }
    }
    
    editor.focus();
    this.documentComponent.handleContentChange(editor.getValue());
    
    await this.executeHook('afterMarkdownAction', { action, selectedText, isMultiLine });
  }
  
  handleMultiLineFormatting(editor, selection, action) {
    const model = editor.getModel();
    const edits = [];
    
    for (let lineNum = selection.startLineNumber; lineNum <= selection.endLineNumber; lineNum++) {
      const lineContent = model.getLineContent(lineNum);
      if (lineContent.trim() === '') continue;
      
      let newContent = '';
      
      switch (action) {
        case 'bold':
          newContent = `**${lineContent}**`;
          break;
        case 'italic':
          newContent = `*${lineContent}*`;
          break;
        case 'strikethrough':
          newContent = `~~${lineContent}~~`;
          break;
        case 'underline':
          newContent = `<u>${lineContent}</u>`;
          break;
        case 'h1':
        case 'h2':
        case 'h3':
          const targetLevel = parseInt(action.substring(1));
          const headingMatch = lineContent.match(/^(#{1,6})\s*(.*)$/);
          if (headingMatch) {
            const currentLevel = headingMatch[1].length;
            const content = headingMatch[2];
            if (currentLevel === targetLevel) {
              // Same level - remove heading
              newContent = content;
            } else {
              // Different level - change to target level
              newContent = '#'.repeat(targetLevel) + ' ' + content;
            }
          } else {
            // No existing heading - add new one
            newContent = '#'.repeat(targetLevel) + ' ' + lineContent;
          }
          break;
        case 'ul':
          newContent = `- ${lineContent}`;
          break;
        case 'ol':
          newContent = `${lineNum - selection.startLineNumber + 1}. ${lineContent}`;
          break;
        case 'task':
          newContent = `- [ ] ${lineContent}`;
          break;
        case 'quote':
          newContent = `> ${lineContent}`;
          break;
        case 'code':
          newContent = `\`${lineContent}\``;
          break;
      }
      
      edits.push({
        range: new monaco.Range(lineNum, 1, lineNum, lineContent.length + 1),
        text: newContent
      });
    }
    
    editor.executeEdits('markdown-toolbar-multiline', edits);
    this.documentComponent.handleContentChange(editor.getValue());
  }
  
  handleMultiLineAlignment(editor, selection, action) {
    const model = editor.getModel();
    const edits = [];
    const alignType = action.replace('align-', '');
    
    for (let lineNum = selection.startLineNumber; lineNum <= selection.endLineNumber; lineNum++) {
      const lineContent = model.getLineContent(lineNum);
      if (lineContent.trim() === '') continue;
      
      let newContent = '';
      
      if (alignType === 'left') {
        // Remove existing alignment
        newContent = lineContent.replace(/<div align="(center|right|justify)">([\s\S]*?)<\/div>/gi, '$2').trim();
      } else {
        // Remove existing alignment first, then apply new alignment
        let cleanContent = lineContent.replace(/<div align="(left|center|right|justify)">([\s\S]*?)<\/div>/gi, '$2').trim();
        newContent = `<div align="${alignType}">${cleanContent}</div>`;
      }
      
      edits.push({
        range: new monaco.Range(lineNum, 1, lineNum, lineContent.length + 1),
        text: newContent
      });
    }
    
    editor.executeEdits('markdown-toolbar-alignment', edits);
    this.documentComponent.handleContentChange(editor.getValue());
  }
  
  insertMarkdownText(text) {
    if (!this.editorComponent.isMonacoLoaded || !this.editorComponent.monacoEditor) {
      return;
    }
    
    const editor = this.editorComponent.monacoEditor;
    const position = editor.getPosition();
    
    editor.executeEdits('markdown-insert', [{
      range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text: text
    }]);
    
    editor.focus();
    this.documentComponent.handleContentChange(editor.getValue());
  }

  updateTaskInMarkdown(taskText, checked) {
    const content = this.editorComponent.getContent();
    const lines = content.split('\n');
    let inCodeBlock = false;
    let matchingLines = [];
    
    // Normalize task text for better matching
    const normalizeText = (text) => {
      return text
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .replace(/[\u00A0\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]/g, ' ') // Replace various unicode spaces
        .trim()
        .toLowerCase();
    };
    
    const normalizedTaskText = normalizeText(taskText);
    
    // Find all lines that contain the task text
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Track code blocks
      if (line.trim().startsWith('```') || line.trim().startsWith('~~~')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      
      if (inCodeBlock) continue;
      
      // Enhanced task list patterns with more comprehensive regex
      const taskPatterns = [
        /^(\s*)[-*+] \[([ xX])\]\s*(.*)$/,     // Standard bullets with x or X
        /^(\s*)\d+\. \[([ xX])\]\s*(.*)$/,    // Numbered lists
        /^(\s*)[-*+]\s*\[([ xX])\]\s*(.*)$/,  // Bullets without space before bracket
        /^(\s*)\d+\.\s*\[([ xX])\]\s*(.*)$/   // Numbered without space before bracket
      ];
      
      for (const pattern of taskPatterns) {
        const match = line.match(pattern);
        if (match) {
          const [, indent, checkState, taskContent] = match;
          const normalizedLineText = normalizeText(taskContent);
          
          // Multiple matching strategies for better accuracy
          const isMatch = 
            normalizedLineText === normalizedTaskText ||                    // Exact match
            normalizedLineText.includes(normalizedTaskText) ||              // Contains match
            normalizedTaskText.includes(normalizedLineText) ||              // Reverse contains
            this.fuzzyMatch(normalizedLineText, normalizedTaskText, 0.8);   // Fuzzy match
          
          if (isMatch) {
            matchingLines.push({ 
              index: i, 
              indent, 
              checkState: checkState.toLowerCase(),
              taskContent: taskContent.trim(),
              normalizedContent: normalizedLineText,
              similarity: this.calculateSimilarity(normalizedLineText, normalizedTaskText)
            });
            break;
          }
        }
      }
    }
    
    // If multiple matches, prefer the one with highest similarity
    if (matchingLines.length > 1) {
      // Sort by similarity (highest first)
      matchingLines.sort((a, b) => b.similarity - a.similarity);
      
      // If top matches have very similar scores, show conflict modal
      if (matchingLines.length > 1 && 
          Math.abs(matchingLines[0].similarity - matchingLines[1].similarity) < 0.1) {
        this.showTaskConflictModal(taskText, matchingLines.length);
        return;
      }
      
      // Use the best match
      matchingLines = [matchingLines[0]];
    }
    
    // Update the matching task
    if (matchingLines.length === 1) {
      const match = matchingLines[0];
      const lineIndex = match.index;
      const line = lines[lineIndex];
      
      // Update checkbox state while preserving all formatting
      const updatedLine = line.replace(/\[([ xX])\]/, checked ? '[x]' : '[ ]');
      lines[lineIndex] = updatedLine;
      
      const newContent = lines.join('\n');
      this.editorComponent.setContent(newContent);
      this.documentComponent.handleContentChange(newContent);
    } else {
      console.warn('[MarkdownActionController] Could not find matching task for:', taskText);
    }
  }
  
  // Helper method for fuzzy string matching
  fuzzyMatch(str1, str2, threshold = 0.8) {
    const similarity = this.calculateSimilarity(str1, str2);
    return similarity >= threshold;
  }
  
  // Calculate similarity between two strings using Levenshtein distance
  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }
  
  showTaskConflictModal(taskText, count) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('task-conflict-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'task-conflict-modal';
      modal.className = 'task-conflict-modal';
      modal.innerHTML = `
        <div class="task-conflict-overlay"></div>
        <div class="task-conflict-window">
          <div class="task-conflict-header">
            <h3>Task Conflict Detected</h3>
          </div>
          <div class="task-conflict-content">
            <p>Multiple tasks with the same name were found:</p>
            <p><strong id="conflict-task-text"></strong></p>
            <p>Found <span id="conflict-count"></span> tasks with this name. Please use unique task names to avoid conflicts.</p>
          </div>
          <div class="task-conflict-buttons">
            <button id="conflict-ok-btn" class="task-conflict-btn primary">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Add event listeners
      const okBtn = modal.querySelector('#conflict-ok-btn');
      const overlay = modal.querySelector('.task-conflict-overlay');
      
      const closeModal = () => {
        modal.style.display = 'none';
      };
      
      okBtn.addEventListener('click', closeModal);
      overlay.addEventListener('click', closeModal);
    }
    
    // Update modal content
    modal.querySelector('#conflict-task-text').textContent = taskText;
    modal.querySelector('#conflict-count').textContent = count;
    
    // Show modal
    modal.style.display = 'flex';
  }

  // Extension API methods
  addMarkdownExtension(name, extension) {
    this.registerExtension(name, extension);
    if (extension.activate) {
      this.extensionAPI.activate(name);
    }
  }

  removeMarkdownExtension(name) {
    return this.unregisterExtension(name);
  }

  // Get available markdown actions for extensions
  getAvailableActions() {
    return [
      'bold', 'italic', 'strikethrough', 'underline',
      'h1', 'h2', 'h3', 'link', 'image', 'ul', 'ol', 'task',
      'table', 'code', 'codeblock', 'quote',
      'align-left', 'align-center', 'align-right', 'align-justify'
    ];
  }
}

// Export for use in main application
window.MarkdownActionController = MarkdownActionController;