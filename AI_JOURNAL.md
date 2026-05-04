# AI Usage Journal

## Session 1: Understanding the assessment
**Prompt:** "Summarize the Dev Trainee assessment PDF into implementation priorities."
**AI Response:** The response grouped the assignment into coding, video, leadership, and legacy-system parts.
**My Adjustment:** I chose to focus first on Part 1 because it has the largest score and concrete deliverables.

## Session 2: Reviewing the existing project
**Prompt:** "Inspect my Next.js project and compare current features with the rubric."
**AI Response:** The response found auth, upload, chat, Prisma models, and missing Docker/docs/tests.
**My Adjustment:** I kept the existing stack instead of restarting from a template.

## Session 3: Planning the core chat flow
**Prompt:** "How should selected uploaded files connect to the chat UI?"
**AI Response:** The response suggested lifting selected-file state into a dashboard component.
**My Adjustment:** I used a dedicated client dashboard so the server page can still handle auth and sign-out.

## Session 4: Upload validation
**Prompt:** "Design safe validation for PDF/TXT upload in a Next.js API route."
**AI Response:** The response recommended checking extension, MIME type, size, and empty extracted text.
**My Adjustment:** I set a 10MB limit and stored extracted text in the database instead of writing uploaded files to disk.

## Session 5: PDF handling
**Prompt:** "Why does reading a PDF buffer as UTF-8 fail?"
**AI Response:** The response explained that PDFs are binary and need text extraction.
**My Adjustment:** I used `pdf-parse` for PDF extraction and left TXT as UTF-8.

## Session 6: Large document context
**Prompt:** "How can I avoid sending an entire uploaded document to the LLM?"
**AI Response:** The response suggested chunking and selecting relevant chunks.
**My Adjustment:** I first implemented keyword-overlap retrieval, then upgraded it to embedding-based section retrieval while keeping keyword retrieval as a fallback.

## Session 7: File ownership security
**Prompt:** "What security checks are needed before chatting with a fileId?"
**AI Response:** The response pointed out that the API must verify the file belongs to the session user.
**My Adjustment:** I added the ownership guard before building any document prompt.

## Session 8: Token usage
**Prompt:** "How should token usage be displayed and saved?"
**AI Response:** The response suggested storing per-assistant-message tokens and daily total usage.
**My Adjustment:** I kept exact total tokens from the provider and used an estimated input/output split for the daily panel.

## Session 9: Markdown rendering
**Prompt:** "Add simple markdown rendering without adding a new package."
**AI Response:** The response proposed handling headings, bullets, links, bold, and inline code.
**My Adjustment:** I kept the renderer intentionally small and escaped HTML before applying markdown replacements.

## Session 10: Rate limiting
**Prompt:** "What is a simple rate limit appropriate for a junior assessment app?"
**AI Response:** The response suggested an in-memory per-user window limit.
**My Adjustment:** I set the app limit to 3 chat requests per minute per user to match the small OpenAI project limit used during testing.

## Session 11: Lint failures
**Prompt:** "Explain the React hook lint errors around functions declared after useEffect."
**AI Response:** The response said the hook references should be declared inside the effect or stabilized.
**My Adjustment:** I moved fetch functions inside effects to satisfy the rule and reduce dependency confusion.

## Session 12: Offline build issue
**Prompt:** "Next.js build fails because Google Fonts cannot be fetched. What should I do?"
**AI Response:** The response recommended local/system fonts for offline Docker builds.
**My Adjustment:** I removed `next/font/google` and used CSS system fonts.

## Session 13: Docker setup
**Prompt:** "Create a Dockerfile and docker-compose setup for this Next.js app."
**AI Response:** The response suggested a multi-stage build and a compose healthcheck.
**My Adjustment:** I kept a SQLite `prisma` folder mount for local persistence, added startup DB setup, seeded mock users, and used a `/login` healthcheck.

## Session 14: Unit tests
**Prompt:** "What can be unit tested without a browser or database?"
**AI Response:** The response suggested testing upload validation, chunking, token splitting, and rate limiting.
**My Adjustment:** I used Node's built-in test runner to avoid adding a new dependency.

## Session 15: README structure
**Prompt:** "Rewrite README to match the assessment required sections."
**AI Response:** The response proposed Tech Stack, Setup, Features Done, Architecture, Known Issues, and test commands.
**My Adjustment:** I wrote the README in assessment-friendly language and clearly marked unfinished bonus items.

## Session 16: Adding vector retrieval
**Prompt:** "Add RAG with embeddings without making the Docker setup too heavy."
**AI Response:** The response suggested storing document chunks and embeddings, then ranking chunks by cosine similarity.
**My Adjustment:** I used SQLite as a lightweight local vector store and kept keyword retrieval as a fallback if embedding generation fails.

## Session 17: Docker production fixes
**Prompt:** "Docker starts but Prisma/Auth errors appear in the container logs."
**AI Response:** The response identified missing runtime files and production host trust settings.
**My Adjustment:** I copied `prisma.config.ts` and seed scripts into the runner image, added a default database URL, and enabled trusted host handling for Docker localhost.

## Session 18: UI polish after manual testing
**Prompt:** "The chat UI shows 0 after user messages and chunk labels are too technical."
**AI Response:** The response traced the issue to rendering zero-token user messages and suggested user-facing section labels.
**My Adjustment:** I hid zero-token labels, changed citations from chunk to section, and kept the internal chunking implementation unchanged.
