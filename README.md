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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

> This app uses a simple client-side passcode gate for private access — it's a personal/demo project, not a production auth system.
