# GlobeTrotter — API Contract (v1)

**For Frontend and Backend Developers.** These are the REST API requests and response schemas for GlobeTrotter.
Build static/mock JSON in **exactly these shapes** and the frontend will connect to the live backend seamlessly.

**Base URL (local dev):** `http://localhost:8000`  
**Format:** JSON over HTTP. Auth endpoints return a JWT `token`; send it on protected calls as:  
`Authorization: Bearer <token>`

---

## Core Data Models

### 1. City
```json
{
  "id": 1,
  "name": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "region": "West",
  "tagline": "The City of Dreams, Colonial Heritage & Coastal Glamour",
  "hero_image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"
}
```

### 2. Activity
```json
{
  "id": 101,
  "city_id": 1,
  "name": "Gateway of India & Taj Palace Walk",
  "price_per_person": 0,
  "category": "Heritage",
  "duration": "1.5 hrs",
  "highlight": true,
  "description": "Marvel at the monumental basalt arch overlooking Mumbai harbour and the majestic facade of the 1903 Taj Mahal Palace."
}
```

### 3. Hotel
```json
{
  "id": 1001,
  "city_id": 1,
  "name": "Abode Bombay",
  "tier": "Boutique",
  "price_per_night": 3500,
  "rating": 4.5,
  "location": "Colaba",
  "amenities": ["Free Wi-Fi", "Vintage Decor", "Artisan Breakfast"]
}
```

---

## 1. Reference Data (10 Seed Destinations Catalog)

### `GET /api/cities`
Returns all 10 destinations. Supports optional `?search=` and `?region=` query parameters.
```json
[
  { "id": 1,  "name": "Mumbai",    "state": "Maharashtra",   "country": "India", "region": "West" },
  { "id": 2,  "name": "New Delhi", "state": "Delhi NCR",      "country": "India", "region": "North" },
  { "id": 3,  "name": "Jaipur",    "state": "Rajasthan",     "country": "India", "region": "North" },
  { "id": 4,  "name": "Bengaluru", "state": "Karnataka",     "country": "India", "region": "South" },
  { "id": 5,  "name": "Varanasi",  "state": "Uttar Pradesh", "country": "India", "region": "North" },
  { "id": 6,  "name": "Udaipur",   "state": "Rajasthan",     "country": "India", "region": "North" },
  { "id": 7,  "name": "Kolkata",   "state": "West Bengal",   "country": "India", "region": "East" },
  { "id": 8,  "name": "Kochi",     "state": "Kerala",        "country": "India", "region": "South" },
  { "id": 9,  "name": "Hyderabad", "state": "Telangana",     "country": "India", "region": "South" },
  { "id": 10, "name": "Goa",       "state": "Goa",           "country": "India", "region": "West" }
]
```

### `GET /api/cities/{id}/activities`
Returns the 10 activities for that city. Example — `GET /api/cities/1/activities` (Mumbai):
```json
[
  { "id": 101, "city_id": 1, "name": "Gateway of India & Taj Palace Walk", "price_per_person": 0, "category": "Heritage" },
  { "id": 102, "city_id": 1, "name": "Marine Drive Sunset Promenade Stroll", "price_per_person": 0, "category": "Sightseeing" },
  { "id": 103, "city_id": 1, "name": "Elephanta Caves Ferry & Island Tour", "price_per_person": 260, "category": "Heritage" },
  { "id": 104, "city_id": 1, "name": "CSMT Station Heritage Walk", "price_per_person": 0, "category": "Heritage" },
  { "id": 105, "city_id": 1, "name": "Dharavi Guided Tour", "price_per_person": 750, "category": "Culture" },
  { "id": 106, "city_id": 1, "name": "Colaba Causeway Shopping & Cafe Trail", "price_per_person": 500, "category": "Shopping" },
  { "id": 107, "city_id": 1, "name": "Bandra Bandstand & Celebrity Homes Walk", "price_per_person": 0, "category": "Sightseeing" },
  { "id": 108, "city_id": 1, "name": "Juhu Beach Street Food Experience", "price_per_person": 300, "category": "Food" },
  { "id": 109, "city_id": 1, "name": "Sanjay Gandhi National Park & Kanheri Caves", "price_per_person": 150, "category": "Nature" },
  { "id": 110, "city_id": 1, "name": "Crawford Market & Spice Trail Walk", "price_per_person": 0, "category": "Food" }
]
```

