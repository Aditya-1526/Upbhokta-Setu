# Upbhokta Setu (उपभोक्ता सेतु)

> **Your consumer grievance, connected.**

An AI-assisted bilingual (English / हिन्दी) platform to help Indian consumers prepare and manage grievance cases.

## Quick Start

### Prerequisites
- Node.js ≥ 18, npm ≥ 9
- Python ≥ 3.11, pip
- Expo Go app on your phone (or an Android/iOS emulator)

### Setup

```bash
# 1. Clone
git clone https://github.com/Aditya-1526/Upbhokta-Setu.git
cd Upbhokta-Setu

# 2. Mobile
cd apps/mobile
npm install
cp .env.example .env   # edit as needed
npx expo start
# Scan QR with Expo Go

# 3. Backend (separate terminal)
cd apps/api
python -m venv .venv
.venv\Scripts\activate   # PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env    # edit SUPABASE_URL, GEMINI_API_KEY, etc.
uvicorn app.main:app --reload --port 8000
```

### Environment Variables

See `apps/api/.env.example` for the full list. Key variables:
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Public anon key (mobile + backend)
- `SUPABASE_SERVICE_ROLE_KEY` — Backend only, never mobile
- `GEMINI_API_KEY` — Backend only

### Scripts

```bash
# Mobile
cd apps/mobile
npm run lint        # ESLint
npx expo start      # Start dev server

# Backend
cd apps/api
pytest              # Run tests
uvicorn app.main:app --reload  # Start dev server
```

## Stack
- **Mobile**: React Native, Expo, Expo Router, TypeScript
- **Backend**: FastAPI, Pydantic, HTTPX
- **Database**: Supabase PostgreSQL
- **AI**: Google Gemini (server-side only)

See `CLAUDE.md` for full constraints and `ARCHITECTURE.md` for the system design.
