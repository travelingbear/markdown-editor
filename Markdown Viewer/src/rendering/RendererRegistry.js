const RENDERER_ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const SUPPORTED_MODES = new Set(['pure', 'extended']);

/**
 * Ordered, failure-isolated pipeline for optional preview renderers.
 *
 * A renderer may provide:
 * - transformMarkdown(markdown, context): change the source before it is parsed
 * - transformHtml(html, context): change sanitized-later HTML
 * - afterRender(container, context): enhance the mounted preview DOM
 * - shouldRender(context): skip work when the document has no relevant syntax
 *
 * Syntax that Markdown would otherwise claim — multi-line math delimiters, for
 * example — must be handled in transformMarkdown, because by the time HTML
 * exists the construct may already be split across elements.
 *
 * Renderers default to extended mode and lower priorities run first.
 */
class RendererRegistry {
  constructor() {
    this.renderers = new Map();
    this.registrationOrder = 0;
    this.diagnostics = [];
  }

  register(id, renderer, options = {}) {
    if (typeof id !== 'string' || !RENDERER_ID_PATTERN.test(id)) {
      throw new Error(`Invalid renderer id: ${id}`);
    }
    if (!renderer || typeof renderer !== 'object') {
      throw new Error(`Renderer '${id}' must be an object`);
    }
    if (this.renderers.has(id)) {
      throw new Error(`Renderer '${id}' is already registered`);
    }
    const phases = ['transformMarkdown', 'transformHtml', 'afterRender'];
    if (!phases.some((phase) => typeof renderer[phase] === 'function')) {
      throw new Error(`Renderer '${id}' must provide one of: ${phases.join('(), ')}()`);
    }

    const modes = options.modes ?? renderer.modes ?? ['extended'];
    if (!Array.isArray(modes) || modes.length === 0 || modes.some((mode) => !SUPPORTED_MODES.has(mode))) {
      throw new Error(`Renderer '${id}' has invalid rendering modes`);
    }

    const requestedPriority = options.priority ?? renderer.priority ?? 100;
    const priority = Number.isFinite(requestedPriority) ? requestedPriority : 100;
    this.renderers.set(id, {
      id,
      renderer,
      modes: [...new Set(modes)],
      priority,
      order: this.registrationOrder++
    });
    return true;
  }

  unregister(id) {
    return this.renderers.delete(id);
  }

  has(id) {
    return this.renderers.has(id);
  }

  getAll() {
    return this.getOrderedEntries().map(({ id, renderer, modes, priority }) => ({
      id,
      renderer,
      modes: [...modes],
      priority
    }));
  }

  getDiagnostics() {
    return this.diagnostics.map((diagnostic) => ({ ...diagnostic }));
  }

  clearDiagnostics() {
    this.diagnostics = [];
  }

  async transformMarkdown(markdown, context = {}) {
    let result = String(markdown ?? '');
    for (const entry of this.getOrderedEntries()) {
      if (this.isCancelled(context)) break;
      if (typeof entry.renderer.transformMarkdown !== 'function') continue;
      if (!await this.shouldRun(entry, context)) continue;

      try {
        const transformed = await entry.renderer.transformMarkdown(result, context);
        if (this.isCancelled(context)) break;
        if (typeof transformed !== 'string') {
          throw new Error('transformMarkdown() must return a string');
        }
        result = transformed;
      } catch (error) {
        this.recordError(entry.id, 'transformMarkdown', error);
      }
    }
    return result;
  }

  async transformHtml(html, context = {}) {
    let result = String(html ?? '');
    for (const entry of this.getOrderedEntries()) {
      if (this.isCancelled(context)) break;
      if (typeof entry.renderer.transformHtml !== 'function') continue;
      if (!await this.shouldRun(entry, context)) continue;

      try {
        const transformed = await entry.renderer.transformHtml(result, context);
        if (this.isCancelled(context)) break;
        if (typeof transformed !== 'string') {
          throw new Error('transformHtml() must return a string');
        }
        result = transformed;
      } catch (error) {
        this.recordError(entry.id, 'transformHtml', error);
      }
    }
    return result;
  }

  async afterRender(container, context = {}) {
    for (const entry of this.getOrderedEntries()) {
      if (this.isCancelled(context)) break;
      if (typeof entry.renderer.afterRender !== 'function') continue;
      if (!await this.shouldRun(entry, context)) continue;

      try {
        await entry.renderer.afterRender(container, context);
      } catch (error) {
        this.recordError(entry.id, 'afterRender', error);
      }
    }
  }

  async shouldRun(entry, context) {
    if (!entry.modes.includes(context.mode || 'extended')) return false;
    if (typeof entry.renderer.shouldRender !== 'function') return true;
    try {
      return await entry.renderer.shouldRender(context) === true;
    } catch (error) {
      this.recordError(entry.id, 'shouldRender', error);
      return false;
    }
  }

  isCancelled(context) {
    return typeof context.isCurrent === 'function' && !context.isCurrent();
  }

  getOrderedEntries() {
    return [...this.renderers.values()].sort((left, right) =>
      left.priority - right.priority || left.order - right.order
    );
  }

  recordError(rendererId, phase, error) {
    const message = error instanceof Error ? error.message : String(error);
    this.diagnostics.push({ rendererId, phase, message });
    if (this.diagnostics.length > 50) this.diagnostics.shift();
    console.warn(`[RendererRegistry] ${rendererId} ${phase} failed:`, error);
  }

  clear() {
    this.renderers.clear();
    this.clearDiagnostics();
  }
}

window.RendererRegistry = RendererRegistry;

export { RendererRegistry };
