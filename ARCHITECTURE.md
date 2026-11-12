# Architecture Note — Ajaia Docs

## 1. Tech Stack Selection & Rationale

- **Next.js (App Router):** Chosen for fast server-side rendering, seamless dynamic routing (`/documents/[id]`), and an overall modern developer experience.
- **Tiptap (Rich-Text Editor):** Headless and highly extensible wrapper around ProseMirror. It allowed us to implement custom paper layouts, headings, lists, and inline formatting with minimal boilerplate.
- **Supabase (PostgreSQL):** Provides a robust relational database with instant setup, letting us manage users, documents, and document-sharing relations efficiently without managing a custom backend server.

## 2. Prioritization & Tradeoffs

- **Prioritized:** Core document creation, rich-text editing, local `.txt`/`.md` file importing, and a secure user-to-user sharing model.
- **Deprioritized (Due to Timebox):** Real-time WebSockets (Yjs/Provider) and granular role-based permissions (Viewer vs. Editor) were deferred to keep the scope tight and focused on core CRUD and sharing functionality.

## 3. Security Decisions

- Fixed a public privacy leak by removing the open user list from the authentication/login page. Authentication now strictly requires validating the user's registered email.
