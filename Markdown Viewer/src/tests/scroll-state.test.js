import { describe, expect, it } from 'vitest';
import {
  clampScrollRatio,
  getScrollRatio,
  getScrollTopFromRatio
} from '../components/scrollState.js';

describe('canonical scroll state', () => {
  it('converts pane pixels into a relative document position', () => {
    expect(getScrollRatio(500, 1000)).toBe(0.5);
  });

  it('applies one relative position to panes with different heights', () => {
    expect(getScrollTopFromRatio(0.5, 2000)).toBe(1000);
    expect(getScrollTopFromRatio(0.5, 600)).toBe(300);
  });

  it('clamps invalid or out-of-range positions safely', () => {
    expect(clampScrollRatio(-1, 0)).toBe(0);
    expect(clampScrollRatio(2, 0)).toBe(1);
    expect(clampScrollRatio(Number.NaN, 0)).toBe(0);
    expect(getScrollRatio(200, 0)).toBe(0);
  });
});
