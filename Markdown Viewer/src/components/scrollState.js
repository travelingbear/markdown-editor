function clampScrollRatio(value, fallback = null) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1, value));
}

function getScrollRatio(scrollTop, maxScroll) {
  if (!Number.isFinite(maxScroll) || maxScroll <= 0) return 0;
  return clampScrollRatio(scrollTop / maxScroll, 0);
}

function getScrollTopFromRatio(ratio, maxScroll) {
  const normalizedRatio = clampScrollRatio(ratio, 0);
  const normalizedMax = Number.isFinite(maxScroll) ? Math.max(0, maxScroll) : 0;
  return normalizedRatio * normalizedMax;
}

export { clampScrollRatio, getScrollRatio, getScrollTopFromRatio };
