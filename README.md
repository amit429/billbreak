# BillBreak 💸

**Split bills, not friendships.**

BillBreak is a modern, intelligent bill-splitting application that makes dividing expenses among friends fair and effortless. No more awkward calculations or debates about who owes what.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)

---

## The Problem

Splitting bills shouldn't require a math degree. Yet every group dinner ends the same way:

- *"Who had the extra drink?"*
- *"Should we just split equally?"* (unfair to the person who only had salad)
- *"Can someone calculate the tax for each person?"*
- *"I only had 2 of the 5 cokes, why am I paying for all of them?"*

**BillBreak solves this.**

---

## Features

### 📸 AI-Powered Receipt Scanning
Upload a photo of your receipt and let Google's Gemini AI extract all items automatically. No manual typing required.

### 👥 Smart User Management
- Add people with a single tap
- Each person gets a unique color identity (Emerald, Blue, Purple, Rose)
- Visual avatars make tracking assignments intuitive

### ✨ Flexible Item Assignment

**Single Items** — Tap to assign, tap again to split
```
Pizza → Alice (full item)
Pizza → Alice + Bob (split 50/50)
```

**Ratio-Based Splitting** — For uneven consumption (NEW!)
```
Paneer Butter Masala (₹320):
  → Alice: 75% (₹240) — she ate most of it
  → Bob: 25% (₹80)   — just had a taste

Available ratios: 50/50, 75/25, 60/40, 70/30, 80/20, and more
```

**Multi-Quantity Items** — Assign exact amounts with 0.5 increments
```
5 Coca-Colas (₹60 each):
  → Alice: 2.5 cokes (₹150)
  → Bob: 1.5 cokes (₹90)  
  → Carol: 1 coke (₹60)
```

### 🎯 Drag & Drop
Intuitively drag items to users for quick assignment. Works on both desktop and mobile.

### ⌨️ Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `/` | Open "Add Person" input |
| `Enter` | Confirm/submit |
| `Escape` | Cancel/close |

### 📊 Live Calculations
- Real-time progress bar showing "Bill Covered" percentage
- Animated subtotals update as you assign items
- Tax and tip split proportionally based on each person's share

### 📱 Responsive Design
- **Mobile**: Vertical item list with bottom user dock
- **Desktop**: Split-screen layout (60/40) with sidebar

### 📥 SplitSlip Download (NEW!)
Download your bill split as a beautiful, shareable receipt:
- **PNG** — Perfect for sharing on WhatsApp/Instagram
- **PDF** — Great for records and expense reports
- Clean white background design for readability
- Includes complete breakdown per person

### 🎨 Modern UI
- Dark theme with glassmorphism effects
- Smooth Framer Motion animations
- Beautiful color-coded user system

---

## Real-World Scenarios BillBreak Handles

| Scenario | How BillBreak Helps |
|----------|---------------------|
| **Restaurant dinner** | Scan receipt, assign individual dishes, split shared appetizers |
| **Pizza party** | 3 pizzas, 8 people — assign slices, not whole pizzas |
| **Grocery shopping** | Split items by who actually uses them |
| **Drinks round** | 5 beers ordered, but Dave only had 2.5 (half-drink support!) |
| **Shared curry** | Someone ate 75% of the dish? Use ratio split! |
| **Shared Uber** | Split the fare proportionally |
| **Office lunch order** | Everyone pays for what they ordered + their share of delivery fee |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with latest features |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast dev server & build |
| **Tailwind CSS v4** | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Framer Motion** | Smooth animations |
| **dnd-kit** | Accessible drag-and-drop |
| **Shadcn/UI** | Beautiful, accessible components |
| **Google Gemini AI** | Receipt image parsing |
| **html2canvas** | HTML to image conversion |
| **jsPDF** | PDF document generation |

### Routes

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Upload | Home screen - upload receipt or start manually |
| `/split` | Assign | Split items among people |
| `/results` | Results | Final breakdown of who owes what |

### Architecture Highlights

- **Feature-based structure** — Code organized by domain (`features/upload`, `features/splitter`)
- **Context + useReducer** — Predictable state management without Redux overhead
- **React Router** — URL-based navigation with browser back/forward support
- **Discriminated unions** — Type-safe actions for all state changes
- **Selector pattern** — Computed values derived from single source of truth

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/billbreak.git
cd billbreak

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Google AI API key to .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_GOOGLE_AI_KEY=your_google_ai_api_key_here
```

Get your free API key at [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## Phase 1 (Current)

**Core Bill Splitting Experience**

- [x] Receipt image upload with AI parsing
- [x] Manual item entry
- [x] User management with color coding
- [x] Single-item assignment (toggle/split)
- [x] Multi-quantity item assignment (uneven splits)
- [x] Ratio-based splitting (75/25, 60/40, etc.)
- [x] Drag-and-drop item assignment
- [x] Tax & tip proportional distribution
- [x] Real-time calculations
- [x] Results summary with breakdown
- [x] **SplitSlip** — Download as PDF/PNG
- [x] Demo bill for testing
- [x] Responsive mobile/desktop layouts
- [x] Beautiful animations & transitions

---

## Phase 2 (Coming Soon) 🚀

**Stay tuned for exciting features:**

- 🔐 **User Authentication** — Save your bill history
- 💾 **Cloud Sync** — Access bills across devices
- 📤 **Share Summary** — Send breakdown via WhatsApp/SMS
- 💳 **Payment Integration** — Settle up with UPI/PayPal
- 🧾 **Bill History** — Track past splits and settlements
- 👥 **Groups** — Create recurring groups (roommates, colleagues)
- 🌍 **Multi-currency** — Split international trips
- 📊 **Analytics** — See spending patterns with friends
- 🔔 **Reminders** — Nudge friends who haven't paid

---

## Project Structure

```
src/
├── components/ui/       # Reusable UI components (Shadcn)
├── context/bill/        # State management (Context + Reducer)
│   ├── actions.ts       # Action creators
│   ├── reducer.ts       # State transitions
│   ├── selectors.ts     # Computed values
│   └── types.ts         # Action type definitions
├── features/
│   ├── upload/          # Receipt upload & parsing
│   │   ├── components/
│   │   ├── hooks/
│   │   └── screens/
│   └── splitter/        # Bill splitting UI
│       ├── components/
│       │   ├── SplitSlip.tsx    # Downloadable receipt
│       │   └── ...
│       ├── hooks/
│       │   └── useDownloadSplitSlip.ts  # PDF/PNG generation
│       └── screens/
├── lib/
│   ├── gemini.ts        # AI service
│   └── utils.ts         # Helper functions
└── types/               # Shared TypeScript types
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for beautiful components
- [Google Gemini](https://ai.google.dev/) for AI-powered receipt parsing
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [dnd-kit](https://dndkit.com/) for accessible drag-and-drop
- [html2canvas](https://html2canvas.hertzen.com/) for HTML to image conversion
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation

---

<p align="center">
  <b>Made with ☕ and code</b>
  <br>
  <i>Because friends who split fairly, stay friends.</i>
</p>