### `GET /api/cities/{id}/hotels`
Returns the 10 hotels for that city sorted from low to high price. Example — `GET /api/cities/1/hotels` (Mumbai):
```json
[
  { "id": 1001, "city_id": 1, "name": "Abode Bombay", "tier": "Boutique", "price_per_night": 3500 },
  { "id": 1002, "city_id": 1, "name": "Gordon House Hotel", "tier": "Mid-Range", "price_per_night": 5500 },
  { "id": 1003, "city_id": 1, "name": "Hotel Marine Plaza", "tier": "4-Star", "price_per_night": 7500 },
  { "id": 1004, "city_id": 1, "name": "Soho House Mumbai", "tier": "Boutique Lux", "price_per_night": 12000 },
  { "id": 1005, "city_id": 1, "name": "ITC Grand Central", "tier": "5-Star Lux", "price_per_night": 13500 },
  { "id": 1006, "city_id": 1, "name": "Trident Nariman Point", "tier": "5-Star Lux", "price_per_night": 15000 },
  { "id": 1007, "city_id": 1, "name": "JW Marriott Mumbai Juhu", "tier": "5-Star Lux", "price_per_night": 18000 },
  { "id": 1008, "city_id": 1, "name": "The St. Regis Mumbai", "tier": "Ultra Lux", "price_per_night": 21000 },
  { "id": 1009, "city_id": 1, "name": "The Oberoi Mumbai", "tier": "Ultra Lux", "price_per_night": 24000 },
  { "id": 1010, "city_id": 1, "name": "The Taj Mahal Palace", "tier": "Iconic Lux", "price_per_night": 28000 }
]
```

---

## 2. Authentication

### `POST /api/signup`
Request:
```json
{ "name": "Megh", "email": "megh@example.com", "password": "secret123" }
```
Response `201`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "name": "Megh", "email": "megh@example.com" }
}
```

### `POST /api/login`
Request:
```json
{ "email": "megh@example.com", "password": "secret123" }
```
Response `200`: same shape as signup (`token` + `user`).

### `GET /api/me` (Protected)
Returns the logged-in user profile:
```json
{ "id": 1, "name": "Megh", "email": "megh@example.com" }
```

Error response (HTTP 400 / 401 / 404):
```json
{ "detail": "Invalid email or password" }
```

---

## 3. Trips Management (Protected)

### Trip Object Schema
```json
{
  "id": 1,
  "name": "Golden Triangle Explorer",
  "description": "Delhi & Jaipur cultural heritage tour",
  "start_date": "2026-09-01",
  "end_date": "2026-09-07",
  "num_people": 2,
  "is_public": false,
  "share_slug": "golden-triangle-789a",
  "cover_photo_url": null,
  "destination_count": 2,
  "stops": [
    {
      "id": 10,
      "trip_id": 1,
      "city": { "id": 2, "name": "New Delhi", "state": "Delhi NCR", "country": "India" },
      "start_date": "2026-09-01",
      "end_date": "2026-09-04",
      "order_index": 0,
      "hotel": { "id": 2003, "name": "The Claridges New Delhi", "tier": "Heritage 5*", "price_per_night": 9500 },
      "activities": [
        { "id": 55, "activity_id": 201, "name": "Red Fort & Chandni Chowk Rikshaw Tour", "price_per_person": 350, "num_people": 2 },
        { "id": 56, "activity_id": 207, "name": "Old Delhi Food Tasting Experience", "price_per_person": 600, "num_people": 2 }
      ]
    }
  ]
}
```

### `GET /api/trips`
Returns all trips created by the logged-in user.

### `POST /api/trips`
Request:
```json
{
  "name": "Golden Triangle Explorer",
  "description": "Delhi & Jaipur cultural tour",
  "start_date": "2026-09-01",
  "end_date": "2026-09-07",
  "num_people": 2,
  "is_public": false
}
```
Response `201`: the created Trip object.

### `GET /api/trips/{id}`
Returns full trip details including nested stops, assigned hotels, and activities.

### `PUT /api/trips/{id}`
Request: update any of `name`, `description`, `start_date`, `end_date`, `num_people`, `is_public`.
Response `200`: updated Trip object.

### `DELETE /api/trips/{id}`
Response `204`: No content.

---

## 4. Stops Management (Cities inside a trip)

### `POST /api/trips/{id}/stops`
Request:
```json
{
  "city_id": 3,
  "start_date": "2026-09-04",
  "end_date": "2026-09-07",
  "hotel_id": 3004
}
```
Response `201`: created Stop object.

### `PUT /api/stops/{id}`
Request: update dates, `hotel_id`, or `order_index`.
Response `200`: updated Stop object.

### `DELETE /api/stops/{id}`
Response `204`: No content.

---

## 5. Activities inside a Stop

### `POST /api/stops/{id}/activities`
Request:
```json
{
  "activity_id": 301,
  "num_people": 2
}
```
Response `201`: added activity object.

### `DELETE /api/stop-activities/{id}`
Response `204`: No content.

---

## 6. Budget & Cost Breakdown

### `GET /api/trips/{id}/budget`
Returns aggregated financial calculation computed from the trip's stops, hotels, and activities.
```json
{
  "trip_id": 1,
  "currency": "INR",
  "total": 43900,
  "breakdown": {
    "hotels": 28500,
    "activities": 3800,
    "meals": 7000,
    "transport": 4600
  },
  "per_day": [
    { "date": "2026-09-01", "amount": 10450 },
    { "date": "2026-09-02", "amount": 10100 },
    { "date": "2026-09-03", "amount": 9500 }
  ],
  "average_per_day": 7316
}
```

---

## 7. Public Itinerary Sharing

### `GET /api/public/{share_slug}` (No Auth required)
Returns the public read-only itinerary view for any trip with `is_public: true`.

---

# ==================== v2 ADDITIONS (Multi-city travel, hotels, full budget) ====================

v2 extends the backend so trips can span **multiple cities with travel between them**,
attach **hotels**, and produce a **complete budget** (activities + hotels + transport + meals).
All v1 endpoints are unchanged; the additions below are new or extend existing shapes.

## v2.1 Trip fields — new optional field

`POST /api/trips` and `PUT /api/trips/{id}` now accept **`daily_meal_estimate`** (integer, INR/day, default 0).
It appears on every trip object and drives the `meals` budget line.

```json
{ "name": "Rajasthan Loop", "start_date": "2026-09-01", "end_date": "2026-09-05",
  "description": "multi-city", "daily_meal_estimate": 500 }
