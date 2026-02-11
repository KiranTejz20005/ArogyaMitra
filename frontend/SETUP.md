# Setup: Run the app

## 1. Install Node.js (required)

Node.js is **not** installed or not in your PATH. Install it first:

- **Download:** https://nodejs.org/en/download  
- Use the **LTS** version (e.g. v22 or v24).  
- Run the installer and **restart your terminal** (or Cursor) after installation.

Check that it works:

```bash
node --version
npm --version
```

## 2. Install dependencies

In this project folder, run:

```bash
npm install
```

(If you use **pnpm**: `pnpm install`)

## 3. Environment variables

Copy the example env file and fill in your values:

```bash
copy .env.local.example .env.local
```

Edit `.env.local` and set:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (auth) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `OPENAI_API_KEY` | OpenAI API key (for the AI coach chat) |

Get Supabase values from: [Supabase Dashboard](https://supabase.com/dashboard) → your project → Settings → API.

## 4. Run the app

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

**Optional:** Run Supabase SQL scripts in your Supabase project (SQL Editor) if you use the full dashboard/DB features:

- `scripts/001_create_tables.sql`
- `scripts/002_profile_trigger.sql`
- `scripts/003_create_tables_part2.sql`
