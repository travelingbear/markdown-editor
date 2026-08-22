const SUPPORTED_THEMES = new Set(['application', 'default', 'dark', 'neutral', 'forest']);

function resolveMermaidTheme(applicationTheme, selectedTheme = 'application') {
  if (!SUPPORTED_THEMES.has(selectedTheme)) selectedTheme = 'application';
  if (selectedTheme !== 'application') return selectedTheme;
  return applicationTheme === 'dark' ? 'dark' : 'default';
}

function createMermaidConfig(applicationTheme, settings = {}) {
  const useMaxWidth = settings.useMaxWidth !== false;
  return {
    startOnLoad: false,
    theme: resolveMermaidTheme(applicationTheme, settings.theme),
    securityLevel: 'strict',
    fontFamily: 'inherit',
    // Native SVG labels remain visible after the strict SVG sanitizer removes
    // embedded foreignObject HTML.
    htmlLabels: false,
    flowchart: { useMaxWidth },
    pie: { useMaxWidth }
  };
}

export { createMermaidConfig, resolveMermaidTheme, SUPPORTED_THEMES };
