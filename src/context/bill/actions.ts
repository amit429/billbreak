// ============================================
// Bill Action Creators
// ============================================
// Factory function that returns bound action creators
// Benefits: Type-safe dispatch, cleaner component code

import type { BillItem, BillStatus, User, UserColor } from '@/types'
import type { BillAction } from './types'

type Dispatch = (action: BillAction) => void

/**
 * Create action creators bound to dispatch
 * Usage: const actions = createActions(dispatch)
 *        actions.addItem({ name: 'Pizza', price: 15, quantity: 1 })
 */
export function createActions(dispatch: Dispatch) {
  return {
    // -------- Items --------
    setItems: (items: BillItem[]) =>
      dispatch({ type: 'SET_ITEMS', payload: items }),

    addItem: (item: Omit<BillItem, 'id' | 'assignments'>) =>
      dispatch({ type: 'ADD_ITEM', payload: item }),

    removeItem: (itemId: string) =>
      dispatch({ type: 'REMOVE_ITEM', payload: { itemId } }),

    updateItem: (itemId: string, updates: Partial<BillItem>) =>
      dispatch({ type: 'UPDATE_ITEM', payload: { itemId, updates } }),

    // -------- Users --------
    addUser: (name: string) =>
      dispatch({ type: 'ADD_USER', payload: { name } }),

    addUserWithColor: (name: string, color: UserColor) =>
      dispatch({ type: 'ADD_USER_WITH_COLOR', payload: { name, color } }),

    setUsers: (users: User[]) =>
      dispatch({ type: 'SET_USERS', payload: users }),

    removeUser: (userId: string) =>
      dispatch({ type: 'REMOVE_USER', payload: { userId } }),

    updateUser: (userId: string, updates: Partial<User>) =>
      dispatch({ type: 'UPDATE_USER', payload: { userId, updates } }),

    // -------- Assignment with Quantity --------
    assignItem: (itemId: string, userId: string, quantity: number) =>
      dispatch({ type: 'ASSIGN_ITEM', payload: { itemId, userId, quantity } }),

    unassignItem: (itemId: string, userId: string) =>
      dispatch({ type: 'UNASSIGN_ITEM', payload: { itemId, userId } }),

    toggleItemAssignment: (itemId: string, userId: string) =>
      dispatch({ type: 'TOGGLE_ITEM_ASSIGNMENT', payload: { itemId, userId } }),

    assignAllToItem: (itemId: string) =>
      dispatch({ type: 'ASSIGN_ALL_TO_ITEM', payload: { itemId } }),

    unassignAllFromItem: (itemId: string) =>
      dispatch({ type: 'UNASSIGN_ALL_FROM_ITEM', payload: { itemId } }),

    // -------- Charges --------
    setTax: (amount: number) =>
      dispatch({ type: 'SET_TAX', payload: { amount } }),

    setTip: (amount: number) =>
      dispatch({ type: 'SET_TIP', payload: { amount } }),

    // -------- Navigation --------
    setStatus: (status: BillStatus) =>
      dispatch({ type: 'SET_STATUS', payload: { status } }),

    goToAssign: () =>
      dispatch({ type: 'SET_STATUS', payload: { status: 'assign' } }),

    goToResults: () =>
      dispatch({ type: 'SET_STATUS', payload: { status: 'results' } }),

    goToUpload: () =>
      dispatch({ type: 'SET_STATUS', payload: { status: 'upload' } }),

    // -------- UI --------
    selectItem: (itemId: string | null) =>
      dispatch({ type: 'SELECT_ITEM', payload: { itemId } }),

    // -------- Reset & Demo --------
    reset: () =>
      dispatch({ type: 'RESET' }),

    loadDemo: (items: BillItem[], users: User[], taxAmount: number) =>
      dispatch({ type: 'LOAD_DEMO', payload: { items, users, taxAmount } }),
  }
}

export type BillActions = ReturnType<typeof createActions>
