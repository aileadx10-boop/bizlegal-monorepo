/**
 * Boundary validation. Nothing reaches the database unvalidated.
 *
 * Roles, phases and anchors are free strings HERE and validated against the
 * chosen template in `create.ts`, not by a Zod enum and not by a database CHECK.
 * That is what keeps WORKFLOW44 (phase 3, where a template is a row someone
 * edits) a UI change rather than a migration plus a redeploy.
 */

import { z } from 'zod'
import { LOCALES } from '@/lib/i18n/types'

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
  .refine((s) => !Number.isNaN(new Date(`${s}T00:00:00.000Z`).getTime()), 'not a real date')

const localeSchema = z.enum(LOCALES as unknown as [string, ...string[]]).default('he-IL')

const personSchema = z.object({
  role: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  locale: localeSchema.optional(),
})

export const createRoomSchema = z.object({
  title: z.string().min(1).max(200),
  locale: localeSchema,
  currency: z.string().length(3).default('ILS'),
  jurisdiction: z.string().min(1).max(40).optional(),
  deal_type: z.string().min(1).max(40).optional(),
  /** Null means a manual room: no template, tasks typed in by hand. */
  template_id: z.string().min(1).max(60).nullable().optional(),
  /** { signing: 'YYYY-MM-DD', closing: 'YYYY-MM-DD' } — keys are template-defined. */
  anchors: z.record(z.string(), isoDate).default({}),
  broker: personSchema.extend({ role: z.string().min(1).max(40).default('broker') }),
  parties: z.array(personSchema).max(12).default([]),
  /**
   * Invites go out by default (founder decision, 2026-09-07). A room whose
   * parties are never told it exists is not a product. The message is
   * transactional and carries a one-line opt-out — see lib/email/send.ts.
   * Pass false to hold the links back and forward them by hand.
   */
  send_invites: z.boolean().default(true),
})

export type CreateRoomInput = z.infer<typeof createRoomSchema>

export const addPartySchema = personSchema.extend({
  send_invite: z.boolean().default(true),
})

/** Changing the signing or delivery date re-dates every template task. */
export const setAnchorsSchema = z.object({
  anchors: z.record(z.string(), isoDate),
})

export const addTaskSchema = z.object({
  label_text: z.string().min(1).max(300),
  phase: z.string().min(1).max(40),
  assignee_role: z.string().min(1).max(40),
  due_date: isoDate.nullable().default(null),
  statutory: z.boolean().default(false),
})

export const toggleTaskSchema = z.object({
  task_id: z.string().uuid(),
  completed: z.boolean(),
})

export const activateSchema = z.object({
  order_id: z.string().uuid(),
})

export const intakeSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional().default(''),
  deals_per_month: z.string().max(40).optional().default(''),
  next_signing: z.string().max(60).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
  turnstile_token: z.string().max(4000).optional().default(''),
})

export type IntakeInput = z.infer<typeof intakeSchema>
