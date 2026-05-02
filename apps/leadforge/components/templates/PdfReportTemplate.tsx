import { formatCurrency } from "@/lib/utils";

const reportRows = [
  { label: "Motivation", value: 88 },
  { label: "Value", value: 91 },
  { label: "Urgency", value: 76 },
];

export function PdfReportTemplate() {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-[color:var(--lead-line)] bg-white shadow-shell">
      <div className="border-b border-[color:var(--lead-line)] bg-navy-950 px-6 py-5 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--pipe-gold)]">
          PDF Report
        </p>
        <h3 className="mt-2 font-display text-2xl">Daily Opportunity Snapshot</h3>
      </div>
      <div className="space-y-5 px-6 py-6">
        <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(25,195,125,0.14),rgba(93,167,220,0.16))] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-500">
            Featured Opportunity
          </p>
          <h4 className="mt-2 text-lg font-semibold text-navy-950">
            Apex Holdings v. Meridian Partners
          </h4>
          <p className="mt-1 text-sm text-navy-600">Commercial dispute • New York County</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-600">
            {formatCurrency(384000)}
          </p>
        </div>
        <div className="space-y-3">
          {reportRows.map((row) => (
            <div key={row.label}>
              <div className="flex items-center justify-between text-sm font-medium text-navy-700">
                <span>{row.label}</span>
                <span>{row.value}/100</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-navy-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${row.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
