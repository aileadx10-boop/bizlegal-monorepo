'use client'

import { useMemo, useState } from 'react'
import type { Guide } from '@/lib/guides'

const CATEGORY_ALL = 'All'

export default function BlogGrid({ guides }: { guides: Guide[] }) {
  const categories = useMemo(() => [CATEGORY_ALL, ...Array.from(new Set(guides.map((g) => g.tag))).sort()], [guides])
  const [active, setActive] = useState(CATEGORY_ALL)
  const filtered = active === CATEGORY_ALL ? guides : guides.filter((g) => g.tag === active)

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            style={{
              padding: '0.35rem 0.85rem',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: cat === active ? 1 : 0.65,
              background: cat === active ? 'var(--primary, #1a56db)' : 'transparent',
              color: cat === active ? '#fff' : 'inherit',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        {filtered.map((guide) => (
          <a
            key={guide.href}
            href={guide.href}
            style={{
              display: 'block',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '12px',
              padding: '1.5rem',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.15s',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                opacity: 0.5,
                marginBottom: '0.6rem',
              }}
            >
              {guide.tag}
            </span>
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                lineHeight: 1.4,
                marginBottom: '0.6rem',
                marginTop: 0,
              }}
            >
              {guide.title}
            </h2>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.65, opacity: 0.7, margin: 0 }}>
              {guide.description}
            </p>
          </a>
        ))}
      </div>
    </>
  )
}
