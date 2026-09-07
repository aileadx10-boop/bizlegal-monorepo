/**
 * Who may do what in a room.
 *
 * Pure functions with no database access, so the rules are unit-testable and
 * every route reaches the same answer.
 *
 * MANAGEMENT IS A FLAG, NOT A ROLE NAME. It used to key off the literal string
 * 'broker', which broke the first time a template used different vocabulary:
 * the US set calls that person 'agent', so the person who opened and paid for
 * the room got a 403 on their own room. Roles are template-defined and
 * open-ended on purpose — WORKFLOW44 lets a template declare its own — so
 * management cannot be inferred from what the role happens to be called.
 */

/** The subset of a party row these rules need. */
export interface Actor {
  readonly role: string
  readonly can_manage: boolean
}

/** Adding parties and tasks, moving the transaction dates, rotating links. */
export function canManageRoom(actor: Actor): boolean {
  return actor.can_manage === true
}

/**
 * A party ticks their own tasks. Whoever runs the room may tick anything,
 * because they are the one being paid to keep the checklist true and they are
 * chasing the other parties by phone anyway.
 */
export function canToggleTask(actor: Actor, taskAssigneeRole: string): boolean {
  return canManageRoom(actor) || actor.role === taskAssigneeRole
}

/** Everyone in the room sees the whole room. A hidden checklist is not a checklist. */
export function canViewRoom(_actor: Actor): boolean {
  return true
}
