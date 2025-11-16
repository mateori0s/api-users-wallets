# Users and Wallets API

A backend API built with Express.js, TypeScript and PostgreSQL for managing users and their cryptocurrency wallets.

## Features

- User authentication (sign-up, sign-in, sign-out)
- JWT-based authentication
- CRUD operations for wallets
- PostgreSQL database with TypeORM
- Docker Compose for local PostgreSQL setup
- TypeScript for type safety
- Clean architecture with separation of concerns (Entities, Services, Controllers, Routes)

## Prerequisites

- Node.js (v18 or higher)
- Docker Compose
- npm or yarn

## Setup Instructions

### 1. Clone the repository and install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and update the values if needed (defaults should work for local development).

### 3. Start PostgreSQL with Docker Compose

```bash
docker-compose up -d
```

This will start a PostgreSQL container on port 5432. The container is configured to automatically create the database `users_wallets_dev` on first initialization.

### 4. Build and run the application

**Development mode:**
```bash
npm run dev
```

> **Note**: When you run `npm run dev` for the first time, the application will automatically:
> - Verify that the database `users_wallets_dev` exists, and create it if it doesn't
> - Create all necessary tables automatically 
> This means you don't need to manually create the database - just run `docker-compose up -d` and then `npm run dev`!

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

#### Sign Up
```
POST /api/auth/signup
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

#### Sign In
```
POST /api/auth/signin
Body: {
  "email": "user@example.com",
  "password": "password123"
}
```

#### Sign Out
```
POST /api/auth/signout
Headers: {
  "Authorization": "Bearer <token>"
}
Output: {
  "success": true,
  "message": "Sign out successful"
}
```

## JWT Authentication

The API uses JWT (JSON Web Tokens) for authentication. Important behavior:

- **Multiple Valid Tokens**: When a user signs in multiple times, each sign-in generates a new token. All tokens remain valid simultaneously until they expire.
- **Token Expiration**: Tokens expire after 15 minutes by default (configurable via `JWT_EXPIRES_IN` environment variable).
- **No Token Invalidation**: Tokens are not invalidated when new sign-ins occur. Each token remains valid until it expires naturally.
- **Sign Out Behavior**: The sign out endpoint validates the token but does not invalidate it server-side. Token removal is handled client-side. The endpoint confirms successful sign out if a valid token is provided.

### Wallets

All wallet endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

#### Get All Wallets
```
GET /api/wallets
Input: Authorization token (JWT)
Output: List of wallets for the authenticated user
Example Response: [
  {
    "id": "uuid",
    "userId": "user-uuid",
    "tag": "My Ethereum Wallet",
    "chain": "Ethereum",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Wallet by ID
```
GET /api/wallets/:id
Input: Wallet ID (UUID) and authorization token (JWT)
Output: Wallet details
Example Response: {
  "id": "uuid",
  "userId": "user-uuid",
  "tag": "My Ethereum Wallet",
  "chain": "Ethereum",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
Error Responses:
- 404: Wallet not found
- 403: Access denied (wallet belongs to another user)
```

#### Create Wallet
```
POST /api/wallets
Input: {
  "tag": "My Ethereum Wallet" (optional),
  "chain": "Ethereum" (required),
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" (required)
}
Output: Created wallet object
Example Response: {
  "id": "uuid",
  "userId": "user-uuid",
  "tag": "My Ethereum Wallet",
  "chain": "Ethereum",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
Error Responses:
- 400: Wallet address already exists
```

#### Update Wallet
```
PUT /api/wallets/:id
Input: {
  "tag": "Updated Tag" (optional),
  "chain": "Bitcoin" (required),
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" (required)
}
Output: Updated wallet object
Example Response: {
  "id": "uuid",
  "userId": "user-uuid",
  "tag": "Updated Tag",
  "chain": "Bitcoin",
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
Error Responses:
- 404: Wallet not found
- 403: Access denied (wallet belongs to another user)
- 400: Wallet address already exists
```

#### Delete Wallet
```
DELETE /api/wallets/:id
Input: Wallet ID (UUID) and authorization token (JWT)
Output: Success message
Example Response: {
  "message": "Wallet deleted successfully"
}
Error Responses:
- 404: Wallet not found
- 403: Access denied (wallet belongs to another user)
```

## Database Schema

### Users Table
- `id`: UUID (Primary Key)
- `email`: VARCHAR(255) (Unique, Required)
- `password`: VARCHAR(255) (Hashed, Required)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Wallets Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → users.id)
- `tag`: VARCHAR(255) (Optional)
- `chain`: VARCHAR(100) (Required)
- `address`: VARCHAR(255) (Unique, Required)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP


## Architecture

The project follows a clean architecture pattern:

- **Entities**: TypeORM entities representing database tables
- **Services**: Business logic layer that handles data operations
- **Controllers**: Handle HTTP requests and responses, call services
- **Routes**: Define API endpoints and validation rules
- **Middleware**: Authentication, error handling, and request validation
- **Utils**: Reusable utility functions (JWT handling, etc.)
- **Config**: Application configuration (database, etc.)


## Environment Variables

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: users_wallets_dev)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `DB_NAME_TEST` - Test database name (default: users_wallets_test)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time (default: 15m)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production/test)

