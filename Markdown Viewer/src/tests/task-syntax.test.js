import { describe, expect, it } from 'vitest';
import {
  extractMarkdownTasks,
  updateMarkdownTaskAtLine
} from '../rendering/taskSyntax.js';

describe('task source identity', () => {
  it('extracts similar, standalone, numbered, and non-breaking-space tasks by line', () => {
    const markdown = [
      '[ ] unchecked item 1',
      '-\u00a0[ ] unchecked item 2',
      '3. [x] unchecked item 3'
    ].join('\n');

    expect(extractMarkdownTasks(markdown)).toEqual([
      { lineIndex: 0, text: 'unchecked item 1', checked: false },
      { lineIndex: 1, text: 'unchecked item 2', checked: false },
      { lineIndex: 2, text: 'unchecked item 3', checked: true }
    ]);
  });

  it('ignores task-like text inside backtick and tilde fences', () => {
    const markdown = [
      '- [ ] real task',
      '```markdown',
      '- [ ] example only',
      '```',
      '~~~',
      '- [x] another example',
      '~~~'
    ].join('\n');

    expect(extractMarkdownTasks(markdown)).toEqual([
      { lineIndex: 0, text: 'real task', checked: false }
    ]);
  });

  it('updates only the identified line while preserving its marker and spacing', () => {
    const markdown = '- [ ] repeated\n*\u00a0[ ] repeated\n1. [ ] repeated';

    expect(updateMarkdownTaskAtLine(markdown, 1, true)).toBe(
      '- [ ] repeated\n*\u00a0[x] repeated\n1. [ ] repeated'
    );
  });
});
