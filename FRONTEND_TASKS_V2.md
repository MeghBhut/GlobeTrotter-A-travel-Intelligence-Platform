# Frontend Tasks — v2

Task list for the frontend, built against the existing backend.

**Status:** The backend (`backend/`, FastAPI + SQLite) is **done and running**. It
implements every endpoint in [`API_CONTRACT.md`](./API_CONTRACT.md). When the
"Live API" badge is green, the frontend is already talking to it. The gaps below
are all on the frontend side.

> Reference for every request/response shape: **[`API_CONTRACT.md`](./API_CONTRACT.md)**.
> Base URL when live: `http://localhost:8000`. Protected calls need the header
> `Authorization: Bearer <token>`.

---

## 1. Bug fixes (found during testing)

- [ ] **Backend badge race condition.** Clicking the status badge while the page is
  still loading throws `GlobeTrotterApp.pingBackend is not a function`. Cause: the
  inline `onclick` fires before `window.GlobeTrotterApp` is assigned. Fix: bind the
  handler with `addEventListener` after `DOMContentLoaded` (or guard the onclick).
- [ ] **Profile pill is dead.** The "M / Megh" pill in the header is a static `<div>`
  with no handler. Make it a real button that opens the profile/account menu (see §2).

---

## 2. Authentication & profile (the main v2 work)

Right now the frontend hardcodes a fake user "Megh" and has no auth screens, so the
backend's real login is unused. Build these:

- [ ] **Login screen** — email + password → `POST /api/login`. On success, store the
  returned `token` (localStorage) and use it as `Authorization: Bearer <token>` on
  all protected calls.
- [ ] **Signup screen** — name + email + password → `POST /api/signup`. Same
  token-storage flow. Include "Signup link" / "Forgot password" placeholder per the
  problem statement.
- [ ] **Basic validation + error display** — show the backend's `{ "detail": "..." }`
  message (e.g. "Invalid email or password", "Email already registered").
- [ ] **Real profile pill** — on load, call `GET /api/me` and show the actual user's
  name/initial instead of the hardcoded "Megh".
- [ ] **Logout** — clear the stored token and return to the login screen.
- [ ] **Auth gating** — if there is no valid token, the trip screens redirect to
  Login. (Reference/catalog screens can stay public.)
- [ ] **Profile / Settings screen** — editable name/email, saved-destinations list,
  language preference, delete-account placeholder (per problem statement screen #12).

---

## 3. Make "Live mode" use the full contract

Confirm every action routes to the backend (not just mock) when live, using the
existing dual-mode adapter in `js/api.js`:

- [ ] Trips: `GET/POST /api/trips`, `GET/PUT/DELETE /api/trips/{id}`
- [ ] Stops: `POST /api/trips/{id}/stops`, `PUT/DELETE /api/stops/{id}`
- [ ] Stop activities: `POST /api/stops/{id}/activities`, `DELETE /api/stop-activities/{id}`
- [ ] Budget: `GET /api/trips/{id}/budget` (display, don't recompute on the client)
- [ ] Graceful fallback: if a live call fails, show a clear toast (already partly done).

---

## 4. Feature screens (align to the problem statement)

These map to the original 12 screens; build/finish them in v2:

- [ ] **Itinerary builder** — add stops (city + dates), attach activities, reorder cities.
- [ ] **Itinerary view** — day-wise / grouped-by-city layout, list ⇄ calendar toggle.
- [ ] **Trip calendar / timeline** — calendar component, expandable day views.
- [ ] **Budget & cost breakdown** — pie/bar charts from `/api/trips/{id}/budget`,
  average cost per day, overbudget highlight. (Backend returns `breakdown` +
  `per_day` + `average_per_day` ready to chart.)
- [ ] **Public / shared itinerary page** — read-only view at a shareable route that
  reads `GET /api/public/{slug}`, with a "Copy Trip" button and social share.
  (Backend mints `share_slug` when a trip is set `is_public: true`.)

---

## 5. Polish (nice-to-have for v2)

- [ ] Loading states / skeletons on network calls.
- [ ] Empty states (no trips yet, no results).
- [ ] Cover photo: keep as a placeholder only — backend leaves `cover_photo_url` null,
  no upload in v2.
- [ ] Mobile layout pass.

---

## Endpoint quick-reference (all implemented server-side)

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/signup` · `POST /api/login` · `GET /api/me` |
| Reference | `GET /api/cities` · `GET /api/cities/{id}/activities` · `GET /api/cities/{id}/hotels` |
| Trips | `GET/POST /api/trips` · `GET/PUT/DELETE /api/trips/{id}` |
| Stops | `POST /api/trips/{id}/stops` · `PUT/DELETE /api/stops/{id}` |
| Activities | `POST /api/stops/{id}/activities` · `DELETE /api/stop-activities/{id}` |
| Budget | `GET /api/trips/{id}/budget` |
| Public | `GET /api/public/{slug}` |

## Definition of done (v2)
- A new user can **sign up, log out, and log back in** through the UI, hitting the real backend.
- The header shows the **real logged-in user** (from `/api/me`), not "Megh".
- Creating a trip while **live** persists it in the backend (survives a page refresh
  and is visible from `GET /api/trips`).
- The **public link** page renders a real shared trip from `/api/public/{slug}`.
- The badge no longer errors when clicked mid-load.
