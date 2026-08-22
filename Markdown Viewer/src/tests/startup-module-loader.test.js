import { describe, expect, it, vi } from 'vitest';
import { loadModuleStages } from '../startup/moduleLoader.js';

describe('startup module loader', () => {
  it('loads modules concurrently inside a stage and waits before starting the next stage', async () => {
    const events = [];
    let releaseFirst;
    let releaseSecond;
    const firstPending = new Promise((resolve) => { releaseFirst = resolve; });
    const secondPending = new Promise((resolve) => { releaseSecond = resolve; });

    const loading = loadModuleStages([
      {
        name: 'foundations',
        modules: [
          () => { events.push('first-started'); return firstPending; },
          () => { events.push('second-started'); return secondPending; }
        ]
      },
      {
        name: 'application',
        modules: [() => { events.push('application-started'); }]
      }
    ]);

    await Promise.resolve();
    expect(events).toEqual(['first-started', 'second-started']);

    releaseFirst();
    await Promise.resolve();
    expect(events).not.toContain('application-started');

    releaseSecond();
    const result = await loading;

    expect(events).toEqual(['first-started', 'second-started', 'application-started']);
    expect(result.moduleCount).toBe(3);
    expect(result.stages.map((stage) => stage.name)).toEqual(['foundations', 'application']);
  });

  it('reports the failed dependency stage and does not continue', async () => {
    const laterModule = vi.fn();
    const originalError = new Error('module unavailable');

    await expect(loadModuleStages([
      {
        name: 'foundations',
        modules: [() => Promise.reject(originalError)]
      },
      {
        name: 'application',
        modules: [laterModule]
      }
    ])).rejects.toMatchObject({
      message: 'Startup module stage "foundations" failed: module unavailable',
      stage: 'foundations',
      cause: originalError
    });

    expect(laterModule).not.toHaveBeenCalled();
  });

  it('rejects malformed stage definitions before attempting their modules', async () => {
    await expect(loadModuleStages([{ name: 'broken' }]))
      .rejects.toThrow('Each startup stage requires a name and a modules array');
  });
});
