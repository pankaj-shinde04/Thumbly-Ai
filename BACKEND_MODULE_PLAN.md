# Backend Module-by-Module Development Plan (Thumbly AI)

This document is a **module-by-module backend build roadmap** aligned with the current `client/` React app.

The frontend currently:
- Uses `AuthContext` with **simulated login/signup** and stores `thumbly_user` in `localStorage`.
- Builds **Design Sessions** in React state (`sessions[]`) containing:
  - `id`, `title`, `platform`, `messages[]`, `thumbnail`, `createdAt`
  - `messages[]` with `role: user|assistant`, `content`, optional `image`
- Shows:
  - **Chat** that “generates” a design (placeholder image)
  - **Gallery** (filters by platform, search by title)
  - **Editor** (client-side text overlay only)
  - **Usage & Credits** placeholder

Your backend should therefore provide:
- Authentication + user profile
- Persistence for sessions/messages
- AI generation pipeline (text -> image, regenerate/variations)
- Image storage + download/export
- Usage/credits tracking
- Observability + security

---

## 0) Backend Stack (Recommended Default)

Because your frontend is Vite + TypeScript, a TypeScript backend keeps the toolchain consistent.

- **Runtime**: Node.js
- **Framework**: Express . Keep it REST for simplicity.
- **DB**: MongoDB
- **ORM**: Prisma (with MongoDB adapter)
- **Auth**: JWT access token + refresh token (HTTP-only cookie) OR access token only (Authorization header)
- **File/Image storage**:
  - Dev: local filesystem (e.g., `uploads/`)
  - Prod: S3 / Cloudflare R2 / Supabase Storage
- **AI providers** (choose later): OpenAI Images, Replicate, Stability, etc.


---

## 1) Module: Project Bootstrap & Architecture

### Outcome
A runnable backend service with clean structure and shared conventions.

### Deliverables
- `server/` populated with:
  - `src/app.ts` (express app)
  - `src/server.ts` (listen)
  - `src/config/*` (env, constants)
  - `src/middlewares/*` (auth, error handler, request id)
  - `src/modules/*` (feature modules)
  - `src/lib/*` (logger, crypto, storage clients)
- Standard response format and error format.

### Conventions
- **REST base path**: `/api/v1`
- **Response envelope** (recommended):
  - Success: `{ data, meta? }`
  - Error: `{ error: { code, message, details? } }`
- **Auth header**: `Authorization: Bearer <accessToken>`

### Local Dev
- Run DB via MongoDB locally or MongoDB Atlas.
- CORS allow `http://localhost:5173`.

---

## 2) Module: Configuration & Environment

### Outcome
All secrets/config are driven by environment variables.

### Env Vars (example)
- `PORT=4000`
- `NODE_ENV=development`
- `DATABASE_URL=mongodb://...`
- `CORS_ORIGIN=http://localhost:5173`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...` (if using refresh tokens)
- `ACCESS_TOKEN_TTL=15m`
- `REFRESH_TOKEN_TTL=30d`
- `STORAGE_DRIVER=local|s3`
- `S3_BUCKET=...` `S3_REGION=...` `S3_ACCESS_KEY=...` `S3_SECRET_KEY=...`
- `AI_PROVIDER=openai|replicate|stability`
- `AI_API_KEY=...`

### Frontend Integration
Add to Vite:
- `VITE_API_BASE_URL=http://localhost:4000/api/v1`

---

## 3) Module: Database Schema (Core Entities)

### Outcome
Prisma schema + migrations for all entities needed by the UI. (Using MongoDB collections)

### Entities (MongoDB Collections)
#### `User` Collection
- `_id` (ObjectId)
- `name`
- `email` (unique)
- `passwordHash` (if password auth)
- `avatarUrl` (optional)
- `createdAt`, `updatedAt`

#### `DesignSession` Collection
- `_id` (ObjectId)
- `userId` (reference)
- `title`
- `platform` (`youtube | instagram-post | instagram-reel`)
- `status` (`active | archived | deleted`)
- `createdAt`, `updatedAt`

