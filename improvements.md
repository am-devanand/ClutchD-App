# ClutchD App — Comprehensive Improvement Report

> **Generated:** 2026-05-16
> **Scope:** Full-stack audit covering security, backend, frontend, CSS/UX, infrastructure, monitoring, and code quality.
> **Files Analyzed:** ~80 source files across `src/`, `backend/`, configs, and Dockerfiles.

---

## 🔴 CRITICAL SECURITY VULNERABILITIES

### 1. Secrets Committed to Git
| File | Severity | Issue |
|------|----------|-------|
| `.env.docker` | **Critical** | Contains hardcoded `JWT_SECRET_KEY`, `DATABASE_URL` with credentials (`mechoncall:mechoncall`), and API keys. **Anyone with repo access can forge JWTs or access the database.** |

**Fix:**
- Rotate all secrets immediately.
- Replace `.env.docker` with `.env.docker.example` using placeholder values.
- Add `.env.docker` to `.gitignore`.
- Use Docker secrets, HashiCorp Vault, or your deployment platform's secret store.

---

### 2. JWT Default Secret Check Bypassed
**File:** `backend/backend/app/core/security.py:21`

The check `if settings.jwt_secret_key == _DEFAULT_SECRET` only matches the literal default string `"change-me-in-production-use-openssl-rand-hex-32"`. But `.env.docker` sets a **different** hardcoded secret (`b76ae7f...`). The check passes, but the secret is still compromised because it's committed to git.

**Fix:**
- Remove hardcoded secrets from the repo entirely.
- Make the check more robust (e.g., warn if secret has been seen in any known data breach).

---

### 3. Token Blacklist Fails Open
**File:** `backend/backend/app/core/security.py:80`

```python
except Exception:
    logger.warning("Redis unavailable for token blacklist check")
    return False  # ⚠️ Fails open — revoked tokens stay valid
```

When Redis is down, `is_token_blacklisted()` returns `False`, meaning **revoked tokens continue to work**.

**Fix:**
- Fail closed: reject all tokens when the blacklist can't be checked, or maintain a local in-memory fallback cache.

---

### 4. No Brute Force Protection on Password Reset
**File:** `backend/backend/app/api/v1/auth.py:210`

- 6-digit numeric reset code (`1,000,000` combinations)
- Rate limit is only `5/minute` per endpoint
- No account lockout after failed attempts
- Can brute-force the code in ~3.5 days at 5 req/min, or much faster with distributed attacks

**Fix:**
- Use alphanumeric tokens (min 8 chars, e.g., `secrets.token_urlsafe(6)`)
- Implement exponential backoff per email
- Lock the account after 5 failed reset attempts
- Add a CAPTCHA for password reset

---

### 5. Mock Payment Gateway in Production Code
**File:** `backend/backend/app/api/v1/payments.py:25-58`

```python
if not settings.razorpay_key_id or not settings.razorpay_key_secret:
    logger.warning("Using MOCK Razorpay client...")
    class MockQrcode: ...
    class MockOrder: ...
```

If Razorpay keys are missing in production, **payments are accepted without being processed** (mock client simulates success after 8 seconds).

**Fix:**
- Raise `HTTPException(503)` in production when payment gateway is not configured.
- Only allow mock client when `settings.debug == True`.
- Add a deployment-time check that verifies payment keys are configured.

---

### 6. Admin Endpoints Have Zero Audit Trail
**File:** `backend/backend/app/api/v1/admin.py`

All admin CRUD operations (verify mechanics/garages, update disputes, change pricing) have no audit logging. No record of:
- Who performed the action
- What was changed
- When it happened

**Fix:**
- Create an `AuditLog` SQLAlchemy model.
- Add middleware or a decorator to log all admin mutations with user ID, timestamp, action, and before/after state.

---

### 7. Google OAuth Missing `state` Parameter
**File:** `backend/backend/app/api/v1/auth.py:148`

