// ============================================
// Bill Reducer
// ============================================
// Pure function: (state, action) => newState
// MUST be immutable - never modify state directly

import { type BillState, type BillItem, type User, BillStatus, getRemainingQuantity } from '@/types'
import type { BillAction } from './types'
import { initialState } from './initialState'
import { generateId, getNextUserColor } from './helpers'

export function billReducer(state: BillState, action: BillAction): BillState {
  switch (action.type) {
    // -------- Items --------

    case 'SET_ITEMS': {
      return {
        ...state,
        items: action.payload,
        currentStatus: action.payload.length > 0 ? BillStatus.ASSIGN : state.currentStatus,
      }
    }

    case 'ADD_ITEM': {
      const newItem: BillItem = {
        id: generateId(),
        name: action.payload.name,
        price: action.payload.price,
        quantity: action.payload.quantity,
        assignments: [],
      }
      return {
        ...state,
        items: [...state.items, newItem],
      }
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.itemId),
        selectedItemId:
          state.selectedItemId === action.payload.itemId ? null : state.selectedItemId,
      }
    }

    case 'UPDATE_ITEM': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, ...action.payload.updates }
            : item
        ),
      }
    }

    // -------- Users --------

    case 'ADD_USER': {
      const newUser: User = {
        id: generateId(),
        name: action.payload.name,
        color: getNextUserColor(state.users),
      }
      return {
        ...state,
        users: [...state.users, newUser],
      }
    }

    case 'ADD_USER_WITH_COLOR': {
      const newUser: User = {
        id: generateId(),
        name: action.payload.name,
        color: action.payload.color,
      }
      return {
        ...state,
        users: [...state.users, newUser],
      }
    }

    case 'SET_USERS': {
      return {
        ...state,
        users: action.payload,
      }
    }

    case 'REMOVE_USER': {
      const userId = action.payload.userId
      return {
        ...state,
        users: state.users.filter((user) => user.id !== userId),
        // Remove this user from all item assignments
        items: state.items.map((item) => ({
          ...item,
          assignments: item.assignments.filter((a) => a.userId !== userId),
        })),
      }
    }

    case 'UPDATE_USER': {
      return {
        ...state,
        users: state.users.map((user) =>
          user.id === action.payload.userId
            ? { ...user, ...action.payload.updates }
            : user
        ),
      }
    }

    // -------- Assignment with Quantity --------

    case 'ASSIGN_ITEM': {
      const { itemId, userId, quantity } = action.payload
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== itemId) return item

          const existingAssignment = item.assignments.find(a => a.userId === userId)
          
          if (existingAssignment) {
            // Update existing assignment
            return {
              ...item,
              assignments: item.assignments.map(a =>
                a.userId === userId ? { ...a, quantity } : a
              ),
            }
          } else {
            // Add new assignment
            return {
              ...item,
              assignments: [...item.assignments, { userId, quantity }],
            }
          }
        }),
      }
    }

    case 'UNASSIGN_ITEM': {
      const { itemId, userId } = action.payload
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === itemId
            ? { ...item, assignments: item.assignments.filter(a => a.userId !== userId) }
            : item
        ),
      }
    }

    case 'TOGGLE_ITEM_ASSIGNMENT': {
      const { itemId, userId } = action.payload
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== itemId) return item

          const existingAssignment = item.assignments.find(a => a.userId === userId)
          
          if (existingAssignment) {
            // Remove assignment
            return {
              ...item,
              assignments: item.assignments.filter(a => a.userId !== userId),
            }
          } else {
            // Add assignment with remaining quantity (or 1 if qty=1 item, or split evenly)
            const remaining = getRemainingQuantity(item)
            const quantityToAssign = item.quantity === 1 ? 1 : Math.max(1, remaining)
            
            return {
              ...item,
              assignments: [...item.assignments, { userId, quantity: quantityToAssign }],
            }
          }
        }),
      }
    }

    case 'ASSIGN_ALL_TO_ITEM': {
      // Assign all users equally to a specific item
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id !== action.payload.itemId) return item
          
          const userCount = state.users.length
          if (userCount === 0) return item
          
          // Distribute quantity evenly
          const baseQty = Math.floor(item.quantity / userCount)
          const remainder = item.quantity % userCount
          
          const assignments = state.users.map((user, index) => ({
            userId: user.id,
            quantity: baseQty + (index < remainder ? 1 : 0),
          }))
          
          return { ...item, assignments }
        }),
      }
    }

    case 'UNASSIGN_ALL_FROM_ITEM': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, assignments: [] }
            : item
        ),
      }
    }

    // -------- Charges --------

    case 'SET_TAX': {
      return { ...state, taxAmount: action.payload.amount }
    }

    case 'SET_TIP': {
      return { ...state, tipAmount: action.payload.amount }
    }

    // -------- Navigation --------

    case 'SET_STATUS': {
      return { ...state, currentStatus: action.payload.status }
    }

    // -------- UI --------

    case 'SELECT_ITEM': {
      return { ...state, selectedItemId: action.payload.itemId }
    }

    // -------- Reset & Demo --------

    case 'RESET': {
      return initialState
    }

    case 'LOAD_DEMO': {
      // Reset and load demo data in one action
      return {
        ...initialState,
        items: action.payload.items,
        users: action.payload.users,
        taxAmount: action.payload.taxAmount,
        currentStatus: BillStatus.ASSIGN,
      }
    }

    default: {
      const _exhaustiveCheck: never = action
      return _exhaustiveCheck
    }
  }
}
