export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-2 border-forge-border rounded-full" />
          <div className="absolute inset-0 border-2 border-forge-accent rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-forge-text-secondary text-sm">Loading...</p>
      </div>
    </div>
  )
}
