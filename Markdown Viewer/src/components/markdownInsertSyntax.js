/**
 * Pure Markdown construction for the link and image insert dialogs.
 * Kept free of DOM access so the generated syntax can be tested directly.
 */

function titleSuffix(title) {
  return title ? ` "${title}"` : '';
}

/**
 * `[text](url "title")`, falling back to the URL when no label is given.
 */
function buildLinkMarkdown({ text = '', url = '', title = '' } = {}) {
  return `[${text || url}](${url}${titleSuffix(title)})`;
}

/**
 * `![alt](url "title")`, wrapped in a link when one is supplied.
 */
function buildImageMarkdown({ url = '', alt = '', title = '', link = '' } = {}) {
  const image = `![${alt || 'Image'}](${url}${titleSuffix(title)})`;
  return link ? `[${image}](${link})` : image;
}

/**
 * Default alt text for a chosen file: its name without the extension.
 */
function altTextFromFileName(fileName = '') {
  return fileName.split('.')[0];
}

export { buildLinkMarkdown, buildImageMarkdown, altTextFromFileName };
