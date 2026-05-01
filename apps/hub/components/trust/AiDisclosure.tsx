interface Props {
  product?: string
  tier?: string
  expertReviewed?: boolean
}

export default function AiDisclosure({ product, tier, expertReviewed }: Props) {
  return (
    <div className="ai-disclosure" role="note" aria-label="AI disclosure">
      <span style={{ flexShrink: 0, fontSize: 18 }}>🛡</span>
      <div>
        <div style={{ fontWeight: 700, color: 'var(--on-surface)', marginBottom: 4, fontSize: 13 }}>
          AI Disclosure{product ? ` — ${product}` : ''}
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>
          This analysis was generated using AI (Claude by Anthropic) and verified through our four-layer accuracy system.
          {expertReviewed
            ? ' This output was reviewed and approved by a qualified attorney.'
            : ' For decisions with legal consequences, use our expert review option.'}
          {' '}Critical decisions should involve independent legal counsel.
        </p>
      </div>
    </div>
  )
}
