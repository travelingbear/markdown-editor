// Component-based Markdown Editor - Main Entry Point
// This replaces the monolithic MarkdownViewer class with a component-based architecture

// Debug mode - set to false for production builds
window.DEBUG_MODE = false;

// Override console methods in production
if (!window.DEBUG_MODE) {
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  // Keep console.warn and console.error for critical issues
}

let markdownEditor = null;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('[App] Starting component-based markdown editor...');
    
    // Create and initialize the main markdown editor component using factory
    markdownEditor = createMarkdownEditor({
      // Pass any configuration options here
      // controllers: {} // Custom controllers can be injected here
    });
    
    // Initialize the editor
    await markdownEditor.init();
    
    // Set global reference for performance optimizer
    window.markdownEditor = markdownEditor;
    
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

// Initial export (will be updated after initialization)
window.markdownEditor = markdownEditor;