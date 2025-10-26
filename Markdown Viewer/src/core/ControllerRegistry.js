/**
 * ControllerRegistry - Dynamic controller registration and lifecycle management
 */
class ControllerRegistry {
  constructor() {
    this.controllers = new Map();
    this.instances = new Map();
  }

  register(name, controllerClass) {
    this.controllers.set(name, controllerClass);
  }

  get(name) {
    return this.controllers.get(name);
  }

  createInstance(name, options = {}) {
    const ControllerClass = this.controllers.get(name);
    if (!ControllerClass) {
      throw new Error(`Controller '${name}' not registered`);
    }
    
    const instance = new ControllerClass(options);
    this.instances.set(name, instance);
    return instance;
  }

  getInstance(name) {
    return this.instances.get(name);
  }

  replace(name, newInstance) {
    const oldInstance = this.instances.get(name);
    if (oldInstance && typeof oldInstance.destroy === 'function') {
      oldInstance.destroy();
    }
    this.instances.set(name, newInstance);
    return oldInstance;
  }

  destroy() {
    for (const [name, instance] of this.instances) {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    }
    this.instances.clear();
    this.controllers.clear();
  }
}

window.ControllerRegistry = ControllerRegistry;