```

## v2.2 Multi-city itinerary

Already supported: a trip has many **stops** (`POST /api/trips/{id}/stops`), each with a
city and dates, ordered by `order_index`. Reorder with `PUT /api/stops/{id}`
(send `order_index`). `GET /api/trips/{id}` returns all stops in order.

## v2.3 Hotels inside a stop

### `POST /api/stops/{stop_id}/hotels`
```json
{ "hotel_id": 3001, "nights": 2 }
```
`nights` is optional — if omitted, the backend uses the stop's own night count
(from its start/end dates). Response `201`:
```json
{ "id": 7, "hotel_id": 3001, "name": "Hotel Pearl Palace", "tier": "Heritage Bud.",
  "price_per_night": 1800, "nights": 2 }
```

### `DELETE /api/stop-hotels/{item_id}` → `204`

Each stop object (inside `GET /api/trips/{id}`) now also carries a `hotels` array in
the same shape as above, alongside its existing `activities` array.

## v2.4 Travel legs (city → city)

A leg is the journey **between two cities** — this is the "travelling" part of a plan.

### `POST /api/trips/{trip_id}/legs`
```json
{ "from_city_id": 3, "to_city_id": 6, "mode": "car", "cost": 1500,
  "depart_date": "2026-09-03", "duration_hours": 6 }
```
`mode` is a free string (`flight` / `train` / `bus` / `car` / `ferry`). Response `201`:
```json
{
  "id": 2,
  "from_city": { "id": 3, "name": "Jaipur", "state": "Rajasthan", "country": "India" },
  "to_city":   { "id": 6, "name": "Udaipur", "state": "Rajasthan", "country": "India" },
  "mode": "car", "cost": 1500, "depart_date": "2026-09-03",
  "duration_hours": 6, "order_index": 0
}
```

### `PUT /api/legs/{leg_id}` → update any field (mode, cost, dates, cities, order_index). Returns the leg.
### `DELETE /api/legs/{leg_id}` → `204`

`GET /api/trips/{id}` and `GET /api/public/{slug}` now include a **`legs`** array
(list of the objects above) next to `stops`.

## v2.5 Full budget

`GET /api/trips/{id}/budget` now fills in every line:

```json
{
  "trip_id": 12,
  "currency": "INR",
  "total": 15800,
  "breakdown": {
    "activities": 3200,
    "hotels": 8600,
    "transport": 1500,
    "meals": 2500
  },
  "per_day": [ { "date": "2026-09-01", "amount": 3350 } ],
  "average_per_day": 3160
}
```
- **activities** = Σ (activity price_per_person × num_people) across all stops
- **hotels** = Σ (hotel price_per_night × nights) across all stops
- **transport** = Σ (leg cost) across all legs
- **meals** = `daily_meal_estimate` × number of trip days

## v2.6 New/updated endpoint summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/stops/{stop_id}/hotels` | Attach a hotel (with nights) to a stop |
| `DELETE` | `/api/stop-hotels/{item_id}` | Remove a hotel from a stop |
| `POST` | `/api/trips/{trip_id}/legs` | Add a travel leg between two cities |
| `PUT` | `/api/legs/{leg_id}` | Update a travel leg |
| `DELETE` | `/api/legs/{leg_id}` | Remove a travel leg |
| `POST`/`PUT` | `/api/trips` · `/api/trips/{id}` | Now accept `daily_meal_estimate` |

