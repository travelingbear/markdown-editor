import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

beforeAll(async () => {
  await import('../core/ExtensionAPI.js');
  await import('../components/BaseComponent.js');
  await import('../components/ToolbarComponent.js');
});

beforeEach(() => {
  document.body.innerHTML = `
    <div class="editor-pane"></div>
    <div id="markdown-toolbar" class="markdown-toolbar">
      <div class="toolbar-content">
        <div class="toolbar-primary">
          <div class="toolbar-group toolbar-group-history">
            <button id="undo-btn" class="md-btn"></button>
          </div>
        </div>
        <div class="toolbar-spacer"></div>
        <div class="toolbar-group toolbar-group-search">
          <button id="find-replace-btn" class="md-btn"></button>
        </div>
      </div>
    </div>
  `;
});

function buildOverflow() {
  const toolbar = new window.ToolbarComponent();
  toolbar.markdownToolbar = document.getElementById('markdown-toolbar');
  toolbar.setupResponsiveOverflow();
  return toolbar;
}

const childClasses = () =>
  [...document.querySelector('.toolbar-content').children].map((node) => node.className);

describe('More button placement', () => {
  it('sits with the search control at the right edge, after the spacer', () => {
    buildOverflow();
    const order = childClasses();

    const primary = order.findIndex((name) => name.includes('toolbar-primary'));
    const spacer = order.findIndex((name) => name.includes('toolbar-spacer'));
    const overflow = order.findIndex((name) => name.includes('toolbar-overflow-group'));
    const search = order.findIndex((name) => name.includes('toolbar-group-search'));

    // The growing spacer sits before both, so More and Find stay pinned right.
    expect(primary).toBeLessThan(spacer);
    expect(spacer).toBeLessThan(overflow);
    expect(overflow).toBeLessThan(search);
  });

  it('leaves search as the last control in the row', () => {
    buildOverflow();
    const order = childClasses();

    expect(order[order.length - 1]).toContain('toolbar-group-search');
  });

  it('builds the menu only once', () => {
    buildOverflow();
    buildOverflow();

    expect(document.querySelectorAll('#md-overflow-btn')).toHaveLength(1);
    expect(document.querySelectorAll('.toolbar-overflow-group')).toHaveLength(1);
  });

  it('stays immediately before search even without a spacer', () => {
    document.querySelector('.toolbar-spacer').remove();
    buildOverflow();
    const order = childClasses();

    const overflow = order.findIndex((name) => name.includes('toolbar-overflow-group'));
    const search = order.findIndex((name) => name.includes('toolbar-group-search'));
    expect(search - overflow).toBe(1);
  });
});
