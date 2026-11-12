# 🚀 DocFlow AI — Premium Collaborative Document Editor

An elite, lightning-fast collaborative document workspace built with Next.js (App Router), Tailwind CSS, TypeScript, Tiptap Rich-Text Editor, and Supabase.

---

## ✨ Features

- **Aesthetic Editor Interface:** Google Docs style minimal paper layout with infinite scroll and custom focus-outline fixes.
- **Rich-Text Formatting:** Seamless support for Bold, Italic, Underline, Headings (H1, H2), and Lists (Bullet/Numbered) using Tiptap.
- **File Import:** Direct support for uploading and parsing `.txt` and `.md` (Markdown) files directly into the editor surface.
- **Real-time Collaboration & Sharing:** Secure access control allowing document owners to share workspaces and dynamically register new users directly from the editor view.
- **Persistent Storage:** Instant auto-save and database persistence via Supabase.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS & Lucide Icons
- **Editor:** Tiptap (`@tiptap/react`, `StarterKit`, `Underline`)
- **Backend & Database:** Supabase (PostgreSQL)
- **Language:** TypeScript

---

## 📂 Project Structure

```text
├── app/
│   ├── dashboard/         # User dashboard & document list
│   ├── documents/[id]/    # Dynamic rich-text editor workspace
│   ├── globals.css        # Global styles & Tiptap overrides
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Landing / User login page
├── lib/
│   └── supabase.js        # Supabase client configuration
└── package.json
```

## ⚙️ Getting Started Locally

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/docflow-ai.git](https://github.com/your-username/docflow-ai.git)
cd docflow-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables Setup

Create a .env.local file in the root directory and add your Supabase credentials:

```Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser to view the application.

## 📄 Database Schema (Supabase)

Make sure you have the following tables set up in your Supabase project:

1. **`users`** (`id`, `name`, `email`, `created_at`)
2. **`documents`** (`id`, `title`, `content`, `owner_id`, `created_at`, `updated_at`)
3. **`document_shares`** (`id`, `document_id`, `shared_with_user_id`, `created_at`)

---

## 💡 Usage Guide

1. **Login/Register:** Enter your name and email on the home screen to access your personalized workspace.
2. **Dashboard:** Create a new document or open an existing one from your list.
3. **Editing & Formatting:** Use the clean top toolbar to format your text, insert headers, or import local text files (`.txt` / `.md`).
4. **Collaboration:** As the document owner, use the share bar to grant access to other registered users or instantly register a new user on the fly.
