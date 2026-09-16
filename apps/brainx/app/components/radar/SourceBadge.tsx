import type { EvidenceKind } from '@/lib/radar/types'
import { EVIDENCE_KIND_LABEL } from '@/lib/radar/types'

export default function SourceBadge({ kind }: { kind: EvidenceKind }): JSX.Element {
  return <span className="bx-chip">{EVIDENCE_KIND_LABEL[kind]}</span>
}
