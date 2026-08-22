# GlobeTrotter — A Travel Intelligence Platform

Personalized, multi-city travel planning. Users create trips, add city stops with
dates, attach activities, see an automatic budget breakdown, and share trips
publicly via a read-only link.

## Prototype scope (v1)

| Included | Deferred to later |
|----------|-------------------|
| Signup / login | Photo upload (`cover_photo_url` stays null) |
| Create / list / view / delete trips | Friends & private sharing (public link only) |
| Itinerary builder (stops + activities) | Admin / analytics dashboard |
| Budget & cost breakdown | Transport / meals costs |
| Public share link | |

## Tech stack

| Layer | Choice |
|-------|--------|
| Backend | Python + **FastAPI** (auto API docs at `/docs`) |
| Server | Uvicorn |
| Database | **SQLite** (local file — no server needed) |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Auth | JWT (`Authorization: Bearer <token>`) |
| Frontend | Consumes the REST API below (framework up to frontend dev) |

## How the two sides connect

Frontend and backend share **no code** — they connect through a contract of HTTP
endpoints returning JSON. That contract is **[API_CONTRACT.md](./API_CONTRACT.md)**.

```
Frontend  ──HTTP request──▶  Backend (FastAPI)  ──▶  SQLite
          ◀──JSON response──                    ◀──
```

### Frontend developer — start here
1. Open **[API_CONTRACT.md](./API_CONTRACT.md)**.
2. Build static/mock JSON in the exact shapes shown (start with the seed catalog:
   cities, activities, hotels).
3. Build screens against the mocks. When the backend is live, swap the mock URLs
   for `http://localhost:8000` — if your shapes match the contract, nothing breaks.

### Backend developer
- Implement the endpoints in `API_CONTRACT.md`.
- FastAPI auto-generates live, testable docs at `http://localhost:8000/docs` —
  share that URL to prove endpoints work.

## Data

Seed data = 10 Indian cities, each with 10 activities (per-person cost) and
10 hotels (per-night price). Source tables are in the project's seed PDF.

## Build stages

0. Skeleton + seed the SQLite DB
1. Auth (signup / login)
2. Trip CRUD
3. Itinerary builder (stops + activities)
4. Budget calculation + itinerary view
5. Public share link
6. *Later:* photos, friends, admin dashboard

## Repo layout (planned)

```
/                 → docs (this README, API_CONTRACT.md)
/backend          → FastAPI app, SQLite DB, seed script
/frontend         → frontend app
```
