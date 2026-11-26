export function shouldShowMarkdownToolbar({
  mode,
  isDistractionFree,
  isToolbarEnabled
}) {
  const supportsToolbar = mode === 'code' || mode === 'split';
  return supportsToolbar && !isDistractionFree && isToolbarEnabled;
}
