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

- The frontend only calls the Flask API. The Groq API key stays on the server.
- Optional: set `GROQ_MODEL` in `backend/.env` to override the default model (`llama-3.3-70b-versatile`).
- A basic in-memory rate limiter allows 5 requests per minute per IP.
- Optional inputs for tone and word-count target are included.
