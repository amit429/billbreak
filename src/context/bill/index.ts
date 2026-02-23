// ============================================
// Bill Context - Public API
// ============================================

// Main exports (what most components need)
export { BillProvider, useBill } from '@/context/bill/BillContext'
export type { BillContextValue } from '@/context/bill/BillContext'

// Action types (for advanced usage)
export type { BillAction } from '@/context/bill/types'
export type { BillActions } from '@/context/bill/actions'

// Selectors (for use outside context if needed)
export {
  selectAssignmentProgress,
  selectSubtotal,
  selectGrandTotal,
  selectUserShares,
  selectUnassignedItems,
  selectIsBillReady,
  selectAssignedItemCount,
  selectPartiallyAssignedItems,
} from '@/context/bill/selectors'

// Initial state (for testing)
export { initialState } from '@/context/bill/initialState'

// Helpers (for use in services)
export { generateId, getNextUserColor } from '@/context/bill/helpers'