The Google OAuth flow doesn't generate or validate a CSRF `state` parameter. This makes the OAuth callback vulnerable to CSRF attacks where an attacker could link their Google account to a victim's existing session.

**Fix:**
- Generate a cryptographically random `state` value on the client.
- Store it in session/cookie. Verify it on the backend callback.

---

### 8. No Security Headers
Neither the frontend nor backend sets these critical security headers:

| Header | Purpose |
|--------|---------|
| `Content-Security-Policy` | Prevents XSS and data injection |
| `X-Frame-Options` | Prevents clickjacking |
| `X-Content-Type-Options` | Prevents MIME-type sniffing |
| `Strict-Transport-Security` | Enforces HTTPS |
| `Referrer-Policy` | Controls referrer leakage |

**Fix:**
- **Backend:** Add a Starlette middleware in `main.py` to set security headers.
- **Frontend:** Configure `headers` in `next.config.mjs`.

---

### 9. JWT Access Token Expiry is 7 Days
**File:** `.env.docker:10` — `ACCESS_TOKEN_EXPIRE_MINUTES=10080`

10080 minutes = 7 days for an **access token**. Best practice is 15–30 minutes. Long-lived access tokens mean a leaked token gives an attacker extended access.

**Fix:**
- Set `ACCESS_TOKEN_EXPIRE_MINUTES=15` (or 30 max).
- Use refresh tokens (already implemented) for session persistence.

---

### 10. Redis Has No Authentication
**File:** `backend/backend/app/core/redis_client.py`

Redis connects without credentials (`REDIS_URL=redis://redis:6379/0`). An attacker who gains network access can read all cached data, session info, and reset codes.

**Fix:**
- Configure Redis with `requirepass`.
- Update URL to `redis://:password@host:6379/0`.
- Use Redis ACLs for finer-grained access control.

---

## 🟠 HIGH PRIORITY — BACKEND

### 11. No Request Body Size Limits
FastAPI accepts unlimited request body sizes. This is a DoS vector.

**Fix:**
```python
# In main.py or config
app.add_middleware(RequestSizeLimitMiddleware, max_size=10_000_000)  # 10MB
```
Or use Nginx to limit request body size at the reverse proxy level.

---

### 12. Rate Limiter Blind Behind Proxy
**File:** `backend/backend/app/core/limiter.py`

```python
limiter = Limiter(key_func=get_remote_address)
```

Behind any reverse proxy (Nginx, Cloudflare, AWS ALB), all traffic appears to originate from the proxy IP, making rate limiting ineffective.

**Fix:**
- Use `ProxyHeadersMiddleware` from SlowAPI.
- Ensure `X-Forwarded-For` is trusted only from your proxy.
- Consider per-route rate limits based on user ID (not IP) for authenticated endpoints.

---

### 13. Payout Service is a Stub
**File:** `backend/backend/app/services/payout_service.py`

```python
async def process_payouts(db, payment, job):
    logger.info(
        "PAYOUT: ₹%.2f to provider UPI, ₹%.2f to platform UPI",
        service_amt, platform_fee
    )
```

This only **logs** amounts — no actual money is transferred to providers.

**Fix:**
- Integrate with Razorpay Payouts API (Payouts).
- Or use Stripe Connect for automated transfers.
- Add a `Payout` model to track payout status (pending/settled/failed).

---

### 14. Database Pool Not Configured
**File:** `backend/backend/app/db/session.py`

```python
engine = create_async_engine(settings.database_url)
```

No `pool_size`, `max_overflow`, `pool_timeout`, or `pool_pre_ping` configured. Defaults may be insufficient under load.

**Fix:**
```python
engine = create_async_engine(
    settings.database_url,
    pool_size=20,
    max_overflow=10,
    pool_timeout=30,
    pool_pre_ping=True,
    echo=settings.debug,
)
```

---

### 15. Admin Analytics — N+1 Query Problem
**File:** `backend/backend/app/api/v1/admin.py:93-102`

