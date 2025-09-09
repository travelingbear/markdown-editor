/**
 * Test Extension - Demonstrates extension system functionality
 */
class TestExtension {
  constructor() {
    this.metadata = {
      name: 'Test Extension',
      version: '1.0.0',
      description: 'A simple test extension to verify extension points work'
    };
  }

  // Extension lifecycle
  activate() {
    console.log('[TestExtension] Activated');
  }

  deactivate() {
    console.log('[TestExtension] Deactivated');
  }

  // File operation hooks
  async beforeNewFile(data) {
    console.log('[TestExtension] Before new file:', data);
  }

  async afterNewFile(data) {
    console.log('[TestExtension] After new file:', data);
  }

  async beforeOpenFile(data) {
    console.log('[TestExtension] Before open file:', data);
  }

  async afterOpenFile(data) {
    console.log('[TestExtension] After open file:', data);
  }

  async beforeSaveFile(data) {
    console.log('[TestExtension] Before save file:', data);
  }

  async afterSaveFile(data) {
    console.log('[TestExtension] After save file:', data);
  }

  // Theme hooks
  async beforeThemeToggle(data) {
    console.log('[TestExtension] Before theme toggle:', data);
  }

  async afterThemeToggle(data) {
    console.log('[TestExtension] After theme toggle:', data);
  }

  async beforeThemeChange(data) {
    console.log('[TestExtension] Before theme change:', data);
  }

  async afterThemeChange(data) {
    console.log('[TestExtension] After theme change:', data);
  }

  // Markdown action hooks
  async beforeMarkdownAction(data) {
    console.log('[TestExtension] Before markdown action:', data);
  }

  async afterMarkdownAction(data) {
    console.log('[TestExtension] After markdown action:', data);
  }
}

// Test functions for console
window.testExtensionSystem = function() {
  console.log('=== Testing Extension System ===');
  
  // Get the main editor instance
  const editor = window.markdownEditor;
  if (!editor) {
    console.error('MarkdownEditor not found');
    return;
  }

  // Create test extension
  const testExt = new TestExtension();
  
  // Test FileController extensions
  console.log('\n1. Testing FileController extensions...');
  editor.fileController.addFileExtension('test-file', testExt);
  console.log('Extensions:', editor.fileController.getExtensions());
  
  // Test UIController extensions
  console.log('\n2. Testing UIController extensions...');
  editor.uiController.addUIExtension('test-ui', testExt);
  console.log('Extensions:', editor.uiController.getExtensions());
  
  // Test MarkdownActionController extensions
  console.log('\n3. Testing MarkdownActionController extensions...');
  editor.markdownActionController.addMarkdownExtension('test-markdown', testExt);
  console.log('Extensions:', editor.markdownActionController.getExtensions());
  console.log('Available actions:', editor.markdownActionController.getAvailableActions());
  
  console.log('\n=== Extension system ready! ===');
  console.log('Now try: New file, Open file, Save file, Toggle theme, or use markdown formatting');
  console.log('Watch the console for extension hook messages');
  
  return {
    fileController: editor.fileController,
    uiController: editor.uiController,
    markdownActionController: editor.markdownActionController,
    testExtension: testExt
  };
};

window.removeTestExtensions = function() {
  console.log('=== Removing Test Extensions ===');
  const editor = window.markdownEditor;
  if (!editor) return;
  
  editor.fileController.removeFileExtension('test-file');
  editor.uiController.removeUIExtension('test-ui');
  editor.markdownActionController.removeMarkdownExtension('test-markdown');
  
  console.log('Test extensions removed');
};