# GlobeTrotter — API Contract (v1 prototype)

**For the frontend developer.** These are the requests the backend will answer.
Build static/mock JSON in **exactly these shapes** and your screens will drop
straight onto the real backend later with no changes.

**Base URL (local dev):** `http://localhost:8000`
**Format:** JSON over HTTP. Auth endpoints return a `token`; send it back on
protected calls as header `Authorization: Bearer <token>`.

Scope note for v1: **public trips only** (no friends), **no photo upload**
(`cover_photo_url` may be null).

---

## Core data objects (the shapes everything reuses)

### City
```json
{ "id": 1, "name": "Mumbai", "state": "Maharashtra", "country": "India" }
```

### Activity
```json
{ "id": 101, "city_id": 1, "name": "Gateway of India & Taj Palace Walk", "price_per_person": 0 }
```

### Hotel
```json
{ "id": 1001, "city_id": 1, "name": "Abode Bombay", "tier": "Boutique", "price_per_night": 3500 }
```

---

## 1. Reference data (from the seed PDF) — build static JSON for these first

These never change per-user, so they are the easiest to mock.

### `GET /api/cities`
Returns all 10 cities.
```json
[
  { "id": 1,  "name": "Mumbai",    "state": "Maharashtra",   "country": "India" },
  { "id": 2,  "name": "New Delhi", "state": "Delhi",         "country": "India" },
  { "id": 3,  "name": "Jaipur",    "state": "Rajasthan",     "country": "India" },
  { "id": 4,  "name": "Bengaluru", "state": "Karnataka",     "country": "India" },
  { "id": 5,  "name": "Varanasi",  "state": "Uttar Pradesh", "country": "India" },
  { "id": 6,  "name": "Udaipur",   "state": "Rajasthan",     "country": "India" },
  { "id": 7,  "name": "Kolkata",   "state": "West Bengal",   "country": "India" },
  { "id": 8,  "name": "Kochi",     "state": "Kerala",        "country": "India" },
  { "id": 9,  "name": "Hyderabad", "state": "Telangana",     "country": "India" },
  { "id": 10, "name": "Goa",       "state": "Goa",           "country": "India" }
]
```

### `GET /api/cities/{id}/activities`
Returns the 10 activities for that city. Example — `GET /api/cities/1/activities` (Mumbai):
```json
[
  { "id": 101, "city_id": 1, "name": "Gateway of India & Taj Palace Walk",        "price_per_person": 0   },
  { "id": 102, "city_id": 1, "name": "Marine Drive Sunset Promenade Stroll",      "price_per_person": 0   },
  { "id": 103, "city_id": 1, "name": "Elephanta Caves Ferry & Island Tour",       "price_per_person": 260 },
  { "id": 104, "city_id": 1, "name": "CSMT Station Heritage Walk",                "price_per_person": 0   },
  { "id": 105, "city_id": 1, "name": "Dharavi Guided Tour",                       "price_per_person": 750 },
  { "id": 106, "city_id": 1, "name": "Colaba Causeway Shopping & Cafe Trail",     "price_per_person": 500 },
  { "id": 107, "city_id": 1, "name": "Bandra Bandstand & Celebrity Homes Walk",   "price_per_person": 0   },
  { "id": 108, "city_id": 1, "name": "Juhu Beach Street Food Experience",         "price_per_person": 300 },
  { "id": 109, "city_id": 1, "name": "Sanjay Gandhi National Park & Kanheri Caves","price_per_person": 150 },
  { "id": 110, "city_id": 1, "name": "Crawford Market & Spice Trail Walk",        "price_per_person": 0   }
]
```
*All 10 cities follow this identical shape. The backend team will supply the full
seed JSON for every city so you don't transcribe by hand.*

### `GET /api/cities/{id}/hotels`
Returns the 10 hotels for that city (already sorted low→high). Example — `GET /api/cities/1/hotels` (Mumbai):
```json
[
  { "id": 1001, "city_id": 1, "name": "Abode Bombay",          "tier": "Boutique",   "price_per_night": 3500  },
  { "id": 1002, "city_id": 1, "name": "Gordon House Hotel",    "tier": "Mid-Range",  "price_per_night": 5500  },
  { "id": 1003, "city_id": 1, "name": "Hotel Marine Plaza",    "tier": "4-Star",     "price_per_night": 7500  },
  { "id": 1004, "city_id": 1, "name": "Soho House Mumbai",     "tier": "Boutique Lux","price_per_night": 12000 },
  { "id": 1005, "city_id": 1, "name": "ITC Grand Central",     "tier": "5-Star Lux", "price_per_night": 13500 },
  { "id": 1006, "city_id": 1, "name": "Trident Nariman Point", "tier": "5-Star Lux", "price_per_night": 15000 },
  { "id": 1007, "city_id": 1, "name": "JW Marriott Mumbai Juhu","tier": "5-Star Lux","price_per_night": 18000 },
  { "id": 1008, "city_id": 1, "name": "The St. Regis Mumbai",  "tier": "Ultra Lux",  "price_per_night": 21000 },
  { "id": 1009, "city_id": 1, "name": "The Oberoi Mumbai",     "tier": "Ultra Lux",  "price_per_night": 24000 },
  { "id": 1010, "city_id": 1, "name": "The Taj Mahal Palace",  "tier": "Iconic Lux", "price_per_night": 28000 }
]
```

