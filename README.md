# Palacio de Oro - Luxury Resort & Fine Dining

A fullstack luxury resort and fine dining web application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🏨 Resort Management
- Browse and filter rooms and cottages (Standard, Deluxe, Suite, Luxury Villa, Small, Family, Barkada)
- Real-time availability tracking
- Online booking system with payment method selection (Cash, GCash, Card)
- Downpayment options
- Guest booking management

### 🍽️ Fine Dining
- 8 menu categories: Appetizers, Main Course, Seafood, Grilled, Desserts, Cocktails, Wine, Non-Alcoholic
- Featured items and bestsellers
- Add to cart system with quantity management
- Dine-in and room delivery options
- Order tracking and status updates

### 👤 User System
- Email/password authentication via Supabase
- Guest account management
- Booking history and order tracking
- Review and rating system for rooms and menu items

### 🛠️ Admin Dashboard
- Manage rooms and cottages (CRUD operations)
- Manage menu items with categories and pricing
- View and update booking statuses
- View and update order statuses
- Analytics dashboard with key metrics

### 📞 Contact & Support
- Support team information with social links
- Developer contact highlighted as primary admin
- Contact form for inquiries
- FAQ section

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Hooks
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: Custom components with glassmorphism design
- **Icons**: Lucide React

## Design System

### Colors
- **Black**: #0B0B0B (Primary background)
- **Gold**: #D4AF37 (Accent)
- **Dark Green**: #0F2A1D (Secondary)
- **White**: #FFFFFF (Text/accents)

### Typography
- **Headings**: Playfair Display (serif)
- **Accent**: Cinzel (serif)
- **Body**: Poppins (sans-serif)

### Animations
- Fade-in on scroll
- Hover lift effects on cards
- Gold glow pulses
- Smooth transitions throughout
- Auto-sliding carousel

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── GlassCard.tsx
│   ├── Modal.tsx
│   ├── StarRating.tsx
│   ├── StatusBadge.tsx
│   ├── LoadingSpinner.tsx
│   └── ReviewSection.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Rooms.tsx
│   ├── Menu.tsx
│   ├── Bookings.tsx
│   ├── Contact.tsx
│   ├── Admin.tsx
│   └── Auth.tsx
├── lib/                # Utilities and types
│   ├── supabase.ts
│   └── types.ts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Database Schema

### Tables
- **users** - Guest and admin accounts
- **rooms** - Resort room inventory
- **cottages** - Cottage inventory
- **menu_items** - Restaurant menu
- **bookings** - Guest reservations
- **orders** - Restaurant orders
- **order_items** - Line items for orders
- **reviews** - Ratings and comments

All tables have Row Level Security (RLS) enabled with appropriate policies for data protection.

## Key Features Implementation

### Authentication Flow
1. Users sign up/login via Auth page
2. Supabase Auth handles session management
3. User data synced with `users` table
4. Admin role restrictions on certain pages

### Booking System
1. Check availability for selected dates
2. Choose room/cottage and guest count
3. Select payment method and downpayment option
4. Generate reference number
5. Submit booking (pending status by default)

### Restaurant Ordering
1. Browse menu by category
2. Add items to cart with quantity control
3. Select order type (dine-in/room delivery)
4. Proceed to checkout
5. Place order with payment method selection

### Admin Panel
1. View analytics dashboard
2. Manage accommodations (add/edit/delete)
3. Manage menu items (add/edit/delete)
4. Update booking and order statuses
5. View all transactions

## Support & Contact

**Developer & Admin**
- Name: Vincent Ecaldre
- Email: vincentecaldre25@gmail.com
- Facebook: https://www.facebook.com/Ilove.tomboybaddie

**Support Lead**
- Name: Rommel Cabanza
- Facebook: https://www.facebook.com/rommel.cabanza.2025

**Support Account**
- Facebook: https://www.facebook.com/profile.php?id=61588094229904

## License

This project is proprietary and confidential.

## Development Notes

- Uses Supabase real-time subscriptions for live updates
- Implements glassmorphism UI design pattern
- Fully responsive from mobile to desktop
- Optimized performance with lazy loading
- Type-safe with full TypeScript coverage
- Production-ready build configuration