#### `Message` Collection
- `_id` (ObjectId)
- `sessionId` (reference)
- `role` (`user | assistant`)
- `content`
- `imageAssetId` (optional reference)
- `createdAt`

#### `Asset` Collection (stored image)
- `_id` (ObjectId)
- `userId` (reference)
- `type` (`image`)
- `mimeType`
- `width`, `height` (optional)
- `storageKey` (path or object key)
- `publicUrl` (optional)
- `createdAt`

#### `GenerationJob` Collection (optional but recommended)
- `_id` (ObjectId)
- `sessionId` (reference)
- `prompt`
- `provider`
- `status` (`queued | running | succeeded | failed`)
- `resultAssetId` (optional reference)
- `error` (optional)
- `createdAt`, `updatedAt`

#### `UsageLedger` Collection / `Credits`
- `_id` (ObjectId)
- `userId` (reference)
- `type` (`generation | variation | regenerate`)
- `amount` (integer)
- `meta` (object)
- `createdAt`

---

## 4) Module: Auth (Signup/Login/Logout)

### Outcome
Replace simulated auth with real auth.

### Endpoints
- `POST /auth/signup`
  - Body: `{ name, email, password }`
  - Returns: `{ user, accessToken }` (or set refresh cookie)
- `POST /auth/login`
  - Body: `{ email, password }`
  - Returns: `{ user, accessToken }`
- `POST /auth/logout`
  - Clears refresh cookie / invalidates refresh token (if used)
- `GET /auth/me`
  - Returns current user

### Notes
- Hash passwords with `bcrypt`.
- Consider refresh tokens for better UX.
- Add rate limiting on auth routes.

### Frontend Tie-in
Update `AuthContext`:
- On login/signup: call backend and store `accessToken` + `user`.
- Replace `thumbly_user` with token-based session.

---

## 5) Module: Users & Profile

### Outcome
User profile for “My Profile” menu and avatar.

### Endpoints
- `GET /users/me`
- `PATCH /users/me`
  - Body: `{ name?, avatarUrl? }`
- `POST /users/me/avatar` (optional)
  - Multipart upload → stores an `Asset` and sets `avatarUrl`

---

## 6) Module: Sessions (Design Projects)

### Outcome
Persist dashboard sessions so refresh/login restores state.

### Endpoints
- `GET /sessions`
  - Query: `q?` (search title), `platform?`, `page?`, `limit?`
- `POST /sessions`
  - Body: `{ title?, platform }` (title can be generated from first message)
- `GET /sessions/:id`
- `PATCH /sessions/:id`
  - Body: `{ title?, platform?, status? }`
- `DELETE /sessions/:id`

### Frontend Tie-in
Replace `useState([])` sessions with React Query:
- Query `GET /sessions`.
- Mutation for create/update/delete.

---

## 7) Module: Messages (Chat Log)

### Outcome
Persist the chat messages in each session.

### Endpoints
- `GET /sessions/:id/messages`
- `POST /sessions/:id/messages`
  - Body: `{ role, content, imageAssetId? }`

### Notes
- The chat UI currently adds:
  - User message
  - Assistant message with `image` URL
- Backend should store both and link image via `Asset`.

---

## 8) Module: AI Generation (Create / Regenerate / Variations)

### Outcome
Replace the placeholder `picsum.photos` generation with a real generation pipeline.

### Actions in UI that need backend
- **Generate** (on send)
- **Regenerate** (button)
- **Variations** (button)

### Endpoints (minimal)
- `POST /ai/generate`
  - Body: `{ sessionId, prompt, platform }`
  - Returns: `{ jobId }` or `{ asset, assistantMessage }`
- `POST /ai/regenerate`
  - Body: `{ sessionId, messageId }`
- `POST /ai/variations`
  - Body: `{ sessionId, assetId, count? }`

### Job Model (recommended)
- Immediately create a `GenerationJob`.
- Processing modes:
  - **Simple**: do it inline (request waits until image is generated)
  - **Scalable**: queue (BullMQ/Redis) and poll job status

### Endpoints (if job-based)
- `GET /ai/jobs/:jobId`
  - Returns: `{ status, resultAssetId?, error? }`

