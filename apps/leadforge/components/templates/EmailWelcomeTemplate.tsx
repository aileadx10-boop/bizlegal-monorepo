export function EmailWelcomeTemplate() {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-[color:var(--lead-line)] bg-white shadow-shell">
      <div className="bg-[linear-gradient(135deg,#081321_0%,#14304c_55%,#0e6b59_100%)] px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
          Welcome Email
        </p>
        <h3 className="mt-2 font-display text-2xl">Pipeline Active</h3>
        <p className="mt-2 max-w-sm text-sm text-navy-100">
          A polished onboarding email that confirms the vertical, location scope, and delivery
          cadence the moment a lead flow goes live.
        </p>
      </div>
      <div className="space-y-4 px-6 py-6">
        <div className="rounded-2xl bg-navy-50 p-4">
          <p className="text-sm font-semibold text-navy-900">Tomorrow&apos;s first delivery</p>
          <p className="mt-2 text-sm text-navy-600">
            Includes scored leads, urgency notes, and the fastest next action for your team.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Vertical", "States", "Plan"].map((item) => (
            <div key={item} className="rounded-2xl border border-navy-100 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-400">
                {item}
              </p>
              <p className="mt-2 text-sm font-semibold text-navy-900">Configured</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
