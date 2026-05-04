# Architecture Decisions

## Decision 1: SQLite + Prisma for the assessment build

### Context
The assignment needs a working knowledge assistant that can be run quickly by reviewers, ideally with `docker compose up`. I needed persistence for users, uploaded files, chat history, and token usage, but I did not need a multi-node production database for this scope.

### Alternatives Considered
PostgreSQL would be closer to many production stacks and scales better. A JSON file would be fastest to start, but it becomes messy for relations and user isolation.

### Why SQLite
SQLite with Prisma gives a real relational model while keeping setup simple. Reviewers do not need to provision an external database, and the schema remains readable. Prisma also makes ownership checks straightforward, such as making sure a user cannot chat with another user's file.

### Trade-offs
SQLite is not ideal for high concurrency or large production deployments. For this assessment, the simplicity and reliability of one local database file is more valuable than adding infrastructure.

## Decision 2: SQLite-backed vector retrieval instead of an external vector service

### Context
The rubric allows vector DB RAG as a bonus, and the required feature is that users can ask questions about uploaded documents. I wanted the app to handle larger documents better than sending the whole file to the model every time while still keeping setup simple for reviewers.

### Alternatives Considered
An external vector database such as Qdrant, Chroma, or Pinecone would be closer to a production RAG setup. Sending the whole document would be simpler but fails on large files and wastes tokens. Keyword-only chunk retrieval would be cheaper but less accurate when the user's wording differs from the document.

### Why Section Retrieval
The current implementation splits document text into internal chunks, labels them as user-facing sections, creates OpenAI embeddings, stores those vectors in SQLite, and retrieves the closest sections by cosine similarity. This gives the assessment a real semantic retrieval path while avoiding another service in `docker compose`.

### Trade-offs
SQLite is not a specialized vector database, so this is not as scalable as Qdrant/Pinecone and it performs similarity in application code. If this became a production feature, I would move embeddings to a dedicated vector index.

## Decision 3: NextAuth credentials with bcrypt and JWT sessions

### Context
The assessment asks for login and protected routes. A simple mock user is allowed, but security basics are part of the scoring criteria, so I chose a real credentials flow.

### Alternatives Considered
A hardcoded `admin/admin123` login would be fastest. OAuth would be more realistic for some apps but adds setup work that does not help the core document assistant.

### Why NextAuth + bcrypt
NextAuth handles session plumbing and route protection cleanly in Next.js. The app intentionally uses mock assessment accounts (`admin/admin123` and `admin1/admin123`) instead of a public registration flow, but those accounts still live in the database with bcrypt-hashed passwords. JWT sessions keep the app simple because there is no separate session table to manage.

### Trade-offs
Credentials auth still needs more production hardening, such as email verification, password reset, audit logs, and stronger abuse protection. For this task, it demonstrates the expected security baseline without distracting from the core assignment.