---

## 9) Module: Asset Storage & Downloads

### Outcome
Store and serve generated images reliably.

### Endpoints
- `POST /assets/upload` (multipart)
  - Returns: `{ asset }`
- `GET /assets/:id`
  - Returns asset metadata
- `GET /assets/:id/download`
  - Streams the file (sets `Content-Disposition`)

### Storage Strategy
- Local dev: save to `server/uploads/<assetId>.<ext>`
- Prod: S3/R2 + signed URLs OR proxy download through backend.

---

## 10) Module: Gallery API

### Outcome
Populate “Image Gallery” from backend.

### Endpoints
Option A (derived from sessions):
- `GET /gallery`
  - Query: `q?`, `platform?`, `page?`, `limit?`
  - Returns: images extracted from sessions with thumbnails

Option B (first-class assets):
- `GET /assets?type=image&tag=generated`

### Frontend Tie-in
Replace gallery’s derived client state with server data and filters.

---

## 11) Module: Editor Save (Optional)

Right now the editor does not create a new image file; it “saves” by returning the same URL.

### Two backend options
- **Option A (Client-side export)**: client renders to canvas and uploads final PNG via `POST /assets/upload`.
- **Option B (Server-side render)**: backend takes base image + overlay instructions and produces a rendered asset.

### Suggested endpoint (Option A)
- `POST /assets/upload` with the exported PNG.
- Link it back to the session:
  - `PATCH /sessions/:id` with `thumbnailAssetId`

---

## 12) Module: Credits / Usage

### Outcome
Make “Usage & Credits” real and prevent abuse.

### Model
- Each generation costs credits.
- Store ledger rows for auditing.

### Endpoints
- `GET /billing/usage`
  - Returns: `{ remainingCredits, monthlyUsed, breakdown }`
- `POST /billing/topup` (later; integrates payment provider)

### Enforcement
- Middleware check before AI endpoints.
- On success, decrement credits (transaction-safe).

---

## 13) Module: Security & Hardening

### Outcome
Safe defaults.

- CORS allow only your client origin.
- Helmet headers.
- Rate limit:
  - Auth routes
  - AI routes
- Request size limits:
  - uploads
  - JSON body
- Input validation:
  - `zod` schemas for bodies/query params

---

## 14) Module: Observability

### Outcome
You can debug production issues.

- Structured logging (pino/winston)
- Request IDs
- Central error handler (no stack traces to clients in prod)
- Metrics (optional): Prometheus

---

## 15) Module: Testing

### Outcome
Confidence to evolve APIs.

- Unit tests for:
  - auth
  - session CRUD
  - validation
- Integration tests:
  - `POST /auth/signup` + `POST /sessions` + `POST /ai/generate` (mock provider)

---

## Suggested Implementation Order (Milestones)

1. **Bootstrap + Config + DB**
2. **Auth** (`/auth/*`), `GET /auth/me`
3. **Sessions CRUD** (persist dashboard)
4. **Messages CRUD**
5. **Assets upload + download**
6. **AI generate (simple inline)** then upgrade to job queue
7. **Gallery API**
8. **Credits/usage**
9. **Hardening + observability + tests**

---

## API Shapes (Match the Frontend Types)

### `User`
```json
{ "_id": "objectId", "name": "string", "email": "string", "avatarUrl": "string|null" }
```

### `DesignSession`
```json
{
  "_id": "objectId",
  "title": "string",
  "platform": "youtube|instagram-post|instagram-reel",
  "thumbnail": "https://..." ,
  "createdAt": "2026-01-17T00:00:00.000Z"
}
```

### `Message`
```json
{ "_id": "objectId", "role": "user|assistant", "content": "string", "image": "https://..." }
```

---

## Open Questions (Answer to finalize)

- Do you want **JWT in localStorage** (simple) or **refresh cookie** (more secure)?
- Which AI provider do you plan to use for image generation?
- Do you want to store generated images publicly or behind auth?

If you answer these, I can refine this plan into an implementation checklist that exactly matches your choices.
