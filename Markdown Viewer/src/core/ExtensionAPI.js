/**
 * Extension API - Provides common extension functionality
 */
class ExtensionAPI {
  constructor() {
    this.extensions = new Map();
  }

  // Register an extension
  register(name, extension) {
    if (this.extensions.has(name)) {
      throw new Error(`Extension '${name}' already registered`);
    }
    
    this.extensions.set(name, {
      instance: extension,
      active: false,
      metadata: extension.metadata || {}
    });
  }

  // Unregister an extension
  unregister(name) {
    const ext = this.extensions.get(name);
    if (ext && ext.active) {
      this.deactivate(name);
    }
    return this.extensions.delete(name);
  }

  // Activate an extension
  activate(name) {
    const ext = this.extensions.get(name);
    if (!ext) throw new Error(`Extension '${name}' not found`);
    
    if (!ext.active) {
      if (ext.instance.activate) {
        ext.instance.activate();
      }
      ext.active = true;
    }
  }

  // Deactivate an extension
  deactivate(name) {
    const ext = this.extensions.get(name);
    if (!ext) throw new Error(`Extension '${name}' not found`);
    
    if (ext.active) {
      if (ext.instance.deactivate) {
        ext.instance.deactivate();
      }
      ext.active = false;
    }
  }

  // Get extension
  get(name) {
    const ext = this.extensions.get(name);
    return ext ? ext.instance : null;
  }

  // Get all extensions
  getAll() {
    return Array.from(this.extensions.entries()).map(([name, ext]) => ({
      name,
      instance: ext.instance,
      active: ext.active,
      metadata: ext.metadata
    }));
  }

  // Execute extension method if exists
  execute(name, method, ...args) {
    const ext = this.extensions.get(name);
    if (ext && ext.active && ext.instance[method]) {
      return ext.instance[method](...args);
    }
  }

  // Cleanup all extensions
  destroy() {
    for (const [name] of this.extensions) {
      this.deactivate(name);
    }
    this.extensions.clear();
  }
}

window.ExtensionAPI = ExtensionAPI;