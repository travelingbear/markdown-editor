import { beforeAll, describe, expect, it } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
});

describe('BaseComponent child lifecycle', () => {
  it('destroys consumers before dependencies', () => {
    const destroyed = [];
    class TrackedComponent extends window.BaseComponent {
      onDestroy() {
        destroyed.push(this.name);
      }
    }

    const parent = new window.BaseComponent('parent');
    parent.addChild(new TrackedComponent('dependency'));
    parent.addChild(new TrackedComponent('consumer'));

    parent.destroy();

    expect(destroyed).toEqual(['consumer', 'dependency']);
  });
});
