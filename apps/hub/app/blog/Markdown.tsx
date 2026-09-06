import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

/**
 * Styled markdown renderer for blog MDX posts. Plain markdown only — the
 * `.mdx` files in content/blog/ contain no JSX components, so react-markdown
 * (not a full MDX compiler) is sufficient and keeps the bundle light.
 *
 * Styling mirrors the guide pages' design language: serif-free, generous
 * line-height, primary-color links, and bordered code/tables.
 */
const components: Components = {
  h1: ({ node: _node, ...props }) => (
    <h1 style={{ fontSize: '1.7rem', fontWeight: 700, lineHeight: 1.3, margin: '2.5rem 0 1rem' }} {...props} />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.3, margin: '2.25rem 0 0.75rem' }} {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.35, margin: '1.75rem 0 0.6rem' }} {...props} />
  ),
  h4: ({ node: _node, ...props }) => (
    <h4 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, margin: '1.5rem 0 0.5rem' }} {...props} />
  ),
  p: ({ node: _node, ...props }) => (
    <p style={{ fontSize: '1.02rem', lineHeight: 1.75, opacity: 0.85, margin: '0 0 1.25rem' }} {...props} />
  ),
  a: ({ node: _node, ...props }) => (
    <a style={{ color: 'var(--primary, #1a56db)' }} {...props} />
  ),
  ul: ({ node: _node, ...props }) => (
    <ul style={{ paddingLeft: '1.5rem', margin: '0 0 1.25rem', lineHeight: 1.75, opacity: 0.85 }} {...props} />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol style={{ paddingLeft: '1.5rem', margin: '0 0 1.25rem', lineHeight: 1.75, opacity: 0.85 }} {...props} />
  ),
  li: ({ node: _node, ...props }) => (
    <li style={{ marginBottom: '0.4rem' }} {...props} />
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      style={{
        borderLeft: '3px solid var(--primary, #1a56db)',
        margin: '0 0 1.25rem',
        padding: '0.75rem 1.25rem',
        background: 'var(--color-blue-50, #eff6ff)',
        borderRadius: '0 8px 8px 0',
        opacity: 0.9,
      }}
      {...props}
    />
  ),
  code: ({ node: _node, ...props }) => (
    <code
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.85em',
        background: 'var(--color-surface-alt, #f9fafb)',
        padding: '0.15rem 0.35rem',
        borderRadius: '4px',
      }}
      {...props}
    />
  ),
  pre: ({ node: _node, ...props }) => (
    <pre
      style={{
        background: 'var(--color-surface-alt, #f9fafb)',
        border: '1px solid var(--color-border, #e5e7eb)',
        borderRadius: '8px',
        padding: '1rem',
        overflowX: 'auto',
        margin: '0 0 1.25rem',
      }}
      {...props}
    />
  ),
  table: ({ node: _node, ...props }) => (
    <table
      style={{
        borderCollapse: 'collapse',
        width: '100%',
        fontSize: '0.9rem',
        margin: '0 0 1.5rem',
      }}
      {...props}
    />
  ),
  th: ({ node: _node, ...props }) => (
    <th
      style={{
        border: '1px solid var(--color-border, #e5e7eb)',
        padding: '0.6rem 0.75rem',
        textAlign: 'left',
        background: 'var(--color-surface-alt, #f9fafb)',
      }}
      {...props}
    />
  ),
  td: ({ node: _node, ...props }) => (
    <td style={{ border: '1px solid var(--color-border, #e5e7eb)', padding: '0.6rem 0.75rem' }} {...props} />
  ),
  hr: ({ node: _node, ...props }) => (
    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', margin: '2rem 0' }} {...props} />
  ),
  strong: ({ node: _node, ...props }) => (
    <strong style={{ fontWeight: 700 }} {...props} />
  ),
  em: ({ node: _node, ...props }) => (
    <em style={{ fontStyle: 'italic' }} {...props} />
  ),
}

export default function Markdown({ content }: { content: string }) {
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>
}
