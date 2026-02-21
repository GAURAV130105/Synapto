# 🔌 Supabase Integration Guide for Synapto

This guide walks you through setting up Supabase as the backend for the Synapto accessibility platform.

---

## 📋 Prerequisites

- A [Supabase](https://supabase.com) account (free tier works)
- Node.js 18+ installed
- The Synapto project cloned locally

---

## 🚀 Step 1: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `synapto` (or any name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest to your users
4. Click **"Create new project"** and wait for it to be ready

---

## 🔑 Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **anon/public** key (under "Project API Keys")

---

## ⚙️ Step 3: Configure Environment Variables

1. Copy the example env file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. (Optional) Add your Groq API key for AI text simplification:
   ```env
   GROQ_API_KEY=your-groq-api-key-here
   ```

---

## 🗄️ Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of [`lib/supabase/schema.sql`](./lib/supabase/schema.sql)
4. Paste it into the SQL editor
5. Click **"Run"**

This creates the following tables:
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on sign-up) |
| `content` | Educational content records |
| `saved_content` | Users' saved/bookmarked content |
| `simplified_content` | Cached text simplifications |
| `user_activity` | Learning progress tracking |

All tables have **Row Level Security (RLS)** enabled, so users can only access their own data.

---

## 📧 Step 5: Configure Authentication

### Email Authentication (Default)

Email auth works out of the box. By default, Supabase requires email confirmation.

**To disable email confirmation for development:**

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle off **"Confirm email"**

### Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these URLs:
   - **Site URL**: `http://localhost:3000` (for dev)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`

---

## 🏃 Step 6: Run the Project

```bash
# Install dependencies (if not already done)
npm install

# Start the dev server
npm run dev
```

Visit `http://localhost:3000` and try:

1. **Sign up** with a new account
2. **Log in** to access the dashboard
3. **Add content** (YouTube URLs)
4. **Customize preferences** (saved to Supabase)
5. **View content** with accessibility features

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│                                                         │
│  app/page.tsx          → Landing page                   │
│  app/auth/login        → Login (Supabase Auth)          │
│  app/auth/sign-up      → Sign up (Supabase Auth)        │
│  app/auth/callback     → Auth redirect handler          │
│  app/dashboard/        → Protected dashboard            │
│  app/dashboard/library → User's saved content           │
│  app/dashboard/content/[id] → Content viewer            │
│  app/dashboard/preferences  → Settings (saved to DB)    │
│                                                         │
│  API Routes:                                            │
│  /api/content/add      → Add content to Supabase        │
│  /api/content/remove   → Remove from library            │
│  /api/content/library  → Fetch user's library           │
│  /api/content/[id]     → Fetch single content           │
│  /api/user/preferences → Read/write preferences         │
│  /api/ai/simplify-text → AI text simplification         │
│  /api/ai/generate-audio → TTS audio generation          │
├─────────────────────────────────────────────────────────┤
│  lib/supabase/                                          │
│    client.ts    → Browser-side Supabase client          │
│    server.ts    → Server-side Supabase client           │
│    proxy.ts     → Middleware for session management     │
│    db.ts        → Database helper functions             │
│    types.ts     → TypeScript types for all tables       │
│    schema.sql   → Database schema (run in SQL Editor)   │
├─────────────────────────────────────────────────────────┤
│                   Supabase Backend                       │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐     │
│  │    Auth      │ │  PostgreSQL  │ │  Row Level   │     │
│  │  (email)     │ │  Database    │ │  Security    │     │
│  └─────────────┘ └──────────────┘ └──────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Key Files Reference

| File                         | Description                          |
| ---------------------------- | ------------------------------------ |
| `.env.local.example`         | Environment variable template        |
| `lib/supabase/schema.sql`    | Database schema SQL                  |
| `lib/supabase/types.ts`      | TypeScript database types            |
| `lib/supabase/db.ts`         | Server-side DB helper functions      |
| `lib/supabase/client.ts`     | Browser Supabase client              |
| `lib/supabase/server.ts`     | Server Supabase client               |
| `lib/supabase/proxy.ts`      | Auth middleware for route protection |
| `middleware.ts`              | Next.js middleware entry point       |
| `app/auth/callback/route.ts` | Email confirmation handler           |

---

## 🔒 Security Notes

- **RLS is enabled** on all tables. Users can only read/write their own data.
- **API keys** in `.env.local` are never committed to git (listed in `.gitignore`).
- **Server-side auth checks** are performed in all API routes.
- The middleware automatically refreshes auth sessions on every request.
- Passwords are handled entirely by Supabase Auth (never stored in your DB).

---

## 🐛 Troubleshooting

### "Unauthorized" errors on API calls

- Make sure you're logged in
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly

### Sign-up not working

- Check Supabase Auth settings (email confirmation may need to be disabled for dev)
- Verify redirect URLs are configured in Supabase dashboard

### Database errors

- Make sure you ran the `schema.sql` in Supabase SQL Editor
- Check the Supabase dashboard → Table Editor to verify tables exist

### Preferences not saving

- Check that the `profiles` table exists and has the `preferences` column
- Verify RLS policies are in place by running the schema SQL
