# BillBreak - Complete Project Documentation

> A modern bill-splitting application built with React, TypeScript, and Tailwind CSS.  
> This document explains every concept, pattern, and decision made during development.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Setup & Configuration](#4-setup--configuration)
5. [React Core Concepts Used](#5-react-core-concepts-used)
6. [State Management Deep Dive](#6-state-management-deep-dive)
7. [Feature Modules](#7-feature-modules)
8. [Styling System](#8-styling-system)
9. [Drag & Drop Implementation](#9-drag--drop-implementation)
10. [AI Integration](#10-ai-integration)
11. [TypeScript Patterns](#11-typescript-patterns)
12. [Step-by-Step Build Journey](#12-step-by-step-build-journey)

---

## 1. Project Overview

### What is BillBreak?

BillBreak is a bill-splitting application that allows users to:
1. **Upload a receipt image** → AI extracts items automatically
2. **Add people** to split the bill with
3. **Assign items** to people via drag-drop or clicking
4. **See results** → Who owes what, with detailed breakdowns

### The User Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   UPLOAD    │ ──► │   ASSIGN    │ ──► │   RESULTS   │
│             │     │             │     │             │
│ • Scan bill │     │ • Add users │     │ • Summary   │
│ • AI parse  │     │ • Drag/drop │     │ • Per-person│
│ • Review    │     │ • Progress  │     │ • Share     │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 2. Technology Stack

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **React 19** | UI Framework | Component-based, great ecosystem |
| **TypeScript** | Type Safety | Catch errors at compile time |
| **Vite** | Build Tool | Fast HMR, modern ESM support |
| **Tailwind CSS v4** | Styling | Utility-first, rapid prototyping |
| **Shadcn/UI** | Components | Customizable, accessible primitives |
| **Framer Motion** | Animations | Declarative, spring physics |
| **dnd-kit** | Drag & Drop | Modern, accessible, React-first |
| **Google Gemini** | AI | Receipt parsing, vision model |

### Package.json Dependencies Explained

```json
{
  "dependencies": {
    "@google/generative-ai": "AI SDK for Gemini",
    "clsx": "Conditional class joining",
    "framer-motion": "Animation library",
    "lucide-react": "Icon library",
    "react": "UI framework",
    "react-dom": "React DOM renderer",
    "tailwind-merge": "Merge Tailwind classes intelligently",
    "@dnd-kit/core": "Drag & drop core",
    "@dnd-kit/sortable": "Sortable lists",
    "@dnd-kit/utilities": "DnD helper utilities"
  }
}
```

---

## 3. Project Structure

```
src/
├── main.tsx                 # App entry point
├── App.tsx                  # Screen router
├── index.css                # Global styles + Tailwind
│
├── components/
│   └── ui/                  # Shadcn/UI components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── progress.tsx
│       ├── accordion.tsx
│       ├── avatar.tsx
│       └── card.tsx
│
├── context/
│   └── bill/                # State management
│       ├── index.ts         # Public exports
│       ├── types.ts         # Action types
│       ├── initialState.ts  # Default state
│       ├── helpers.ts       # Utility functions
│       ├── reducer.ts       # State transitions
│       ├── selectors.ts     # Computed values
│       ├── actions.ts       # Action creators
│       └── BillContext.tsx  # Provider + Hook
│
├── features/
│   ├── upload/              # Receipt upload feature
│   │   ├── index.ts
│   │   ├── hooks/
│   │   │   └── useReceiptUpload.ts
│   │   ├── components/
│   │   │   ├── DropZone.tsx
│   │   │   ├── ScanningAnimation.tsx
│   │   │   ├── ParsedItemsList.tsx
│   │   │   └── ReceiptUploader.tsx
│   │   └── screens/
│   │       └── UploadScreen.tsx
│   │
│   └── splitter/            # Bill splitting feature
│       ├── index.ts
│       ├── components/
│       │   ├── UserAvatar.tsx
│       │   ├── AddUserInput.tsx
│       │   ├── UserCard.tsx
│       │   └── ReceiptItem.tsx
│       └── screens/
│           ├── AssignScreen.tsx
│           └── ResultsScreen.tsx
│
├── lib/
│   ├── utils.ts             # cn() utility
│   └── gemini.ts            # AI service
│
├── types/
│   └── index.ts             # TypeScript definitions
│
└── utils/
    └── index.ts             # Re-exports
```

### Why This Structure?

#### Feature-Based Organization
```
❌ Traditional (by file type):
src/
├── components/     # All components mixed
├── hooks/          # All hooks mixed
└── utils/          # All utilities mixed

✅ Feature-Based (by domain):
src/features/
├── upload/         # Everything for uploading
│   ├── components/
│   ├── hooks/
│   └── screens/
└── splitter/       # Everything for splitting
    ├── components/
    └── screens/
```

**Benefits:**
- Delete a feature = delete one folder
- Related code lives together
- Clear boundaries between features
- Easier to find what you need

---

## 4. Setup & Configuration

### 4.1 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**What each part does:**
- `react()` → Enables React Fast Refresh (HMR)
- `tailwindcss()` → Tailwind v4 Vite plugin (no PostCSS needed)
- `alias` → Enables `@/` imports instead of `../../`

### 4.2 TypeScript Configuration

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true
  }
}
```

**Key options:**
- `paths` → TypeScript understands `@/` imports
- `strict` → Maximum type safety
- `erasableSyntaxOnly` → No enums (use const objects instead)

### 4.3 Path Aliases

**The Problem:**
```typescript
// Deep imports are ugly and fragile
import { Button } from '../../../components/ui/button'
```

**The Solution:**
```typescript
// Clean absolute imports
import { Button } from '@/components/ui/button'
```

**Requires configuration in TWO places:**
1. `tsconfig.json` → For TypeScript/IDE
2. `vite.config.ts` → For actual bundling

---

## 5. React Core Concepts Used

### 5.1 Components

**What:** Reusable pieces of UI.

```tsx
// Function component with TypeScript props
interface ButtonProps {
  label: string
  onClick: () => void
}

function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
```

**In BillBreak:**
- `UserAvatar` → Displays user initial with color
- `ReceiptItem` → Shows item with assignment UI
- `UserCard` → Sidebar card with user details

### 5.2 useState

**What:** Local state for a single component.

```tsx
function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

**In BillBreak:**
- `AddUserInput` → `isOpen` state for showing/hiding input
- `useReceiptUpload` → `status`, `error`, `parsedItems` states

### 5.3 useReducer

**What:** Complex state management with actions.

```tsx
// Reducer pattern
const [state, dispatch] = useReducer(reducer, initialState)

// Dispatch an action
dispatch({ type: 'ADD_ITEM', payload: { name: 'Pizza' } })
```

**Why useReducer over useState?**
| useState | useReducer |
|----------|------------|
| Simple state (boolean, string) | Complex state (objects, arrays) |
| Independent updates | Related updates (add user → update items) |
| Few state changes | Many action types |

**In BillBreak:**
- Central bill state (items, users, status)
- Actions: `ADD_USER`, `TOGGLE_ASSIGNMENT`, `SET_ITEMS`, etc.

### 5.4 useContext

**What:** Share state across components without prop drilling.

```tsx
// Without Context (prop drilling)
<App>
  <Header user={user} />
  <Main>
    <Sidebar user={user} />
    <Content user={user}>
      <Card user={user} />  {/* Passed through 4 levels! */}
    </Content>
  </Main>
</App>

// With Context
<UserProvider value={user}>
  <App>
    <Header />      {/* Uses useUser() hook */}
    <Main>
      <Sidebar />   {/* Uses useUser() hook */}
      <Content>
        <Card />    {/* Uses useUser() hook */}
      </Content>
    </Main>
  </App>
</UserProvider>
```

**In BillBreak:**
- `BillContext` provides state to all components
- `useBill()` hook accesses it anywhere

### 5.5 useMemo

**What:** Cache expensive calculations.

```tsx
// Without useMemo - runs EVERY render
const expensiveValue = calculateExpensiveThing(data)

// With useMemo - only runs when `data` changes
const expensiveValue = useMemo(
  () => calculateExpensiveThing(data),
  [data]  // Dependency array
)
```

**In BillBreak:**
- `userShares` → Loops through all items × users
- `progress` → Calculates assignment percentage
- `actions` → Memoized action creators

### 5.6 useCallback

**What:** Cache function references.

```tsx
// Without useCallback - new function every render
const handleClick = () => doSomething(id)

// With useCallback - same reference if `id` hasn't changed
const handleClick = useCallback(
  () => doSomething(id),
  [id]
)
```

**Why it matters:**
- Prevents unnecessary re-renders of child components
- Required when passing callbacks to memoized components

**In BillBreak:**
- `uploadReceipt` in `useReceiptUpload`
- `handleDragEnd` in `AssignScreen`

### 5.7 useRef

**What:** Persist values without causing re-renders.

```tsx
function Input() {
  const inputRef = useRef<HTMLInputElement>(null)
  
  const focusInput = () => {
    inputRef.current?.focus()
  }
  
  return <input ref={inputRef} />
}
```

**In BillBreak:**
- `AddUserInput` → Focus input when opened
- `DropZone` → Reference to hidden file input

### 5.8 useEffect

**What:** Run side effects (API calls, subscriptions, DOM manipulation).

```tsx
useEffect(() => {
  // Runs after render
  document.title = `Count: ${count}`
  
  // Cleanup (optional)
  return () => {
    console.log('Cleaning up')
  }
}, [count])  // Dependencies
```

**In BillBreak:**
- `AddUserInput` → Auto-focus input when opened

### 5.9 Custom Hooks

**What:** Extract reusable stateful logic.

```tsx
// Custom hook
function useLocalStorage(key: string, initialValue: string) {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key) ?? initialValue
  })
  
  useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value])
  
  return [value, setValue] as const
}

// Usage
const [name, setName] = useLocalStorage('name', 'Guest')
```

**In BillBreak:**
- `useBill()` → Access bill context
- `useReceiptUpload()` → Upload state machine

---

## 6. State Management Deep Dive

### 6.1 The Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BillProvider                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                      State                         │  │
│  │  {                                                │  │
│  │    currentStatus: 'assign',                       │  │
│  │    items: [...],                                  │  │
│  │    users: [...],                                  │  │
│  │    taxAmount: 0,                                  │  │
│  │    tipAmount: 0,                                  │  │
│  │    selectedItemId: null                           │  │
│  │  }                                                │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │                    Reducer                         │  │
│  │   switch (action.type) {                          │  │
│  │     case 'ADD_USER': ...                          │  │
│  │     case 'TOGGLE_ASSIGNMENT': ...                 │  │
│  │   }                                               │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Computed Values (Memoized)            │  │
│  │   • progress (% assigned)                         │  │
│  │   • subtotal                                      │  │
│  │   • userShares (who owes what)                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                  Any Component via useBill()
```

### 6.2 File Breakdown

| File | Lines | Responsibility |
|------|-------|----------------|
| `types.ts` | ~35 | Action type definitions |
| `initialState.ts` | ~15 | Default state values |
| `helpers.ts` | ~20 | Pure utility functions |
| `reducer.ts` | ~170 | State transition logic |
| `selectors.ts` | ~95 | Computed/derived values |
| `actions.ts` | ~95 | Action creator factory |
| `BillContext.tsx` | ~95 | Provider + hook |
| `index.ts` | ~25 | Public API (barrel file) |

### 6.3 Discriminated Union Actions

```typescript
type BillAction =
  | { type: 'SET_ITEMS'; payload: BillItem[] }
  | { type: 'ADD_USER'; payload: { name: string } }
  | { type: 'TOGGLE_ITEM_ASSIGNMENT'; payload: { itemId: string; userId: string } }
  | { type: 'RESET' }
```

**Why this pattern?**

TypeScript can narrow the type inside switch cases:

```typescript
function reducer(state: State, action: BillAction): State {
  switch (action.type) {
    case 'ADD_USER':
      // TypeScript KNOWS payload is { name: string }
      console.log(action.payload.name)  // ✅
      console.log(action.payload.itemId)  // ❌ Error!
      break
  }
}
```

### 6.4 Immutable Updates

**The Golden Rule:** Never mutate state directly.

```typescript
// ❌ WRONG - Mutates existing state
state.users.push(newUser)
return state

// ✅ CORRECT - Returns new state object
return {
  ...state,
  users: [...state.users, newUser]
}
```

**Common Patterns:**

```typescript
// Add to array
users: [...state.users, newUser]

// Remove from array
users: state.users.filter(u => u.id !== userId)

// Update item in array
items: state.items.map(item =>
  item.id === targetId
    ? { ...item, name: newName }
    : item
)

// Toggle in array
assignedTo: isAssigned
  ? item.assignedTo.filter(id => id !== userId)
  : [...item.assignedTo, userId]
```

### 6.5 Selectors

**What:** Functions that derive data from state.

```typescript
// Don't store what you can calculate
export function selectAssignmentProgress(state: BillState): number {
  if (state.items.length === 0) return 0
  const assigned = state.items.filter(i => i.assignedTo.length > 0)
  return (assigned.length / state.items.length) * 100
}
```

**Benefits:**
- Single source of truth (no duplicate data)
- Easy to test
- Memoizable for performance

### 6.6 Action Creators

```typescript
export function createActions(dispatch: Dispatch) {
  return {
    addUser: (name: string) => {
      dispatch({ type: 'ADD_USER', payload: { name } })
    },
    toggleAssignment: (itemId: string, userId: string) => {
      dispatch({ type: 'TOGGLE_ITEM_ASSIGNMENT', payload: { itemId, userId } })
    },
  }
}
```

**Why?**
- Cleaner component code
- Type-safe parameters
- Easy to add middleware (logging, analytics)

---

## 7. Feature Modules

### 7.1 Upload Feature

```
features/upload/
├── index.ts              # Public exports
├── hooks/
│   └── useReceiptUpload.ts   # State machine for upload
├── components/
│   ├── DropZone.tsx          # Drag & drop area
│   ├── ScanningAnimation.tsx # Loading indicator
│   ├── ParsedItemsList.tsx   # Review parsed items
│   └── ReceiptUploader.tsx   # Orchestrator
└── screens/
    └── UploadScreen.tsx      # Full page
```

#### State Machine Pattern

```typescript
type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'success' | 'error'

// Only certain transitions are valid:
// idle → uploading → parsing → success
//                          ↘ error
```

**In the UI:**
```tsx
{status === 'idle' && <DropZone />}
{status === 'uploading' && <ScanningAnimation />}
{status === 'success' && <ParsedItemsList />}
{status === 'error' && <ErrorMessage />}
```

### 7.2 Splitter Feature

```
features/splitter/
├── index.ts
├── components/
│   ├── UserAvatar.tsx    # Color-coded avatar
│   ├── AddUserInput.tsx  # Inline name input
│   ├── UserCard.tsx      # Sidebar card (droppable)
│   └── ReceiptItem.tsx   # Item card (draggable)
└── screens/
    ├── AssignScreen.tsx  # Main splitting UI
    └── ResultsScreen.tsx # Summary view
```

#### Component Composition

`AssignScreen` orchestrates everything:

```tsx
<DndContext>
  {/* Mobile Layout */}
  <div className="lg:hidden">
    <Header />
    <ItemsList>
      {items.map(item => <ReceiptItem />)}
    </ItemsList>
    <BottomDock>
      {users.map(user => <UserAvatar />)}
      <AddUserInput />
    </BottomDock>
  </div>

  {/* Desktop Layout */}
  <div className="hidden lg:flex">
    <LeftPanel>  {/* 60% */}
      <ItemsList />
    </LeftPanel>
    <RightSidebar>  {/* 40% */}
      {users.map(user => <UserCard />)}
    </RightSidebar>
  </div>

  <DragOverlay />
</DndContext>
```

---

## 8. Styling System

### 8.1 Tailwind CSS v4

**Key Change:** Configuration moved to CSS.

```css
/* Old way (v3) - tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#6EE7B7'
      }
    }
  }
}

/* New way (v4) - index.css */
@theme {
  --color-primary: oklch(0.75 0.15 165);
}
```

### 8.2 Color System

**Base Colors (CSS Variables):**
```css
:root {
  --background: oklch(0.13 0.01 260);  /* Deep navy */
  --foreground: oklch(0.98 0 0);       /* Off-white */
  --card: oklch(0.18 0.01 260);        /* Elevated surface */
  --border: oklch(0.30 0.01 260);      /* Subtle borders */
  --primary: oklch(0.75 0.15 165);     /* Mint accent */
}
```

**User Colors:**
```css
--color-user-emerald: oklch(0.65 0.17 160);
--color-user-blue: oklch(0.65 0.17 240);
--color-user-purple: oklch(0.65 0.17 300);
--color-user-rose: oklch(0.65 0.17 15);
```

**Why OKLCH?**
- Perceptually uniform (consistent brightness)
- Easy to create harmonious palettes
- Better for accessibility

### 8.3 The `cn()` Utility

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**What it does:**

```tsx
// clsx: Conditional classes
cn('px-4', isActive && 'bg-blue-500')
// → "px-4 bg-blue-500" or "px-4"

// twMerge: Resolves conflicts
cn('px-2', 'px-4')
// → "px-4" (not "px-2 px-4")

// Combined power
cn(
  'base-styles',
  isActive && 'active-styles',
  className  // Props override
)
```

### 8.4 Glassmorphism

```css
.glass {
  background: oklch(0.18 0.01 260 / 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid oklch(0.30 0.01 260 / 0.5);
}
```

**Used for:**
- Header/footer overlays
- Sidebar
- Bottom dock

---

## 9. Drag & Drop Implementation

### 9.1 dnd-kit Overview

```
┌─────────────────────────────────────────┐
│              DndContext                  │
│  (Provides drag/drop state to children)  │
│                                          │
│   ┌─────────────┐    ┌─────────────┐    │
│   │  Draggable  │    │  Droppable  │    │
│   │  (Item)     │───►│  (User)     │    │
│   └─────────────┘    └─────────────┘    │
│                                          │
│   ┌─────────────────────────────────┐   │
│   │         DragOverlay              │   │
│   │  (Ghost preview while dragging)  │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 9.2 Making Items Draggable

```tsx
import { useDraggable } from '@dnd-kit/core'

function ReceiptItem({ item }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `item-${item.id}`,
    data: { itemId: item.id },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
    >
      {item.name}
    </div>
  )
}
```

### 9.3 Making Users Droppable

```tsx
import { useDroppable } from '@dnd-kit/core'

function UserCard({ user }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `user-drop-${user.id}`,
    data: { userId: user.id },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(isOver && 'scale-105 ring-2')}
    >
      {user.name}
    </div>
  )
}
```

### 9.4 Handling Drop Events

```tsx
function AssignScreen() {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const itemId = String(active.id).replace('item-', '')
    const dropId = String(over.id)

    if (dropId.startsWith('user-drop-')) {
      const userId = dropId.replace('user-drop-', '')
      actions.toggleAssignment(itemId, userId)
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* ... */}
    </DndContext>
  )
}
```

---

## 10. AI Integration

### 10.1 Service Layer Pattern

```
Component                    Service                     External API
    │                           │                             │
    │  uploadReceipt(file)      │                             │
    ├──────────────────────────►│                             │
    │                           │  parseReceiptWithAI(file)   │
    │                           ├────────────────────────────►│
    │                           │                             │
    │                           │◄───── JSON response ────────│
    │                           │                             │
    │◄───── BillItem[] ─────────│                             │
    │                           │                             │
```

**Benefits:**
- Components don't know about Gemini, base64, or prompts
- Easy to mock for testing
- Can swap AI providers without touching UI

### 10.2 The Gemini Service

```typescript
// src/lib/gemini.ts

export async function parseReceiptWithAI(imageFile: File): Promise<ParseReceiptResult> {
  // 1. Convert image to base64
  const base64Data = await fileToBase64(imageFile)
  
  // 2. Call Gemini API
  const result = await model.generateContent([PROMPT, imagePart])
  
  // 3. Parse and validate response
  const items = parseAIResponse(response.text())
  
  // 4. Return typed data
  return { items, rawResponse }
}
```

### 10.3 Prompt Engineering

```typescript
const RECEIPT_PROMPT = `You are a receipt parser. Analyze this receipt image.

IMPORTANT RULES:
1. Extract ONLY individual items (food, drinks, products)
2. IGNORE: tax, tip, subtotal, total, discounts
3. For each item: name, price (number), quantity (number, default 1)
4. Return ONLY valid JSON array

OUTPUT FORMAT:
[
  {"name": "Margherita Pizza", "price": 450, "quantity": 1},
  {"name": "Coke", "price": 50, "quantity": 2}
]`
```

**Good prompts are:**
- Explicit about what TO include and NOT include
- Strict about output format
- Include examples

---

## 11. TypeScript Patterns

### 11.1 Interface vs Type

```typescript
// Interface - for objects, can be extended
interface User {
  id: string
  name: string
}

interface Admin extends User {
  permissions: string[]
}

// Type - for unions, intersections, primitives
type Status = 'idle' | 'loading' | 'success' | 'error'
type UserOrNull = User | null
```

### 11.2 Const Assertions

```typescript
// Without as const
const status = { LOADING: 'loading' }
// Type: { LOADING: string }

// With as const
const status = { LOADING: 'loading' } as const
// Type: { readonly LOADING: 'loading' }
```

**Used for:**
```typescript
export const BillStatus = {
  UPLOAD: 'upload',
  ASSIGN: 'assign',
  RESULTS: 'results',
} as const

export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus]
// Type: 'upload' | 'assign' | 'results'
```

### 11.3 Generic Components

```typescript
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <div>{items.map(renderItem)}</div>
}

// Usage - TypeScript infers T
<List items={users} renderItem={user => <span>{user.name}</span>} />
```

### 11.4 Utility Types

```typescript
// Omit - Remove properties
type NewItem = Omit<BillItem, 'id' | 'assignedTo'>
// { name: string, price: number, quantity: number }

// Partial - All properties optional
type ItemUpdate = Partial<BillItem>
// { id?: string, name?: string, ... }

// Pick - Select properties
type ItemPreview = Pick<BillItem, 'name' | 'price'>
// { name: string, price: number }

// ReturnType - Extract return type
type Actions = ReturnType<typeof createActions>
```

---

## 12. Step-by-Step Build Journey

### Phase 1: Project Setup

1. **Created Vite + React + TypeScript project**
2. **Configured Tailwind CSS v4**
   - Installed `@tailwindcss/vite`
   - Added `@import "tailwindcss"` to CSS
3. **Set up path aliases** (`@/`)
   - `tsconfig.json` for TypeScript
   - `vite.config.ts` for bundling
4. **Initialized Shadcn/UI**
   - Installed base components
   - Created `cn()` utility

### Phase 2: Folder Structure

```
Created feature-based structure:
src/
├── features/upload/
├── features/splitter/
├── context/bill/
├── lib/
└── types/
```

### Phase 3: State Management

1. **Defined types** (`types/index.ts`)
   - `User`, `BillItem`, `BillState`
   - `BillStatus` constant
   - `UserColor` palette
2. **Created reducer** (`context/bill/reducer.ts`)
   - All action handlers
   - Immutable update patterns
3. **Built selectors** (`context/bill/selectors.ts`)
   - `selectAssignmentProgress`
   - `selectUserShares`
4. **Set up Context** (`context/bill/BillContext.tsx`)
   - Provider with useReducer
   - Memoized computed values
   - `useBill()` hook

### Phase 4: AI Integration

1. **Created Gemini service** (`lib/gemini.ts`)
   - File to base64 conversion
   - Prompt engineering
   - Response parsing
2. **Built upload hook** (`useReceiptUpload.ts`)
   - Status state machine
   - Error handling
   - Progress tracking

### Phase 5: Upload Feature

1. **DropZone** - Drag & drop area
2. **ScanningAnimation** - Loading state
3. **ParsedItemsList** - Review items
4. **ReceiptUploader** - Orchestrator
5. **UploadScreen** - Full page

### Phase 6: Splitter Feature

1. **Design system update** - Colors, fonts
2. **UserAvatar** - Color-coded initials
3. **AddUserInput** - Inline name input
4. **UserCard** - Droppable sidebar card
5. **ReceiptItem** - Draggable item
6. **AssignScreen** - Split layout with DnD
7. **ResultsScreen** - Summary view

### Phase 7: Polish

1. **Responsive layouts** - Mobile/desktop
2. **Animations** - Framer Motion
3. **Glassmorphism** - Premium feel
4. **Grid background** - Visual depth

---

## Quick Reference

### Import Patterns

```typescript
// Context
import { useBill, BillProvider } from '@/context/bill'

// Components
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/features/splitter'

// Types
import type { User, BillItem, BillStatus } from '@/types'

// Utilities
import { cn } from '@/lib/utils'
```

### Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Add Shadcn component
npx shadcn@latest add [component]

# Type check
npx tsc --noEmit
```

### Environment Variables

```bash
# .env (never commit!)
VITE_GOOGLE_AI_KEY=your_api_key_here

# Access in code
const key = import.meta.env.VITE_GOOGLE_AI_KEY
```

---

## Conclusion

BillBreak demonstrates:
- **Modern React patterns** (hooks, context, reducers)
- **TypeScript best practices** (strict typing, discriminated unions)
- **Feature-based architecture** (scalable, maintainable)
- **Professional styling** (Tailwind, design system)
- **Advanced interactions** (drag & drop, animations)
- **AI integration** (service layer pattern)

The codebase is designed to be:
- **Readable** - Clear naming, comments, structure
- **Testable** - Pure functions, isolated modules
- **Extensible** - Easy to add features
- **Maintainable** - Single responsibility per file

---

*Built with ❤️ as a learning project*
