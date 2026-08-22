import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(process.cwd());
const baseStyles = readFileSync(resolve(projectRoot, 'src/styles.css'), 'utf8');
const retroStyles = readFileSync(resolve(projectRoot, 'src/styles/themes/retro.css'), 'utf8');

describe('Retro preview typography', () => {
  it('overrides the shared scaled code size with a readable fixed size', () => {
    expect(baseStyles).toMatch(
      /\.preview-content pre\s*\{[^}]*font-size:\s*85%;/s
    );
    expect(retroStyles).toMatch(
      /body\.retro-theme \.preview-content pre\s*\{[^}]*font-size:\s*14px;[^}]*line-height:\s*1\.5;/s
    );
  });
});
