# Knowledge Assistant

Mini Knowledge Assistant for the Dev Trainee assessment. The app lets a signed-in user upload PDF/TXT documents, ask AI questions, see token usage, and review conversation history.

## Tech Stack

- Framework: Next.js App Router + React + TypeScript
- Auth: NextAuth Credentials provider with bcrypt password hashing
- Database: SQLite with Prisma ORM
- AI: OpenAI Responses API (`gpt-5.4-mini` by default)
- Document handling: TXT parsing, PDF text extraction, chunking, embeddings, SQLite vector retrieval
- Deploy: Docker Compose

## Setup & Run

1. Copy the environment example.

```bash
cp .env.example .env
```

2. Fill in `OPENAI_API_KEY` and `AUTH_SECRET`.

3. Run with Docker Compose.

```bash
docker compose up --build
```

The container runs Prisma setup and seeds the mock users automatically.

4. Open `http://localhost:3000` and sign in with `admin/admin123` or `admin1/admin123`.

For local development:

```bash
npm install
npx prisma generate
npm run dev
```

## Features Done

- [x] Mock login with protected routes (`admin/admin123`, `admin1/admin123`)
- [x] Password hashing with bcrypt
- [x] Upload PDF/TXT files
- [x] Validate file extension, MIME type, file size, and empty content
- [x] Extract readable text from PDFs
- [x] Chat with AI
- [x] Chat with selected uploaded file context
- [x] RAG with chunking, OpenAI embeddings, and SQLite-backed vector retrieval
- [x] Token usage per assistant response and total usage panel
- [x] Daily per-user token quota display and guardrail
- [x] Conversation history by selected file
- [x] Markdown rendering for assistant answers
- [x] Citation list from document sections
- [x] Basic in-memory rate limiting for chat (3 requests per minute per user)
- [x] Docker Compose with healthcheck
- [x] Unit tests for document utilities and rate limiting
- [ ] Streaming response

## Architecture

The app uses server-side protected routes through NextAuth. Auth, files, chats, and token usage are stored in SQLite through Prisma. Uploaded documents are validated in the file API, converted to text, normalized, and saved in the database.

When a user uploads a document, the API extracts text, splits it into sections, generates embeddings with OpenAI, and stores those vectors in SQLite. When a user sends a chat message with a selected file, the chat API verifies the file belongs to the current user, embeds the question, retrieves the closest document sections by cosine similarity, and sends only those excerpts to OpenAI.

Embedding failures are handled gracefully. If the embedding API is unavailable because of quota, rate limits, or network errors, the app falls back to keyword-based section retrieval instead of failing the whole chat request.

## Test Commands

```bash
npm run lint
npm run test
npm run build
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

```bash
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## Known Issues

- Vector retrieval is stored in SQLite as serialized embeddings, not an external vector service like Qdrant or Pinecone.
- If OpenAI embedding requests hit quota or rate limits, the app falls back to keyword-based section retrieval, so document chat can still work but answer relevance may be lower than vector retrieval.
- Image-only or scanned PDFs need OCR; the current parser reads PDF text layers only.
- Token input/output split is estimated when the provider only returns total tokens.
- Rate limiting and daily token quota are app-level guardrails, not billing controls.
- Docker expects `.env` to exist locally and contain a valid OpenAI key.
