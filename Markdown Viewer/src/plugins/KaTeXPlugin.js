import {
  containsMathSyntax,
  replaceDisplayMath,
  replaceInlineMath
} from '../rendering/mathSyntax.js';
import { katexMetadata } from './katexManifest.js';

const DEFAULT_SETTINGS = Object.freeze({
  detectionMode: 'strict',
  inlineMath: true,
  displayMath: true,
  errorMode: 'source'
});

const KATEX_PLUGIN_CSS = `
.math-display {
  margin: 16px 0;
  padding: 12px;
  overflow-x: auto;
  border-left: 4px solid var(--accent-primary, #5e60e7);
  border-radius: 6px;
  background-color: var(--bg-secondary, #f6f8fa);
  text-align: center;
}
.math-display .katex-display { margin: 0; }
.math-inline { display: inline; margin: 0 2px; }
.katex { font-size: 1.1em; }
.katex-display { margin: 0.5em 0; }
@media (max-width: 768px) {
  .katex { font-size: 1em; }
  .math-display { margin: 12px 0; padding: 8px; }
}`;

async function loadBundledKatex() {
  const [katexModule, cssModule] = await Promise.all([
    import('katex'),
    import('katex/dist/katex.min.css?inline')
  ]);
  return {
    katex: katexModule.default,
    css: cssModule.default
  };
}

class KaTeXPlugin {
  static metadata = katexMetadata;

  constructor(pluginAPI, options = {}) {
    this.pluginAPI = pluginAPI;
    this.runtimeLoader = options.runtimeLoader || loadBundledKatex;
    this.katex = null;
    this.runtimeCss = '';
    this.runtimePromise = null;
    this.styleElement = null;
    this.settingsHost = null;
    this.isActive = false;
    this.renderer = null;
  }

  async init() {
    this.isActive = true;
    this.renderer = {
      shouldRender: (context) => containsMathSyntax(context.markdown, this.getDetectionOptions()),
      transformHtml: (html, context) => this.renderMath(html, context),
      getStatus: () => this.getRuntimeStatus()
    };

    this.pluginAPI.registerRenderer('math', this.renderer, {
      modes: ['extended'],
      priority: 20
    });
    this.pluginAPI.registerExtension('export', {
      metadata: { name: 'katex-export-styles' },
      getStyles: ({ previewHtml } = {}) => String(previewHtml || '').includes('class="katex')
        ? this.runtimeCss
        : ''
    });

    await this.refreshPreview();
  }

  getSetting(key) {
    return this.pluginAPI.getSetting?.(key, DEFAULT_SETTINGS[key]) ?? DEFAULT_SETTINGS[key];
  }

  setSetting(key, value) {
    const saved = this.pluginAPI.setSetting?.(key, value) ?? false;
    this.updateSettingsUI();
    void this.refreshPreview();
    return saved;
  }

  getDetectionOptions() {
    return {
      strict: this.getSetting('detectionMode') !== 'permissive',
      inline: this.getSetting('inlineMath') !== false && this.getSetting('inlineMath') !== 'false',
      display: this.getSetting('displayMath') !== false && this.getSetting('displayMath') !== 'false'
    };
  }

  getRuntimeStatus() {
    return {
      loaded: this.katex !== null,
      version: this.katex?.version || null,
      local: true
    };
  }

  async ensureRuntime() {
    if (this.katex) return this.katex;
    if (this.runtimePromise) return this.runtimePromise;

    this.runtimePromise = (async () => {
      const runtime = await this.runtimeLoader();
      if (!this.isActive) return null;
      if (!runtime?.katex || typeof runtime.katex.renderToString !== 'function') {
        throw new Error('Bundled KaTeX runtime is invalid');
      }

      this.katex = runtime.katex;
      const bundledCss = typeof runtime.css === 'string' ? runtime.css : '';
      this.runtimeCss = `${bundledCss}\n${KATEX_PLUGIN_CSS}`;
      this.mountRuntimeStyles();
      this.updateSettingsUI();
      this.pluginAPI.getPreview?.()?.emit?.('katex-loaded', {
        version: this.katex.version || null
      });
      return this.katex;
    })();

    try {
      return await this.runtimePromise;
    } finally {
      this.runtimePromise = null;
    }
  }

  mountRuntimeStyles() {
    if (!this.runtimeCss || this.styleElement) return;
    this.styleElement = document.createElement('style');
    this.styleElement.dataset.pluginStyle = 'katex-plugin';
    this.styleElement.textContent = this.runtimeCss;
    document.head.appendChild(this.styleElement);
  }

  async renderMath(html, context = {}) {
    const options = this.getDetectionOptions();
    if (!containsMathSyntax(context.markdown, options)) return html;

    const katex = await this.ensureRuntime();
    if (!katex || (typeof context.isCurrent === 'function' && !context.isCurrent())) return html;

    let result = replaceDisplayMath(html, (match, expression, offset, source) => {
      if (this.isInsideCodeElement(source, offset)) return match;
      return this.renderExpression(katex, match, expression, true);
    }, options);

    result = replaceInlineMath(result, (match, expression, offset, source) => {
      if (this.isInsideCodeElement(source, offset)) return match;
      return this.renderExpression(katex, match, expression, false);
    }, options);

    return result;
  }

