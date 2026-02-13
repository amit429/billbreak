// ============================================
// Gemini AI Service
// ============================================
// Handles receipt image parsing using Google's Gemini AI

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { BillItem } from '@/types'
import { generateId } from '@/context/bill/helpers'

// -------- Configuration --------

const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY as string

if (!API_KEY) {
  console.warn('⚠️ VITE_GOOGLE_AI_KEY is not set. AI features will not work.')
}

const genAI = new GoogleGenerativeAI(API_KEY || '')

// Use gemini-2.0-flash (available on free tier, supports vision)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

// -------- Helpers --------

/**
 * Convert a File object to a base64 string
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Result is "data:image/jpeg;base64,/9j/4AAQ..."
      // We need just the base64 part after the comma
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get MIME type from file
 */
function getMimeType(file: File): string {
  return file.type || 'image/jpeg'
}

/**
 * Strip markdown code blocks from AI response
 * AI sometimes returns ```json ... ``` instead of raw JSON
 */
function stripMarkdown(text: string): string {
  // Remove ```json or ``` at start and ``` at end
  return text
    .replace(/^```(?:json)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim()
}

/**
 * Parse AI response into BillItem array
 */
function parseAIResponse(responseText: string): Omit<BillItem, 'id' | 'assignments'>[] {
  const cleaned = stripMarkdown(responseText)
  
  try {
    const parsed = JSON.parse(cleaned)
    
    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array')
    }
    
    // Validate and normalize each item
    return parsed.map((item: unknown) => {
      const obj = item as Record<string, unknown>
      return {
        name: String(obj.name || 'Unknown Item'),
        price: Number(obj.price) || 0,
        quantity: Number(obj.quantity || obj.qty) || 1,
      }
    })
  } catch (error) {
    console.error('Failed to parse AI response:', cleaned)
    throw new Error('Failed to parse receipt data from AI response')
  }
}

// -------- The Prompt --------

const RECEIPT_PROMPT = `You are a receipt parser. Analyze this receipt image and extract all purchased items.

IMPORTANT RULES:
1. Extract ONLY individual items (food, drinks, products)
2. IGNORE: tax, tip, subtotal, total, discounts, service charges
3. For each item, extract: name, price (as number), quantity (as number, default 1)
4. If price includes quantity (e.g., "2 x Coffee $6.00"), set quantity=2 and price=3.00 (unit price)
5. Return ONLY a valid JSON array, no other text

OUTPUT FORMAT (strict JSON array):
[
  {"name": "Margherita Pizza", "price": 450, "quantity": 1},
  {"name": "Coke", "price": 50, "quantity": 2}
]

Parse the receipt now:`

// -------- Main Function --------

export interface ParseReceiptResult {
  items: BillItem[]
  rawResponse: string
}

/**
 * Parse a receipt image using Gemini AI
 * @param imageFile - The receipt image file
 * @returns Parsed bill items with generated IDs
 */
export async function parseReceiptWithAI(imageFile: File): Promise<ParseReceiptResult> {
  if (!API_KEY) {
    throw new Error('Google AI API key is not configured. Add VITE_GOOGLE_AI_KEY to your .env file.')
  }

  // Convert image to base64
  const base64Data = await fileToBase64(imageFile)
  const mimeType = getMimeType(imageFile)

  // Prepare the image part for Gemini
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  }

  // Call Gemini API
  const result = await model.generateContent([RECEIPT_PROMPT, imagePart])
  const response = await result.response
  const responseText = response.text()

  // Parse the response
  const parsedItems = parseAIResponse(responseText)

  // Convert to full BillItem objects with IDs
  const items: BillItem[] = parsedItems.map((item) => ({
    id: generateId(),
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    assignments: [], // Start unassigned
  }))

  return {
    items,
    rawResponse: responseText,
  }
}

// -------- Export helpers for testing --------

export { fileToBase64, stripMarkdown, parseAIResponse }
