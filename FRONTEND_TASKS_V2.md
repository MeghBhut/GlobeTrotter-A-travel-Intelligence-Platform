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

## 1. Auth bug fixes (found in live testing)

> **Verified:** the backend and the signup/login handlers themselves WORK — with the
> backend live, signup creates real users, login authenticates, and wrong-password
> shows the right error. The problems below are why it *looks* broken in the browser.

- [ ] **Validate the token on load (biggest one).** `isAuthenticated()` just returns
  `!!this.token`, so if *any* token is left in `localStorage` (from an old session or
  an expired login) the app thinks you're already logged in, shows a default identity,
  and the login/signup modal **never opens** — which reads as "login not happening /
  defaults to a user." Fix: on startup, if a token exists, call `GET /api/me`; if it
  fails or returns 401, clear the token + stored user and treat the user as logged out.
- [ ] **Remove the hardcoded "Megh" placeholder.** The profile pill's initial HTML
  shows "Megh" before any real user loads. Show a neutral "Sign in" / guest state
  until `GET /api/me` returns a real user, so it isn't mistaken for a logged-in user.
- [ ] **Backend badge race condition.** Clicking the status badge while the page is
  still loading throws `GlobeTrotterApp.pingBackend is not a function` (inline
  `onclick` fires before `window.GlobeTrotterApp` exists). Fix: bind it with
  `addEventListener` after `DOMContentLoaded` instead of the inline `onclick`.
- [ ] **Make mock vs live obvious.** When the backend is offline (`isLiveBackend =
  false`), signup/login silently create **fake, local-only** users — so it "works"
  but nothing is really saved and it can't be shared. Show a visible "Offline / mock
  mode" indicator, or require the live backend for real auth, so this isn't mistaken
  for a real account.
- [ ] **Logout clears everything.** Ensure logout removes the token AND the stored
  user from `localStorage`, then returns to a logged-out state.

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

---

## 6. Multi-city travel & full budget (backend is READY — build the UI)

The backend now fully supports multi-city trips with travel and complete costs.
No more backend work needed for these — wire the UI to the endpoints (see
`API_CONTRACT.md` → "v2 ADDITIONS"):

- [ ] **Multi-city planner.** Let a trip hold several cities: use
  `POST /api/trips/{id}/stops` per city, show them in order, and allow reorder via
  `PUT /api/stops/{id}` (`order_index`). Stop treating the planner as single-city.
- [ ] **Travelling between cities.** Add a "travel leg" UI between stops:
  `POST /api/trips/{id}/legs` with `from_city_id`, `to_city_id`, `mode`
  (flight/train/bus/car/ferry), `cost`, `depart_date`, `duration_hours`.
- [ ] **Hotels per stop.** `POST /api/stops/{stop_id}/hotels` (`hotel_id`, optional
  `nights`); list from `GET /api/cities/{id}/hotels`.
- [ ] **Meals.** Add a `daily_meal_estimate` field on the trip form
  (`POST`/`PUT /api/trips`).
- [ ] **Full budget breakdown.** `GET /api/trips/{id}/budget` now returns
  `activities + hotels + transport + meals`, plus a `per_day` series — chart all four.
- [ ] **Compare destinations — make the cities selectable.** The compare view has
  fixed cities; add a city picker backed by `GET /api/cities` and pull each city's
  `activities`/`hotels` for side-by-side comparison. (No backend change needed.)

---

## 7. Timeline, Friends & Community (backend READY — build the UI)

Backend is done and tested for all of these — see `API_CONTRACT.md` → "v3 ADDITIONS".

- [ ] **Timeline with tabs.** Add Upcoming / Ongoing / Completed tabs on the trips
  timeline. Each trip already returns a `status` field; or fetch per tab with
  `GET /api/trips?status=upcoming|ongoing|completed`.
- [ ] **Visibility selector on a trip.** Replace the public/private toggle with three
  choices — Private / Friends only / Public — via `PUT /api/trips/{id}` with
  `visibility`. Show the resulting share link when Public.
- [ ] **Friends tab.**
  - Search users: `GET /api/users/search?q=`
  - Send request: `POST /api/friends/request { user_id }`
  - Incoming requests + Accept: `GET /api/friends/requests`, `POST /api/friends/{id}/accept`
  - Friends list + unfriend: `GET /api/friends`, `DELETE /api/friends/{id}`
  - View a friend's trips: `GET /api/users/{id}/trips`
- [ ] **Community page.** Grid of all public trips via `GET /api/community/trips`,
  each showing the `owner` name. Add a **Copy Trip** button → `POST /api/trips/{id}/clone`,
  then take the user to the new copy in their account.
- [ ] **"Clone/Copy this trip"** on the public shared page and on friends' trips too
  (same clone endpoint).
