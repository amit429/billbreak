// ============================================
// Bill Context Action Types
// ============================================

import type { BillItem, BillStatus, User, UserColor } from '@/types'

/**
 * Discriminated union of all possible actions
 * Each action has a unique 'type' and typed 'payload'
 */
export type BillAction =
  // Receipt items
  | { type: 'SET_ITEMS'; payload: BillItem[] }
  | { type: 'ADD_ITEM'; payload: Omit<BillItem, 'id' | 'assignments'> }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; updates: Partial<BillItem> } }

  // Users
  | { type: 'ADD_USER'; payload: { name: string } }
  | { type: 'ADD_USER_WITH_COLOR'; payload: { name: string; color: UserColor } }
  | { type: 'REMOVE_USER'; payload: { userId: string } }
  | { type: 'UPDATE_USER'; payload: { userId: string; updates: Partial<User> } }
  | { type: 'SET_USERS'; payload: User[] }

  // Assignment with quantity support
  | { type: 'ASSIGN_ITEM'; payload: { itemId: string; userId: string; quantity: number } }
  | { type: 'UNASSIGN_ITEM'; payload: { itemId: string; userId: string } }
  | { type: 'TOGGLE_ITEM_ASSIGNMENT'; payload: { itemId: string; userId: string } }
  | { type: 'ASSIGN_ALL_TO_ITEM'; payload: { itemId: string } }
  | { type: 'UNASSIGN_ALL_FROM_ITEM'; payload: { itemId: string } }

  // Charges
  | { type: 'SET_TAX'; payload: { amount: number } }
  | { type: 'SET_TIP'; payload: { amount: number } }

  // Navigation
  | { type: 'SET_STATUS'; payload: { status: BillStatus } }

  // UI
  | { type: 'SELECT_ITEM'; payload: { itemId: string | null } }

  // Reset
  | { type: 'RESET' }
  | { type: 'LOAD_DEMO'; payload: { items: BillItem[]; users: User[]; taxAmount: number } }
