import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const projectRoot = resolve(process.cwd());

function readSource(relativePath) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8').replace(/\r\n/g, '\n');
}

const rootSource = readSource('src/components/MarkdownEditor.js');
const bootstrapSource = readSource('src/bootstrap.js');

function matchAll(source, pattern) {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

const registered = matchAll(rootSource, /registry\.register\('([^']+)'/g);
const constructed = matchAll(rootSource, /registry\.createInstance\('([^']+)'/g);
const staged = matchAll(bootstrapSource, /import\('\.\/([^']+)\.js'\)/g);

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../core/ControllerRegistry.js');
  await import('../components/MarkdownEditor.js');
});

describe('composition root wiring', () => {
  it('registers every controller it constructs', () => {
    for (const name of new Set(constructed)) {
      expect(registered, `'${name}' is constructed but never registered`).toContain(name);
    }
    expect(constructed.length).toBeGreaterThan(0);
  });

  it('constructs every controller it registers', () => {
    // A registration with no construction is dead weight in the registry.
    for (const name of new Set(registered)) {
      expect(constructed, `'${name}' is registered but never constructed`).toContain(name);
    }
  });

  it('registers each controller exactly once', () => {
    expect(new Set(registered).size).toBe(registered.length);
  });

  it('stages every controller class the root references', () => {
    // A class registered but absent from bootstrap.js is a ReferenceError at
    // startup, which no unit test would otherwise catch.
    const stagedClasses = new Set(staged.map((path) => path.split('/').pop()));
    const referenced = matchAll(rootSource, /registry\.register\('[^']+',\s*(\w+)\)/g);

    expect(referenced.length).toBe(registered.length);
    for (const className of referenced) {
      expect(stagedClasses, `${className} is not staged in bootstrap.js`).toContain(className);
    }
  });

  it('stages MarkdownEditor after every module it depends on', () => {
    const rootIndex = staged.findIndex((path) => path.endsWith('MarkdownEditor'));
    const referenced = matchAll(rootSource, /registry\.register\('[^']+',\s*(\w+)\)/g);

    expect(rootIndex).toBeGreaterThan(-1);
    for (const className of referenced) {
      const index = staged.findIndex((path) => path.endsWith(className));
      expect(index, `${className} must load before MarkdownEditor`).toBeLessThan(rootIndex);
    }
  });
});

describe('composition root responsibilities', () => {
  it('registers no component event listeners of its own', () => {
    // Every cross-component event has an owning controller; a listener here
    // would be one with no teardown owner.
    const listeners = rootSource.match(/this\.\w+\.on\(/g) || [];
    expect(listeners).toEqual([]);
  });

  it('keeps only construction, startup, and teardown responsibilities', () => {
    const methods = matchAll(rootSource, /^ {2}(?:async )?(\w+)\(/gm);
    expect(new Set(methods)).toEqual(new Set([
      'constructor',
      'onInit',
      'createComponents',
      'applyInitialSettings',
      'setupGlobalEventHandlers',
      'updateSplashProgress',
      'hideSplash',
      'handleInitializationError',
      'handleError',
      'onDestroy'
    ]));
  });
});

describe('composition root teardown', () => {
  function createRoot() {
    const registry = new window.ControllerRegistry();
    const rendererRegistry = { clear: vi.fn() };
    const editor = new window.MarkdownEditor({ registry, rendererRegistry });
    editor.performanceOptimizer = { destroy: vi.fn() };
    editor.pluginManager = { destroy: vi.fn() };
    editor.pluginLoader = {};
    return { editor, registry };
  }

  it('releases the optimizer, plugins, renderers, and registry exactly once', () => {
    const { editor, registry } = createRoot();
    const optimizer = editor.performanceOptimizer;
    const pluginManager = editor.pluginManager;
    const rendererRegistry = editor.rendererRegistry;
    registry.register('probe', class Probe {});
    registry.createInstance('probe');

    editor.destroy();

    expect(optimizer.destroy).toHaveBeenCalledOnce();
    expect(pluginManager.destroy).toHaveBeenCalledOnce();
    expect(rendererRegistry.clear).toHaveBeenCalledOnce();
    expect(editor.pluginLoader).toBeNull();
    // Cleared, not destroyed: BaseComponent owns child disposal, so the
    // registry must not dispose the same controllers a second time.
    expect(registry.getInstance('probe')).toBeUndefined();
  });

  it('destroys child controllers exactly once, in reverse construction order', () => {
    const { editor } = createRoot();
    const destroyed = [];
    for (const name of ['first', 'second', 'third']) {
      const child = new window.BaseComponent(name);
      child.onDestroy = () => destroyed.push(name);
      editor.addChild(child);
    }

    editor.destroy();

    expect(destroyed).toEqual(['third', 'second', 'first']);
  });
});
