# GlobeTrotter — Travel Intelligence Platform (v2)

A modern, responsive web application for exploring Indian destinations, configuring custom travel itineraries, calculating real-time travel budgets, and sharing travel plans. Fully integrated with **FastAPI Backend (API Contract v1 & v2)** and styled with the **Cyanotype Theme**.

---

## ✨ What's New in v2

### 1. 🔐 Complete Authentication & User Profiles
- **Real JWT Authentication**: Live signup (`POST /api/signup`), login (`POST /api/login`), and profile fetch (`GET /api/me`) with `Authorization: Bearer <token>` headers.
- **Dynamic Profile Pill**: Reflects the real logged-in user's initial and name in the header navbar.
- **Auth Gating**: Protected endpoints (My Trips, Save Trip) require authentication with automated login prompts.
- **User Settings & Profile View**: Manage personal details, display language (English, Hindi, Spanish), default currency, and color themes.

### 2. 🗓️ List ⇄ Calendar / Timeline Itinerary Views
- Switch between **List View** (morning, afternoon, evening slots) and **Timeline / Calendar View** (daily calendar distribution with date tags).
- One-click presets for Cultural, Budget Explorer, and Luxury Retreats.

### 3. 🌐 Public Shared Itineraries
- Toggle trip visibility (`PUT /api/trips/{id}` with `is_public: true`) to mint shareable slugs (`share_slug`).
- Public route `#public/{slug}` fetching read-only data via `GET /api/public/{slug}`.
- Social sharing shortcuts (WhatsApp, Copy Link) and "Copy to My Account" feature.

### 4. 🎨 Cyanotype Design System
- Strict adherence to Cyanotype specifications:
  - **Cyan (`--cyan`)**: Links, navigation, primary actions, category chips, eyebrow tags.
  - **Warm Gold (`--sun`)**: Prices, star ratings (★), and sun graphics.
  - **Fonts**: *Bricolage Grotesque* (Headings), *Hanken Grotesk* (Body/UI), *Spline Sans Mono* (Prices/Meta).
  - **No-Flash Theme Toggle**: Instant light/dark mode switching persisted in `localStorage`.

---

## 🚀 API Endpoint Reference

| Category | Endpoint | Action |
|---|---|---|
| **Auth** | `POST /api/signup` | Register new user & issue JWT |
| **Auth** | `POST /api/login` | Authenticate credentials & issue JWT |
| **Auth** | `GET /api/me` | Fetch authenticated user profile |
| **Reference** | `GET /api/cities` | Search 10 Indian hubs |
| **Reference** | `GET /api/cities/{id}/activities` | 100 activities across destinations |
| **Reference** | `GET /api/cities/{id}/hotels` | 100 hotels sorted low to high |
| **Trips** | `GET /api/trips` | List all trips owned by user |
| **Trips** | `POST /api/trips` | Create new multi-stop trip |
| **Trips** | `GET /api/trips/{id}` | Get full trip details with stops |
| **Trips** | `PUT /api/trips/{id}` | Update trip title, dates, or visibility |
| **Trips** | `DELETE /api/trips/{id}` | Delete trip |
| **Stops** | `POST /api/trips/{id}/stops` | Add city stop to itinerary |
| **Stops** | `PUT /api/stops/{id}` | Update stop dates and order |
| **Stops** | `DELETE /api/stops/{id}` | Remove stop from itinerary |
| **Activities** | `POST /api/stops/{id}/activities` | Book experience inside stop |
| **Activities** | `DELETE /api/stop-activities/{id}` | Remove experience from stop |
| **Budget** | `GET /api/trips/{id}/budget` | Compute trip budget & daily chart |
| **Public** | `GET /api/public/{slug}` | Public read-only trip viewer |

---

## ⚡ How to Run

### Standalone (Browser / Mock Mode)
Double-click `index.html` or run:
```bash
npx serve .
# or
python -m http.server 3000
```

### With Live Backend (FastAPI + SQLite)
1. In a terminal, navigate to `backend/`:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
2. Open `index.html` in your browser.
3. The **API Status Badge** in the top navbar will automatically show **Live API (localhost:8000)** in green.
