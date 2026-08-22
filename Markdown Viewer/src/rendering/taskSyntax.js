const TASK_LINE_PATTERN = /^(\s*(?:(?:[-+*]|\d+[.)])\s+)?\[)([ xX])(\]\s*(.*))$/;
const FENCE_PATTERN = /^\s{0,3}(`{3,}|~{3,})/;

export function parseTaskLine(line) {
  const match = String(line ?? '').match(TASK_LINE_PATTERN);
  if (!match) return null;
  return {
    prefix: match[1],
    checked: match[2].toLowerCase() === 'x',
    suffix: match[3],
    text: match[4]
  };
}

export function extractMarkdownTasks(markdown) {
  const tasks = [];
  const lines = String(markdown ?? '').split('\n');
  let fence = null;

  lines.forEach((line, lineIndex) => {
    const fenceMatch = line.match(FENCE_PATTERN);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) {
        fence = { character: marker[0], length: marker.length };
      } else if (marker[0] === fence.character && marker.length >= fence.length) {
        fence = null;
      }
      return;
    }
    if (fence) return;

    const task = parseTaskLine(line);
    if (task) tasks.push({ lineIndex, text: task.text, checked: task.checked });
  });

  return tasks;
}

export function updateMarkdownTaskAtLine(markdown, lineIndex, checked) {
  if (!Number.isInteger(lineIndex) || lineIndex < 0) return null;
  const lines = String(markdown ?? '').split('\n');
  if (lineIndex >= lines.length) return null;
  const task = parseTaskLine(lines[lineIndex]);
  if (!task) return null;

  lines[lineIndex] = `${task.prefix}${checked ? 'x' : ' '}${task.suffix}`;
  return lines.join('\n');
}
