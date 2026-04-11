# ClutchD — On-Demand Freelance Mechanic Platform Frontend

## Overview

Build a production-ready Next.js (App Router) frontend for an on-demand freelance mechanic platform. The app supports **Customers**, **Mechanics**, **Garages**, and **Admins** with role-based dashboards, real-time tracking, and a premium glassmorphism UI.

---

## Design System

| Token | Value |
|---|---|
| **Primary gradient** | `#064e3b` → `#10b981` → `#6ee7b7` (emerald dark→light) |
| **Glass effect** | `backdrop-blur-xl bg-white/10 border border-white/20` |
| **Cards** | `rounded-2xl shadow-xl` with glass overlay |
| **Font** | Inter (Google Fonts) |
| **Animations** | Framer Motion — fade/slide/scale on mount, hover lifts, page transitions |

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | TailwindCSS v3 |
| Animations | Framer Motion |
| State | Zustand |
| Validation | Zod + react-hook-form |
| HTTP | Axios |
| Maps | Leaflet + react-leaflet (free, no API key) |
| Real-time | Native WebSocket client |
| Icons | Lucide React |
| Charts | Recharts (admin analytics) |

---

## Proposed File Structure

```
startup-front/
├── backend/                    # Empty folder for future backend
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (fonts, providers)
│   │   ├── page.tsx            # Landing → redirects to /auth
│   │   ├── globals.css         # Tailwind + custom glass utilities
│   │   ├── auth/
│   │   │   └── page.tsx        # Split login/signup page
│   │   ├── dashboard/
│   │   │   ├── customer/
│   │   │   │   └── page.tsx    # Customer dashboard (map + request)
│   │   │   ├── mechanic/
│   │   │   │   └── page.tsx    # Mechanic dashboard
│   │   │   └── garage/
│   │   │       └── page.tsx    # Garage dashboard
│   │   └── admin/
│   │       ├── layout.tsx      # Admin sidebar layout
│   │       ├── page.tsx        # Admin overview
│   │       ├── users/
│   │       │   └── page.tsx
│   │       ├── jobs/
│   │       │   └── page.tsx
│   │       ├── disputes/
│   │       │   └── page.tsx
│   │       └── analytics/
│   │           └── page.tsx
│   ├── components/
│   │   ├── ui/                 # Reusable primitives
│   │   │   ├── GlassCard.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── MultiSelect.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── StarRating.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Loader.tsx
│   │   ├── auth/
│   │   │   ├── LoginCard.tsx
│   │   │   ├── SignUpCard.tsx
│   │   │   ├── CustomerFields.tsx
│   │   │   ├── MechanicFields.tsx
│   │   │   └── GarageFields.tsx
│   │   ├── dashboard/
│   │   │   ├── MapView.tsx
│   │   │   ├── ServiceRequestPanel.tsx
│   │   │   ├── ServiceStatusTracker.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   └── ReviewModal.tsx
│   │   ├── mechanic/
│   │   │   ├── ProfileEditor.tsx
│   │   │   ├── AvailabilityToggle.tsx
│   │   │   ├── IncomingJobs.tsx
│   │   │   ├── EarningsChart.tsx
│   │   │   └── NavigationMap.tsx
│   │   ├── garage/
│   │   │   ├── GarageProfile.tsx
│   │   │   ├── JobQueue.tsx
│   │   │   ├── AssignMechanic.tsx
│   │   │   └── GarageAnalytics.tsx
│   │   └── admin/
│   │       ├── Sidebar.tsx
│   │       ├── UserTable.tsx
│   │       ├── KYCApproval.tsx
│   │       ├── JobMonitor.tsx
│   │       ├── DisputePanel.tsx
│   │       └── AnalyticsCharts.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   ├── useGeolocation.ts
│   │   └── useApi.ts
│   ├── lib/
│   │   ├── api.ts              # Axios instance
│   │   ├── validators.ts       # Zod schemas
│   │   ├── constants.ts        # App constants
│   │   └── utils.ts            # Helpers
│   ├── store/
│   │   ├── authStore.ts        # Zustand auth store
│   │   ├── serviceStore.ts     # Service request state
│   │   └── trackingStore.ts    # Real-time tracking state
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── public/
│   └── images/                 # Static assets
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Implementation Phases

### Phase 1: Project Setup
- Initialize Next.js with TypeScript, TailwindCSS, ESLint
- Configure Tailwind with custom emerald theme, glassmorphism utilities
- Install dependencies (framer-motion, zustand, zod, react-hook-form, axios, lucide-react, recharts, react-leaflet, leaflet)
- Set up Google Fonts (Inter)
- Create empty `backend/` directory

### Phase 2: Design System & UI Primitives
- `globals.css` — glass utilities, gradient backgrounds, custom scrollbar
- `GlassCard`, `Button`, `Input`, `Select`, `MultiSelect`, `FileUpload`, `StarRating`, `Badge`, `Modal`, `Loader`

### Phase 3: Auth Page
- Split-screen layout with Login (left) and Sign-Up (right)
- Role selector dropdown (Customer / Mechanic / Garage)
- Dynamic form fields per role with Zod validation
- Framer Motion entrance animations
- Google OAuth button (UI only, backend placeholder)

### Phase 4: Customer Dashboard
- Map view with Leaflet (user location, nearby mechanics/garages markers)
- Service Request Panel (issue tags, description, image upload, price estimate)
- Service status tracker (Searching → Assigned → En Route → In Progress → Completed)
- Payment modal (UPI, Cards)
- Review modal (star rating + text)

### Phase 5: Mechanic Dashboard
- Profile editor with expertise multi-select
- Availability toggle (online/offline)
- Incoming jobs list with Accept/Reject
- Navigation map
- Earnings charts (daily/weekly)
- Rating display

### Phase 6: Garage Dashboard
- Garage profile management
- Job queue view
- Assign mechanic to job
- Earnings analytics
- Ratings & reviews

### Phase 7: Admin Panel
- Sidebar navigation layout
- User management table (search, filter, CRUD)
- KYC approval cards
- Job monitoring
- Dispute handling
- Analytics charts (Recharts)

### Phase 8: Integration Layer
- Zustand stores (auth, service, tracking)
- API hooks with Axios
- WebSocket client for real-time tracking
- Zod validation schemas
- TypeScript types

---

## User Review Required

> [!IMPORTANT]
> **Map Provider**: Using **Leaflet/OpenStreetMap** (free, no API key required). If you prefer Google Maps, you'll need to provide a Google Maps API key.

> [!IMPORTANT]
> **Backend folder**: Will create an empty `backend/` directory at the project root for you to merge your backend code later.

> [!NOTE]
> **No real backend**: All API calls will be mocked with realistic placeholder data. The Axios instance and hooks are pre-configured so you can swap in real endpoints when the backend is ready.

---

## Open Questions

1. **App name**: I'm using "ClutchD" — would you prefer a different name?
2. **Color preference**: The plan uses an emerald green gradient. Should I adjust the exact shades?
3. **Landing page**: Should the root `/` be a marketing landing page, or simply redirect to `/auth`?

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify the project compiles without errors
- Run `npm run lint` to check for code quality issues

### Manual Verification
- Launch dev server with `npm run dev`
- Use browser subagent to verify all pages render correctly
- Test responsive layout on different viewport sizes
- Verify animations and transitions work smoothly
