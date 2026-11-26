const horizontalSplitMetadata = Object.freeze({
  name: 'Horizontal Split Plugin',
  version: '1.1.0',
  description: 'Adds horizontal split functionality to the split mode',
  author: 'Markdown Editor'
});

const horizontalSplitConfigKeys = Object.freeze([
  'markdownViewer_defaultSplitOrientation',
  'markdownViewer_horizontalSplitToolbar',
  'markdownViewer_horizontalSplitPaneOrder'
]);

function resetHorizontalSplitConfig() {
  for (const key of horizontalSplitConfigKeys) {
    localStorage.removeItem(key);
  }
}

export {
  horizontalSplitConfigKeys,
  horizontalSplitMetadata,
  resetHorizontalSplitConfig
};
