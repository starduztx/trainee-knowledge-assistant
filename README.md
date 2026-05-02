# Knowledge Assistant

Mini Knowledge Assistant for the Dev Trainee assessment. The app lets a signed-in user upload PDF/TXT documents, ask AI questions, see token usage, and review conversation history.

## Tech Stack

- Framework: Next.js App Router + React + TypeScript
- Auth: NextAuth Credentials provider with bcrypt password hashing
- Database: SQLite with Prisma ORM
- AI: OpenAI Responses API (`gpt-5.4-mini` by default)
- Document handling: TXT parsing, PDF text extraction, chunk-based retrieval
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

4. Open `http://localhost:3000`.

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
- [x] Chunk retrieval for large documents
- [x] Token usage per assistant response and total usage panel
- [x] Conversation history by selected file
- [x] Markdown rendering for assistant answers
- [x] Citation list from document chunks
- [x] Basic in-memory rate limiting for chat
- [x] Docker Compose with healthcheck
- [x] Unit tests for document utilities and rate limiting
- [ ] Vector database RAG
- [ ] Streaming response

## Architecture

The app uses server-side protected routes through NextAuth. Auth, files, chats, and token usage are stored in SQLite through Prisma. Uploaded documents are validated in the file API, converted to text, normalized, and saved in the database.

When a user sends a chat message with a selected file, the chat API verifies the file belongs to the current user, splits the document into chunks, selects the most relevant chunks by query overlap, and sends only those excerpts to OpenAI. Assistant messages and token usage are saved after the API response.

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

- Retrieval is chunk-based keyword matching, not a full vector database.
- Image-only or scanned PDFs need OCR; the current parser reads PDF text layers only.
- Token input/output split is estimated when the provider only returns total tokens.
- Rate limiting is in-memory, so it resets when the server restarts.
- Docker expects `.env` to exist locally and contain a valid OpenAI key.
