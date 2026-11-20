# Palacio de Oro — Private Island Sanctuary & Fine Dining

An ultra-luxury European editorial resort web platform built with **React 18, TypeScript, Tailwind CSS, Vite 5, and Supabase**.

[![Production Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=flat&logo=vercel)](https://palacio-de-oro-luxury-resort.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat&logo=github)](https://github.com/Hawkin20/palacio-de-oro-luxury-resort)
[![Aesthetic](https://img.shields.io/badge/Design_Direction-Quiet_Luxury-C5A880?style=flat)](https://palacio-de-oro-luxury-resort.vercel.app/)

---

## 🏛️ Design Direction — Quiet Luxury: European Resort Editorial

Palacio de Oro embodies the **Quiet Luxury** aesthetic, marrying classical European architectural elegance with the warm tropical sanctuary of Boracay:

* **Obsidian Noir (`#080808`)**: Deep, restful foundation replacing harsh synthetic blacks.
* **Champagne Bronze (`#C5A880`)**: Muted, metallic gold accents avoiding neon saturations.
* **Alabaster Sand (`#F6F4EF`)**: Warm, breathable editorial typography for effortless readability.
* **Warm Charcoal (`#292720`)**: Subtle contrast borders and secondary layers.
* **Typography Hierarchy**: High-contrast `Playfair Display` serif headlines, `Cinzel` architectural badges, and clean `Poppins` sans-serif body.
* **Hairline Glassmorphic Cards**: Ultra-subtle frosted glass (`bg-white/[0.03] border-white/[0.08]`) with refined bronze focus transitions.

---

## 🌟 Key Features

### 🏰 Accommodations & Private Suites (`/rooms`)
- **Curated Inventory**: Presidential Suite, Garden View Villa, Poolside Villa, Sunset Casita, Deluxe Suite, and Beach Cottages.
- **Unique Imagery & Safe Fallbacks**: Dedicated distinct high-resolution editorial photography per accommodation with graceful offline fallbacks.
- **Dynamic Integer Booking Engine**: Check-in to check-out calculation with strict integer validation, preventing zero or negative night bookings.
- **Automatic Date Range Constraints**: Check-in locked to `today+`, and check-out dynamically auto-advances to `checkIn + 1 day`.
- **Transparent Price Breakdown**: Itemized calculation showing nightly base rate, complimentary resort amenities, 50% deposit option, and total amount.
- **Editorial Confirmation Screen**: Generates a persistent reservation modal with copy-to-clipboard booking reference `#BK...` and direct navigation to Guest Portal.
- **Quick View & Side-by-Side Comparison**: Interactive modal inspector and 3-suite comparison dock.

### 🍽️ Private Island Gastronomy (`/menu`)
- **8 Culinary Categories**: Appetizers, Main Course, Seafood, Grilled, Desserts, Cocktails, Wine, and Refreshments.
- **Chef's Recommendations**: Curated carousel showcasing bestsellers and chef specials.
- **Selection Tray Drawer**: Slide-out cart drawer with live quantity adjustments, Order Type selection (Dine-in vs. Room Suite Delivery), and payment methods (Card, GCash, Cash).
- **Search & Dynamic Filters**: Instant live text filtering across ingredients, descriptions, and categories.

### 📋 Guest Sanctuary Portal (`/bookings`)
- **Chronicle of Stays**: Unified timeline of confirmed, pending, and past resort stays.
- **Culinary Order Tracking**: Linked room service dining requests with real-time status badges.
- **Direct Navigation**: Graceful empty-state prompts leading directly to accommodation reservations.

### 🛡️ Executive Management Console (`/admin`)
- **Gated Authorization**: Strict role-based verification against Supabase user metadata and `users` table, with a luxury Access Denied fallback.
- **Real-Time Operations**: Live business analytics, occupancy rate bar, revenue trends, and metrics tracking.
- **Inventory Management**: Create, edit, and delete suites, cottages, and culinary menu items with validated modals.
- **Reservation & Order Workflows**: Dynamic status updates (`pending` → `confirmed` / `preparing` → `completed`) with toast alerts.

### 📱 Progressive Web App (PWA) & Performance
- **Full Icon Suite**: Pre-cached PWA icons from 72px up to 512px with brand monogram favicon.
- **Service Worker Caching**: Offline manifest and Workbox precaching for sub-second repeat loads.
- **URL Synchronization**: Direct URL navigation (`/`, `/rooms`, `/menu`, `/bookings`, `/admin`) synchronized with browser history and popstate events.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18.3.1 | Component-driven architecture |
| **Language** | TypeScript 5.5.3 | Static typing, contract safety |
| **Build Tool** | Vite 5.4.8 | Lightning-fast HMR and Rollup production bundling |
| **Styling** | Tailwind CSS 3.4.1 | Utility-first design tokens and glassmorphism |
| **Database & Auth** | Supabase (PostgreSQL) | Real-time database, auth, and Row Level Security |
| **Icons** | Lucide React | Minimalist line icons |
| **Hosting & CI/CD** | Vercel & GitHub | Continuous automated production deployments |

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Hawkin20/palacio-de-oro-luxury-resort.git
cd palacio-de-oro-luxury-resort
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview -- --port 4173
```

---

## 📁 Repository Structure

```
palacio-de-oro-luxury-resort/
├── public/                  # PWA icons (72–512px), manifest, SVG monogram favicon
├── src/
│   ├── components/          # Reusable quiet luxury components
│   │   ├── Navbar.tsx       # Header, promo banner, navigation & auth modal triggers
│   │   ├── PalacioLogo.tsx  # Royal Monogram 'P' vector emblem
│   │   ├── Footer.tsx       # Editorial resort footer and links
│   │   ├── GlassCard.tsx    # Glassmorphism container wrapper
│   │   ├── Modal.tsx        # Accessible dialog backdrop & container
│   │   ├── StatusBadge.tsx  # Color-coded reservation & order state pills
│   │   └── LoadingSpinner.tsx
│   ├── pages/               # Application views
│   │   ├── Home.tsx         # Quiet luxury editorial homepage & hero
│   │   ├── Rooms.tsx        # Accommodation suites, comparison, & reservation modal
│   │   ├── Menu.tsx         # Dining menu, category pills, & cart tray drawer
│   │   ├── Bookings.tsx     # Guest reservations and room service history
│   │   ├── Admin.tsx        # Executive operations console & analytics
│   │   ├── Auth.tsx         # Guest sign-in & registration
│   │   └── Contact.tsx      # Concierge inquiry & resort information
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client singleton
│   │   ├── types.ts         # TypeScript schema definitions
│   │   └── images.ts        # Accommodation image registry and fallback handlers
│   ├── App.tsx              # URL routing synchronization and state management
│   ├── main.tsx             # Application bootstrap
│   └── index.css            # Custom design tokens, fonts, and animation keyframes
├── tailwind.config.js       # Color tokens: obsidian, bronze, alabaster, charcoal
└── vite.config.ts           # Vite configuration & PWA plugin setup
```

---

## 👥 Leadership & Development Team

* **Lead Developer & Administrator**: Vincent Paul Ecaldre  
  * Email: [vincentecaldre25@gmail.com](mailto:vincentecaldre25@gmail.com)  
  * GitHub: [@Hawkin20](https://github.com/Hawkin20)
* **Resort Operations & Support Lead**: Rommel Cabanza  
* **Resort Concierge & Guest Services**: Palacio de Oro Support Team  

---

## 📄 License
This project is proprietary and confidential. All rights reserved by **Palacio de Oro Resort & Sanctuary**.