5 separate `SELECT COUNT(*)` queries run serially. On large tables, this is slow.

**Fix:** Single query:
```sql
SELECT
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM jobs) AS total_jobs,
  (SELECT COALESCE(SUM(amount), 0) FROM payments) AS total_revenue,
  (SELECT COUNT(*) FROM mechanic) AS total_mechanics,
  (SELECT COUNT(*) FROM garage) AS total_garages
```

---

### 16. Most Endpoints Lack Rate Limiting
Only auth endpoints (`/auth/*`) have `@limiter.limit`. All of these are unthrottled:
- `POST /service/request`
- `POST /uploads` (especially dangerous — file upload + no rate limit)
- `POST /reviews`
- All admin endpoints
- `POST /service/sos`

**Fix:** Apply rate limiting to all mutating endpoints, especially file uploads and SOS alerts.

---

### 17. Bootstrap Script Destroys Data on Startup
**File:** `backend/backend/scripts/bootstrap_db.py`

```python
Base.metadata.drop_all(bind=sync_engine)  # ⚠️ Data loss!
Base.metadata.create_all(bind=sync_engine)
```

Every Docker container restart wipes all data and recreates tables. **Not safe for any environment beyond local dev.**

**Fix:**
- Change the Docker entrypoint to use `alembic upgrade head` for schema management, not `bootstrap_db.py`.
- Move seed data to a separate script that checks if data already exists.
- Remove `bootstrap_db.py` from the Docker startup command.

---

### 18. Test Files Copied into Docker Image
Files in `backend/backend/` root:
- `test_db.py`
- `test_job_service.py`
- `test_patch.py`
- `test_patch2.py`

These are included in the Docker image, increasing image size and potentially exposing test code in production.

**Fix:**
- Move tests to `backend/tests/`.
- Add a `.dockerignore` excluding test files.

---

### 19. Inconsistent Error Response Format
Some endpoints return `{"detail": "..."}`, others use `{"message": "..."}`, and some use custom formats.

**Fix:** Create a standard error response model:
```python
class ErrorResponse(BaseModel):
    error: str
    message: str
    status_code: int
```
Register a custom exception handler that catches all errors and returns this format.

---

### 20. WebSocket Manager — Horizontal Scaling Blocked
**File:** `backend/backend/app/ws/manager.py`

`ConnectionManager` is a module-level singleton storing connections in memory. With multiple server instances, users may connect to different instances and miss messages.

**Fix:**
- Use Redis PubSub as a message broker for WebSocket broadcasts.
- Each instance subscribes to Redis channels and relays messages to its local connections.

---

### 21. WebSocket Job Tracking — Missing Auth Check
The `/ws/tracking/{job_id}` endpoint may not verify the connecting user is authorized to track that specific job (customer, assigned mechanic, or admin).

**Fix:** Verify job ownership/assignment in the WebSocket `connect` handler before allowing subscription.

---

### 22. Uploaded Files Not Served Back
Files uploaded via `POST /uploads` are saved to disk but there's no `GET /uploads/{filename}` endpoint to retrieve them.

**Fix:** Add a download endpoint with authentication and authorization checks.

---

## 🟠 HIGH PRIORITY — FRONTEND

### 23. No TypeScript
The entire frontend (~60 JS files) is plain JavaScript. No type safety means:
- Refactoring is dangerous
- API contracts aren't enforced
- Many bugs only surface at runtime

**Fix:** Migrate incrementally — start with `src/lib/` and `src/store/`, then components. Rename to `.tsx`/`.ts`.

---

### 24. JWT Stored in localStorage (XSS Vector)
**File:** `src/store/authStore.js`

The JWT access token is persisted in `localStorage`. Any XSS vulnerability allows an attacker to steal the token and impersonate the user indefinitely.

**Fix:**
- The backend already sets refresh tokens as httpOnly cookies.
- **Also set access tokens as httpOnly cookies**, removing the need for JS-accessible token storage.
- Use the cookie-based refresh flow to obtain new access tokens.
- If cookies aren't feasible, use `sessionStorage` (cleared on tab close) and refresh aggressively.

