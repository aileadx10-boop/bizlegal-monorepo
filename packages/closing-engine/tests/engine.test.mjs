import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MON_FRI,
  FRI_SAT,
  IL_WORKING_WEEK,
  israelCalendar,
  addBusinessDays,
  addCalendarDays,
  rollForwardToWorkingDay,
  daysUntil,
  isWorkingDay,
  coversDate,
  materialiseTasks,
  templateAccepts,
  tierFor,
  OVERDUE_TIER,
  generateChecklist,
  deriveDeadlines,
  IL_RESIDENTIAL_TASKS,
} from '../dist/index.js'

const D = (iso) => new Date(`${iso}T00:00:00.000Z`)
const iso = (d) => d.toISOString().slice(0, 10)

// Verified weekday anchors used throughout:
//   2026-09-16 Wed · 09-17 Thu · 09-18 Fri · 09-19 Sat · 09-20 Sun · 09-21 Mon

// ── Israeli working week (the bug this package exists to fix) ────────────────

test('Israel: Thursday + 1 business day is Sunday, not Friday', () => {
  assert.equal(iso(addBusinessDays(D('2026-09-17'), 1, IL_WORKING_WEEK)), '2026-09-20')
})

test('Israel: Wednesday + 2 business days skips the Fri-Sat weekend', () => {
  assert.equal(iso(addBusinessDays(D('2026-09-16'), 2, IL_WORKING_WEEK)), '2026-09-20')
})

test('Israel: Sunday - 1 business day is Thursday', () => {
  assert.equal(iso(addBusinessDays(D('2026-09-20'), -1, IL_WORKING_WEEK)), '2026-09-17')
})

test('Israel: a Saturday start rolls into Sunday before counting', () => {
  assert.equal(iso(addBusinessDays(D('2026-09-19'), 1, IL_WORKING_WEEK)), '2026-09-20')
})

test('Israel: Friday and Saturday are non-working, Sunday is working', () => {
  assert.equal(isWorkingDay(D('2026-09-18'), IL_WORKING_WEEK), false)
  assert.equal(isWorkingDay(D('2026-09-19'), IL_WORKING_WEEK), false)
  assert.equal(isWorkingDay(D('2026-09-20'), IL_WORKING_WEEK), true)
})

test('the US calendar disagrees with the Israeli one on the same date', () => {
  // Same input, different working week — this is precisely the defect that the
  // single hardcoded Sat/Sun weekend produced for Israeli deadlines.
  assert.equal(iso(addBusinessDays(D('2026-09-17'), 1, MON_FRI)), '2026-09-18')
  assert.equal(iso(addBusinessDays(D('2026-09-17'), 1, IL_WORKING_WEEK)), '2026-09-20')
})

test('IL_WORKING_WEEK and FRI_SAT share the same weekend', () => {
  assert.deepEqual([...IL_WORKING_WEEK.weekendDays], [...FRI_SAT.weekendDays])
})

// ── Holidays ────────────────────────────────────────────────────────────────

test('a holiday is skipped like a weekend day', () => {
  const cal = israelCalendar(['2026-09-20'], [2026])
  assert.equal(iso(addBusinessDays(D('2026-09-17'), 1, cal)), '2026-09-21')
})

test('a holiday landing on a weekend day is not counted twice', () => {
  const cal = israelCalendar(['2026-09-18'], [2026]) // a Friday, already non-working
  assert.equal(iso(addBusinessDays(D('2026-09-17'), 1, cal)), '2026-09-20')
})

test('coverage is reported honestly rather than assumed', () => {
  const cal = israelCalendar(['2026-09-20'], [2026])
  assert.equal(coversDate(D('2026-05-01'), cal), true)
  assert.equal(coversDate(D('2027-05-01'), cal), false)
  // No table at all means nothing is covered — never "no holidays".
  assert.equal(coversDate(D('2026-05-01'), IL_WORKING_WEEK), false)
})

// ── Calendar days vs business days ──────────────────────────────────────────

