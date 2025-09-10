/**
 * Plugin Validator - Enhanced validation for plugin security and compatibility
 */
class PluginValidator {
  constructor() {
    this.requiredMetadataFields = ['name', 'version', 'description'];
    this.supportedVersions = ['1.0.0', '1.0.1', '1.1.0'];
    this.maxPluginSize = 1024 * 1024; // 1MB limit
  }

  async validatePlugin(pluginClass, metadata, pluginId) {
    const validationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      // Metadata validation
      this.validateMetadata(metadata, validationResult);
      
      // Class structure validation
      this.validatePluginClass(pluginClass, validationResult);
      
      // Security validation
      this.validateSecurity(pluginClass, metadata, validationResult);
      
      // Version compatibility
      this.validateVersion(metadata, validationResult);
      
      // Set overall validity
      validationResult.isValid = validationResult.errors.length === 0;
      
    } catch (error) {
      validationResult.errors.push(`Validation error: ${error.message}`);
    }

    return validationResult;
  }

  validateMetadata(metadata, result) {
    if (!metadata || typeof metadata !== 'object') {
      result.errors.push('Plugin metadata is missing or invalid');
      return;
    }

    // Check required fields
    for (const field of this.requiredMetadataFields) {
      if (!metadata[field] || typeof metadata[field] !== 'string') {
        result.errors.push(`Missing or invalid metadata field: ${field}`);
      }
    }

    // Validate version format
    if (metadata.version && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
      result.errors.push('Invalid version format (expected x.y.z)');
    }

    // Check for suspicious metadata
    if (metadata.name && metadata.name.length > 100) {
      result.warnings.push('Plugin name is unusually long');
    }
  }

  validatePluginClass(pluginClass, result) {
    if (typeof pluginClass !== 'function') {
      result.errors.push('Plugin class must be a constructor function');
      return;
    }

    // Check for required methods
    const prototype = pluginClass.prototype;
    if (!prototype) {
      result.errors.push('Plugin class missing prototype');
      return;
    }

    // Check for init method
    if (typeof prototype.init !== 'function') {
      result.warnings.push('Plugin missing init method');
    }

    // Check for destroy method
    if (typeof prototype.destroy !== 'function') {
      result.warnings.push('Plugin missing destroy method');
    }
  }

  validateSecurity(pluginClass, metadata, result) {
    // Check for suspicious patterns in class string
    const classString = pluginClass.toString();
    
    // Blocked patterns (specific dangerous usage)
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /document\.write/,
      /\.innerHTML\s*=\s*[a-zA-Z_$][a-zA-Z0-9_$]*/,  // Variables/functions only
      /\.outerHTML\s*=/,
      /localStorage\.clear\s*\(/,
      /sessionStorage\.clear\s*\(/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(classString)) {
        result.errors.push(`Security risk: Dangerous pattern detected - ${pattern.source}`);
      }
    }

    // Check class size
    if (classString.length > this.maxPluginSize) {
      result.errors.push('Plugin class exceeds maximum size limit');
    }

    // Check metadata for suspicious content
    if (metadata.description && metadata.description.includes('<script>')) {
      result.errors.push('Security risk: Script tags in description');
    }
  }

  validateVersion(metadata, result) {
    if (!metadata.version) return;

    // Check if version is supported
    if (!this.supportedVersions.includes(metadata.version)) {
      result.warnings.push(`Plugin version ${metadata.version} may not be fully compatible`);
    }

    // Check for future versions
    const [major, minor, patch] = metadata.version.split('.').map(Number);
    if (major > 1 || (major === 1 && minor > 1)) {
      result.warnings.push('Plugin uses newer version format than supported');
    }
  }

  validateDependencies(metadata, availablePlugins = []) {
    const result = {
      isValid: true,
      missing: [],
      conflicts: []
    };

    if (!metadata.dependencies) return result;

    for (const [depId, depVersion] of Object.entries(metadata.dependencies)) {
      const availableDep = availablePlugins.find(p => p.id === depId);
      
      if (!availableDep) {
        result.missing.push(depId);
        result.isValid = false;
      } else if (depVersion && availableDep.metadata.version !== depVersion) {
        result.conflicts.push(`${depId}: expected ${depVersion}, found ${availableDep.metadata.version}`);
        result.isValid = false;
      }
    }

    return result;
  }

  isPluginSafe(validationResult) {
    return validationResult.isValid && 
           !validationResult.errors.some(error => error.includes('Security risk'));
  }
}

window.PluginValidator = PluginValidator;