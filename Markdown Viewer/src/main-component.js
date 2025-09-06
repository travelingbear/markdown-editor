// Component-based Markdown Editor - Main Entry Point
// This replaces the monolithic MarkdownViewer class with a component-based architecture

let markdownEditor = null;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('[App] Starting component-based markdown editor...');
    
    // Create and initialize the main markdown editor component
    markdownEditor = new MarkdownEditor({
      // Pass any configuration options here
    });
    
    // Initialize the editor
    await markdownEditor.init();
    
    console.log('[App] Component-based markdown editor initialized successfully');
    
  } catch (error) {
    console.error('[App] Failed to initialize markdown editor:', error);
    
    // Fallback error handling
    const welcomePage = document.getElementById('welcome-page');
    if (welcomePage) {
      welcomePage.style.display = 'flex';
      welcomePage.innerHTML = `
        <div class="welcome-content">
          <h1>⚠️ Initialization Error</h1>
          <p>The markdown editor failed to initialize properly.</p>
          <p>Please refresh the page or restart the application.</p>
          <button onclick="location.reload()" class="welcome-btn primary">Refresh Page</button>
        </div>
      `;
    }
  }
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('[App] Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('[App] Unhandled promise rejection:', event.reason);
});

// Export for debugging purposes
window.markdownEditor = markdownEditor;