---

### 25. No React Error Boundaries
A single runtime error in any component crashes the entire page. There are zero `ErrorBoundary` components anywhere in the app.

**Fix:** Create a reusable `ErrorBoundary` wrapper and wrap page-level components and individual widgets.

---

### 26. No App Router Loading States
Next.js App Router supports `loading.js` for automatic loading UI. None are used.

**Fix:** Add loading files:
- `src/app/loading.js`
- `src/app/auth/loading.js`
- `src/app/dashboard/customer/loading.js`
- `src/app/dashboard/mechanic/loading.js`
- `src/app/dashboard/garage/loading.js`
- `src/app/admin/*/loading.js`

---

### 27. No 404 or Error Pages
No `not-found.js` or `error.js` in the App Router. Users see Next.js default error pages.

**Fix:** Add:
- `src/app/not-found.js` — branded 404 page
- `src/app/error.js` — error boundary for all pages
- `src/app/global-error.js` — global error boundary

---

### 28. Next.js Image Optimization Not Used
All images use standard `<img>` tags — Leaflet tiles, QR codes, user avatars. No `next/image`, meaning no:
- Automatic lazy loading
- Responsive sizes
- WebP conversion
- Blur placeholder

**Fix:** Use `next/image` for all static and user-uploaded images. Configure `remotePatterns` in `next.config.mjs`.

---

### 29. No SEO Meta Tags
Only the root `layout.js` has a basic `<title>`. No per-page:
- Meta descriptions
- Open Graph tags (`og:title`, `og:description`, `og:image`)
- JSON-LD structured data
- Canonical URLs

**Fix:** Export `metadata` objects from each page, or build a reusable SEO component.

---

### 30. No Accessibility (a11y) Audit
- Icon buttons lack `aria-label`
- Color contrast concerns in light mode (warm mustard theme may have low contrast)
- No keyboard navigation for dropdowns/modals
- Interactive `<div>` elements instead of `<button>`

**Fix:** Audit with axe DevTools. Add semantic HTML, ARIA labels, and keyboard event handlers.

---

### 31. No PWA / Offline Support
No service worker, web manifest, or offline fallback. The app is entirely dependent on network connectivity.

**Fix:** Use `@serwist/next` or `next-pwa` to add:
- Service worker with cache strategies
- Web manifest
- Offline fallback page

---

### 32. API Base URL Mismatch in Docker
**File:** `Dockerfile:18`
```
ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

But the app's `constants.js` uses `http://127.0.0.1:8000/api` (note: no `/v1` suffix). This means the Docker build arg doesn't match the actual API path.

**Fix:** Standardize on one URL pattern. The backend prefix is `/api`, not `/api/v1`.

---

### 33. Leaflet CSS Bundled Globally
**File:** `src/app/globals.css`
```css
@import "leaflet/dist/leaflet.css";
```

This adds Leaflet CSS to **every page's** initial bundle, even pages that never show a map.

**Fix:** Dynamically import Leaflet CSS only on pages that use `MapView`:
```javascript
import("leaflet/dist/leaflet.css");
```

---

### 34. No Bundle Analysis
No tooling to track bundle size. The app bundles Framer Motion (35KB), Recharts (50KB+), Leaflet (40KB+), and Lucide (20KB+).

**Fix:** Add `@next/bundle-analyzer` and set up a bundle budget in CI.

---

### 35. Zustand Stores Untyped
All 5 Zustand stores use plain JavaScript, eliminating compile-time checks for state access and mutations.

