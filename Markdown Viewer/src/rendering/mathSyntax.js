const DISPLAY_MATH_SOURCE = String.raw`(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$`;
const INLINE_MATH_SOURCE = String.raw`(?<!\\)\$(?![\s$])([^$\n]+?)(?<![\s\\])\$(?![$\d])`;

const LATEX_COMMAND = /\\(?:[A-Za-z]+|[^A-Za-z\s])/;
const MATH_STRUCTURE = /[=+*/^_{}<>\[\]|]|[≤≥≠≈±×÷√∑∫∞]/;
const BINARY_MINUS = /(?:[A-Za-z0-9)}\]])\s*-\s*(?:[A-Za-z0-9({\[])/;
const SINGLE_VARIABLE = /^[A-Za-z](?:\d+)?$/;
const PARENTHESIZED_VARIABLE = /^\([A-Za-z0-9]+\)$/;
const NUMBER_ONLY = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;

function normalizeOptions(options = {}) {
  return {
    inline: options.inline !== false,
    display: options.display !== false,
    strict: options.strict !== false,
    ignoreMarkdownCode: options.ignoreMarkdownCode !== false
  };
}

/**
 * Remove fenced and inline code before syntax detection. Replacement still
 * performs its own HTML code-element check after Markdown has been parsed.
 */
export function stripMarkdownCode(text) {
  return String(text ?? '')
    .replace(/(^|\n)[ \t]{0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n[ \t]{0,3}\2[ \t]*(?=\r?\n|$)|$)/g, '$1')
    .replace(/(`+)([^\n]*?)\1/g, '');
}

/**
 * Strict mode intentionally requires a mathematical signal. This prevents
 * prose, environment variables, and currency-like pairs from loading KaTeX.
 */
export function isLikelyMathExpression(expression, options = {}) {
  const { strict } = normalizeOptions(options);
  const value = String(expression ?? '').trim();
  if (!value) return false;
  if (!strict) return true;
  if (NUMBER_ONLY.test(value)) return false;

  return LATEX_COMMAND.test(value)
    || MATH_STRUCTURE.test(value)
    || BINARY_MINUS.test(value)
    || SINGLE_VARIABLE.test(value)
    || PARENTHESIZED_VARIABLE.test(value);
}

export function containsMathSyntax(text, options = {}) {
  const normalized = normalizeOptions(options);
  const source = normalized.ignoreMarkdownCode ? stripMarkdownCode(text) : String(text ?? '');

  if (normalized.display) {
    const displayPattern = new RegExp(DISPLAY_MATH_SOURCE, 'g');
    for (const match of source.matchAll(displayPattern)) {
      if (String(match[1] ?? '').trim()) return true;
    }
  }

  if (!normalized.inline) return false;
  const inlinePattern = new RegExp(INLINE_MATH_SOURCE, 'g');
  for (const match of source.matchAll(inlinePattern)) {
    if (isLikelyMathExpression(match[1], normalized)) return true;
  }
  return false;
}

/**
 * Fenced blocks and inline code spans, in source order. Math inside them is
 * literal text and must survive untouched.
 *
 * The closing-fence lookahead has to tolerate CRLF: on a Windows-authored
 * document `\r` sits between the fence and the newline, and a fence that never
 * matches its close swallows the rest of the file as code.
 */
const CODE_REGION_SOURCE = String.raw`(?:^|\n)[ \t]{0,3}(\`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n[ \t]{0,3}\1[ \t]*(?=\r?\n|$)|$)|(\`+)[^\n]*?\2`;

/**
 * Apply `replace` to every part of the Markdown source that is not code.
 *
 * Math has to be handled before Markdown parsing: a display block spanning
 * several lines is otherwise cut apart by paragraphs, `breaks`, and setext
 * headings, and the delimiters end up in different elements.
 */
export function replaceMathOutsideCode(markdown, replace) {
  const source = String(markdown ?? '');
  const pattern = new RegExp(CODE_REGION_SOURCE, 'g');
  let result = '';
  let lastIndex = 0;

  for (const match of source.matchAll(pattern)) {
    result += replace(source.slice(lastIndex, match.index));
    result += match[0];
    lastIndex = match.index + match[0].length;
  }

  return result + replace(source.slice(lastIndex));
}

export function replaceDisplayMath(text, replacer, options = {}) {
  const { display } = normalizeOptions(options);
  if (!display) return String(text ?? '');
  return String(text ?? '').replace(new RegExp(DISPLAY_MATH_SOURCE, 'g'), replacer);
}

export function replaceInlineMath(text, replacer, options = {}) {
  const normalized = normalizeOptions(options);
  if (!normalized.inline) return String(text ?? '');
  return String(text ?? '').replace(new RegExp(INLINE_MATH_SOURCE, 'g'), (...args) => {
    const expression = args[1];
    return isLikelyMathExpression(expression, normalized) ? replacer(...args) : args[0];
  });
}
