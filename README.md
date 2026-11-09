# ⚔️ Lockout Platform

A modern web application for real-time **1v1 competitive programming lockout matches** on Codeforces problems.

---

## 📌 What is Lockout?

Lockout is a fast-paced head-to-head competitive programming race:
- Two players face off with the **same set of 5 Codeforces problems** of ascending difficulty.
- Each problem can be **claimed by only one player** — the first player to achieve an **Accepted (AC)** verdict locks their opponent out of that problem.
- Points are awarded per problem solved (100, 200, 300, 400, 500).
- The player with the highest total points when the timer expires wins the match.
- If tied, a fresh **tie-breaker problem** decides the winner.

For complete rules and gameplay specifications, refer to [LOCKOUT.md](./LOCKOUT.md).

---

## 🏗️ Architecture

```
Lockout-website/
├── backend/          # Go HTTP API server (PostgreSQL + Redis)
│   ├── internal/
│   │   ├── database/ # User store (pgxpool) & session store (Redis)
│   │   ├── handlers/ # Auth, Codeforces verification & Problem Picker
│   │   └── models/   # User and game data structures
│   └── main.go       # Server entrypoint and route definitions
├── frontend/         # Next.js App Router frontend (React + Tailwind CSS)
│   ├── src/
│   │   ├── app/      # Next.js pages and layouts
│   │   ├── components/ # Dashboard, challenge builder, verification, auth
│   │   └── context/  # Global state and auth providers
├── test/             # Development & testing utilities
└── LOCKOUT.md        # Tournament and gameplay rulebook
```

---

## 🚀 Getting Started

### Prerequisites

- [Go](https://golang.org/) (v1.22+ recommended)
- [Node.js](https://nodejs.org/) (v18+ or v20+) & [npm](https://npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Ensure PostgreSQL and Redis are running locally, then update `.env` if necessary:
   ```env
   DATABASE_URL=postgres://username:password@localhost:5432/lockout?sslmode=disable
   REDIS_ADDR=localhost:6379
   PORT=:8080
   ```

4. Run the Go server:
   ```bash
   go run main.go
   ```
   The backend server runs on `http://localhost:8080`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛡️ Key Features

- **Fairness Filter:** Guarantees neither participant has ever submitted to any problem in the match, accounting for Div. 1/Div. 2 twins and skipping interactive problems.
- **Automated Codeforces Verification:** Verifies user handles by validating test submissions made on Codeforces.
- **Secure Authentication:** Password hashing with bcrypt, session tracking backed by Redis, and protected API endpoints.
- **Real-Time Matchmaking & Challenges:** Send and receive match challenges with custom base ratings and durations.
