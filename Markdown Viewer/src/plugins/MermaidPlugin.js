import { sanitizeRenderedSvg } from '../rendering/security.js';
import { createMermaidConfig, SUPPORTED_THEMES } from './mermaidConfig.js';
import { BUNDLED_MERMAID_VERSION, mermaidMetadata } from './mermaidManifest.js';

const DEFAULT_SETTINGS = Object.freeze({
  theme: 'application',
  useMaxWidth: true,
  errorMode: 'warning'
});

const MERMAID_STYLES = `
.mermaid-diagram {
  margin: 20px 0;
  text-align: center;
  background-color: var(--bg-primary);
  border-radius: 6px;
  padding: 16px;
  border: 1px solid var(--border-primary);
}
.mermaid-diagram svg { max-width: 100%; height: auto; }
body.dark-theme .mermaid-diagram,
[data-theme="dark"] .mermaid-diagram { background-color: var(--bg-secondary); }
.mermaid-error {
  margin: 20px 0;
  padding: 16px;
  background-color: rgba(248, 81, 73, 0.1);
  border-radius: 6px;
  border: 2px solid #f85149;
  text-align: center;
}
.mermaid-error .error-header {
  font-weight: 600;
  color: #f85149;
  margin-bottom: 12px;
  font-size: 16px;
}
.mermaid-error .diagram-code {
  background-color: var(--bg-tertiary);
  padding: 12px;
  border-radius: 4px;
  margin: 12px 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  text-align: left;
  overflow-x: auto;
}
.mermaid-error .error-message {
  font-size: 12px;
  color: #f85149;
  font-style: italic;
  margin-top: 8px;
  background-color: rgba(248, 81, 73, 0.05);
  padding: 8px;
  border-radius: 4px;
}
@media (max-width: 600px) {
  .mermaid-diagram, .mermaid-error { margin: 10px 0; padding: 8px; }
  .mermaid-error .diagram-code { font-size: 11px; padding: 8px; }
}
@media print {
  .mermaid-diagram {
    page-break-inside: avoid;
    break-inside: avoid;
    max-width: 100%;
    overflow: hidden;
    text-align: center;
    margin: 16px 0 !important;
    border: 1px solid #ddd !important;
    padding: 8px !important;
  }
  .mermaid-diagram svg {
    max-width: 100% !important;
    height: auto !important;
    max-height: 400px !important;
    page-break-inside: avoid;
  }
}`;

async function loadBundledMermaid() {
  const mermaidModule = await import('mermaid');
  return {
    mermaid: mermaidModule.default,
    version: BUNDLED_MERMAID_VERSION
  };
}

function decodeHtmlEntities(value) {
  const parsed = new DOMParser().parseFromString(`<body>${value}</body>`, 'text/html');
  return parsed.body.textContent || '';
}

function replaceWithSanitizedSvg(container, svg) {
  const sanitizedSvg = sanitizeRenderedSvg(svg);
  const parsed = new DOMParser().parseFromString(sanitizedSvg, 'image/svg+xml');
  const svgElement = parsed.documentElement;
  if (svgElement?.localName !== 'svg' || parsed.querySelector('parsererror')) {
    throw new Error('Mermaid returned invalid SVG');
  }
  container.replaceChildren(document.importNode(svgElement, true));
}

class MermaidPlugin {
  static metadata = mermaidMetadata;

  constructor(pluginAPI, options = {}) {
    this.pluginAPI = pluginAPI;
    this.runtimeLoader = options.runtimeLoader || loadBundledMermaid;
    this.mermaid = null;
    this.runtimeVersion = null;
    this.runtimePromise = null;
    this.runtimeError = null;
    this.styleElement = null;
    this.settingsHost = null;
    this.configurationSignature = null;
    this.diagramSequence = 0;
    this.isActive = false;
  }

