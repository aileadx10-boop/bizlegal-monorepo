/**
 * Email bodies. Pure string building — no sending, no database, so the wording
 * can be unit-tested and reviewed without a live key.
 *
 * Both messages are wrapped `dir`/`lang` per recipient locale. A Hebrew email
 * rendered left-to-right reads as broken software, and the recipient here is a
 * buyer in the middle of the largest transaction of their life.
 */

import { fmtDate, fmtDaysLeft } from '@/lib/i18n/format'
import { t, taskLabel, dirFor, langFor, type Locale } from '@/lib/i18n'
import type { PartyRow, TaskRow } from '@/lib/db'
import type { Crossing } from '@/lib/alerts/compute'

export interface BuiltEmail {
  readonly subject: string
  readonly html: string
  readonly text: string
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function shell(locale: Locale, inner: string, stopLine: string, disclaimer: string): string {
  const dir = dirFor(locale)
  const align = dir === 'rtl' ? 'right' : 'left'
  return [
    `<div dir="${dir}" lang="${langFor(locale)}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;`,
    `max-width:600px;margin:0 auto;padding:24px;color:#111827;text-align:${align};">`,
    inner,
    `<p style="margin-top:28px;font-size:11px;color:#9ca3af;line-height:1.6;">${esc(stopLine)}<br/>${esc(disclaimer)}</p>`,
    '</div>',
  ].join('')
}

function button(locale: Locale, href: string, label: string): string {
  const dir = dirFor(locale)
  return `<p style="margin:20px 0;text-align:${dir === 'rtl' ? 'right' : 'left'};"><a href="${esc(href)}" style="display:inline-block;background:#1f6feb;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:6px;font-size:15px;">${esc(label)}</a></p>`
}

export function buildInvite(params: {
  locale: Locale
  brokerName: string
  roomTitle: string
  role: string
  link: string
}): BuiltEmail {
  const { locale, brokerName, roomTitle, role, link } = params
  const roleLabel = t(locale, `role.${role}` as never) || role
  const subject = t(locale, 'email.invite.subject', { broker: brokerName, title: roomTitle })
  const intro = t(locale, 'email.invite.intro', { broker: brokerName, role: roleLabel })
  const explain = t(locale, 'email.invite.explain')
  const cta = t(locale, 'email.invite.cta')

  const inner = [
    `<h1 style="font-size:19px;margin:0 0 12px;">${esc(roomTitle)}</h1>`,
    `<p style="font-size:15px;line-height:1.6;margin:0 0 12px;">${esc(intro)}</p>`,
    button(locale, link, cta),
    `<p style="font-size:13px;color:#4b5563;line-height:1.6;margin:0;">${esc(explain)}</p>`,
  ].join('')

  const text = [intro, '', cta + ': ' + link, '', explain, '', t(locale, 'email.stop')].join('\n')

  return {
    subject,
    html: shell(locale, inner, t(locale, 'email.stop'), t(locale, 'email.footer.disclaimer')),
    text,
  }
}

export function buildDigest(params: {
  locale: Locale
  roomTitle: string
  party: PartyRow
  crossings: readonly Crossing[]
  openTasks: readonly TaskRow[]
  link: string | null
}): BuiltEmail {
  const { locale, roomTitle, party, crossings, openTasks, link } = params
  const subject = t(locale, 'email.digest.subject', { title: roomTitle, n: crossings.length })

  const byId = new Map(openTasks.map((task) => [task.id, task]))
  const row = (c: Crossing): string => {
    const task = byId.get(c.taskId)
    if (!task) return ''
    const label = taskLabel(locale, task.label_key, task.label_text)
    const when = `${fmtDate(locale, c.dueDate)} · ${fmtDaysLeft(locale, c.daysUntil)}`
    const colour = c.daysUntil < 0 ? '#b42318' : c.daysUntil <= 1 ? '#b54708' : '#374151'
    const own = c.isOwn ? '' : ` <span style="color:#9ca3af;">(${esc(t(locale, `role.${task.assignee_role}` as never) || task.assignee_role)})</span>`
    return `<li style="margin:0 0 8px;font-size:14px;line-height:1.5;"><strong>${esc(label)}</strong>${own}<br/><span style="color:${colour};font-size:13px;">${esc(when)}</span></li>`
  }

  const mine = crossings.filter((c) => c.isOwn)
  const others = crossings.filter((c) => !c.isOwn)

  const inner = [
    `<h1 style="font-size:19px;margin:0 0 6px;">${esc(roomTitle)}</h1>`,
    `<p style="font-size:14px;color:#4b5563;margin:0 0 16px;">${esc(t(locale, 'email.digest.intro'))}</p>`,
    mine.length
      ? `<h2 style="font-size:15px;margin:0 0 8px;">${esc(t(locale, 'room.your_tasks'))}</h2><ul style="padding-inline-start:18px;margin:0 0 18px;">${mine.map(row).join('')}</ul>`
      : '',
    others.length
      ? `<h2 style="font-size:15px;margin:0 0 8px;color:#6b7280;">${esc(t(locale, 'room.all_tasks'))}</h2><ul style="padding-inline-start:18px;margin:0 0 18px;">${others.map(row).join('')}</ul>`
      : '',
    link ? button(locale, link, t(locale, 'email.invite.cta')) : '',
  ].join('')

  const text = [
    roomTitle,
    t(locale, 'email.digest.intro'),
    '',
    ...crossings.map((c) => {
      const task = byId.get(c.taskId)
      const label = task ? taskLabel(locale, task.label_key, task.label_text) : c.taskKey
      return `- ${label}: ${fmtDate(locale, c.dueDate)} (${fmtDaysLeft(locale, c.daysUntil)})`
    }),
    '',
    link ?? '',
    '',
    t(locale, 'email.stop'),
  ].join('\n')

  void party
  return {
    subject,
    html: shell(locale, inner, t(locale, 'email.stop'), t(locale, 'email.footer.disclaimer')),
    text,
  }
}