**Fix:** Add TypeScript interfaces:
```typescript
interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

---

## 💅 MEDIUM PRIORITY — CSS / UX

### 36. No Print Styles
Invoice pages and service history have no print-optimized CSS.

**Fix:**
```css
@media print {
  .no-print { display: none !important; }
  body { background: white !important; color: black !important; }
}
```

---

### 37. No `prefers-reduced-motion` Support
Framer Motion animations may cause discomfort for users with vestibular motion disorders.

**Fix:**
```javascript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;
// Conditionally disable animations
```

---

### 38. Theme Flash on Page Load
**File:** `src/components/ui/ThemeProvider.js`

The provider uses a `mounted` state check to delay rendering, but users may see a flash of the wrong theme before JS executes.

**Fix:** Add a blocking `<script>` in `layout.js`:
```html
<script dangerouslySetInnerHTML={{
  __html: `
    const theme = localStorage.getItem('theme-storage');
    if (theme) {
      const t = JSON.parse(theme).state.theme;
      document.documentElement.classList.toggle('light', t === 'light');
    }
  `
}} />
```

---

### 39. CSS File Organization
**File:** `src/app/globals.css` (417 lines)

Single file mixing Tailwind config, custom component styles, animations, and Leaflet overrides.

**Fix:** Split into:
- `src/app/styles/base.css`
- `src/app/styles/components.css`
- `src/app/styles/animations.css`
- `src/app/styles/leaflet-overrides.css`

Import in `layout.js` instead of `globals.css`.

---

### 40. No Responsive Design Review
Desktop-first assumption. Some layouts may break on mobile: admin sidebar, data tables, multi-column forms.

**Fix:** Audit every page at 320px, 768px, 1024px, 1440px widths.

---

### 41. No Font Optimization
Using system fonts — fine for performance, but lacks brand identity.

**Fix:** Load a single variable font using `next/font/google`:
```javascript
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
```

---

## 🟡 MEDIUM PRIORITY — CODE QUALITY & TESTING

### 42. Zero Frontend Tests
No unit, integration, or E2E tests exist for the frontend.

**Fix:** Add:
- **Vitest** for unit testing stores and utilities
- **React Testing Library** for component tests
- **Playwright** for E2E flows (auth, service request, payment)

Minimum coverage target: auth flow, service request flow, payment flow.

---

### 43. No Backend Integration Tests
Only simple test scripts in the backend root, not proper integration tests.

**Fix:** Use `pytest` + `pytest-asyncio` with a test database fixture:
```
backend/tests/
├── conftest.py        # Test DB, client fixtures
├── test_auth.py
├── test_jobs.py
├── test_payments.py
├── test_matching.py
└── test_admin.py
```

---

### 44. No CI/CD Pipeline
No GitHub Actions, GitLab CI, or any automated pipeline.

**Fix:** Add a `.github/workflows/ci.yml` that:
1. Lints (ESLint, ruff)
2. Type-checks (pyright/tsc)
3. Runs unit tests (pytest, vitest)
4. Builds and pushes Docker images
5. Deploys to staging/production

---

### 45. No Code Formatting Standards
ESLint is configured but with minimal rules. No Prettier, no import ordering, no consistent code style.

**Fix:**
```json
{
  "scripts": {
    "format": "prettier --write .",
    "lint": "eslint . --fix"
  }
}
```
Add Husky + lint-staged for pre-commit formatting.

---

### 46. No Pre-commit Hooks
No Husky configuration to prevent bad code from being committed.

**Fix:**
```bash
npx husky init
npx husky add .husky/pre-commit "npx lint-staged"
```

---

## 🐳 MEDIUM PRIORITY — INFRASTRUCTURE & DEVOPS

### 47. No Container Restart Policies
All services in `docker-compose.yml` lack `restart` policies. A crash means downtime.

**Fix:**
```yaml
services:
  api:
    restart: unless-stopped
  worker:
    restart: unless-stopped
  frontend:
    restart: unless-stopped
```

---

### 48. No Health Checks for API/Worker
Only `db` has a health check. If `api` or `worker` crash, Docker won't restart them.

**Fix:**
```yaml
api:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

---

### 49. No `.dockerignore`
The Docker build context includes `node_modules`, `.git`, `.next`, `node_modules` — all of which are uploaded to the Docker daemon.

