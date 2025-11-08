# LUMO Marketplace - Cleaned Version

This is a cleaned version of the LUMO marketplace application, keeping only the home page with "The Tartan Marketplace" text and removing all other functionality.

## What was preserved:

- **Home page** (`src/app/page.tsx`) - The main landing page with:

  - "The Tartan Marketplace" title with animated text
  - Liquid glass panel styling
  - Animated CMU futuristic background
  - Glass morphism buttons (non-functional, for display only)

- **Essential components**:
  - `CMUFuturisticBackground.tsx` - The animated background
  - `button.tsx` - Button component for the UI
  - Layout and styling files

## What was removed:

- All pages except the home page:
  - `/checkout`, `/dashboard`, `/login`, `/orders`, `/profile`, `/requests`, `/review`, `/services`
- All Supabase integration:
  - Database connections
  - Authentication system
  - Supabase utilities and configuration
- Components no longer needed:
  - Navigation bar, footer, sidebars
  - Service cards, request cards, order management
  - Form components, dialog components
  - Context providers (Auth, Notifications)
- Dependencies cleanup:
  - Removed Supabase packages
  - Removed unused Radix UI components
  - Removed other unnecessary dependencies

## How to run:

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port).

## Structure:

```
src/
├── app/
│   ├── globals.css          # Global styles and animations
│   ├── layout.tsx           # Root layout (simplified)
│   └── page.tsx             # Home page with Tartan Marketplace
├── components/
│   └── ui/
│       ├── CMUFuturisticBackground.tsx  # Animated background
│       └── button.tsx       # Button component
├── lib/
│   └── utils.ts            # Utility functions
└── utils/                  # (empty, utilities removed)
```

The home page maintains all the original visual elements including the glass morphism effects, animated background, and the distinctive "Tartan Marketplace" branding.
