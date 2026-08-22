import { describe, expect, it, vi } from 'vitest';
import {
  containsMathSyntax,
  isLikelyMathExpression,
  replaceInlineMath,
  stripMarkdownCode
} from '../rendering/mathSyntax.js';

describe('math syntax detection', () => {
  it('does not treat ordinary currency as inline math', () => {
    expect(containsMathSyntax('The prices are $5 and $10 today.')).toBe(false);
    expect(containsMathSyntax('This costs $12.50.')).toBe(false);
    expect(containsMathSyntax('We paid $5 for lunch and $6 for coffee.')).toBe(false);
  });

  it('recognizes explicit inline and display math', () => {
    expect(containsMathSyntax('Area is $\\pi r^2$.')).toBe(true);
    expect(containsMathSyntax('$$x = y + 2$$')).toBe(true);
  });

  it('ignores escaped dollar delimiters', () => {
    expect(containsMathSyntax(String.raw`The price is \$5 and the symbol is \$`)).toBe(false);
  });

  it('rejects prose and shell variables in strict mode', () => {
    expect(containsMathSyntax('Use $PATH and $HOME for these folders.')).toBe(false);
    expect(containsMathSyntax('This is $ordinary prose$ in a sentence.')).toBe(false);
    expect(isLikelyMathExpression('hello')).toBe(false);
    expect(isLikelyMathExpression('x')).toBe(true);
    expect(isLikelyMathExpression('x + y')).toBe(true);
  });

  it('allows legacy delimiter behavior in permissive mode', () => {
    expect(containsMathSyntax('This is $ordinary prose$.', { strict: false })).toBe(true);
  });

  it('ignores math-like text inside Markdown code', () => {
    const markdown = 'Inline `$x + y$`\n\n```text\n$$z = 2$$\n```';
    expect(containsMathSyntax(markdown)).toBe(false);
    expect(stripMarkdownCode(markdown)).not.toContain('x + y');
    expect(stripMarkdownCode(markdown)).not.toContain('z = 2');
  });

  it('honors individually disabled delimiters', () => {
    expect(containsMathSyntax('Inline $x + y$.', { inline: false })).toBe(false);
    expect(containsMathSyntax('$$x + y$$', { display: false })).toBe(false);
  });

  it('does not replace currency-like pairs', () => {
    const replacer = vi.fn(() => '<math></math>');
    const result = replaceInlineMath('The prices are $5 and $10.', replacer);

    expect(result).toBe('The prices are $5 and $10.');
    expect(replacer).not.toHaveBeenCalled();
  });
});