**Fix:** Create `.dockerignore`:
```
node_modules
.next
.git
*.md
data/
*.log
```

---

### 50. No Database Migration Strategy in Containers
The Docker entrypoint runs `bootstrap_db.py` which drops and recreates all tables. **Data loss on every deploy.**

**Fix:**
- Use `alembic upgrade head` as the startup command.
- Run seed data in a separate migration step.
- Never use `drop_all()` in any production code path.

---

### 51. No Environment-Specific Overrides
Staging and production share the same Docker Compose configuration. No way to customize ports, resource limits, or networking per environment.

**Fix:**
- `docker-compose.override.yml` for local dev
- `docker-compose.prod.yml` for production (no port exposure for db/redis, resource limits, replicas)

---

### 52. Port Conflicts with Host Services
PostgreSQL (5432) and Redis (6379) are exposed on the host. Conflicts with locally-running services.

**Fix:**
```yaml
# In docker-compose.override.yml (dev only)
services:
  db:
    ports:
      - "5433:5432"  # Use different host port
  redis:
    ports:
      - "6380:6379"
```

---

## 🟡 MEDIUM PRIORITY — MONITORING & OBSERVABILITY

### 53. No Structured Logging
Uses plain `logger.warning()` and `print()` calls. JSON-structured logs are needed for log aggregation.

**Fix:**
```python
import structlog
structlog.configure(processors=[structlog.processors.JSONRenderer()])
logger = structlog.get_logger()
```

---

### 54. No Error Tracking
No Sentry, Datadog, or similar error tracking.

**Fix:**
```bash
# Backend
pip install sentry-sdk
```
```python
# main.py
sentry_sdk.init(dsn=settings.sentry_dsn)
```
```bash
# Frontend
npm install @sentry/nextjs
```

---

### 55. No Performance Monitoring
No APM for API response times, DB query profiling, or frontend performance.

**Fix:**
- Backend: Add OpenTelemetry middleware or Sentry performance monitoring.
- Frontend: Add `web-vitals` tracking and Next.js Speed Insights.

---

### 56. Health Check Doesn't Verify Dependencies
**File:** `backend/backend/app/main.py`

```python
@app.get("/health")
async def health():
    return {"status": "ok"}
```

This always returns `ok` even if the database or Redis is unreachable.

**Fix:**
```python
@app.get("/health")
async def health(db: DbSession):
    # Check DB
    await db.execute(select(1))
    # Check Redis
    r = await get_redis()
    await r.ping()
    # Check Celery (optional)
    return {
        "status": "ok",
        "database": "ok",
        "redis": "ok",
    }
```

---

## 📂 FILE-SPECIFIC ISSUES

### 57. Login Log Endpoint Writes to Repo
**File:** `src/app/api/login-log/route.js`

Writes `email, role, timestamp` to `data/login_attempts.csv`. This CSV:
- Is NOT in `.gitignore`
- Accumulates user email addresses — a potential data breach
- Has no file rotation or size limits

**Fix:** Remove this endpoint, or gitignore `data/`, or better yet, log to the database.

---

### 58. Dispute Model — Field Mismatch
**File:** `backend/backend/app/models/dispute.py`

The model may use `notes` for the dispute description, but the admin route references `d.reason`. This will cause `AttributeError`.

**Fix:** Align the model fields with route expectations. Standardize on `reason` and `resolution`.

---

### 59. API Prefix Inconsistency
- Backend config: `api_prefix: str = "/api"`
- Dockerfile build arg: `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` (has `/v1`)
- `constants.js`: `http://127.0.0.1:8000/api` (no `/v1`)

**Fix:** Standardize on one prefix. `/api` is the backend prefix, routes inside have no `/v1` prefix.

---

### 60. `next.config.mjs` is Bare Minimum
```js
const nextConfig = { /* config options here */ };
export default nextConfig;
```

