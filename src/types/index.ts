// ============================================
// BillBreak Type Definitions
// ============================================

// -------- Constants --------

// App navigation states
export const BillStatus = {
  UPLOAD: 'upload',
  ASSIGN: 'assign',
  RESULTS: 'results',
} as const

export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus]

// User color palette - 4 distinct color schemes
export const UserColors = {
  EMERALD: 'emerald',
  BLUE: 'blue',
  PURPLE: 'purple',
  ROSE: 'rose',
} as const

export type UserColor = (typeof UserColors)[keyof typeof UserColors]

// Array for easy iteration/assignment
export const USER_COLOR_LIST: UserColor[] = [
  UserColors.EMERALD,
  UserColors.BLUE,
  UserColors.PURPLE,
  UserColors.ROSE,
]

// Color CSS class mappings
export const USER_COLOR_CLASSES: Record<UserColor, {
  bg: string
  bgLight: string
  border: string
  text: string
  ring: string
  glow: string
}> = {
  emerald: {
    bg: 'bg-user-emerald',
    bgLight: 'bg-user-emerald/20',
    border: 'border-user-emerald',
    text: 'text-user-emerald-light',
    ring: 'ring-user-emerald',
    glow: 'shadow-[0_0_20px_oklch(0.65_0.17_160_/_0.3)]',
  },
  blue: {
    bg: 'bg-user-blue',
    bgLight: 'bg-user-blue/20',
    border: 'border-user-blue',
    text: 'text-user-blue-light',
    ring: 'ring-user-blue',
    glow: 'shadow-[0_0_20px_oklch(0.65_0.17_240_/_0.3)]',
  },
  purple: {
    bg: 'bg-user-purple',
    bgLight: 'bg-user-purple/20',
    border: 'border-user-purple',
    text: 'text-user-purple-light',
    ring: 'ring-user-purple',
    glow: 'shadow-[0_0_20px_oklch(0.65_0.17_300_/_0.3)]',
  },
  rose: {
    bg: 'bg-user-rose',
    bgLight: 'bg-user-rose/20',
    border: 'border-user-rose',
    text: 'text-user-rose-light',
    ring: 'ring-user-rose',
    glow: 'shadow-[0_0_20px_oklch(0.65_0.17_15_/_0.3)]',
  },
}

// -------- Core Entities --------

export interface User {
  id: string
  name: string
  color: UserColor
}

// Assignment with quantity support
export interface ItemAssignment {
  userId: string
  quantity: number  // How many of this item the user is taking
}

export interface BillItem {
  id: string
  name: string
  price: number         // Price per unit
  quantity: number      // Total number of items
  assignments: ItemAssignment[]  // Who gets how many
}

// -------- Application State --------

export interface BillState {
  // Current screen/step
  currentStatus: BillStatus

  // Receipt data
  items: BillItem[]
  users: User[]

  // Additional charges
  taxAmount: number
  tipAmount: number

  // UI state
  selectedItemId: string | null
}

// -------- Computed/Derived Types --------

export interface UserShare {
  user: User
  subtotal: number      // Sum of their item shares
  taxShare: number      // Their portion of tax
  tipShare: number      // Their portion of tip
  total: number         // Final amount they owe
  itemCount: number     // Number of items assigned
  items: {
    item: BillItem
    quantity: number    // How many they got
    shareAmount: number // How much they pay for this item
  }[]
}

// -------- Helper Functions --------

// Get total assigned quantity for an item
export function getAssignedQuantity(item: BillItem): number {
  return item.assignments.reduce((sum, a) => sum + a.quantity, 0)
}

// Get remaining unassigned quantity
export function getRemainingQuantity(item: BillItem): number {
  return item.quantity - getAssignedQuantity(item)
}

// Check if item is fully assigned
export function isItemFullyAssigned(item: BillItem): boolean {
  return getAssignedQuantity(item) >= item.quantity
}

// Get user's assigned quantity for an item
export function getUserAssignedQuantity(item: BillItem, userId: string): number {
  const assignment = item.assignments.find(a => a.userId === userId)
  return assignment?.quantity ?? 0
}
