// ============================================
// Helper Functions for Reducer
// ============================================

import { type User, type UserColor, USER_COLOR_LIST } from '@/types'

/**
 * Generate a unique ID for new entities
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Get the next available color for a new user
 * Cycles through the palette if all colors are used
 */
export function getNextUserColor(existingUsers: User[]): UserColor {
  const usedColors = existingUsers.map((u) => u.color)
  const availableColor = USER_COLOR_LIST.find((c) => !usedColors.includes(c))
  return availableColor ?? USER_COLOR_LIST[existingUsers.length % USER_COLOR_LIST.length]
}
