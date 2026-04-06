# UAAD Frontend Development Specification

This document serves as the single source of truth for all frontend architecture patterns, conventions, and operational modes in the Universal Activity Aggregation & Distribution (UAAD) platform.

---

## 🏗️ 1. Tech Stack Overview
- **Framework**: React 18 + Vite + TypeScript.
- **Styling**: Tailwind CSS v4 (Native Vite plugin architecture, no PostCSS).
- **Animations**: Framer Motion (used for layout transitions and micro-interactions).
- **Routing**: React Router DOM v6.
- **Data Fetching**: Axios (with centralized interceptors).
- **i18n**: `i18next` & `react-i18next` (JSON-based dictionary).
- **Mocking**: Mock Service Worker (MSW).

---

## 🔐 2. Authentication & Data Flow

### 2.1 State Management (AuthContext)
We use a **custom React Context (`src/context/AuthContext.tsx`)** as the singular authority for user sessions, protecting against basic LocalStorage XSS vulnerabilities.
- **Rule**: Never raw-read `localStorage.getItem('token')` inside UI components.
- **Pattern**: 
  ```tsx
  import { useAuth } from '../context/AuthContext';
  const { token, isAuthenticated, login, logout } = useAuth();
  ```

### 2.2 Global Error Handling (Axios)
To avoid messy `try/catch` boilerplate, network errors are caught centrally in `src/api/axios.ts`.
- **401 Unauthorized**: Automatically caught by the global response interceptor. It dynamically wipes the token memory and triggers a force-redirect to `/login`.
- **Backend API Base**: Defaulted to `http://localhost:8080/api/v1`.

### 2.3 Route Protection
Protected pages (e.g., Dashboard, Activities) must not process auth logic explicitly. 
- **Rule**: Wrap protected route `elements` inside `<ProtectedRoute>` within `src/App.tsx`.
- The `ProtectedRoute` silently observes `AuthContext` and reroutes unauthenticated intrusions.

---

## 🎨 3. UI & Asset Guidelines

### 3.1 Styling Conventions (Tailwind v4)
- **Public Discovery Pages** (`/`, `/activities`): Use a light, content-distribution layout inspired by mainstream ticketing platforms. Prioritize editorial whitespace, clear card grouping, strong pink/red CTA accents, and desktop-first browsing patterns that gracefully collapse on mobile.
- **Authenticated Dashboard Pages** (`/app/*`, `/merchant/*`): Existing darker dashboard styling may remain, but new public discovery pages must not inherit the dark glassmorphism shell.
- **Class Grouping**: Organize classes functionally: `[Layout] [Flexbox/Grid] [Spacing] [Typography] [Colors] [Effects]`.
- **No Pixel Copying**: Reference large ticketing sites for information architecture, not for brand cloning.

### 3.2 Internationalization (i18n)
All user-facing text must be internationalized to support concurrent cross-region operations.
- **Locale Files**: Located in `src/i18n/locales/`. Update BOTH `en.json` and `zh.json` when adding new keys.
- **Fallback**: zh (Chinese) is the default runtime fallback.
- **Pattern**:
  ```tsx
  import { useTranslation } from 'react-i18next';
  const { t } = useTranslation();
  <h1>{t('dashboard.overview')}</h1>
  ```

---

## 🧪 4. Mocks & Simulation

### 4.1 Mock Service Worker (MSW)
We utilize `msw` to act as an interceptive proxy layer simulating backend endpoints before Go API finalization.
- **Environment Toggle**: Set `VITE_USE_MOCK=true` in `.env` to engage. If false or missing, the app hits the real network.
- **Passthrough Policy**: Important core endpoints (like `/api/v1/auth/*`) are configured as `bypass` inside `src/mocks/browser.ts`, meaning they will always hit the real backend regardless of the mock state.
- **Handler Definitions**: Split by domain under `src/mocks/handlers/`, then re-exported from a single index file.
- **Rule**: When mocking C-End flow (like Ticket Registration), always implement realistic `delay(ms)` and randomly return `202 Accepted` ("Queueing") to force UI loading states to display, assuring the frontend handles extreme concurrency grace gracefully.
- **Current Boundary**: Public homepage recommendation, notification badge, and banner data are allowed to be MSW-first. Activity list/search should prefer the documented `/activities` contract and only fall back to MSW when the backend capability is unavailable.

---

## 📁 5. Directory Structure
```
frontend/
├── src/
│   ├── api/          # Axios instances and endpoint definitions
│   │   └── endpoints/ # Domain API wrappers (activities/recommendations/notifications/...)
│   ├── components/   # Reusable UI (Buttons, LanguageToggle, ProtectedRoute)
│   ├── context/      # Global state providers (AuthContext)
│   ├── constants/    # Shared option lists and public-category metadata
│   ├── data/         # Static homepage fixtures (banner seeds, fallback sections)
│   ├── hooks/        # Route/query/data helper hooks
│   ├── i18n/         # i18next configs and locale JSONs
│   ├── layouts/      # Global wrappers (DashboardLayout)
│   ├── mocks/        # MSW handlers and browser setup
│   ├── pages/        # View-level route components (Home, Activities, Login, Dashboard)
│   ├── types/        # Shared TypeScript contracts
│   ├── App.tsx       # Core Router definitions
│   └── main.tsx      # React Bootstrapper
└── package.json      # Dependencies and scripts
```

## 6. Public Discovery Contract
- Public landing route is `/`, not `/app/overview`.
- Public category/search route remains `/activities`.
- `GET /activities` must be consumed through endpoint wrappers and support `keyword`, `region`, `artist`, `category`, `sort`, `page`, `page_size`.
- Sort options for the public search page are fixed to `relevance`, `hot`, `soon`, `recent`.
- Search state must be URL-synced so refresh/share/back-forward keep the current filters intact.
