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

// -------- Types --------

interface TaxBreakdown {
  cgst: number       // Central GST
  sgst: number       // State GST
  igst: number       // Integrated GST (for inter-state)
  serviceCharge: number
  serviceTax: number
  vat: number
  cess: number       // Additional cess if any
  other: number      // Any other taxes
  total: number      // Total tax amount
}

interface ParsedReceiptData {
  items: Omit<BillItem, 'id' | 'assignments'>[]
  tax: TaxBreakdown
  subtotal: number   // Sum of items before tax
  grandTotal: number // Final total on receipt
}

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
 * Create empty tax breakdown
 */
function emptyTaxBreakdown(): TaxBreakdown {
  return {
    cgst: 0,
    sgst: 0,
    igst: 0,
    serviceCharge: 0,
    serviceTax: 0,
    vat: 0,
    cess: 0,
    other: 0,
    total: 0,
  }
}

/**
 * Parse AI response into structured data
 */
function parseAIResponse(responseText: string): ParsedReceiptData {
  const cleaned = stripMarkdown(responseText)
  
  try {
    const parsed = JSON.parse(cleaned)
    
    // Handle both formats: array (old) or object with items/tax (new)
    if (Array.isArray(parsed)) {
      // Old format - just items array
      const items = parsed.map((item: unknown) => {
        const obj = item as Record<string, unknown>
        return {
          name: String(obj.name || 'Unknown Item'),
          price: Number(obj.price) || 0,
          quantity: Number(obj.quantity || obj.qty) || 1,
        }
      })
      return {
        items,
        tax: emptyTaxBreakdown(),
        subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        grandTotal: 0,
      }
    }
    
    // New format - object with items and tax
    const obj = parsed as Record<string, unknown>
    
    // Parse items
    const rawItems = (obj.items || []) as unknown[]
    const items = rawItems.map((item: unknown) => {
      const itemObj = item as Record<string, unknown>
      return {
        name: String(itemObj.name || 'Unknown Item'),
        price: Number(itemObj.price) || 0,
        quantity: Number(itemObj.quantity || itemObj.qty) || 1,
      }
    })
    
    // Parse tax breakdown
    const rawTax = (obj.tax || {}) as Record<string, unknown>
    const tax: TaxBreakdown = {
      cgst: Number(rawTax.cgst) || 0,
      sgst: Number(rawTax.sgst) || 0,
      igst: Number(rawTax.igst) || 0,
      serviceCharge: Number(rawTax.serviceCharge || rawTax.service_charge) || 0,
      serviceTax: Number(rawTax.serviceTax || rawTax.service_tax) || 0,
      vat: Number(rawTax.vat) || 0,
      cess: Number(rawTax.cess) || 0,
      other: Number(rawTax.other) || 0,
      total: 0, // Will calculate below
    }
    
    // Calculate total tax
    tax.total = tax.cgst + tax.sgst + tax.igst + tax.serviceCharge + 
                tax.serviceTax + tax.vat + tax.cess + tax.other
    
    return {
      items,
      tax,
      subtotal: Number(obj.subtotal) || items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      grandTotal: Number(obj.grandTotal || obj.grand_total || obj.total) || 0,
    }
  } catch (error) {
    console.error('Failed to parse AI response:', cleaned)
    throw new Error('Failed to parse receipt data from AI response')
  }
}

// -------- The Prompt --------

const RECEIPT_PROMPT = `You are an expert receipt parser specializing in Indian bills. Analyze this receipt image and extract:

1. ALL PURCHASED ITEMS (food, drinks, products)
2. ALL TAX COMPONENTS (very important for Indian bills)

INDIAN TAX COMPONENTS TO LOOK FOR:
- CGST (Central GST) - usually 2.5% or 9%
- SGST (State GST) - usually 2.5% or 9%
- IGST (Integrated GST) - for inter-state, usually 5% or 18%
- Service Charge - often 5-10% in restaurants
- Service Tax (older bills)
- VAT (Value Added Tax)
- Cess (Swachh Bharat Cess, Krishi Kalyan Cess, etc.)
- Any other taxes or charges

EXTRACTION RULES:
1. For items: Extract name, price (unit price as number), quantity (default 1)
2. If price includes quantity (e.g., "2 x Coffee ₹120"), set quantity=2 and price=60 (unit price)
3. For taxes: Extract exact amounts shown on receipt, use 0 if not present
4. DO NOT include tips or discounts in tax
5. Return ONLY valid JSON, no other text

OUTPUT FORMAT (strict JSON object):
{
  "items": [
    {"name": "Margherita Pizza", "price": 450, "quantity": 1},
    {"name": "Coke", "price": 60, "quantity": 2}
  ],
  "tax": {
    "cgst": 45,
    "sgst": 45,
    "igst": 0,
    "serviceCharge": 57,
    "serviceTax": 0,
    "vat": 0,
    "cess": 0,
    "other": 0
  },
  "subtotal": 570,
  "grandTotal": 717
}

Parse the receipt now:`

// -------- Main Function --------

export interface ParseReceiptResult {
  items: BillItem[]
  tax: TaxBreakdown
  subtotal: number
  grandTotal: number
  rawResponse: string
}

/**
 * Parse a receipt image using Gemini AI
 * @param imageFile - The receipt image file
 * @returns Parsed bill items, tax breakdown, and totals
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
  const parsedData = parseAIResponse(responseText)

  // Convert to full BillItem objects with IDs
  const items: BillItem[] = parsedData.items.map((item) => ({
    id: generateId(),
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    assignments: [], // Start unassigned
  }))

  return {
    items,
    tax: parsedData.tax,
    subtotal: parsedData.subtotal,
    grandTotal: parsedData.grandTotal,
    rawResponse: responseText,
  }
}

// -------- Export types and helpers --------

export type { TaxBreakdown, ParsedReceiptData }
export { fileToBase64, stripMarkdown, parseAIResponse, emptyTaxBreakdown }
