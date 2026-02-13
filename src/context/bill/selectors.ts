// ============================================
// Bill Selectors
// ============================================
// Pure functions that derive computed state from raw state
// Benefits: Single source of truth, testable, memoizable

import type { BillState, UserShare, BillItem } from '@/types'
import { getAssignedQuantity } from '@/types'

/**
 * Calculate overall assignment progress (0-100)
 * Returns percentage of total item quantities that have been assigned
 */
export function selectAssignmentProgress(state: BillState): number {
  if (state.items.length === 0) return 0

  const totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const assignedQuantity = state.items.reduce((sum, item) => sum + getAssignedQuantity(item), 0)

  return Math.round((assignedQuantity / totalQuantity) * 100)
}

/**
 * Calculate subtotal (sum of all items before tax/tip)
 */
export function selectSubtotal(state: BillState): number {
  return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/**
 * Calculate grand total including tax and tip
 */
export function selectGrandTotal(state: BillState): number {
  return selectSubtotal(state) + state.taxAmount + state.tipAmount
}

/**
 * Calculate what each user owes
 * Distributes tax/tip proportionally based on item share
 */
export function selectUserShares(state: BillState): UserShare[] {
  const subtotal = selectSubtotal(state)

  return state.users.map((user) => {
    // Find all items assigned to this user and their quantities
    const userItems: { item: BillItem; quantity: number; shareAmount: number }[] = []
    let itemCount = 0

    state.items.forEach((item) => {
      const assignment = item.assignments.find(a => a.userId === user.id)
      if (assignment && assignment.quantity > 0) {
        const shareAmount = item.price * assignment.quantity
        userItems.push({
          item,
          quantity: assignment.quantity,
          shareAmount,
        })
        itemCount++
      }
    })

    const userSubtotal = userItems.reduce((sum, ui) => sum + ui.shareAmount, 0)

    // Proportional share of tax/tip (based on their subtotal / total subtotal)
    const shareRatio = subtotal > 0 ? userSubtotal / subtotal : 0
    const taxShare = state.taxAmount * shareRatio
    const tipShare = state.tipAmount * shareRatio

    return {
      user,
      subtotal: userSubtotal,
      taxShare,
      tipShare,
      total: userSubtotal + taxShare + tipShare,
      itemCount,
      items: userItems,
    }
  })
}

/**
 * Get a specific user's subtotal
 */
export function selectUserSubtotal(state: BillState, userId: string): number {
  let subtotal = 0

  state.items.forEach((item) => {
    const assignment = item.assignments.find(a => a.userId === userId)
    if (assignment) {
      subtotal += item.price * assignment.quantity
    }
  })

  return subtotal
}

/**
 * Check if bill is ready for results
 * All items must have at least one assignment with quantity > 0
 */
export function selectIsBillReady(state: BillState): boolean {
  if (state.items.length === 0 || state.users.length === 0) return false
  return state.items.every((item) => getAssignedQuantity(item) >= item.quantity)
}

/**
 * Get count of fully assigned items
 */
export function selectAssignedItemCount(state: BillState): number {
  return state.items.filter((item) => getAssignedQuantity(item) >= item.quantity).length
}

/**
 * Get unassigned items
 */
export function selectUnassignedItems(state: BillState): BillItem[] {
  return state.items.filter((item) => getAssignedQuantity(item) === 0)
}

/**
 * Get partially assigned items
 */
export function selectPartiallyAssignedItems(state: BillState): BillItem[] {
  return state.items.filter((item) => {
    const assigned = getAssignedQuantity(item)
    return assigned > 0 && assigned < item.quantity
  })
}
