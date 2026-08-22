import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { loadModuleStages } from './startup/moduleLoader.js';

// Transitional bridge for the existing global-script architecture. Each
// component is loaded in dependency order while the codebase moves to native
// ES modules behind stable interfaces.
window.marked = marked;
window.DOMPurify = DOMPurify;

const applicationModuleStages = [
  {
    name: 'foundations',
    modules: [
      () => import('./core/StyleManager.js'),
      () => import('./utils/sanitizer.js'),
      () => import('./utils/common.js'),
      () => import('./ipc-wrapper.js'),
      () => import('./performance-optimizer.js'),
      () => import('./core/ExtensionAPI.js'),
      () => import('./core/ControllerRegistry.js'),
      () => import('./core/PluginConfig.js'),
      () => import('./core/PluginValidator.js'),
      () => import('./rendering/RendererRegistry.js')
    ]
  },
  {
    name: 'component base',
    modules: [
      () => import('./components/BaseComponent.js')
    ]
  },
  {
    name: 'application modules',
    modules: [
      () => import('./core/PluginManager.js'),
      () => import('./core/PluginLoader.js'),
      () => import('./components/controllers/FileController.js'),
      () => import('./components/controllers/UIController.js'),
      () => import('./components/controllers/KeyboardController.js'),
      () => import('./components/controllers/SettingsController.js'),
      () => import('./components/controllers/TabUIController.js'),
      () => import('./components/controllers/ScrollCoordinator.js'),
      () => import('./components/controllers/ModeController.js'),
      () => import('./components/controllers/TabSessionController.js'),
      () => import('./components/controllers/DocumentLifecycleController.js'),
      () => import('./components/controllers/EditorLifecycleController.js'),
      () => import('./components/controllers/MarkdownActionController.js'),
      () => import('./components/controllers/ExportController.js'),
      () => import('./components/controllers/NativeWindowController.js'),
      () => import('./components/controllers/FileDropController.js'),
      () => import('./components/controllers/SplitPaneController.js'),
      () => import('./components/controllers/WelcomeController.js'),
      () => import('./components/PluginModalController.js'),
      () => import('./components/DocumentComponent.js'),
      () => import('./components/EditorComponent.js'),
      () => import('./components/PreviewComponent.js'),
      () => import('./components/ToolbarComponent.js'),
      () => import('./components/TabState.js'),
      () => import('./components/TabCollection.js'),
      () => import('./components/TabManager.js'),
      () => import('./components/MarkdownEditor.js')
    ]
  },
  {
    name: 'entry point',
    modules: [
      () => import('./main.js')
    ]
  }
];

async function startApplication() {
  const result = await loadModuleStages(applicationModuleStages, {
    onStageStart: (name) => {
      if (name === 'entry point') {
        window.splashScreen?.updateProgress(10, 'Starting application...');
      }
    },
    onStageComplete: ({ name, moduleCount }) => {
      const completedProgress = {
        foundations: 3,
        'component base': 5,
        'application modules': 8
      }[name];
      if (completedProgress) {
        window.splashScreen?.updateProgress(completedProgress, `Loaded ${name}`);
      }
      document.body.dataset.startupStage = name;
      document.body.dataset.startupModules = String(moduleCount);
    }
  });

  delete document.body.dataset.startupStage;
  delete document.body.dataset.startupModules;
  console.log(`[Bootstrap] ${result.moduleCount} modules ready in ${result.duration.toFixed(2)}ms`);
}

startApplication().catch((error) => {
  console.error('[Bootstrap] Application startup failed:', error);
  document.body.dataset.startupError = 'true';
  document.body.classList.add('app-initialized');
  window.splashScreen?.hideSplash();
});
