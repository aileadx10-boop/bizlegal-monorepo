import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-forge-accent/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-forge-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-forge-text-secondary hover:text-white border border-forge-border hover:border-forge-accent px-6 py-3 rounded-lg font-semibold transition-all"
          >
            View FAQ
          </Link>
        </div>
      </div>
    </div>
  )
}