test('calendar days ignore the working week entirely', () => {
  assert.equal(iso(addCalendarDays(D('2026-09-20'), 30)), '2026-10-20')
  assert.equal(iso(addCalendarDays(D('2026-09-20'), 60)), '2026-11-19')
})

test('rollForwardToWorkingDay moves a Friday to Sunday in Israel', () => {
  assert.equal(iso(rollForwardToWorkingDay(D('2026-09-18'), IL_WORKING_WEEK)), '2026-09-20')
  assert.equal(iso(rollForwardToWorkingDay(D('2026-09-20'), IL_WORKING_WEEK)), '2026-09-20')
})

test('daysUntil counts whole calendar days and goes negative when past due', () => {
  assert.equal(daysUntil(D('2026-09-20'), D('2026-09-17')), 3)
  assert.equal(daysUntil(D('2026-09-17'), D('2026-09-20')), -3)
  assert.equal(daysUntil(D('2026-09-17'), D('2026-09-17')), 0)
})

// ── Materialisation ─────────────────────────────────────────────────────────

const template = {
  id: 'test',
  jurisdiction: 'IL',
  version: 1,
  roles: ['buyer', 'seller'],
  phases: ['tax', 'delivery'],
  anchors: ['signing', 'closing'],
  reviewed: true,
  tasks: [
    {
      key: 'statutory_30',
      labelKey: 'k.statutory_30',
      phase: 'tax',
      assigneeRole: 'buyer',
      anchor: 'signing',
      offset: 30,
      dayType: 'calendar',
      statutory: true,
    },
    {
      key: 'contractual',
      labelKey: 'k.contractual',
      phase: 'delivery',
      assigneeRole: 'seller',
      anchor: 'closing',
      offset: -1,
      dayType: 'business',
    },
  ],
}

test('both anchors resolve, each with its own day type', () => {
  const { tasks, warnings } = materialiseTasks(
    template,
    { signing: '2026-09-20', closing: '2026-09-20' },
    IL_WORKING_WEEK,
  )
  const byKey = Object.fromEntries(tasks.map((t) => [t.key, t]))
  assert.equal(byKey.statutory_30.dueDate, '2026-10-20') // calendar
  assert.equal(byKey.contractual.dueDate, '2026-09-17') // business, back over Fri-Sat
  assert.equal(warnings.includes('template_not_reviewed'), false)
})

test('a missing anchor produces a null date and a warning, never a guess', () => {
  const { tasks, warnings } = materialiseTasks(template, { signing: '2026-09-20' }, IL_WORKING_WEEK)
  const contractual = tasks.find((t) => t.key === 'contractual')
  assert.equal(contractual.dueDate, null)
  assert.ok(warnings.includes('missing_anchor:closing'))
})

test('an uncovered holiday year is warned about, not silently assumed', () => {
  const { warnings } = materialiseTasks(
    template,
    { signing: '2026-09-20', closing: '2026-09-20' },
    IL_WORKING_WEEK,
  )
  assert.ok(warnings.includes('holidays_not_configured'))
})

test('rollIfNonWorking forward moves a statutory date off a weekend; none leaves it', () => {
  const base = {
    key: 't',
    labelKey: 'k',
    phase: 'tax',
    assigneeRole: 'buyer',
    anchor: 'signing',
    offset: 1,
    dayType: 'calendar',
  }
  const mk = (roll) => ({ ...template, tasks: [{ ...base, rollIfNonWorking: roll }] })

  // 2026-09-17 Thu + 1 calendar day = Friday, a non-working day in Israel.
  const none = materialiseTasks(mk('none'), { signing: '2026-09-17' }, IL_WORKING_WEEK)
  const fwd = materialiseTasks(mk('forward'), { signing: '2026-09-17' }, IL_WORKING_WEEK)
  assert.equal(none.tasks[0].dueDate, '2026-09-18')
  assert.equal(fwd.tasks[0].dueDate, '2026-09-20')
})

test('tasks come back sorted soonest-first with undated ones last', () => {
  const { tasks } = materialiseTasks(template, { signing: '2026-09-20' }, IL_WORKING_WEEK)
  assert.equal(tasks[tasks.length - 1].dueDate, null)
})

