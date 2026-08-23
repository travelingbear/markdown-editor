import { describe, expect, it } from 'vitest';
import {
  TAB_POLICY_LIMITS,
  averageAccessCount,
  selectTabsToUnload
} from '../performance/tabPolicy.js';

const NOW = 1_000_000_000;
const minutes = (count) => count * 60 * 1000;

/** Tabs described by how long ago they were seen and how often. */
function session(entries) {
  const lastAccessTime = new Map();
  const accessCounts = new Map();
  for (const [tabId, idleMinutes, accessCount] of entries) {
    lastAccessTime.set(tabId, NOW - minutes(idleMinutes));
    accessCounts.set(tabId, accessCount);
  }
  return { lastAccessTime, accessCounts, now: NOW };
}

describe('selectTabsToUnload', () => {
  it('releases nothing in a fresh session', () => {
    expect(selectTabsToUnload(session([['a', 0, 1], ['b', 1, 2]]))).toEqual([]);
  });

  it('releases a tab left idle and rarely visited', () => {
    expect(selectTabsToUnload(session([['stale', 10, 1]]))).toEqual(['stale']);
  });

  it('keeps a tab the reader returns to, however long ago', () => {
    // Five visits is the point at which a tab counts as in use.
    expect(selectTabsToUnload(session([['favourite', 60, 5]]))).toEqual([]);
  });

  it('keeps a recently seen tab even if barely visited', () => {
    expect(selectTabsToUnload(session([['recent', 4, 0]]))).toEqual([]);
  });

  it('ignores a tab sitting exactly on the idle threshold', () => {
    const lastAccessTime = new Map([['edge', NOW - TAB_POLICY_LIMITS.idleBeforeUnloadMs]]);
    expect(selectTabsToUnload({ lastAccessTime, accessCounts: new Map(), now: NOW })).toEqual([]);
  });

  it('releases least-visited first', () => {
    const result = selectTabsToUnload(session([
      ['visited-twice', 10, 2],
      ['never-visited', 10, 0],
      ['visited-once', 10, 1]
    ]));

    expect(result).toEqual(['never-visited', 'visited-once', 'visited-twice']);
  });

  it('breaks a tie on visits by releasing the longest idle first', () => {
    const result = selectTabsToUnload(session([
      ['idle-10m', 10, 1],
      ['idle-30m', 30, 1],
      ['idle-20m', 20, 1]
    ]));

    expect(result).toEqual(['idle-30m', 'idle-20m', 'idle-10m']);
  });

  it('releases only a few at a time', () => {
    const many = Array.from({ length: 10 }, (_, index) => [`tab-${index}`, 30, 0]);
    const result = selectTabsToUnload(session(many));

    expect(result).toHaveLength(TAB_POLICY_LIMITS.maxUnloadsPerPass);
  });

  it('treats an untracked tab as never visited', () => {
    const lastAccessTime = new Map([['unknown', NOW - minutes(10)]]);
    expect(selectTabsToUnload({ lastAccessTime, accessCounts: new Map(), now: NOW }))
      .toEqual(['unknown']);
  });

  it('accepts an empty session', () => {
    expect(selectTabsToUnload()).toEqual([]);
  });
});

describe('averageAccessCount', () => {
  it('averages across tracked tabs', () => {
    expect(averageAccessCount(new Map([['a', 2], ['b', 4]]))).toBe(3);
  });

  it('rounds to the nearest whole visit', () => {
    expect(averageAccessCount(new Map([['a', 1], ['b', 2]]))).toBe(2);
  });

  it('is zero before anything is tracked', () => {
    expect(averageAccessCount(new Map())).toBe(0);
    expect(averageAccessCount()).toBe(0);
  });
});
