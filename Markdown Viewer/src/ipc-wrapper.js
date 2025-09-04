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
        console.warn(`[SafeIPC] Callback error for ${command}, retrying...`);
        
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
          console.error(`[SafeIPC] Retry failed for ${command}:`, retryError);
          throw new Error(`IPC command failed: ${command} - ${retryError.message}`);
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
          console.warn(`[SafeIPC] Invalid event data for ${event}:`, eventData);
          return;
        }
        
        // Ensure payload exists
        if (!eventData.payload) {
          console.warn(`[SafeIPC] No payload in event ${event}:`, eventData);
          return;
        }
        
        return handler(eventData);
      } catch (handlerError) {
        console.error(`[SafeIPC] Event handler error for ${event}:`, handlerError);
      }
    };
    
    return await window.__TAURI__.event.listen(event, safeHandler);
  }
}

// Create global safe IPC instance
window.safeIPC = new SafeIPC();

console.log('[SafeIPC] Wrapper initialized');