### `GET /api/cities?search=jai`  (City Search screen)
Same shape as `GET /api/cities`, filtered by name. Empty `search` = all cities.

---

## 2. Auth

### `POST /api/signup`
Request:
```json
{ "name": "Megh", "email": "megh@example.com", "password": "secret123" }
```
Response `201`:
```json
{ "token": "eyJhbGci...", "user": { "id": 1, "name": "Megh", "email": "megh@example.com" } }
```

### `POST /api/login`
Request:
```json
{ "email": "megh@example.com", "password": "secret123" }
```
Response `200`: same shape as signup (`token` + `user`).

### `GET /api/me`  (protected)
Returns the logged-in user:
```json
{ "id": 1, "name": "Megh", "email": "megh@example.com" }
```

Error shape (all endpoints):
```json
{ "detail": "Invalid email or password" }
```

---

## 3. Trips (protected — the user's own trips)

### Trip object
```json
{
  "id": 1,
  "name": "Golden Triangle",
  "description": "Delhi–Jaipur loop",
  "start_date": "2026-09-01",
  "end_date": "2026-09-07",
  "is_public": false,
  "share_slug": null,
  "cover_photo_url": null,
  "destination_count": 2
}
```

### `GET /api/trips`  → array of Trip objects (My Trips screen)

### `POST /api/trips`
Request:
```json
{ "name": "Golden Triangle", "description": "Delhi–Jaipur loop",
  "start_date": "2026-09-01", "end_date": "2026-09-07" }
```
Response `201`: the created Trip object.

### `GET /api/trips/{id}`  → full trip **with stops** (Itinerary View)
```json
{
  "id": 1,
  "name": "Golden Triangle",
  "description": "Delhi–Jaipur loop",
  "start_date": "2026-09-01",
  "end_date": "2026-09-07",
  "is_public": false,
  "share_slug": null,
  "cover_photo_url": null,
  "stops": [
    {
      "id": 10,
      "city": { "id": 2, "name": "New Delhi", "state": "Delhi", "country": "India" },
      "start_date": "2026-09-01",
      "end_date": "2026-09-03",
      "order_index": 0,
      "activities": [
        { "id": 55, "activity_id": 201, "name": "Red Fort & Chandni Chowk Rikshaw Tour", "price_per_person": 350, "num_people": 2 }
      ]
    }
  ]
}
```

### `PUT /api/trips/{id}`  → update name/dates/description/is_public. Returns Trip object.
### `DELETE /api/trips/{id}`  → `204` no content.

---

## 4. Stops (cities inside a trip)

### `POST /api/trips/{id}/stops`
Request:
```json
{ "city_id": 3, "start_date": "2026-09-03", "end_date": "2026-09-05" }
```
Response `201`: the created stop object (same shape as a stop in section 3).

### `PUT /api/stops/{id}`  → update dates / order_index (drag-to-reorder).
### `DELETE /api/stops/{id}`  → `204`.

---

## 5. Activities inside a stop

### `POST /api/stops/{id}/activities`
Request:
```json
{ "activity_id": 201, "num_people": 2 }
```
Response `201`: the added activity line (as shown in the stop's `activities` array).

### `DELETE /api/stop-activities/{id}`  → `204`.

---

## 6. Budget (Trip Budget & Cost Breakdown screen)

### `GET /api/trips/{id}/budget`
Backend computes this from the stops/activities. Frontend just displays it.
```json
{
  "trip_id": 1,
  "currency": "INR",
  "total": 8700,
  "breakdown": {
    "activities": 8700,
    "hotels": 0,
    "transport": 0,
    "meals": 0
  },
  "per_day": [
    { "date": "2026-09-01", "amount": 700 },
    { "date": "2026-09-02", "amount": 0 }
  ],
  "average_per_day": 1450
}
```
*(v1 computes `activities` = Σ price_per_person × num_people. `hotels`/`transport`/
`meals` are 0 for now — kept in the shape so charts don't need rework later.)*

---

## 7. Public share (Shared/Public Itinerary View)

### `GET /api/public/{slug}`  (no auth)
Read-only copy of a trip that has `is_public: true`. Same shape as
`GET /api/trips/{id}` but without private fields. Used by the public URL page.

---

## What to build first (frontend)
1. Mock all of **section 1** (cities/activities/hotels) as static JSON — this is your whole seed catalog.
2. Mock **section 3** trip objects to build My Trips + Itinerary View screens.
3. Everything else can start against mocks and switch to the live backend when ready.

**Rule of thumb:** if the shapes above match, the day we connect to the real
backend, nothing on your side breaks.
