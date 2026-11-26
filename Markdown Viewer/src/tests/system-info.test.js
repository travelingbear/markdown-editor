import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/controllers/SettingsController.js');
});

beforeEach(() => {
  document.body.innerHTML = `
    <span id="info-default-mode"></span>
    <span id="info-current-mode"></span>
    <span id="info-code-editor"></span>
    <span id="info-mermaid"></span>
    <span id="info-katex"></span>
  `;
});

describe('renderer system information', () => {
  it('distinguishes enabled-but-lazy, loaded, and disabled renderer states', () => {
    const settings = new window.SettingsController();
    const editor = {
      isEditorReady: () => true,
      getEditorEngine: () => 'CodeMirror'
    };
    let isEnabled = true;
    let runtimeStatus = { loaded: false, version: null };
    let mermaidEnabled = true;
    let mermaidRuntimeStatus = { loaded: false, version: null };
    const preview = {
      rendererRegistry: {
        getAll: () => [
          {
            id: 'katex-plugin.math',
            renderer: { getStatus: () => runtimeStatus }
          },
          {
            id: 'mermaid-plugin.diagrams',
            renderer: { getStatus: () => mermaidRuntimeStatus }
          }
        ]
      },
      parentComponent: {
        pluginManager: {
          getPluginStatus: (pluginId) => ({
            isEnabled: pluginId === 'mermaid-plugin' ? mermaidEnabled : isEnabled
          })
        }
      }
    };

    settings.updateSystemInfo(editor, preview, 'preview');
    expect(document.getElementById('info-katex').textContent).toBe('Not Loaded');
    expect(document.getElementById('info-mermaid').textContent).toBe('Not Loaded');

    runtimeStatus = { loaded: true, version: '0.16.47' };
    settings.updateSystemInfo(editor, preview, 'preview');
    expect(document.getElementById('info-katex').textContent).toBe('Loaded (0.16.47)');

    mermaidRuntimeStatus = { loaded: true, version: '11.16.1' };
    settings.updateSystemInfo(editor, preview, 'preview');
    expect(document.getElementById('info-mermaid').textContent).toBe('Loaded (11.16.1)');

    isEnabled = false;
    settings.updateSystemInfo(editor, preview, 'preview');
    expect(document.getElementById('info-katex').textContent).toBe('Disabled');

    mermaidEnabled = false;
    settings.updateSystemInfo(editor, preview, 'preview');
    expect(document.getElementById('info-mermaid').textContent).toBe('Disabled');
  });
});
