# Users and Wallets API

A secure and modular backend API built with **Node.js**, **TypeScript**, **Express**, and **PostgreSQL**, designed to manage users and their blockchain wallets.

---

## Features

- JWT-based authentication (Sign Up / Sign In / Sign Out)
- CRUD operations for user wallets
- PostgreSQL + TypeORM ORM
- Clean architecture (Entities, Services, Controllers, Routes)
- Dockerized setup for local development
- Tests with dedicated test database (no interference with dev data)

---

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- `git` and optionally `Node.js` (only if running outside Docker)

### Setup

```bash
git clone <repo-url>
cp .env.example .env
docker-compose up --build
npm run dev
```

The API will be available at: `http://localhost:3000`


You can import the included Postman collection in `api-users-wallets.postman_collection.json` to test endpoints.

---

## Authentication Flow

### 1. **Sign Up**
```http
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "yourPassword"
}
```

### 2. **Sign In**
```http
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "yourPassword"
}
```
Response: `{ token: <JWT> }`

### 3. **Sign Out**
```http
POST /api/auth/signout
Authorization: Bearer <token>
```
The token is invalidated server-side (blacklisted).

All protected endpoints require:
```http
Authorization: Bearer <token>
```

---

## Wallet Endpoints

### GET /api/wallets
Returns all wallets for the authenticated user.

### GET /api/wallets/:id
Returns a specific wallet if owned by the authenticated user.

### POST /api/wallets
```json
{
  "tag": "Label",
  "chain": "Ethereum",
  "address": "0xABC..."
}
```

### PUT /api/wallets/:id
Update wallet
```json
{
  "tag": "Updated Label",
  "chain": "Ethereum",
  "address": "0xABC..."
}
```

### DELETE /api/wallets/:id
Deletes the wallet.

---

## JWT Behavior

- Tokens expire after `15m` (configurable via `.env`)
- Multiple sign-ins create independent tokens
- Tokens are **revoked** on sign out (via in-memory blacklist)

---

## Database Schema

### Users
| Field      | Type    | Constraints           |
|------------|---------|-----------------------|
| id         | UUID    | Primary Key           |
| email      | string  | Unique, required      |
| password   | string  | Hashed, required      |
| created_at | Date    | Auto-generated        |
| updated_at | Date    | Auto-updated          |

### Wallets
| Field      | Type    | Constraints               |
|------------|---------|---------------------------|
| id         | UUID    | Primary Key               |
| user_id    | UUID    | FK → users.id             |
| tag        | string  | Optional label            |
| chain      | string  | Required (e.g., Ethereum) |
| address    | string  | Unique, required          |
| created_at | Date    | Auto-generated            |
| updated_at | Date    | Auto-updated              |

---

## Environment Variables (`.env`)

| Variable         | Description                        | Default                |
|------------------|------------------------------------|------------------------|
| DB_HOST          | PostgreSQL host                    | `localhost`            |
| DB_PORT          | PostgreSQL port                    | `5432`                 |
| DB_NAME          | Dev DB name                        | `users_wallets_dev`    |
| DB_NAME_TEST     | Test DB name                       | `users_wallets_test`   |
| DB_USER          | PostgreSQL user                    | `postgres`             |
| DB_PASSWORD      | PostgreSQL password                | `postgres`             |
| JWT_SECRET       | Secret for signing JWTs            | `your-secret-key`      |
| JWT_EXPIRES_IN   | JWT expiration                     | `15m`                  |
| PORT             | API server port                    | `3000`                 |
| NODE_ENV         | Environment                        | `development`          |

---

## Testing

### Separate Test DB
- Uses a completely isolated DB: `users_wallets_test`
- Tables auto-created via `synchronize: true`
- Cleanup with `TRUNCATE` before each test
- No impact on dev or prod data

### Run Tests
```bash
npm run test            # All tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage   # With coverage
```

---

## Architecture Overview

```
src/
├── _tests__/ # Unit & integration tests
├── config/ # Database and environment config
├── controllers/ # Request handlers
├── entities/ # TypeORM models (User, Wallet)
├── middleware/ # JWT auth, error handler, etc.
├── routes/ # Express routers
├── services/ # Business logic layer
├── utils/ # JWT helpers, password hashing, etc.
├── app.ts # Express app setup
└── index.ts # App entry point (starts server + DB)
```

---

## Postman Collection

Import the provided `Shield.postman_collection.json` in Postman to test all endpoints.

The `signin` request auto-saves the JWT token into `{{jwt_token}}` collection variable. All other requests use it automatically in the `Authorization` header.

---

## License

ISC License. Feel free to use and extend.
