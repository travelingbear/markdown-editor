// Debug script for IPC communication issues
console.log('[Debug] Starting IPC debug script...');

// Check Tauri availability
if (window.__TAURI__) {
  console.log('[Debug] Tauri is available');
  console.log('[Debug] Tauri version:', window.__TAURI__.app?.getVersion?.() || 'Unknown');
  
  // Test basic IPC communication
  if (window.__TAURI__.core?.invoke) {
    console.log('[Debug] Testing basic IPC...');
    
    // Test with timeout
    Promise.race([
      window.__TAURI__.core.invoke('get_app_info'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ]).then(result => {
      console.log('[Debug] IPC test successful:', result);
    }).catch(error => {
      console.error('[Debug] IPC test failed:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(error) : encodeURIComponent(error));
    });
  } else {
    console.error('[Debug] Tauri core.invoke not available');
  }
  
  // Check event system
  if (window.__TAURI__.event?.listen) {
    console.log('[Debug] Event system available');
  } else {
    console.error('[Debug] Event system not available');
  }
  
} else {
  console.error('[Debug] Tauri not available - running in browser mode');
}

// Monitor for IPC errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('callbackId')) {
    console.error('[Debug] IPC callback error detected:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(event.error) : encodeURIComponent(event.error));
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'string' && event.reason.includes('callbackId')) {
    console.error('[Debug] IPC promise rejection detected:', window.SecurityUtils ? window.SecurityUtils.sanitizeForLog(event.reason) : encodeURIComponent(event.reason));
  }
});

console.log('[Debug] IPC debug script loaded');