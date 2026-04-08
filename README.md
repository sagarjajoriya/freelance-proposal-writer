# Freelance Proposal Writer

React frontend and Flask backend for generating tailored freelance proposals with Groq.

## Project structure

```text
frontend/  # Vite + React app
backend/   # Flask API
```

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Set `GROQ_API_KEY` in `backend/.env`, then run:

```bash
python app.py
```

The backend runs on `http://127.0.0.1:5001`.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend runs on `http://127.0.0.1:5173`.

## Notes

- The frontend calls the Flask API on the same domain in production and through a Vite proxy during local development.
- The Groq API key stays on the server.
- Optional: set `GROQ_MODEL` in `backend/.env` to override the default model (`llama-3.3-70b-versatile`).
- A basic in-memory rate limiter allows 5 requests per minute per IP.
- Optional inputs for tone and word-count target are included.

## Deploy on Vercel

This repository is configured so one Vercel project serves:

- the React frontend as static files from `public/`
- the Flask backend from the root `app.py` entrypoint

Deploy with the Vercel CLI or by importing the repository in Vercel:

```bash
vercel
```

Then add these environment variables in the Vercel project settings:

- `GROQ_API_KEY`
- `GROQ_MODEL` (optional)
- `FRONTEND_ORIGIN=https://your-project.vercel.app`

After deployment, the app uses the same domain for both frontend and backend, with requests sent to `/generate`.
