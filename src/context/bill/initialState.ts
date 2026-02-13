// ============================================
// Initial State
// ============================================

import { type BillState, BillStatus } from '@/types'

export const initialState: BillState = {
  currentStatus: BillStatus.UPLOAD,
  items: [],
  users: [],
  taxAmount: 0,
  tipAmount: 0,
  selectedItemId: null,
}