---

# ==================== v3 ADDITIONS (Timeline status, Friends, Visibility, Community) ====================

v3 adds trip **status** for the timeline, three-level **visibility**, a **friends**
system, a **community** feed of public trips, and **trip cloning**. All v1/v2
endpoints are unchanged. Trip objects now also include: `visibility`
("private" | "friends" | "public"), `status` ("upcoming" | "ongoing" | "completed"),
and `owner` ({ id, name }).

## v3.1 Timeline status
Every trip object now has a computed **`status`** derived from today's date vs the
trip's `start_date`/`end_date`:
- `upcoming` — starts in the future (or no dates yet)
- `ongoing` — today is within the trip
- `completed` — the trip has ended

Filter the user's trips for timeline tabs:
- `GET /api/trips?status=upcoming` · `?status=ongoing` · `?status=completed`
  (omit `status` for all). Sorted by start date.

## v3.2 Visibility (private / friends / public)
`POST /api/trips` and `PUT /api/trips/{id}` accept **`visibility`**:
```json
{ "visibility": "public" }   // "private" | "friends" | "public"
```
- `private` — only you
- `friends` — you and your accepted friends
- `public` — anyone (appears in the community feed; a `share_slug` is minted)

The legacy `is_public` boolean still works (`true` → public, `false` → private) and
is always returned in sync with `visibility`.

## v3.3 Friends

| Method | Endpoint | Body / Notes |
|--------|----------|--------------|
| `GET` | `/api/users/search?q=bob` | Find users by name/email → `[{ id, name, email }]` |
| `POST` | `/api/friends/request` | `{ "user_id": 5 }` → sends a request |
| `GET` | `/api/friends/requests` | Incoming pending requests addressed to me |
| `POST` | `/api/friends/{id}/accept` | Accept a pending request (by friendship id) |
| `DELETE` | `/api/friends/{id}` | Decline / cancel / unfriend (same endpoint) |
| `GET` | `/api/friends` | My accepted friends |
| `GET` | `/api/users/{user_id}/trips` | A user's trips **visible to me** (friend → friends+public; else public only) |

Friendship object shape:
```json
{ "id": 12, "user": { "id": 5, "name": "Bob" }, "status": "pending", "direction": "incoming" }
```
- `user` = the *other* person. `direction` = `incoming` (they asked me) or `outgoing` (I asked them). `status` = `pending` | `accepted`.

## v3.4 Community feed
### `GET /api/community/trips?limit=30&offset=0`
All **public** trips, newest first — each carries its `owner`:
```json
[
  { "id": 8, "name": "Goa Public", "visibility": "public", "status": "upcoming",
    "owner": { "id": 9, "name": "Alice" }, "share_slug": "aB3xY...",
    "start_date": "2026-09-21", "end_date": "2026-09-24", "destination_count": 1, "...": "..." }
]
```

## v3.5 Clone a trip (Copy Trip)
### `POST /api/trips/{trip_id}/clone`
Copies a trip you can see — **yours, a public one, or a friend's friends-only one** —
into your account (deep-copies stops, activities, hotels, and travel legs). The copy
is `private`, titled `"Copy of <name>"`, with no share slug.
Response `201`:
```json
{ "id": 42, "name": "Copy of Goa Public", "message": "Trip cloned to your account" }
```

## v3.6 New endpoint summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/trips?status=` | Timeline filter (upcoming/ongoing/completed) |
| `GET` | `/api/users/search?q=` | Find users to friend |
| `POST` | `/api/friends/request` | Send friend request |
| `GET` | `/api/friends/requests` | Incoming pending requests |
| `POST` | `/api/friends/{id}/accept` | Accept request |
| `DELETE` | `/api/friends/{id}` | Decline / cancel / unfriend |
| `GET` | `/api/friends` | List friends |
| `GET` | `/api/users/{id}/trips` | A user's trips visible to me |
| `GET` | `/api/community/trips` | Public trips feed (with owner) |
| `POST` | `/api/trips/{id}/clone` | Copy a trip into my account |
| `POST`/`PUT` | `/api/trips` · `/api/trips/{id}` | Now accept `visibility` |

