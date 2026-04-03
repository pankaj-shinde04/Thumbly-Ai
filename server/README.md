# Thumbly AI Backend Server

Backend server for Thumbly AI - AI Thumbnail Generator application.

## Tech Stack

- **Node.js** 16+ with TypeScript
- **Express.js** 4.18.2
- **MongoDB** with Mongoose 6.10.0
- **JWT** for authentication
- **Winston** for logging
- **Multer** for file uploads

## Project Structure

```
server/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── config/
│   │   └── env.ts          # Environment configuration
│   ├── middlewares/
│   │   ├── errorHandler.ts # Global error handler
│   │   ├── requestLogger.ts # Request logging
│   │   └── requestId.ts    # Request ID middleware
│   ├── lib/
│   │   ├── constants.ts    # Application constants
│   │   └── logger.ts       # Winston logger setup
│   └── modules/            # Feature modules (to be created)
│       ├── auth/
│       ├── sessions/
│       ├── assets/
│       └── ai/
├── package.json
├── tsconfig.json
└── .env.example
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- `DATABASE_URL`: MongoDB connection string
- `JWT_ACCESS_SECRET`: JWT access token secret
- `JWT_REFRESH_SECRET`: JWT refresh token secret
- `AI_API_KEY`: AI provider API key

## Development

1. Start development server:
```bash
npm run dev
```

2. Build for production:
```bash
npm run build
```

3. Start production server:
```bash
npm start
```

## API Conventions

### Base URL
- Development: `http://localhost:4000/api/v1`
- Production: `https://your-domain.com/api/v1`

### Response Format

**Success Response:**
```json
{
  "data": { ... },
  "meta": { ... } // Optional pagination info
}
```

**Error Response:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... } // Optional additional details
  }
}
```

### Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | MongoDB connection string | - |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `JWT_ACCESS_SECRET` | JWT access secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - |
| `ACCESS_TOKEN_TTL` | Access token TTL | `15m` |
| `REFRESH_TOKEN_TTL` | Refresh token TTL | `30d` |
| `STORAGE_DRIVER` | Storage driver | `local` |
| `AI_PROVIDER` | AI provider | `openai` |
| `AI_API_KEY` | AI provider API key | - |

## Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (errors only)

## Health Check

Check server health:
```bash
curl http://localhost:4000/health
```

## Next Steps

The following modules are planned for implementation:

1. **Authentication** (`/auth`)
   - User registration and login
   - JWT token management

2. **Sessions** (`/sessions`)
   - Design session CRUD operations
   - Message management

3. **Assets** (`/assets`)
   - File upload and storage
   - Image serving

4. **AI Generation** (`/ai`)
   - AI image generation
   - Job management

## License

MIT
