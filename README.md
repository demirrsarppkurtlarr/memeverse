# 🔥 MemeVerse — Production-Ready Viral Meme Platform

A full-stack SaaS meme platform with auto-fetching content, soundboard, dark mode, infinite scroll, user auth, and AI-powered tagging. Built with Next.js 15, Supabase, Cloudflare R2, and Tailwind CSS.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/yourname/memeverse.git
cd memeverse
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
# Fill in all values (see section below)
```

### 3. Set Up Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. Copy your project URL and keys into `.env.local`

### 4. Set Up Cloudflare R2

1. Create a Cloudflare account → go to **R2**
2. Create a bucket named `memeverse-media`
3. Create an API token with R2 Read+Write permissions
4. Enable public access on the bucket → copy the public URL
5. Fill in `R2_*` variables in `.env.local`

### 5. Set Up Reddit API

1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Create a "script" app
3. Copy `client_id` and `client_secret`
4. Fill in `REDDIT_*` variables

### 6. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📂 Project Structure

```
memeverse/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── api/                    # API routes
│   │   │   ├── memes/              # GET/POST memes
│   │   │   ├── sounds/             # GET sounds + play tracking
│   │   │   ├── likes/              # POST/DELETE likes
│   │   │   ├── favorites/          # POST/DELETE favorites
│   │   │   ├── upload/presign/     # R2 presigned URLs
│   │   │   ├── cron/scrape/        # Auto-scraper endpoint
│   │   │   ├── search/             # Full-text search
│   │   │   ├── trending/           # Trending stats
│   │   │   ├── health/             # Health check + admin stats
│   │   │   └── profile/            # User profile API
│   │   ├── (auth)/                 # Login + Register pages
│   │   ├── meme/[id]/              # Meme detail page
│   │   ├── categories/             # Category listing + detail
│   │   ├── soundboard/             # SFX soundboard
│   │   ├── profile/                # User profile
│   │   ├── upload/                 # Upload meme or sound
│   │   ├── admin/                  # Admin panel (scraper control)
│   │   └── search/                 # Search results
│   ├── components/
│   │   ├── layout/                 # Navbar, Sidebar, MobileNav
│   │   ├── meme/                   # MemeCard, MemeGrid, FilterBar, VideoPlayer
│   │   ├── sound/                  # SoundButton
│   │   └── ui/                     # Avatar, Badge, Button, Modal, Skeleton, etc.
│   ├── hooks/                      # useAuth, useMemes, useSounds, useLikes, etc.
│   ├── lib/
│   │   ├── supabase/               # Client + Server + Middleware
│   │   ├── reddit/                 # Reddit API scraper
│   │   ├── r2/                     # Cloudflare R2 storage
│   │   └── ai/                     # AI tagger (language detect, tag gen)
│   ├── store/                      # Zustand stores (auth, notifications, filters)
│   └── types/                      # TypeScript types
├── supabase/
│   └── schema.sql                  # Full database schema + seed data
├── vercel.json                     # Cron job config (every 10 min)
└── .env.local.example              # Environment variable template
```

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `REDDIT_CLIENT_ID` | Reddit app client ID |
| `REDDIT_CLIENT_SECRET` | Reddit app client secret |
| `REDDIT_USERNAME` | Reddit account username |
| `REDDIT_PASSWORD` | Reddit account password |
| `REDDIT_USER_AGENT` | Reddit API user agent string |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key |
| `R2_BUCKET_NAME` | R2 bucket name (e.g. `memeverse-media`) |
| `R2_PUBLIC_URL` | Public URL for the bucket |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (e.g. `https://memeverse.app`) |
| `CRON_SECRET` | Random secret to protect the cron endpoint |

---

## 🚢 Deployment to Vercel

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "initial commit"
git push origin main
```

### Step 2 — Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy**

### Step 3 — Add Environment Variables

In your Vercel project → **Settings → Environment Variables**, add all variables from `.env.local.example`.

### Step 4 — Configure Cron Job

The `vercel.json` already contains:

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

Vercel Pro plans support cron jobs. On free plans, use an external service like:
- [cron-job.org](https://cron-job.org) — free, reliable
- Set up a cron to `GET https://your-domain.vercel.app/api/cron/scrape` with header `Authorization: Bearer YOUR_CRON_SECRET` every 10 minutes.

### Step 5 — Configure Supabase Auth

In Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://your-domain.vercel.app`
- **Redirect URLs**: `https://your-domain.vercel.app/**`

### Step 6 — Configure R2 CORS

In Cloudflare R2 bucket → **Settings → CORS**:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 86400
  }
]
```

---

## 🤖 Auto Content System

The scraper runs automatically every 10 minutes and:

1. **Fetches** posts from `r/memes`, `r/dankmemes`, `r/funny`, `r/me_irl`, `r/wholesomememes`
2. **Deduplicates** using the `source_id` field (e.g. `reddit_abc123`)
3. **Classifies** content as Turkish vs Global using language detection
4. **Tags** content using pattern matching on title + subreddit
5. **Scores** content using the trending algorithm: `(likes×3 + views×0.5 + reddit_score×0.1) / (hours+2)^1.5`
6. **Cleans up** old low-score content older than 30 days

To manually trigger a scrape, visit `/admin` and enter your `CRON_SECRET`.

---

## 📊 Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends `auth.users`) |
| `memes` | All meme content (image/video/gif) |
| `sounds` | SFX audio clips |
| `likes` | User likes for memes and sounds |
| `favorites` | User saved favorites |
| `views` | View analytics per meme |
| `scraper_logs` | Auto-scraper run history |

---

## 🎨 Features

- **Infinite scroll** masonry grid with lazy loading
- **Soundboard** with instant play, categories, search
- **AI tagging** — automatic tag generation from title analysis
- **Language detection** — Turkish vs Global auto-classification  
- **Trending algorithm** — time-decay scoring formula
- **Dark mode** — full dark UI with neon pink accent
- **Mobile-first** — responsive with bottom navigation
- **Rate limiting** — in-memory rate limiter on all API routes
- **Optimistic UI** — instant like/favorite updates without refresh
- **Search** — live search with debounce across memes and sounds
- **User auth** — email/password with Supabase Auth
- **File uploads** — direct-to-R2 with presigned URLs
- **SEO** — sitemap, robots.txt, OpenGraph meta

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v3 |
| Language | TypeScript |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Storage | Cloudflare R2 (S3-compatible) |
| State | Zustand + SWR |
| Fonts | Bebas Neue (display) + Outfit (body) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 🔐 Security Notes

- All write API routes require authentication
- Cron endpoint protected by `CRON_SECRET`
- Rate limiting on all API routes (60 req/min) and uploads (10/min)
- Row-level security enabled on all Supabase tables
- Service role key never exposed to client
- File upload validation: type + size checks before presigning
- Input sanitization on all user-provided text

---

## 📝 License

MIT — free to use for any project.
