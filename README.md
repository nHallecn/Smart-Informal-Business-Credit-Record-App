# Smart Informal Business Credit & Record App

Mobile-first financial records and credit scoring for informal traders and small business owners.

## Stack

- Frontend: React Native with Expo, local SQLite storage for offline transaction capture.
- Backend: Node.js, Express, JWT authentication, PostgreSQL.
- Database: PostgreSQL schema with UUID primary keys, JSONB scoring/report metadata, sync-friendly timestamps and indexes.

## Core Features

- Register and log in business owners.
- Record sales and expenses locally while offline.
- Sync local transactions to the backend when the app is online.
- Calculate a rule-based credit score from transaction history.
- View dashboard totals and latest score.
- Generate and view simple financial report files.

## Backend Setup

1. Create a PostgreSQL database:

   ```bash
   createdb smart_business_credit
   ```

2. Configure environment variables:

   ```bash
   cd backend
   cp .env.example .env
   ```

   Update `DATABASE_URL` and `JWT_SECRET` in `backend/.env`.

3. Install dependencies and create tables:

   ```bash
   npm install
   npm run db:migrate
   npm run dev
   ```

The API runs on `http://localhost:3000` by default.

## Frontend Setup

```bash
cd frontend
npm install
```

For a physical phone, set the backend URL to your computer's LAN IP:

```bash
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_IP:3000/api
npm start
```

For a simulator on the same machine, the default is `http://localhost:3000/api`.
