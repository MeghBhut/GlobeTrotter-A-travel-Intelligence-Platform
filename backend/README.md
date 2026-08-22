# GlobeTrotter — Backend (FastAPI + SQLite)

Initial backend for the v1 prototype. Implements every endpoint in
[`../API_CONTRACT.md`](../API_CONTRACT.md).

## Run it (Windows / PowerShell)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

macOS / Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open **http://localhost:8000/docs** — interactive, testable API docs.
The SQLite file `globetrotter.db` is created and seeded automatically on first run
(10 cities, 100 activities, 100 hotels).

## Using protected endpoints in /docs
1. Call `POST /api/signup` (or `/api/login`) and copy the `token` from the response.
2. Click the green **Authorize** button (top right), paste the token, confirm.
3. Trip/stop/budget endpoints now work as the logged-in user.

## Project layout
```
backend/
  requirements.txt
  app/
    main.py          # app entry, CORS, table create + seed
    database.py      # SQLite engine + session
    models.py        # ORM tables
    schemas.py       # request/response JSON shapes (Pydantic)
    auth.py          # password hashing + JWT + current-user dependency
    seed.py          # loads the catalog once
    seed_data.py     # the 10 cities / activities / hotels
    routers/
      cities.py      # GET cities / activities / hotels
      users.py       # signup / login / me
      trips.py       # trip CRUD + stops + stop-activities
      budget.py      # GET trip budget
      public.py      # GET public/{slug}
```

## Notes
- `globetrotter.db` is git-ignored — it regenerates on startup, so no DB file is committed.
- `SECRET_KEY` in `app/auth.py` is a dev placeholder; move it to an env var before any real deployment.
- CORS is open (`*`) for local dev; restrict it to the frontend origin later.
