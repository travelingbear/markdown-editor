/**
 * Produce a stable identity for a local file path without changing the path
 * stored for display or file-system access.
 *
 * Windows paths are case-insensitive and may arrive with either separator.
 * POSIX paths remain case-sensitive. Dot segments are resolved lexically so
 * equivalent paths selected through different routes still match.
 */
export function normalizeFilePath(filePath) {
  if (typeof filePath !== 'string') return null;

  const trimmed = filePath.trim();
  if (!trimmed) return null;

  const slashed = trimmed.replace(/\\/g, '/');
  const isWindowsDrive = /^[a-zA-Z]:\//.test(slashed);
  const isUnc = slashed.startsWith('//');
  const isAbsolutePosix = !isUnc && slashed.startsWith('/');
  let prefix = '';
  let remainder = slashed;

  if (isWindowsDrive) {
    prefix = slashed.slice(0, 3);
    remainder = slashed.slice(3);
  } else if (isUnc) {
    prefix = '//';
    remainder = slashed.slice(2);
  } else if (isAbsolutePosix) {
    prefix = '/';
    remainder = slashed.slice(1);
  }

  const parts = [];
  for (const part of remainder.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..' && parts.length > 0 && parts.at(-1) !== '..') {
      parts.pop();
    } else if (part !== '..' || !prefix) {
      parts.push(part);
    }
  }

  let normalized = prefix + parts.join('/');
  if (normalized.length > prefix.length && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return isWindowsDrive || isUnc ? normalized.toLocaleLowerCase('en-US') : normalized;
}

export function areSameFilePath(firstPath, secondPath) {
  const first = normalizeFilePath(firstPath);
  const second = normalizeFilePath(secondPath);
  return first !== null && second !== null && first === second;
}
