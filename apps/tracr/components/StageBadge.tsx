import { stageConfig } from '@/lib/supabase'
import type { Stage } from '@/lib/supabase'
import clsx from 'clsx'

export default function StageBadge({ stage }: { stage: Stage }) {
  const cfg = stageConfig(stage)
  return (
    <span className={clsx('badge', cfg.bg, cfg.color)}>
      {cfg.label}
    </span>
  )
}
