/**
 * Synthetic fixture with hand-computed answers (asOf 2026-09-01, USD).
 * Every expected number below was worked by hand in the plan; if the engine
 * disagrees, the engine is wrong until proven otherwise.
 */
export const AS_OF = '2026-09-01'

export const TIME_CSV = `Date,Client,Matter,Hours,Rate,Billable,Invoice
2026-05-04,Client 01,M01-01,2.0,300,yes,INV-0001
2026-05-06,Client 01,M01-01,1.5,300,yes,INV-0001
2026-06-02,Client 02,M02-01,4.0,200,yes,INV-0002
2026-06-03,Client 02,M02-01,1.0,200,no,
2026-07-10,Client 01,M01-02,3.0,300,yes,
2026-08-20,Client 03,M03-01,2.0,400,yes,
2026-03-15,Client 03,M03-02,5.0,400,yes,INV-0003
2026-08-25,Client 02,M02-01,0.5,200,yes,
n/a,Client 01,M01-01,1.0,300,yes,
2026-04-01,Client 02,M02-02,2.0,200,yes,INV-0004
`

export const INVOICES_CSV = `Invoice #,Client,Issue Date,Due Date,Amount,Amount Paid,Paid Date
INV-0001,Client 01,2026-05-20,2026-06-19,"$1,050.00","$1,050.00",2026-06-10
INV-0002,Client 02,2026-06-05,2026-07-05,700.00,350.00,2026-07-30
INV-0003,Client 03,2026-03-20,2026-04-19,"2,000.00",0.00,
INV-0004,Client 02,2026-04-03,2026-05-03,400.00,400.00,2026-04-20
INV-0005,Client 01,2026-08-28,2026-09-27,500.00,0.00,
INV-0000,Client 04,2025-12-01,2025-12-31,600.00,600.00,2025-12-20
`

export const EXPECTED = {
  skippedTimeRows: 1,
  unbilledCents: 180_000,
  unbilledAgedCents: 90_000,
  unbilledHours: 5.5,
  arOpenCents: 285_000,
  buckets: { b0_30: 50_000, b31_60: 35_000, b61_90: 0, b90p: 200_000 },
  overdue60Cents: 200_000,
  realizationPct: 72.5,
  writeDownCents: 10_000,
  collectionPct: 45.7,
  dsoDays: 213.8,
  lockupDays: 348.8,
  clientPerHour: { 'CLIENT 01': 16_154, 'CLIENT 02': 11_538, 'CLIENT 03': 0 },
  invoiceLagDaysWeighted: 6.7,
  excessLagDollarDays: 15_550,
  excessCollectDollarDays: 25_900,
  openPastTargetCents: 235_000,
  closedMatters: 3,
  dormantCount: 1,
} as const
