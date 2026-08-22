import { describe, expect, it } from 'vitest';
import { shouldShowMarkdownToolbar } from '../components/toolbarState.js';

describe('Markdown toolbar visibility', () => {
  it.each(['code', 'split'])('shows in %s mode when enabled', (mode) => {
    expect(shouldShowMarkdownToolbar({
      mode,
      isDistractionFree: false,
      isToolbarEnabled: true
    })).toBe(true);
  });

  it('stays hidden in preview mode', () => {
    expect(shouldShowMarkdownToolbar({
      mode: 'preview',
      isDistractionFree: false,
      isToolbarEnabled: true
    })).toBe(false);
  });

  it('respects disabled and distraction-free states in split mode', () => {
    expect(shouldShowMarkdownToolbar({
      mode: 'split',
      isDistractionFree: false,
      isToolbarEnabled: false
    })).toBe(false);
    expect(shouldShowMarkdownToolbar({
      mode: 'split',
      isDistractionFree: true,
      isToolbarEnabled: true
    })).toBe(false);
  });
});
