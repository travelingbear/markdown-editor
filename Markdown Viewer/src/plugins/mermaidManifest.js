const BUNDLED_MERMAID_VERSION = '11.16.1';

const mermaidMetadata = Object.freeze({
  name: 'Mermaid Diagram Renderer',
  version: '1.0.0',
  description: 'Renders Mermaid diagrams locally and only when an Extended Markdown document contains a Mermaid code fence.',
  author: 'Markdown Editor',
  defaultEnabled: true,
  runtimeVersion: BUNDLED_MERMAID_VERSION
});

export { BUNDLED_MERMAID_VERSION, mermaidMetadata };
