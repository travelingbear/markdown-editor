// Safe IPC wrapper to prevent destructuring errors
class SafeIPC {
  constructor() {
    this.isAvailable = false;
    this.init();
  }
  
  init() {
    if (window.__TAURI__?.core?.invoke) {
      this.isAvailable = true;
      console.log('[SafeIPC] Tauri IPC available');
    } else {
      console.warn('[SafeIPC] Tauri IPC not available');
    }
  }
  
  async invoke(command, args = {}) {
    if (!this.isAvailable) {
      throw new Error('Tauri IPC not available');
    }
    
    // Input validation to prevent code injection
    if (!command || typeof command !== 'string') {
      throw new Error('Invalid command: must be a non-empty string');
    }
    
    // Sanitize command string - only allow alphanumeric, underscore, dash, and colon
    if (!/^[a-zA-Z0-9_:-]+$/.test(command)) {
      throw new Error('Invalid command format: contains unsafe characters');
    }
    
    // Validate args parameter
    if (args !== null && typeof args !== 'object') {
      throw new Error('Invalid args: must be an object or null');
    }
    
    try {
      // Add timeout to all IPC calls
      const result = await Promise.race([
        window.__TAURI__.core.invoke(command, args),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`IPC timeout for command: ${command}`)), 5000)
        )
      ]);
      
      return result;
    } catch (error) {
      // Handle specific destructuring errors
      if (error.message && error.message.includes('callbackId')) {
        console.warn(`[SafeIPC] Callback error for ${window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(command)) : encodeURIComponent(String(command))}, retrying...`);
        
        // Wait a bit and retry once
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
          return await Promise.race([
            window.__TAURI__.core.invoke(command, args),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`IPC retry timeout for command: ${command}`)), 3000)
            )
          ]);
        } catch (retryError) {
          console.error(`[SafeIPC] Retry failed for ${window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(command)) : encodeURIComponent(String(command))}:`, window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(retryError)) : encodeURIComponent(String(retryError)));
          throw new Error(`IPC command failed: ${window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(command)) : encodeURIComponent(String(command))} - ${window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(retryError.message)) : encodeURIComponent(String(retryError.message))}`);
        }
      }
      
      throw error;
    }
  }
  
  async listen(event, handler) {
    if (!window.__TAURI__?.event?.listen) {
      throw new Error('Tauri event system not available');
    }
    
    const safeHandler = (eventData) => {
      try {
        // Validate event data structure
        if (!eventData || typeof eventData !== 'object') {
          console.warn(`[SafeIPC] Invalid event data for ${window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(event)) : encodeURIComponent(String(event))}:`, window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(eventData)) : encodeURIComponent(String(eventData)));
          return;
        }
        
        // Ensure payload exists
        if (!eventData.payload) {
          console.warn(`[SafeIPC] No payload in event ${window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(event)) : encodeURIComponent(String(event))}:`, window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(eventData)) : encodeURIComponent(String(eventData)));
          return;
        }
        
        return handler(eventData);
      } catch (handlerError) {
        console.error(`[SafeIPC] Event handler error for ${window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(event)) : encodeURIComponent(String(event))}:`, window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(String(handlerError)) : encodeURIComponent(String(handlerError)));
      }
    };
    
    return await window.__TAURI__.event.listen(event, safeHandler);
  }
}

// Create global safe IPC instance
window.safeIPC = new SafeIPC();

console.log('[SafeIPC] Wrapper initialized');