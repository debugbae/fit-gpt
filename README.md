# FitGPT

AI-powered nutrition assistant that scans meal and fridge photos, tracks macros against a daily budget, and suggests recipes based on what's actually in your kitchen.

## Features

- **Meal Scanner** — photograph a meal and get calories, protein, carbs, fat, and sodium via Gemini vision
- **Stock Auditor** — photograph your fridge/pantry to auto-populate your inventory
- **Kitchen Hub** — manage pantry inventory manually
- **Dashboard** — daily macro tracking against your budget, with sodium alerts
- **Insights** — trends over time
- **Community** — social feed
- **Profile** — set your daily calorie and macro budget

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS · Google Gemini API (`@google/generative-ai`) · lucide-react

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values:
   - `VITE_GEMINI_API_KEY` — your Gemini API key
   - `VITE_APP_PASSCODE` — passcode for the primary login gate
   - `VITE_SECONDARY_USERNAME` / `VITE_SECONDARY_PASSWORD` — credentials for the secondary login
3. Run the app:
   `npm run dev`

> This app uses a simple client-side passcode gate for private access — it's a personal/demo project, not a production auth system. Since it's client-side, anyone who inspects the built app's JS bundle can still recover these values; treat them as a light deterrent, not real security.
