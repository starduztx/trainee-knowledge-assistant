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

## Decision 2: Chunk retrieval instead of a full vector database

### Context
The rubric allows vector DB RAG as a bonus, but the required feature is that users can ask questions about uploaded documents. I wanted the app to handle larger documents better than sending the whole file to the model every time.

### Alternatives Considered
A full vector database with embeddings would improve semantic retrieval. Sending the whole document would be simpler but fails on large files and wastes tokens.

### Why Chunk Retrieval
The current implementation splits document text into chunks and picks relevant chunks by query overlap. This keeps token usage lower, avoids extra services, and is easy to inspect during a live interview.

### Trade-offs
Keyword retrieval can miss answers when the user's wording differs from the document. If this became a production feature, I would add embeddings and a vector index next.

## Decision 3: NextAuth credentials with bcrypt and JWT sessions

### Context
The assessment asks for login and protected routes. A simple mock user is allowed, but security basics are part of the scoring criteria, so I chose a real credentials flow.

### Alternatives Considered
A hardcoded `admin/admin123` login would be fastest. OAuth would be more realistic for some apps but adds setup work that does not help the core document assistant.

### Why NextAuth + bcrypt
NextAuth handles session plumbing and route protection cleanly in Next.js. The app intentionally uses mock assessment accounts (`admin/admin123` and `admin1/admin123`) instead of a public registration flow, but those accounts still live in the database with bcrypt-hashed passwords. JWT sessions keep the app simple because there is no separate session table to manage.

### Trade-offs
Credentials auth still needs more production hardening, such as email verification, password reset, audit logs, and stronger abuse protection. For this task, it demonstrates the expected security baseline without distracting from the core assignment.
