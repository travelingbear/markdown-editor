// Common utility functions for Markdown Editor
// Phase 3: Code Quality & Maintenance

/**
 * Debug logging wrapper - only logs when debug mode is enabled
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments
 */
function debugLog(message, ...args) {
  if (localStorage.getItem('debug') === 'true') {
    console.log(message, ...args);
  }
}

/**
 * Performance timing utility
 * @param {string} label - Timer label
 * @param {Function} fn - Function to time
 * @returns {Promise|any} - Function result
 */
async function timeFunction(label, fn) {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (localStorage.getItem('debug') === 'true') {
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export functions for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debugLog,
    timeFunction,
    debounce
  };
} else {
  // Browser environment
  window.CommonUtils = {
    debugLog,
    timeFunction,
    debounce
  };
}