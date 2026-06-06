'use client'

import { useEffect, useId, useRef, useState } from 'react'

/**
 * MermaidDiagram — renders a compliance-flow Mermaid diagram client-side.
 *
 * Why a CDN lazy-load instead of an npm dependency: mermaid is a large
 * (~500kb) library that's only needed on gap pages that actually have a
 * `diagram_mermaid` value. Importing it statically would inflate every
 * forge bundle. We dynamic-import the ESM build from jsDelivr on mount,
 * inside an effect, so SSR stays untouched and the cost is paid only on
 * pages that use it.
 *
 * Server-safe by construction: the server renders the raw Mermaid source
 * inside a styled <pre> (readable, accessible text). On hydration this
 * client component swaps in the rendered SVG. If the CDN is blocked or
 * mermaid throws on bad source, the <pre> fallback stays — no broken UI.
 *
 * Accessibility: the <figure> carries the caption as <figcaption>, and
 * the rendered SVG gets aria-label = caption. The pre-render text is the
 * source itself, which screen readers can read as the flow definition.
 */

// Pinned major version — avoids surprise breaking changes from a floating
// "latest" tag while still getting patch fixes within v11.
const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'

interface MermaidDiagramProps {
  readonly source: string
  readonly caption?: string | null
}

type RenderState = 'pending' | 'rendered' | 'error'

export default function MermaidDiagram({ source, caption }: MermaidDiagramProps) {
  const reactId = useId()
  // Mermaid render ids must be valid CSS/DOM ids — strip the colons React
  // emits in useId so the generated SVG id is selector-safe.
  const renderId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const [svg, setSvg] = useState<string | null>(null)
  const [state, setState] = useState<RenderState>('pending')
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false

    async function render() {
      try {
        const mermaid = (await import(/* webpackIgnore: true */ MERMAID_CDN)).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'strict', // no click handlers / script injection
          themeVariables: {
            // Match the forge dark editorial palette (violet accent).
            primaryColor: '#1f2230',
            primaryTextColor: '#e7e5ee',
            primaryBorderColor: '#5B49E0',
            lineColor: '#7E6DFF',
            secondaryColor: '#15172180',
            tertiaryColor: '#1f2230',
            fontFamily: 'var(--font-inter, system-ui, sans-serif)',
          },
        })
        const { svg: rendered } = await mermaid.render(renderId, source)
        if (cancelled.current) return
        setSvg(rendered)
        setState('rendered')
      } catch {
        // CDN blocked, offline, or invalid source → keep the <pre> fallback.
        if (cancelled.current) return
        setState('error')
      }
    }

    render()
    return () => {
      cancelled.current = true
    }
  }, [source, renderId])

  return (
    <figure className="my-12">
      {state === 'rendered' && svg ? (
        <div
          role="img"
          aria-label={caption || 'Compliance decision flow diagram'}
          className="overflow-x-auto rounded-xl border border-forge-border bg-forge-card/50 p-6 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          // Mermaid output is generated from our own trusted source string
          // (built by the generator script, not user input) and rendered
          // with securityLevel:'strict'. Safe to inject.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre
          className="mermaid overflow-x-auto rounded-xl border border-forge-border bg-forge-card/50 p-6 text-xs leading-relaxed text-forge-text-secondary"
          aria-label={caption || 'Compliance decision flow (diagram source)'}
        >
          {source}
        </pre>
      )}
      {caption ? (
        <figcaption className="mt-3 text-center text-xs text-forge-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
