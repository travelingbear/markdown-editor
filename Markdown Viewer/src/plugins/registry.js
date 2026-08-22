import {
  horizontalSplitMetadata,
  resetHorizontalSplitConfig
} from './horizontalSplitManifest.js';
import { katexMetadata } from './katexManifest.js';
import { mermaidMetadata } from './mermaidManifest.js';

/**
 * Built-in plugin catalog.
 *
 * Keeping discovery data here lets PluginLoader remain generic. A bundled
 * plugin only needs a stable id, virtual path, and dynamic module import.
 */
const bundledPluginDefinitions = Object.freeze([
  Object.freeze({
    id: 'horizontal-split-plugin',
    path: '/plugins/HorizontalSplitPlugin.js',
    metadata: horizontalSplitMetadata,
    resetConfig: resetHorizontalSplitConfig,
    load: () => import('./HorizontalSplitPlugin.js')
  }),
  Object.freeze({
    id: 'katex-plugin',
    path: '/plugins/KaTeXPlugin.js',
    metadata: katexMetadata,
    load: () => import('./KaTeXPlugin.js')
  }),
  Object.freeze({
    id: 'mermaid-plugin',
    path: '/plugins/MermaidPlugin.js',
    metadata: mermaidMetadata,
    load: () => import('./MermaidPlugin.js')
  })
]);

function getBundledPluginDefinitions() {
  return [...bundledPluginDefinitions];
}

export { getBundledPluginDefinitions };
