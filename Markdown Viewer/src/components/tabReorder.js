export function getPinnedTabDropIndex(sourceIndex, targetIndex, insertAfter, tabCount) {
  let nextIndex = targetIndex + (insertAfter ? 1 : 0);
  if (sourceIndex < nextIndex) nextIndex -= 1;
  return Math.max(0, Math.min(nextIndex, tabCount - 1));
}