## TypeORM

The project uses TypeORM for database operations. In development mode, `synchronize: true` automatically creates/updates database tables based on entity definitions. For production, use migrations instead.

## Testing

### Overview

The test suite uses a **separate test database** (`users_wallets_test`) to avoid affecting production or development data.

### Test Database Setup

**The test database is created automatically** - no manual setup required

The test database is created automatically when you run tests. If the database doesn't exist when tests run, `setup.ts` will create it automatically and initialize tables using `synchronize: true`.

**No manual setup required** Just run `npm test` and the database will be created automatically if it doesn't exist.


#### Database Connection Settings

The test database uses the same connection settings as your development database:
- Host: `localhost` (or `DB_HOST` from env)
- Port: `5432` (or `DB_PORT` from env)
- User: `postgres` (or `DB_USER` from env)
- Password: `postgres` (or `DB_PASSWORD` from env)
- Database: `users_wallets_test` (or `DB_NAME_TEST` from env)

### Run Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run with coverage
npm run test:coverage


```

### Test Database Architecture

#### Architecture Overview

- **Test Database**: `users_wallets_test` (separate from `users_wallets_dev`)
- **Test DataSource**: `src/config/test-data-source.ts` - Dedicated DataSource for tests
- **AppDataSource**: Automatically mocked to use `TestDataSource` during tests
- **Synchronize**: `true` for tests - automatically creates/updates tables without migrations
- **Cleanup**: Uses `TRUNCATE` between tests (faster and resets auto-increment)
- **Execution**: Tests run serially (`maxWorkers: 1`) to avoid database race conditions

#### How It Works

1. **Before Tests**: 
   - `mock-data-source.ts` (loaded via `setupFiles`) mocks `AppDataSource` to use `TestDataSource`
   - `setup.ts` initializes `TestDataSource` which connects to `users_wallets_test` database
   - Tables are automatically created (`synchronize: true`)
   - **No production code is modified** - the mock happens only during test execution

2. **During Tests**:
   - All tests run against `users_wallets_test` database
   - Services that use `AppDataSource` automatically get `TestDataSource` via the mock
   - Helpers use `TestDataSource` directly
   - Production code remains unchanged

3. **Between Tests**:
   - `cleanDatabase()` is called before each test (in `beforeEach` hooks)
   - Uses `TRUNCATE` to efficiently clear all data
   - Resets auto-increment counters
   - Tests run serially to avoid conflicts

4. **After Tests**:
   - Database connections are closed
   - Mock is removed (AppDataSource returns to normal)
   - Test database still exists with empty tables

## License

ISC
