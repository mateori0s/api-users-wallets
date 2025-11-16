# Users and Wallets API

A backend API built with Express.js, TypeScript, TypeORM, and PostgreSQL for managing users and their cryptocurrency wallets.

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
- Docker and Docker Compose
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

This will start a PostgreSQL container on port 5432.

### 4. Build and run the application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

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
- **Token Expiration**: Tokens expire after 24 hours by default (configurable via `JWT_EXPIRES_IN` environment variable).
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

## Project Structure

```
api-users-wallets/
├── src/
│   ├── entities/          # TypeORM Entities (Data Models)
│   │   ├── User.ts
│   │   └── Wallet.ts
│   ├── controllers/       # Controllers (Route Logic)
│   │   ├── user.controller.ts
│   │   └── wallet.controller.ts
│   ├── services/          # Services (Business Logic)
│   │   ├── user.service.ts
│   │   └── wallet.service.ts
│   ├── routes/            # Route Definitions
│   │   ├── user.routes.ts
│   │   ├── wallet.routes.ts
│   │   └── index.ts        # Combines all routes
│   ├── middleware/        # Middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── utils/             # Utility Functions
│   │   └── jwt.util.ts
│   ├── config/            # Configuration
│   │   └── data-source.ts  # TypeORM DataSource
│   ├── app.ts             # Express app configuration
│   └── index.ts           # Server entry point
├── Dockerfile
├── docker-compose.yml
├── ormconfig.json         # TypeORM configuration (optional)
├── package.json
├── tsconfig.json
├── .env                   # Environment variables (not committed)
├── .env.example           # Example environment configuration
└── README.md
```

## Architecture

The project follows a clean architecture pattern:

- **Entities**: TypeORM entities representing database tables
- **Services**: Business logic layer that handles data operations
- **Controllers**: Handle HTTP requests and responses, call services
- **Routes**: Define API endpoints and validation rules
- **Middleware**: Authentication, error handling, and request validation
- **Utils**: Reusable utility functions (JWT handling, etc.)
- **Config**: Application configuration (database, etc.)

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## Environment Variables

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: wallets_db)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time (default: 24h)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## TypeORM

The project uses TypeORM for database operations. In development mode, `synchronize: true` automatically creates/updates database tables based on entity definitions. For production, use migrations instead.

## License

ISC
