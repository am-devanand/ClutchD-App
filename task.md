# ClutchD — Build Task Tracker

## Phase 1: Project Setup
- [/] Initialize Next.js (JS, App Router, TailwindCSS)
- [ ] Install all dependencies
- [ ] Create empty `backend/` directory
- [ ] Configure Tailwind custom theme
- [ ] Set up `next.config.js`

## Phase 2: Design System & UI Primitives
- [x] `globals.css` — glass utilities, gradients
- [x] `GlassCard`, `Button`, `Input`, `Select`
- [x] `MultiSelect`, `FileUpload`, `StarRating`
- [x] `Badge`, `Modal`, `Loader`

## Phase 3: Auth Page
- [x] Split-screen `/auth` page
- [x] `LoginCard` with validation
- [x] `SignUpCard` with role selector
- [x] `MechanicFields`, `GarageFields`, `CustomerFields`
- [x] Framer Motion animations

## Phase 4: Customer Dashboard
- [x] Map view (Leaflet/OpenStreetMap)
- [x] Service Request Panel
- [x] Status Tracker component
- [x] Payment Modal
- [x] Review Modal

## Phase 5: Mechanic Dashboard
- [x] Profile editor
- [x] Availability toggle
- [x] Incoming jobs list
- [x] Earnings charts
- [x] Navigation map

## Phase 6: Garage Dashboard
- [x] Garage profile
- [x] Job queue
- [x] Assign mechanic
- [x] Analytics

## Phase 7: Admin Panel
- [x] Sidebar layout
- [x] User management table
- [x] KYC approval
- [x] Job monitor
- [x] Dispute panel
- [x] Analytics charts

## Phase 8: Integration Layer
- [x] Zustand stores
- [x] Axios API client + hooks
- [x] WebSocket client
- [x] Zod validators

## Phase 9: Reliability, Infrastructure & Security Improvements
- [x] Blacklist fail-closed security logic in token blacklist
- [x] Branded glassmorphism fallback pages (404 not-found, error boundaries, global-error)
- [x] Centered loading spinner pages for all page router branch layouts
- [x] Reusable Class component `ErrorBoundary` for runtime fallback UI
- [x] Secure headers & dependency imports optimization in next.config.mjs
- [x] Print media query styling & prefers-reduced-motion CSS optimization
- [x] Session persistence resilience: Prevent automatic force logout on temporary server reset/network error (502/503/500)
- [x] Enforce secure mock payment client restricted exclusively to local debug mode
- [x] Update docker-compose files with automatic restart policy (unless-stopped) & api service healthcheck
- [x] Secure dockerignore scopes for root project and backend contexts to optimize build footprint
- [x] Upgrade Git ignore files to avoid committing logs, secrets, and database caches
- [x] Set access token expiration to secure 15-minute standard

