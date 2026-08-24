/**
 * Flattens a stylesheet into the ordered list of rules a browser would apply,
 * following @import in place so a split stylesheet can be compared against the
 * single file it replaced.
 *
 * Used to prove a CSS extraction changed nothing: same rules, same order, so
 * the cascade cannot have moved.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const IMPORT_PATTERN = /@import\s+(?:url\()?['"]([^'"]+)['"]\)?\s*;/g;

/** Read a stylesheet, replacing each @import with the file it names. */
export function inlineImports(path, seen = new Set()) {
  const absolute = resolve(path);
  if (seen.has(absolute)) throw new Error(`circular @import at ${absolute}`);
  seen.add(absolute);

  const css = readFileSync(absolute, 'utf8').replace(/\r\n/g, '\n');
  return css.replace(IMPORT_PATTERN, (match, target) => {
    if (/^(https?:)?\/\//.test(target)) return match;
    return inlineImports(resolve(dirname(absolute), target), seen);
  });
}

/** Strip comments so formatting differences do not register as changes. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function normalize(value) {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Walk the stylesheet and emit one entry per declaration block, carrying the
 * at-rule context it sits inside so nesting is compared too.
 */
export function flattenRules(css) {
  const source = stripComments(css);
  const rules = [];
  const context = [];
  let buffer = '';

  for (let i = 0; i < source.length; i += 1) {
    const character = source[i];

    if (character === '{') {
      const prelude = normalize(buffer);
      buffer = '';
      if (prelude.startsWith('@')) {
        context.push(prelude);
        rules.push({ kind: 'open', context: context.join(' | '), selector: prelude });
      } else {
        // A declaration block: capture it whole.
        let depth = 1;
        let body = '';
        i += 1;
        while (i < source.length && depth > 0) {
          if (source[i] === '{') depth += 1;
          else if (source[i] === '}') { depth -= 1; if (depth === 0) break; }
          body += source[i];
          i += 1;
        }
        rules.push({
          kind: 'rule',
          context: context.join(' | '),
          selector: prelude,
          declarations: normalize(body)
        });
      }
      continue;
    }

    if (character === '}') {
      if (context.length > 0) {
        rules.push({ kind: 'close', context: context.join(' | '), selector: context.at(-1) });
        context.pop();
      }
      buffer = '';
      continue;
    }

    buffer += character;
  }

  return rules.filter((rule) => rule.kind === 'rule');
}

export function fingerprint(path) {
  return flattenRules(inlineImports(path))
    .map((rule) => `${rule.context}##${rule.selector}##${rule.declarations}`);
}

if (process.argv[2]) {
  const entries = fingerprint(process.argv[2]);
  if (process.argv[3] === '--list') {
    for (const entry of entries) console.log(entry);
  } else {
    console.log(`${entries.length} rules`);
  }
}
