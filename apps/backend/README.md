# Micro Estate Backend

Modern real estate API built with **Hono** + **Bun** + **Better Auth** + **Drizzle ORM**

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Update .env with your credentials

# Push database schema
bun run db:push

# Start development server
bun run dev
```

## 📁 Project Structure

```
src/
├── index.ts              # Entry point
├── config/               # Configuration
│   └── env.ts           # Environment variables
├── gateway/              # API Gateway
│   ├── index.ts         # Main gateway
│   └── v1.ts            # API v1 routes
├── shared/               # Shared code
│   ├── constants/       # Global constants
│   ├── errors/          # Custom errors
│   ├── middleware/      # Shared middleware
│   ├── schemas/         # Shared Zod schemas
│   ├── services/        # Shared services (Redis)
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── modules/              # Feature modules
│   ├── auth/            # Authentication
│   ├── users/           # User management
│   ├── properties/      # Property listings
│   ├── search/          # Search functionality
│   └── media/           # File uploads
├── db/                   # Database
│   ├── index.ts         # Drizzle client
│   └── schema/          # Database schemas
└── lib/                  # Libraries
    └── auth.ts          # Better Auth config
```

## 🔧 API Endpoints

### Health Check

- `GET /health` - Server health status

### Auth (via Better Auth)

- `POST /api/v1/auth/sign-up/email` - Register
- `POST /api/v1/auth/sign-in/email` - Login
- `POST /api/v1/auth/sign-out` - Logout
- `GET /api/v1/auth/session` - Get session

### Users

- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile
- `GET /api/v1/users` - List all users (admin)
- `GET /api/v1/users/:id` - Get user by ID (admin)

### Properties

- `GET /api/v1/properties` - List properties (with filters)
- `GET /api/v1/properties/:id` - Get property by ID
- `GET /api/v1/properties/slug/:slug` - Get property by slug
- `POST /api/v1/properties` - Create property (agent/admin)
- `PUT /api/v1/properties/:id` - Update property
- `DELETE /api/v1/properties/:id` - Delete property
- `GET /api/v1/properties/my/listings` - Get user's properties

### Search

- `GET /api/v1/search/properties?q=query` - Search properties
- `GET /api/v1/search/agents?q=query` - Search agents
- `GET /api/v1/search/suggestions?q=query` - Get suggestions

### Media

- `POST /api/v1/media/upload` - Upload file
- `POST /api/v1/media/upload/multiple` - Upload multiple files
- `DELETE /api/v1/media/:key` - Delete file

## 🗄️ Database Commands

```bash
# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema (dev only)
bun run db:push

# Open Drizzle Studio
bun run db:studio
```

## 🔐 Environment Variables

| Variable                   | Description                          |
| -------------------------- | ------------------------------------ |
| `PORT`                     | Server port (default: 4000)          |
| `NODE_ENV`                 | Environment (development/production) |
| `DATABASE_URL`             | Neon PostgreSQL connection string    |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis URL                    |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token                  |
| `BETTER_AUTH_SECRET`       | Auth secret (min 32 chars)           |
| `BETTER_AUTH_URL`          | Backend URL                          |
| `FRONTEND_URL`             | Frontend URL (for CORS)              |
| `R2_*`                     | Cloudflare R2 credentials (optional) |

## 📦 Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **Auth**: Better Auth
- **Cache**: Upstash Redis
- **Validation**: Zod
- **Storage**: Cloudflare R2
