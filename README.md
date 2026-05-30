# BizTrack

Professional project-centric business management for technicians, freelancers, and service businesses.

## Stack

- React + Vite
- Tailwind CSS v4
- Firebase Auth + Firestore
- Zustand, React Router, Recharts, XLSX

## Features

- Email/password authentication with persistent sessions
- Dashboard with optimized summary from `users/{uid}` document
- Project management with denormalized totals on each project
- Payments, expenses, and split tracking per project
- Analytics, charts, and Excel export
- Dark/light theme

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables (Firebase config stays out of source code):

```bash
cp .env.example .env
```

Edit `.env` with values from [Firebase Console](https://console.firebase.google.com/) → Project settings → Your apps → Web app config. Variable names must start with `VITE_` for Vite.

3. Create **Firestore** in [Firebase Console](https://console.firebase.google.com/project/biztrack-21158/firestore) → **Create database** (if not done yet).

4. Enable **Email/Password** sign-in in [Firebase Console](https://console.firebase.google.com/project/biztrack-21158/authentication/providers) → Authentication.

5. Deploy Firestore rules and indexes:

```bash
firebase login
firebase use biztrack-21158
firebase deploy --only firestore
```

6. Run the app (restart dev server after changing `.env`):

```bash
npm run dev
```

## Firestore structure

- `users/{uid}` — profile + aggregated dashboard totals (1 read for dashboard summary)
- `projects/{id}` — **single document per project** containing:
  - Project info, totals (`totalReceived`, `totalExpenses`, `totalSplit`, `totalProfit`, `totalPending`)
  - `payments[]`, `expenses[]`, `splits[]` as embedded JSON arrays

One project read loads the full ledger (minimal reads, simple architecture).

## Build

```bash
npm run build
```

## Troubleshooting

**Opening `https://firestore.googleapis.com` shows Google 404** — This is normal. That URL is an API host, not a website. A 404 there does **not** mean you are offline.

**How to verify Firebase is set up:**

1. Open [Firebase Console → Firestore](https://console.firebase.google.com/project/biztrack-21158/firestore) — you should see the database UI (Data / Rules tabs).
2. Run BizTrack at `http://localhost:5173`, press **F12** → **Console**, and check errors when logging in.
3. Common fixes: create Firestore database, enable Email/Password auth, run `firebase deploy --only firestore`, disable VPN/ad-blockers for localhost.
