// Security sanitization utilities for Markdown Editor
// Phase 1: Critical Security Fixes

/**
 * Sanitizes input for safe logging to prevent log injection attacks
 * @param {any} input - Input to sanitize
 * @returns {string} - Sanitized string safe for logging
 */
function sanitizeForLog(input) {
  if (input === null || input === undefined) {
    return 'null';
  }
  
  if (typeof input === 'string') {
    // Only sanitize dangerous characters, keep readability
    return input.replace(/[\r\n]/g, ' ').replace(/[<>"']/g, '_');
  }
  
  if (typeof input === 'object') {
    try {
      const str = JSON.stringify(input);
      return str.replace(/[\r\n]/g, ' ').replace(/[<>"']/g, '_');
    } catch (e) {
      return '[Object]';
    }
  }
  
  return String(input).replace(/[\r\n]/g, ' ').replace(/[<>"']/g, '_');
}

/**
 * Sanitizes markdown input to prevent code injection
 * @param {string} markdown - Raw markdown input
 * @returns {string} - Sanitized markdown
 */
function sanitizeMarkdownInput(markdown) {
  if (typeof markdown !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous script tags
  let sanitized = markdown.replace(/<script[^>]*>.*?<\/script>/gis, '');
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
}

/**
 * Validates and sanitizes user-controllable input for XSS prevention
 * @param {string} input - User input
 * @returns {string} - Sanitized input
 */
function sanitizeUserInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Basic HTML entity encoding
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Export functions for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sanitizeForLog,
    sanitizeMarkdownInput,
    sanitizeUserInput
  };
} else {
  // Browser environment
  window.SecurityUtils = {
    sanitizeForLog,
    sanitizeMarkdownInput,
    sanitizeUserInput
  };
}