test('the unreviewed Israeli template is flagged on every materialisation', () => {
  const { warnings } = materialiseTasks(
    IL_RESIDENTIAL_TASKS,
    { signing: '2026-09-20', closing: '2026-12-20' },
    IL_WORKING_WEEK,
  )
  assert.equal(IL_RESIDENTIAL_TASKS.reviewed, false)
  assert.ok(warnings.includes('template_not_reviewed'))
})

test('the Israeli statutory tax clocks are calendar days, never business days', () => {
  const statutory = IL_RESIDENTIAL_TASKS.tasks.filter((t) => t.statutory)
  assert.ok(statutory.length >= 4)
  for (const t of statutory) assert.equal(t.dayType, 'calendar', `${t.key} must be calendar days`)
})

test('every Israeli task declares a role, phase and anchor the template knows', () => {
  for (const t of IL_RESIDENTIAL_TASKS.tasks) {
    assert.ok(templateAccepts(IL_RESIDENTIAL_TASKS, 'roles', t.assigneeRole), t.key)
    assert.ok(templateAccepts(IL_RESIDENTIAL_TASKS, 'phases', t.phase), t.key)
    assert.ok(templateAccepts(IL_RESIDENTIAL_TASKS, 'anchors', t.anchor), t.key)
  }
})

test('every Israeli task label is an i18n key, not display text', () => {
  for (const t of IL_RESIDENTIAL_TASKS.tasks) {
    assert.match(t.labelKey, /^task\.il\.[a-z0-9_]+$/, t.key)
  }
})

// ── Alert tiers ─────────────────────────────────────────────────────────────

test('tiers pick the smallest containing window', () => {
  assert.equal(tierFor(0), 0)
  assert.equal(tierFor(1), 1)
  assert.equal(tierFor(5), 7)
  assert.equal(tierFor(9), 30)
  assert.equal(tierFor(31), null)
})

test('anything past due collapses to a single overdue tier', () => {
  assert.equal(tierFor(-1), OVERDUE_TIER)
  assert.equal(tierFor(-40), OVERDUE_TIER)
})

// ── The US move is a move, not a rewrite ────────────────────────────────────

test('US checklist dates are unchanged by the calendar refactor', () => {
  // Snapshot of the pre-move behaviour: Mon-Fri, no holidays. If this drifts,
  // closeflow and leaseparse have silently changed their deadlines.
  const closing = D('2026-09-18')
  const tasks = generateChecklist('residential_purchase', closing)
  assert.equal(tasks.length, 18)
  const byKey = Object.fromEntries(tasks.map((t) => [t.key, iso(t.dueDate)]))
  assert.equal(byKey.closing_day, '2026-09-18')
  assert.equal(byKey.final_walkthrough, '2026-09-17')
  assert.equal(byKey.clear_to_close, '2026-09-15')
  assert.equal(byKey.utilities_keys, '2026-09-21')
  // Every dated task must land on a Mon-Fri working day.
  for (const t of tasks) assert.ok(isWorkingDay(t.dueDate, MON_FRI), t.key)
})

test('1031 statutory dates stay calendar days and can land on a weekend', () => {
  const deadlines = deriveDeadlines(D('2026-09-18'), 'exchange_1031')
  const byKey = Object.fromEntries(deadlines.map((d) => [d.key, d]))
  const relinquished = addBusinessDays(D('2026-09-18'), -30, MON_FRI)
  assert.equal(iso(byKey.identification_45.dueDate), iso(addCalendarDays(relinquished, 45)))
  assert.equal(iso(byKey.completion_180.dueDate), iso(addCalendarDays(relinquished, 180)))
})

test('passing an Israeli calendar changes US-shaped maths too', () => {
  const usDates = generateChecklist('residential_purchase', D('2026-09-18')).map((t) => iso(t.dueDate))
  const ilDates = generateChecklist('residential_purchase', D('2026-09-18'), undefined, IL_WORKING_WEEK)
    .map((t) => iso(t.dueDate))
  assert.notDeepEqual(usDates, ilDates)
})
