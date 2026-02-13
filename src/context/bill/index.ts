// ============================================
// Bill Context - Public API
// ============================================

// Main exports (what most components need)
export { BillProvider, useBill } from './BillContext'
export type { BillContextValue } from './BillContext'

// Action types (for advanced usage)
export type { BillAction } from './types'
export type { BillActions } from './actions'

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
} from './selectors'

// Initial state (for testing)
export { initialState } from './initialState'

// Helpers (for use in services)
export { generateId, getNextUserColor } from './helpers'
