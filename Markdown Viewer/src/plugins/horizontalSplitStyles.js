/**
 * Styles for the horizontal split layout.
 *
 * Held apart from the plugin because it is data, not behaviour: the plugin
 * mounts and removes this sheet, and nothing here depends on plugin state.
 */
export const HORIZONTAL_SPLIT_CSS = `
      /* TODO: Fix hover highlighting - needs to match Save As dropdown behavior */
      /* Remove left border and fix dropdown styling */
      #split-orientation-arrow {
        border-left: none;
      }
      
      #split-orientation-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: var(--bg-secondary);
        border: 1px solid var(--border-primary);
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 1000;
        min-width: 120px;
        display: none;
      }
      
      #split-orientation-menu .dropdown-item {
        display: block;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        color: var(--text-primary);
        transition: background-color 0.2s;
      }
      
      #split-orientation-menu .dropdown-item:hover {
        background: var(--bg-hover);
      }
      
      /* Retro theme support */
      body.retro-theme #split-orientation-menu {
        background: #c0c0c0;
        border: 2px outset #c0c0c0;
        border-radius: 0;
        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      }
      
      body.retro-theme #split-orientation-menu .dropdown-item {
        background: #c0c0c0;
        color: #000000;
        font-family: 'MS Sans Serif', sans-serif, 'Courier New';
        font-size: 11px;
        border-radius: 0;
      }
      
      body.retro-theme #split-orientation-menu .dropdown-item:hover {
        background: #000080 !important;
        color: #ffffff !important;
      }
      
      /* ONLY apply horizontal split when in split mode */
      .main-content.split-mode.split-horizontal {
        flex-direction: column;
      }
      
      .main-content.split-mode.split-horizontal .preview-pane {
        width: 100%;
        height: 50%;
        order: 1;
        border-bottom: none;
        border-right: none;
      }
      
      .main-content.split-mode.split-horizontal .editor-pane {
        width: 100%;
        height: 50%;
        order: 3;
        border-right: none;
        border-top: none;
      }
      
      .main-content.split-mode.split-horizontal .splitter {
        width: 100%;
        height: 6px;
        cursor: row-resize;
        order: 2;
        border-bottom: 1px solid var(--border-primary);
      }
      
      /* Code Top Variant */
      .main-content.split-mode.split-horizontal.code-top .preview-pane {
        order: 3;
        height: 50%;
      }
      .main-content.split-mode.split-horizontal.code-top .editor-pane {
        order: 1;
        height: 50%;
      }
      
      /* Toolbar positioning inside editor pane */
      .main-content.split-mode.split-horizontal .editor-pane .markdown-toolbar {
        position: relative !important;
        z-index: 999 !important;
      }

      .main-content.split-mode.split-horizontal.horizontal-toolbar-hidden .markdown-toolbar {
        display: none !important;
      }

      /* Flex sizing accounts for any responsive toolbar height. */
      .main-content.split-mode.split-horizontal .editor-pane .editor-container,
      .main-content.split-mode.split-horizontal .editor-pane #editor {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        height: auto !important;
      }
      
      /* Distraction-free mode horizontal split support */
      body.distraction-free .main-content.split-mode.split-horizontal {
        flex-direction: column !important;
        height: 100vh !important;
        padding: 0 !important;
      }
      
      body.distraction-free .main-content.split-mode.split-horizontal .preview-pane,
      body.distraction-free .main-content.split-mode.split-horizontal .editor-pane {
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
      }
      
      body.distraction-free .main-content.split-mode.split-horizontal .splitter {
        display: block !important;
        width: 100% !important;
        height: 6px !important;
        cursor: row-resize !important;
      }
      
      /* Code top in distraction-free mode */
      body.distraction-free .main-content.split-mode.split-horizontal.code-top .preview-pane {
        order: 3 !important;
      }
      body.distraction-free .main-content.split-mode.split-horizontal.code-top .editor-pane {
        order: 1 !important;
      }
      
      /* Show status bar in distraction-free mode when using horizontal split */
      body.distraction-free .main-content.split-mode.split-horizontal ~ .status-bar {
        display: flex !important;
        visibility: visible !important;
      }
      
      /* Centered layout compatibility */
      body.centered-layout .main-content.split-mode.split-horizontal {
        max-width: var(--content-max-width, 1200px) !important;
        margin: 0 auto !important;
        width: 100% !important;
      }
      
      body.centered-layout .main-content.split-mode.split-horizontal .preview-pane,
      body.centered-layout .main-content.split-mode.split-horizontal .editor-pane {
        width: 100% !important;
        max-width: none !important;
      }
      
      body.centered-layout .main-content.split-mode.split-horizontal .splitter {
        width: 100% !important;
        max-width: none !important;
      }
      
      body.centered-layout .main-content.split-mode.split-horizontal .preview-content {
        display: table !important;
        min-height: 100% !important;
        width: 100% !important;
      }
      
      /* Distraction-free mode with centered layout */
      body.distraction-free.centered-layout .main-content.split-mode.split-horizontal .preview-content {
        display: table !important;
        min-height: 100% !important;
      }
      
      /* Force preview display in both normal and distraction-free mode */
      #preview {
        display: block !important;
        min-height: 100%
      }
      
    `;
