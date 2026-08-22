# GlobeTrotter — Travel Intelligence Platform

A modern, responsive web application for exploring Indian destinations, configuring custom travel itineraries, and calculating real-time travel budgets. Fully integrated with **API Contract v1**.

---

## 🚀 API Contract Integration (`API_CONTRACT.md`)

The frontend is built against the official REST API specification documented in [`API_CONTRACT.md`](./API_CONTRACT.md).

### Endpoint Mapping:

| Category | Endpoint | Frontend Implementation |
|---|---|---|
| **Reference: Cities** | `GET /api/cities` | `GlobeTrotterAPI.getCities(search, region)` |
| **Reference: Activities** | `GET /api/cities/{id}/activities` | `GlobeTrotterAPI.getCityActivities(cityId)` |
| **Reference: Hotels** | `GET /api/cities/{id}/hotels` | `GlobeTrotterAPI.getCityHotels(cityId)` |
| **Auth: Signup** | `POST /api/signup` | `GlobeTrotterAPI.signup(name, email, password)` |
| **Auth: Login** | `POST /api/login` | `GlobeTrotterAPI.login(email, password)` |
| **Auth: Profile** | `GET /api/me` | `GlobeTrotterAPI.getMe()` (Bearer JWT Auth) |
| **Trips: List** | `GET /api/trips` | `GlobeTrotterAPI.getTrips()` |
| **Trips: Create** | `POST /api/trips` | `GlobeTrotterAPI.createTrip(data)` |
| **Trips: Details** | `GET /api/trips/{id}` | `GlobeTrotterAPI.getTrip(id)` |
| **Trips: Update** | `PUT /api/trips/{id}` | `GlobeTrotterAPI.updateTrip(id, data)` |
| **Trips: Delete** | `DELETE /api/trips/{id}` | `GlobeTrotterAPI.deleteTrip(id)` |
| **Stops: Add** | `POST /api/trips/{id}/stops` | `GlobeTrotterAPI.addStop(tripId, stopData)` |
| **Stops: Activities** | `POST /api/stops/{id}/activities` | `GlobeTrotterAPI.addStopActivity(stopId, actData)` |
| **Budget** | `GET /api/trips/{id}/budget` | `GlobeTrotterAPI.getTripBudget(tripId)` |
| **Public Share** | `GET /api/public/{share_slug}` | `GlobeTrotterAPI.getPublicTrip(slug)` |

---

## ⚡ Dual-Mode Operation (Mock & Live Backend)

The frontend features a dual-mode API adapter located in [`js/api.js`](./js/api.js):
1. **Mock Mode (Default)**: Runs standalone without any external server required. Full seed dataset (10 cities, 100 hotels, 100 activities) with LocalStorage persistence.
2. **Live Backend Mode**: Click the **API Status Badge** in the header to ping `http://localhost:8000`. If your backend server is active, it automatically routes all network requests to the live backend with `Bearer <token>` headers.

---

## 🌟 Seed Dataset Reference (Exact Numeric IDs)

- **10 Destinations** (IDs 1–10): Mumbai (`1`), New Delhi (`2`), Jaipur (`3`), Bengaluru (`4`), Varanasi (`5`), Udaipur (`6`), Kolkata (`7`), Kochi (`8`), Hyderabad (`9`), Goa (`10`).
- **100 Activities** (IDs 101–1010): Structured with `city_id`, `price_per_person`, `category`, and `duration`.
- **100 Hotels** (IDs 1001–10010): Structured with `city_id`, `tier`, `price_per_night`, `rating`, and `amenities`.

---

## 📁 Project Structure

```
GlobeTrotter-A-travel-Intelligence-Platform/
├── index.html              # Single Page Application layout
├── API_CONTRACT.md         # Full REST API Contract (v1)
├── css/
│   └── styles.css          # Theme tokens, glassmorphism, and print stylesheet
├── js/
│   ├── data.js             # 10 Indian destinations, 100 activities, 100 hotels seed data
│   ├── api.js              # REST API Client & dual-mode mock adapter
│   ├── planner.js          # Financial calculation, budget optimizer & comparison engine
│   ├── state.js            # Reactive state management & trip persistence
│   ├── export.js           # Print itinerary generator, JSON backup, and share links
│   ├── ui.js               # Dynamic DOM rendering and component controllers
│   └── app.js              # Application bootstrapper and event delegator
└── README.md               # Documentation and usage guide
```

---

## 💻 How to Run

1. **Standalone in Browser**: Double-click `index.html` to open it in Chrome, Edge, Firefox, or Safari.
2. **Local HTTP Server**:
   ```bash
   npx serve .
   # or
   python -m http.server 3000
   ```
3. **Connecting to Python/Node Backend**: Run your backend service on `http://localhost:8000`. The frontend will automatically detect and communicate with it.
