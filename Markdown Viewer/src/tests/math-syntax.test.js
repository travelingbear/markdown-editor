import { describe, expect, it, vi } from 'vitest';
import {
  containsMathSyntax,
  isLikelyMathExpression,
  replaceInlineMath,
  replaceMathOutsideCode,
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

describe('replaceMathOutsideCode', () => {
  it('applies the replacement to ordinary prose', () => {
    expect(replaceMathOutsideCode('a $x$ b', (part) => part.toUpperCase()))
      .toBe('A $X$ B');
  });

  it('leaves fenced blocks untouched', () => {
    const source = ['before', '```', '$x + y$', '```', 'after'].join('\n');
    const result = replaceMathOutsideCode(source, (part) => part.replace(/\$/g, 'D'));
    expect(result).toContain('$x + y$');
    expect(result.startsWith('before')).toBe(true);
  });

  it('leaves tilde fences and inline code untouched', () => {
    const source = ['~~~', '$a$', '~~~', '', 'text `$b$` more $c$'].join('\n');
    const result = replaceMathOutsideCode(source, (part) => part.replace(/\$/g, 'D'));
    expect(result).toContain('$a$');
    expect(result).toContain('`$b$`');
    expect(result).toContain('DcD');
  });

  it('rebuilds the source exactly when the replacement is the identity', () => {
    const source = ['# Title', '', '```js', 'const a = `$x$`;', '```', '', 'Tail $y$.'].join('\n');
    expect(replaceMathOutsideCode(source, (part) => part)).toBe(source);
  });

  it('closes a fence written with CRLF line endings', () => {
    // A Windows-authored document puts \r before the newline. When the closing
    // fence was not recognised, the fence swallowed the rest of the file and no
    // math after the first code block was ever rendered.
    const source = ['before $a$', '```js', 'const x = 1;', '```', 'after $b$'].join('\r\n');
    const result = replaceMathOutsideCode(source, (part) => part.replace(/\$/g, 'D'));

    expect(result).toContain('DaD');
    expect(result).toContain('DbD');
    expect(result).toContain('const x = 1;');
  });

  it('detects math after a CRLF fenced block', () => {
    const source = ['```', 'code', '```', '', 'Area: $\\pi r^2$'].join('\r\n');
    expect(stripMarkdownCode(source)).toContain('$\\pi r^2$');
    expect(containsMathSyntax(source)).toBe(true);
  });

  it('allows trailing spaces after a closing fence', () => {
    const source = ['$a$', '```', 'code', '```   ', 'tail $b$'].join('\n');
    const result = replaceMathOutsideCode(source, (part) => part.replace(/\$/g, 'D'));

    expect(result).toContain('DaD');
    expect(result).toContain('DbD');
  });

  it('handles an unterminated fence by treating the rest as code', () => {
    const source = ['ok $x$', '```', '$y$'].join('\n');
    const result = replaceMathOutsideCode(source, (part) => part.replace(/\$/g, 'D'));
    expect(result).toContain('DxD');
    expect(result).toContain('$y$');
  });
});
