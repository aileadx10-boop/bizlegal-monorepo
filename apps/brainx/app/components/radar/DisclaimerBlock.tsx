const YMYL =
  'BrainX is decision-support software, not a law firm. This is general information, not legal advice, and does not create an attorney-client relationship. Every opportunity is an inferred commercial signal based on the cited evidence, not a guaranteed outcome — verify every source before acting, and consult qualified counsel in the relevant jurisdiction.'

const SHORT = 'Not legal advice. No outcome guarantee. Decision-support software, not a law firm.'

export default function DisclaimerBlock({ variant = 'ymyl' }: { variant?: 'ymyl' | 'short' }): JSX.Element {
  return (
    <p className="bx-muted" style={{ fontSize: 12, lineHeight: 1.7, maxWidth: 640 }}>
      {variant === 'ymyl' ? YMYL : SHORT}
    </p>
  )
}