---

# ==================== v4 ADDITION (Calendar view — dates + daily schedule) ====================

Adds real per-date scheduling so a calendar can show *what happens on each date*.

## v4.1 Schedule an activity on a date/slot
Stop-activities now carry an optional **`scheduled_date`** and **`slot`**
("morning" | "afternoon" | "evening"). Set them when adding:
```json
POST /api/stops/{stop_id}/activities
{ "activity_id": 103, "num_people": 2, "scheduled_date": "2026-09-21", "slot": "morning" }
```
…or change them later:
```json
PUT /api/stop-activities/{item_id}
{ "scheduled_date": "2026-09-22", "slot": "afternoon" }   // any subset; also num_people
```
Every stop-activity object now includes `scheduled_date` and `slot` (may be null).

## v4.2 Calendar view
### `GET /api/trips/{trip_id}/calendar`
Returns the trip's activities grouped by real date — one entry per day across the
trip span. Works for any trip you can view (yours, public, or a friend's).
```json
{
  "trip_id": 12,
  "start_date": "2026-09-21",
  "end_date": "2026-09-23",
  "days": [
    {
      "date": "2026-09-21",
      "city": "Mumbai",
      "items": [
        { "stop_activity_id": 5, "activity_id": 103, "name": "Elephanta Caves Ferry & Island Tour",
          "city": "Mumbai", "slot": "morning", "price_per_person": 260, "num_people": 2 }
      ]
    },
    { "date": "2026-09-22", "city": "Mumbai", "items": [] }
  ]
}
```
- Activities with no `scheduled_date` default to their stop's start date, so the
  calendar is never empty.
- `city` per day = the stop whose date range covers that day.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/trips/{id}/calendar` | Activities grouped by date (for the calendar view) |
| `PUT` | `/api/stop-activities/{id}` | Reschedule an activity (date / slot / num_people) |
| `POST` | `/api/stops/{id}/activities` | Now accepts `scheduled_date` + `slot` |

---

# ==================== v5 ADDITIONS (Auto travel fares, travellers, home city, single-origin run) ====================

## v5.1 Trip travellers + home (origin) city
`POST /api/trips` and `PUT /api/trips/{id}` accept:
- **`travelers`** (int, default 1) — number of people on the trip; drives per-person fares.
- **`origin_city_id`** (int, optional) — the home city you start from (one of the 10 city ids).

Trip objects now return `travelers`, `origin_city_id`, and (on detail) an `origin_city` object.
City objects now include `latitude` / `longitude`.

## v5.2 Travel fare estimate
### `GET /api/estimate/travel?from_city_id=1&to_city_id=2&mode=flight&travelers=3`
Estimates fare + duration from the great-circle distance between the two cities.
`mode` = flight | train | bus | car | ferry.
```json
{
  "from_city_id": 1, "to_city_id": 2, "mode": "flight", "travelers": 3,
  "distance_km": 1148, "duration_hours": 4,
  "fare_per_person": 8963, "total_fare": 26889
}
```
- `total_fare` = `fare_per_person` × `travelers` (car is per-vehicle, not multiplied).
- Use this to prefill the "add travel leg" form (e.g. home → first city, or city → city).

## v5.3 Legs auto-estimate their fare
`POST /api/trips/{id}/legs` — if you **omit `cost`** and/or **`duration_hours`**, the
backend fills them in automatically from the estimate above, using the trip's
`travelers`. Send explicit values to override. Transport is already summed into the
budget (`breakdown.transport`) and the total.

## v5.4 Single-origin run (no IP, evaluator-friendly)
The backend now **serves the frontend too**. To run the whole app:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app        # or: uvicorn app.main:app --host 0.0.0.0  (for LAN)
```
Then open **http://localhost:8000** — the app loads and talks to its own API on the
same origin. No separate frontend server, no IP to configure. Another PC on the LAN
opens `http://<your-ip>:8000` and it just works (the frontend targets whatever host
served it — never a hardcoded IP). `/docs` still serves the API docs.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/estimate/travel` | Fare + duration estimate between two cities |
| `POST` | `/api/trips/{id}/legs` | Omit `cost`/`duration_hours` to auto-estimate |
| `POST`/`PUT` | `/api/trips` · `/api/trips/{id}` | Now accept `travelers`, `origin_city_id` |