Missing critical configuration:
- `images.remotePatterns` for external images
- `headers` for security headers
- `experimental.optimizePackageImports` for bundle optimization
- `output` (e.g., `standalone` for Docker)

**Fix:** Add comprehensive Next.js configuration:
```js
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};
```

---

## 💡 FEATURE & ARCHITECTURE — ENHANCEMENT SUGGESTIONS

### 61. Add Email Service
Password reset codes are logged to console instead of emailed. Integrate with:
- SendGrid
- AWS SES
- Resend

### 62. Add SMS/WhatsApp Notifications
For SOS alerts and job assignments, SMS would be more immediate than in-app notifications. Use:
- Twilio
- Vonage
- MessageBird

### 63. Redis PubSub for Cross-Instance WebSocket
Current WebSocket location tracking breaks with multiple backend instances. Use Redis PubSub to broadcast location updates across all instances.

### 64. Database Connection Encryption
No TLS for PostgreSQL. For production:
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db?ssl=true
```

### 65. Implement Idempotency Keys
For payment endpoints. Prevents duplicate charges from network retries:
```python
@router.post("/payments/create")
async def payment_create(..., idempotency_key: str = Header(None)):
    # Check if key already processed
    # Return cached result if yes
```

### 66. Add API Versioning
Routes are inconsistently versioned. Standardize:
- `/api/v1/auth/login`
- `/api/v1/jobs/create`
- `/api/v1/payments/create`

### 67. Add Request ID Tracking
Missing `X-Request-ID` header. Makes cross-service debugging impossible.

### 68. Implement Caching Layer
Provider lists, pricing, and service types don't change often. Cache with Redis:
```python
@router.get("/providers/nearby")
async def nearby_providers(...):
    cache_key = f"nearby:{lat}:{lng}:{issue}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
    # ... compute ...
    await redis.setex(cache_key, 60, json.dumps(result))
```

---

## 📊 PRIORITY SUMMARY

| Priority | Count | Key Categories |
|----------|-------|----------------|
| 🔴 **Critical** | 10 | Secrets in git, JWT bypass, fails-open blacklist, mock payments, 7-day tokens, no audit trail, OAuth CSRF, no security headers, Redis no auth |
| 🟠 **High (Backend)** | 12 | No request limits, proxy-blind rate limit, stub payouts, N+1 queries, unthrottled endpoints, bootstrap drops data, test files in Docker |
| 🟠 **High (Frontend)** | 13 | No TypeScript, localStorage JWT, no error boundaries, no loading/error pages, no image optimization, no SEO, no a11y, no PWA |
| 🟡 **Medium (CSS/UX)** | 6 | No print styles, no reduced motion, theme flash, CSS organization, responsive gaps, font optimization |
| 🟡 **Medium (Testing/CI)** | 5 | Zero tests (frontend + backend), no CI/CD, no formatting standards, no pre-commit |
| 🟡 **Medium (Infra)** | 6 | No restart policies, no health checks, no .dockerignore, destructive DB migration, port conflicts |
| 🟡 **Medium (Monitoring)** | 4 | No structured logging, no error tracking, no APM, broken health check |
| 🟢 **Enhancement** | 8 | Email/SMS integration, Redis PubSub, idempotency keys, API versioning, caching, request IDs, DB TLS |

**Total: 68 issues identified.**

---

## QUICK WINS (Estimated Combined Effort)

These can be fixed in under 2 hours total:

1. ✅ Add `.dockerignore`
2. ✅ Add `restart: unless-stopped` to Docker Compose services
3. ✅ Add `not-found.js` and `error.js`
4. ✅ Add `loading.js` for branches
5. ✅ Standardize API URL prefix
6. ✅ Add print media queries
7. ✅ Move test files out of Docker context
8. ✅ Add `ACCESS_TOKEN_EXPIRE_MINUTES=15` to production env
9. ✅ Remove `data/` from repo or gitignore it
10. ✅ Add security headers to `next.config.mjs`
