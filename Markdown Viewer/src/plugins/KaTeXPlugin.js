import {
  containsMathSyntax,
  replaceDisplayMath,
  replaceInlineMath,
  replaceMathOutsideCode
} from '../rendering/mathSyntax.js';
import { katexMetadata } from './katexManifest.js';

const DEFAULT_SETTINGS = Object.freeze({
  detectionMode: 'strict',
  inlineMath: true,
  displayMath: true,
  errorMode: 'source'
});

const PLACEHOLDER_OPEN = '\uE000katex';
const PLACEHOLDER_CLOSE = '\uE001';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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
.math-inline .katex { font-size: 1em; }
.math-display .katex { font-size: 1.1em; }
.katex-display { margin: 0.5em 0; }
@media (max-width: 768px) {
  .math-display .katex { font-size: 1em; }
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
      transformMarkdown: (markdown, context) => this.extractMath(markdown, context),
      transformHtml: (html, context) => this.restoreMath(html, context),
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

  /**
   * Render every math span straight from the source and leave a placeholder in
   * its place. Markdown cannot then split a multi-line display block across a
   * paragraph, a `breaks` line break, or a setext heading, which previously
   * left the delimiters in different elements and produced unbalanced HTML.
   */
  async extractMath(markdown, context = {}) {
    const options = this.getDetectionOptions();
    if (!containsMathSyntax(markdown, options)) return markdown;

    const katex = await this.ensureRuntime();
    if (!katex || (typeof context.isCurrent === 'function' && !context.isCurrent())) {
      return markdown;
    }

    const placeholders = new Map();
    const store = (expression, displayMode) => {
      const token = `${PLACEHOLDER_OPEN}${placeholders.size}${PLACEHOLDER_CLOSE}`;
      const html = this.renderExpression(katex, expression, displayMode);
      placeholders.set(token, {
        // Kept-source fallbacks stay inline text, so only a real display block
        // may replace the paragraph Markdown wrapped around it.
        isBlock: displayMode && html.startsWith('<div'),
        html
      });
      return token;
    };

    const result = replaceMathOutsideCode(markdown, (segment) => {
      const withDisplay = replaceDisplayMath(
        segment,
        (match, expression) => store(expression, true),
        options
      );
      return replaceInlineMath(
        withDisplay,
        (match, expression) => store(expression, false),
        options
      );
    });

    context.mathPlaceholders = placeholders;
    return result;
  }

  restoreMath(html, context = {}) {
    const placeholders = context.mathPlaceholders;
    if (!placeholders?.size) return html;

    let result = String(html);
    for (const [token, { isBlock, html: rendered }] of placeholders) {
      if (isBlock) {
        // A display block owns its line, so unwrap the paragraph Markdown put
        // around it rather than nesting a div inside a p.
        result = result.replace(new RegExp(`<p>\\s*${token}\\s*</p>`, 'g'), rendered);
      }
      result = result.split(token).join(rendered);
    }
    return result;
  }

  renderExpression(katex, expression, displayMode) {
    // The expression comes from the raw source, so no Markdown entity or line
    // break decoding is needed.
    const source = String(expression).trim();
    try {
      const rendered = katex.renderToString(source, {
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
      // Keep Source: hand the original delimiters back as escaped text so the
      // formula stays readable instead of disappearing.
      const delimiter = displayMode ? '$$' : '$';
      return escapeHtml(`${delimiter}${source}${delimiter}`);
    }
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
