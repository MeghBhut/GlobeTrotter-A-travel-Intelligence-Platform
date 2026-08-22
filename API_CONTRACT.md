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
