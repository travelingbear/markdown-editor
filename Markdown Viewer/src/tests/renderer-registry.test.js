import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RendererRegistry } from '../rendering/RendererRegistry.js';

describe('RendererRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new RendererRegistry();
  });

  it('runs matching renderers in stable priority order', async () => {
    registry.register('normal', {
      transformHtml: (html) => `${html}-normal`
    });
    registry.register('first', {
      transformHtml: (html) => `${html}-first`
    }, { priority: 10 });
    registry.register('same-priority', {
      transformHtml: (html) => `${html}-same`
    }, { priority: 10 });

    await expect(registry.transformHtml('start', { mode: 'extended' }))
      .resolves.toBe('start-first-same-normal');
  });

  it('keeps extended renderers out of pure Markdown mode', async () => {
    const extended = vi.fn((html) => `${html}-extended`);
    const pure = vi.fn((html) => `${html}-pure`);
    registry.register('extended', { transformHtml: extended });
    registry.register('pure', { transformHtml: pure }, { modes: ['pure'] });

    await expect(registry.transformHtml('start', { mode: 'pure' })).resolves.toBe('start-pure');
    expect(extended).not.toHaveBeenCalled();
  });

  it('isolates renderer failures and continues the pipeline', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    registry.register('broken', {
      transformHtml: () => { throw new Error('broken renderer'); }
    }, { priority: 10 });
    registry.register('healthy', {
      transformHtml: (html) => `${html}-healthy`
    });

    await expect(registry.transformHtml('start', { mode: 'extended' }))
      .resolves.toBe('start-healthy');
    expect(registry.getDiagnostics()).toEqual([{
      rendererId: 'broken',
      phase: 'transformHtml',
      message: 'broken renderer'
    }]);
  });

  it('stops stale asynchronous render pipelines', async () => {
    let current = true;
    registry.register('stale', {
      transformHtml: async (html) => {
        current = false;
        return `${html}-stale`;
      }
    });
    const next = vi.fn((html) => `${html}-next`);
    registry.register('next', { transformHtml: next });

    await registry.transformHtml('start', {
      mode: 'extended',
      isCurrent: () => current
    });

    expect(next).not.toHaveBeenCalled();
  });

  it('runs DOM enhancement only when relevant syntax is detected', async () => {
    const afterRender = vi.fn();
    registry.register('diagram', {
      shouldRender: ({ markdown }) => markdown.includes('```diagram'),
      afterRender
    });
    const container = document.createElement('div');

    await registry.afterRender(container, { mode: 'extended', markdown: '# Plain' });
    await registry.afterRender(container, { mode: 'extended', markdown: '```diagram\nA --> B\n```' });

    expect(afterRender).toHaveBeenCalledOnce();
    expect(afterRender).toHaveBeenCalledWith(container, expect.objectContaining({ mode: 'extended' }));
  });

  it('rejects duplicate and malformed renderer contracts', () => {
    registry.register('valid-renderer', { transformHtml: (html) => html });

    expect(() => registry.register('valid-renderer', { afterRender() {} }))
      .toThrow('already registered');
    expect(() => registry.register('Invalid renderer', { afterRender() {} }))
      .toThrow('Invalid renderer id');
    expect(() => registry.register('missing-methods', {}))
      .toThrow('must provide transformHtml() or afterRender()');
  });
});
