/**
 * Who may do what in a room.
 *
 * Pure functions with no database access, so the rules are unit-testable and
 * every route reaches the same answer. Phase 0 has no accounts: the broker is
 * simply the party whose role is 'broker', and their link carries elevated
 * rights. Phase 1 adds a magic-link session that claims the room; these rules do
 * not change when it does.
 */

export const BROKER_ROLE = 'broker'

export function isBroker(role: string): boolean {
  return role === BROKER_ROLE
}

/**
 * A party may tick their own tasks. The broker may tick anything, because they
 * are the one being paid to keep the checklist true and they are chasing the
 * other parties by phone anyway.
 */
export function canToggleTask(actorRole: string, taskAssigneeRole: string): boolean {
  return isBroker(actorRole) || actorRole === taskAssigneeRole
}

/** Adding parties, adding tasks, changing the transaction dates, rotating links. */
export function canManageRoom(actorRole: string): boolean {
  return isBroker(actorRole)
}

/** Everyone in the room sees the whole room. A hidden checklist is not a checklist. */
export function canViewRoom(_actorRole: string): boolean {
  return true
}
