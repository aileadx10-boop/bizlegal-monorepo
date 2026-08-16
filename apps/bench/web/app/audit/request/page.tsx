import type { Metadata } from 'next'
import { AuditRequestForm } from './request-form'

export const metadata: Metadata = {
  title: 'Request an audit',
  description:
    'Request a Bench diagnostic audit or managed evaluation program. Tell us your system, jurisdiction, and practice area — we scope asynchronously, no calls required.',
  alternates: { canonical: '/audit/request' },
}

export default function AuditRequestPage() {
  return (
    <section className="section section--flush">
      <div className="shell" style={{ paddingTop: 'var(--space-section)', paddingBottom: 'var(--space-section)' }}>
        <div className="split">
          <div>
            <p className="eyebrow">Client intake</p>
            <h1 className="title">Request an audit.</h1>
            <div className="prose">
              <p>
                Tell us what your system does and where it operates. We reply by
                email with a scoping note — benchmark, item count, price, and
                turnaround — typically within two business days. No calls, no
                pressure sequence, no payment until scoping is agreed.
              </p>
              <p className="small faint">
                We use what you submit here to respond to this request. We never
                add you to marketing lists without separate double-opt-in
                consent, and we never publish client-identified results.
              </p>
            </div>
          </div>
          <AuditRequestForm />
        </div>
      </div>
    </section>
  )
}
