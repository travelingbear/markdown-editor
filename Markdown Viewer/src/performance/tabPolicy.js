/**
 * Decisions about which tabs to release under memory pressure, and the access
 * statistics the performance report is built from.
 *
 * Kept free of application state so the thresholds can be read and tested
 * directly; `PerformanceOptimizer` owns the maps and performs the effects.
 */

// A tab must be untouched for this long, and rarely visited, before it is
// considered releasable.
const IDLE_BEFORE_UNLOAD_MS = 5 * 60 * 1000;
const RARELY_ACCESSED_BELOW = 5;

// Release a few at a time rather than emptying the session in one pass.
const MAX_UNLOADS_PER_PASS = 3;

/**
 * Least-used tabs first, then least recently used. `lastAccessTime` and
 * `accessCounts` are the optimizer's own Maps, keyed by tab id.
 */
export function selectTabsToUnload({
  lastAccessTime = new Map(),
  accessCounts = new Map(),
  now = Date.now(),
  idleMs = IDLE_BEFORE_UNLOAD_MS,
  rarelyAccessedBelow = RARELY_ACCESSED_BELOW,
  limit = MAX_UNLOADS_PER_PASS
} = {}) {
  const candidates = [];

  for (const [tabId, lastAccess] of lastAccessTime) {
    const timeSinceAccess = now - lastAccess;
    const accessCount = accessCounts.get(tabId) || 0;
    if (timeSinceAccess > idleMs && accessCount < rarelyAccessedBelow) {
      candidates.push({ tabId, timeSinceAccess, accessCount });
    }
  }

  candidates.sort((left, right) => (
    left.accessCount !== right.accessCount
      ? left.accessCount - right.accessCount
      : right.timeSinceAccess - left.timeSinceAccess
  ));

  return candidates.slice(0, limit).map((candidate) => candidate.tabId);
}

/** Mean visits per tracked tab, rounded, for the performance report. */
export function averageAccessCount(accessCounts = new Map()) {
  if (accessCounts.size === 0) return 0;

  const total = [...accessCounts.values()].reduce((sum, count) => sum + count, 0);
  return Math.round(total / accessCounts.size);
}

export const TAB_POLICY_LIMITS = Object.freeze({
  idleBeforeUnloadMs: IDLE_BEFORE_UNLOAD_MS,
  rarelyAccessedBelow: RARELY_ACCESSED_BELOW,
  maxUnloadsPerPass: MAX_UNLOADS_PER_PASS
});
