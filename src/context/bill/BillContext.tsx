// ============================================
// Bill Context & Provider
// ============================================

import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react'
import type { BillState, UserShare } from '@/types'

import type { BillAction } from './types'
import { initialState } from './initialState'
import { billReducer } from './reducer'
import { createActions, type BillActions } from './actions'
import {
  selectAssignmentProgress,
  selectSubtotal,
  selectGrandTotal,
  selectUserShares,
} from './selectors'

// -------- Context Value Type --------

export interface BillContextValue {
  // Raw state
  state: BillState

  // Dispatch (for advanced usage)
  dispatch: React.Dispatch<BillAction>

  // Computed values
  progress: number
  subtotal: number
  grandTotal: number
  userShares: UserShare[]

  // Action creators
  actions: BillActions
}

// -------- Context --------

const BillContext = createContext<BillContextValue | null>(null)

// -------- Provider --------

interface BillProviderProps {
  children: ReactNode
}

export function BillProvider({ children }: BillProviderProps) {
  const [state, dispatch] = useReducer(billReducer, initialState)

  // Memoize computed values
  const progress = useMemo(() => selectAssignmentProgress(state), [state])

  const subtotal = useMemo(() => selectSubtotal(state), [state])

  const grandTotal = useMemo(() => selectGrandTotal(state), [state])

  const userShares = useMemo(() => selectUserShares(state), [state])

  // Memoize action creators
  const actions = useMemo(() => createActions(dispatch), [])

  // Memoize context value
  const value = useMemo<BillContextValue>(
    () => ({
      state,
      dispatch,
      progress,
      subtotal,
      grandTotal,
      userShares,
      actions,
    }),
    [state, progress, subtotal, grandTotal, userShares, actions]
  )

  return <BillContext.Provider value={value}>{children}</BillContext.Provider>
}

// -------- Hook --------

export function useBill(): BillContextValue {
  const context = useContext(BillContext)

  if (!context) {
    throw new Error('useBill must be used within a BillProvider')
  }

  return context
}