  renderExpression(katex, original, expression, displayMode) {
    const decodedExpression = this.decodeMarkdownHtml(expression).trim();
    try {
      const rendered = katex.renderToString(decodedExpression, {
        displayMode,
        throwOnError: this.getSetting('errorMode') !== 'warning',
        strict: 'warn',
        trust: false,
        output: 'htmlAndMathml'
      });
      const tag = displayMode ? 'div' : 'span';
      const className = displayMode ? 'math-display' : 'math-inline';
      return `<${tag} class="${className}">${rendered}</${tag}>`;
    } catch (error) {
      return original;
    }
  }

  decodeMarkdownHtml(value) {
    return String(value)
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/<br\s*\/?>/gi, '\n');
  }

  isInsideCodeElement(html, offset) {
    const precedingHtml = String(html).slice(0, offset);
    const codeOpenCount = (precedingHtml.match(/<code(?:\s[^>]*)?>/gi) || []).length;
    const codeCloseCount = (precedingHtml.match(/<\/code>/gi) || []).length;
    return codeOpenCount > codeCloseCount;
  }

  mountSettings(host) {
    if (!host) return;
    this.settingsHost = host;
    host.replaceChildren();

    const section = document.createElement('div');
    section.className = 'settings-section katex-plugin-settings';
    section.append(
      this.createHeading('KaTeX Math'),
      this.createDescription('KaTeX is bundled locally and loads only when Extended rendering finds enabled math syntax.'),
      this.createChoiceSetting('Detection', [
        ['strict', 'Strict'],
        ['permissive', 'Permissive']
      ], 'detectionMode', 'Strict mode requires recognizable math syntax and avoids treating prices, shell variables, or ordinary prose as formulas. Permissive mode accepts any valid dollar-delimited text.'),
      this.createBooleanSetting('Inline $…$', 'inlineMath', 'Controls formulas written between single dollar signs, such as $x + y$. Disable this if your documents use single dollar signs primarily for currency.'),
      this.createBooleanSetting('Display $$…$$', 'displayMath', 'Controls centered block formulas written between double dollar signs. This setting does not affect inline formulas.'),
      this.createChoiceSetting('Invalid Formulas', [
        ['source', 'Keep Source'],
        ['warning', 'Show Warning']
      ], 'errorMode', 'Keep Source leaves invalid formulas unchanged. Show Warning lets KaTeX display its visible error output in the preview.'),
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

  createChoiceSetting(label, choices, settingKey, helpText = '') {
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
      button.dataset.katexSetting = settingKey;
      button.dataset.katexValue = value;
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

  createBooleanSetting(label, settingKey, helpText = '') {
    return this.createChoiceSetting(label, [
      ['true', 'Enabled'],
      ['false', 'Disabled']
    ], settingKey, helpText);
  }

  createRuntimeSetting() {
    const item = document.createElement('div');
    item.className = 'setting-item';
    this.attachSettingHelp(item, 'Shows whether the bundled local KaTeX runtime has been loaded. It stays unloaded until Extended rendering encounters an enabled formula.');
    item.classList.add('plugin-setting-help-above');
    const label = document.createElement('label');
    label.textContent = 'Bundled Runtime';
    const value = document.createElement('span');
    value.className = 'katex-runtime-status plugin-version';
    item.append(label, value);
    return item;
  }

  attachSettingHelp(item, helpText) {
    if (!helpText) return;
    item.classList.add('plugin-setting-help');
    item.dataset.settingHelp = helpText;
    item.setAttribute('aria-description', helpText);
  }

  updateSettingsUI() {
    if (!this.settingsHost) return;
    this.settingsHost.querySelectorAll('[data-katex-setting]').forEach((button) => {
      const settingKey = button.dataset.katexSetting;
      let currentValue = this.getSetting(settingKey);
      if (typeof currentValue === 'boolean') currentValue = String(currentValue);
      button.classList.toggle('active', button.dataset.katexValue === currentValue);
    });

    const runtimeStatus = this.settingsHost.querySelector('.katex-runtime-status');
    if (runtimeStatus) {
      runtimeStatus.textContent = this.katex
        ? `KaTeX ${this.katex.version || 'unknown'} · loaded locally`
        : 'Not loaded · bundled locally';
    }
  }

  async refreshPreview() {
    const preview = this.pluginAPI.getPreview?.();
    if (preview?.updatePreview) await preview.updatePreview();
  }

  async destroy() {
    this.isActive = false;
    this.pluginAPI.unregisterRenderer?.('math');
    this.styleElement?.remove();
    this.styleElement = null;
    this.katex = null;
    this.runtimeCss = '';
    this.settingsHost = null;
    await this.refreshPreview();
  }
}

export { DEFAULT_SETTINGS, KaTeXPlugin, loadBundledKatex };
export default KaTeXPlugin;