  async init() {
    this.isActive = true;
    this.pluginAPI.registerRenderer?.('diagrams', {
      shouldRender: ({ markdown }) => /^\s*(```|~~~)\s*mermaid\b/im.test(String(markdown || '')),
      transformHtml: (html, context) => this.transformHtml(html, context),
      afterRender: (container, context) => this.renderDiagrams(container, context),
      getStatus: () => this.getStatus()
    }, { modes: ['extended'], priority: 200 });
    this.pluginAPI.registerExtension?.('export', {
      metadata: { name: 'mermaid-export-styles' },
      getStyles: ({ previewHtml } = {}) => String(previewHtml || '').includes('class="mermaid-diagram')
        ? MERMAID_STYLES
        : ''
    });
  }

  getSetting(key) {
    const fallback = DEFAULT_SETTINGS[key];
    const value = this.pluginAPI.getSetting?.(key, fallback) ?? fallback;
    if (key === 'theme') return SUPPORTED_THEMES.has(value) ? value : fallback;
    if (key === 'errorMode') return ['source', 'warning'].includes(value) ? value : fallback;
    if (key === 'useMaxWidth') return value !== false;
    return value;
  }

  async setSetting(key, value) {
    this.pluginAPI.setSetting?.(key, value);
    this.configurationSignature = null;
    this.updateSettingsUI();
    await this.refreshPreview();
  }

  getStatus() {
    return {
      loaded: this.mermaid !== null,
      version: this.runtimeVersion,
      error: this.runtimeError
    };
  }

  async ensureRuntime() {
    if (this.mermaid) return this.mermaid;
    if (this.runtimePromise) return this.runtimePromise;

    this.runtimePromise = this.runtimeLoader().then((runtime) => {
      if (!this.isActive) return null;
      if (!runtime?.mermaid || typeof runtime.mermaid.render !== 'function'
        || typeof runtime.mermaid.initialize !== 'function') {
        throw new Error('Bundled Mermaid runtime is invalid');
      }
      this.mermaid = runtime.mermaid;
      this.runtimeVersion = runtime.version || null;
      this.runtimeError = null;
      this.installStyles();
      this.updateSettingsUI();
      this.refreshSystemInfo();
      return this.mermaid;
    }).catch((error) => {
      this.runtimeError = error instanceof Error ? error.message : String(error);
      this.runtimePromise = null;
      this.updateSettingsUI();
      this.refreshSystemInfo();
      throw error;
    });
    return this.runtimePromise;
  }

  async configureRuntime(applicationTheme) {
    const mermaid = await this.ensureRuntime();
    if (!mermaid || !this.isActive) return null;
    const settings = {
      theme: this.getSetting('theme'),
      useMaxWidth: this.getSetting('useMaxWidth')
    };
    const config = createMermaidConfig(applicationTheme, settings);
    const signature = JSON.stringify(config);
    if (signature !== this.configurationSignature) {
      mermaid.initialize(config);
      this.configurationSignature = signature;
    }
    return mermaid;
  }

  async transformHtml(html, context = {}) {
    if (!html.includes('language-mermaid')) return html;
    const mermaid = await this.configureRuntime(context.theme);
    if (!mermaid) return html;
    if (typeof context.isCurrent === 'function' && !context.isCurrent()) return html;

    return html.replace(
      /<pre><code class="([^"]*\blanguage-mermaid\b[^"]*)">([\s\S]*?)<\/code><\/pre>/g,
      (_match, _classes, encodedCode) => {
        const code = decodeHtmlEntities(encodedCode).trim();
        const id = `mermaid-${++this.diagramSequence}`;
        return `<div class="mermaid-diagram" id="${id}" data-mermaid-code="${encodeURIComponent(code)}"></div>`;
      }
    );
  }

  async renderDiagrams(container, context = {}) {
    const diagrams = [...container.querySelectorAll('.mermaid-diagram[data-mermaid-code]')];
    if (diagrams.length === 0) return;
    const mermaid = await this.configureRuntime(context.theme);
    if (!mermaid) return;

    for (const diagram of diagrams) {
      if (typeof context.isCurrent === 'function' && !context.isCurrent()) return;
      const code = decodeURIComponent(diagram.dataset.mermaidCode || '');
      try {
        const { svg } = await mermaid.render(`${diagram.id}-svg`, code);
        if (typeof context.isCurrent === 'function' && !context.isCurrent()) return;
        replaceWithSanitizedSvg(diagram, svg);
      } catch (error) {
        console.warn('[MermaidPlugin] Diagram rendering failed:', error);
        this.showDiagramError(diagram, code, error);
      }
    }
  }

  showDiagramError(diagram, code, error) {
    const source = document.createElement('pre');
    const sourceCode = document.createElement('code');
    sourceCode.className = 'language-mermaid';
    sourceCode.textContent = code;
    source.appendChild(sourceCode);

    if (this.getSetting('errorMode') === 'source') {
      diagram.replaceWith(source);
      return;
    }

    const errorContainer = document.createElement('div');
    errorContainer.className = 'mermaid-error';
    const header = document.createElement('div');
    header.className = 'error-header';
    header.textContent = '⚠️ Mermaid Rendering Error';
    source.className = 'diagram-code';
    const message = document.createElement('div');
    message.className = 'error-message';
    message.textContent = error instanceof Error ? error.message : String(error);
    errorContainer.append(header, source, message);
    diagram.replaceChildren(errorContainer);
  }

  installStyles() {
    if (this.styleElement) return;
    this.styleElement = document.createElement('style');
    this.styleElement.dataset.pluginStyle = 'mermaid-plugin';
    this.styleElement.textContent = MERMAID_STYLES;
    document.head.appendChild(this.styleElement);
  }

  mountSettings(host) {
    this.settingsHost = host;
    host.replaceChildren();
    const section = document.createElement('div');
    section.className = 'settings-section mermaid-plugin-settings';
    section.append(
      this.createHeading('Mermaid Diagrams'),
      this.createDescription('Mermaid is bundled locally and loads only when Extended rendering finds a Mermaid code fence.'),
      this.createChoiceSetting('Theme', [
        ['application', 'Application'],
        ['default', 'Default'],
        ['dark', 'Dark'],
        ['neutral', 'Neutral'],
        ['forest', 'Forest']
      ], 'theme', 'Application follows the editor theme. The other choices keep a fixed Mermaid diagram theme for every document.'),
      this.createBooleanSetting('Maximum Width', 'useMaxWidth', 'Fits generated flowcharts and pie charts to the available preview width. Disable it to preserve Mermaid’s intrinsic diagram width.'),
      this.createChoiceSetting('Invalid Diagrams', [
        ['source', 'Keep Source'],
        ['warning', 'Show Warning']
      ], 'errorMode', 'Keep Source restores an ordinary Mermaid code block. Show Warning displays the source together with Mermaid’s error message.'),
      this.createReadOnlySetting('Security', 'Strict', 'Mermaid always runs at its strict security level, and generated SVG is sanitized again before entering the preview.'),
      this.createRuntimeSetting()
    );
    host.appendChild(section);
    this.updateSettingsUI();
  }

  createHeading(text) {
    const heading = document.createElement('h3');
    heading.textContent = text;
    return heading;
  }

  createDescription(text) {
    const description = document.createElement('p');
    description.className = 'plugin-manager-description';
    description.textContent = text;
    return description;
  }

  createChoiceSetting(label, choices, settingKey, helpText) {
    const item = document.createElement('div');
    item.className = 'setting-item';
    this.attachSettingHelp(item, helpText);
    const itemLabel = document.createElement('label');
    itemLabel.textContent = label;
    const controls = document.createElement('div');
    controls.className = 'setting-control';
    for (const [value, text] of choices) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'setting-btn';
      button.dataset.mermaidSetting = settingKey;
      button.dataset.mermaidValue = value;
      button.textContent = text;
      button.addEventListener('click', () => {
        const settingValue = typeof DEFAULT_SETTINGS[settingKey] === 'boolean'
          ? value === 'true'
          : value;
        this.setSetting(settingKey, settingValue);
      });
      controls.appendChild(button);
    }
    item.append(itemLabel, controls);
    return item;
  }

  createBooleanSetting(label, settingKey, helpText) {
    return this.createChoiceSetting(label, [['true', 'Enabled'], ['false', 'Disabled']], settingKey, helpText);
  }

  createReadOnlySetting(labelText, valueText, helpText) {
    const item = document.createElement('div');
    item.className = 'setting-item';
    this.attachSettingHelp(item, helpText);
    const label = document.createElement('label');
    label.textContent = labelText;
    const value = document.createElement('span');
    value.className = 'plugin-version';
    value.textContent = valueText;
    item.append(label, value);
    return item;
  }

  createRuntimeSetting() {
    const item = this.createReadOnlySetting(
      'Bundled Runtime',
      '',
      'Shows whether the bundled local Mermaid runtime has loaded. It stays unloaded until Extended rendering encounters a Mermaid code fence.'
    );
    item.classList.add('plugin-setting-help-above');
    item.querySelector('.plugin-version').classList.add('mermaid-runtime-status');
    return item;
  }

  attachSettingHelp(item, helpText) {
    item.classList.add('plugin-setting-help');
    item.dataset.settingHelp = helpText;
    item.setAttribute('aria-description', helpText);
  }

  updateSettingsUI() {
    if (!this.settingsHost) return;
    this.settingsHost.querySelectorAll('[data-mermaid-setting]').forEach((button) => {
      const key = button.dataset.mermaidSetting;
      const currentValue = String(this.getSetting(key));
      button.classList.toggle('active', button.dataset.mermaidValue === currentValue);
    });
    const runtimeStatus = this.settingsHost.querySelector('.mermaid-runtime-status');
    if (runtimeStatus) {
      runtimeStatus.textContent = this.runtimeError
        ? `Load failed · ${this.runtimeError}`
        : this.mermaid
          ? `Mermaid ${this.runtimeVersion || 'unknown'} · loaded locally`
          : 'Not loaded · bundled locally';
    }
  }

  refreshSystemInfo() {
    const settings = this.pluginAPI.getSettingsController?.();
    const preview = this.pluginAPI.getPreview?.();
    const editor = this.pluginAPI.getEditor?.();
    const mode = this.pluginAPI.getModeController?.()?.getCurrentMode?.() || 'preview';
    settings?.updateSystemInfo?.(editor, preview, mode);
  }

  async refreshPreview() {
    const preview = this.pluginAPI.getPreview?.();
    if (preview?.updatePreview) await preview.updatePreview();
  }

  async destroy() {
    this.isActive = false;
    this.pluginAPI.unregisterRenderer?.('diagrams');
    this.styleElement?.remove();
    this.styleElement = null;
    this.mermaid = null;
    this.runtimeVersion = null;
    this.runtimePromise = null;
    this.configurationSignature = null;
    this.settingsHost = null;
    await this.refreshPreview();
  }
}

export { DEFAULT_SETTINGS, MERMAID_STYLES, MermaidPlugin, loadBundledMermaid };
export default MermaidPlugin;
