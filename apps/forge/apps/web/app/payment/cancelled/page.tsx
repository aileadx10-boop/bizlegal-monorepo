import Link from 'next/link'

export default function PaymentCancelledPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-white mb-3">Payment Cancelled</h1>
      <p className="text-forge-muted mb-6">
        No charge was made. Your intake form data has been saved.
      </p>
      <Link href="/passport" className="btn-primary inline-block">
        Return to Passport
      </Link>
    </div>
  )
}
