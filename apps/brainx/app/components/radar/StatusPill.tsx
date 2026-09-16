import type { OpportunityStatus } from '@bizlegal/scoring'

const LABEL: Record<OpportunityStatus, string> = {
  build: 'Build',
  validate: 'Validate',
  validated: 'Validated',
  watch: 'Watch',
  building: 'Building',
  built: 'Built',
  killed: 'Killed',
  ignore: 'Ignore',
}

const CLASS: Record<OpportunityStatus, string> = {
  build: 'bx-status bx-status--build',
  validate: 'bx-status bx-status--validate',
  validated: 'bx-status bx-status--validate',
  watch: 'bx-status bx-status--watch',
  building: 'bx-status bx-status--validate',
  built: 'bx-status bx-status--build',
  killed: 'bx-status bx-status--ignore',
  ignore: 'bx-status bx-status--ignore',
}

export default function StatusPill({ status }: { status: OpportunityStatus }): JSX.Element {
  return <span className={CLASS[status]}>{LABEL[status]}</span>
}
