# Deployment Guide — From Zero to Live

> **Target audience:** First-year CS student.  
> **Goal:** Take the project from your laptop → running live on the internet.

---

## Table of Contents

1. [What We're Building](#1-what-were-building)
2. [The Services You Need](#2-the-services-you-need)
3. [Step 1: Create Supabase (Your Database)](#3-step-1-create-supabase-your-database)
4. [Step 2: Get Your Database Connection String](#4-step-2-get-your-database-connection-string)
5. [Step 3: Switch Prisma from SQLite to Postgres](#5-step-3-switch-prisma-from-sqlite-to-postgres)
6. [Step 4: Run Migrations](#6-step-4-run-migrations)
7. [Step 5: Seed Your Database](#7-step-5-seed-your-database)
8. [Step 6: Set Up Upstash Redis (Rate Limiting)](#8-step-6-set-up-upstash-redis-rate-limiting)
9. [Step 7: Set Up DoubleTick (WhatsApp)](#9-step-7-set-up-doubletick-whatsapp)
10. [Step 8: Deploy to Vercel](#10-step-8-deploy-to-vercel)
11. [Step 9: Add All Environment Variables in Vercel](#11-step-9-add-all-environment-variables-in-vercel)
12. [Step 10: Set Up Vercel Cron Job](#12-step-10-set-up-vercel-cron-job)
13. [Step 11: Replace the WhatsApp Mock](#13-step-11-replace-the-whatsapp-mock)
14. [Step 12: Wire Up Redis for Rate Limiting](#14-step-12-wire-up-redis-for-rate-limiting)
15. [Final Checklist](#15-final-checklist)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. What We're Building

A lucky draw web app for Nippon Toyota:

- **Customers** scan a QR code at a showroom → fill a form → get WhatsApp confirmation
- **Admins** log in to a dashboard → see entries → pick winners
- **The system** prevents fraud, duplicate entries, and spam

Right now it runs on your laptop with a SQLite file (`dev.db`).  
We're moving it to the cloud so anyone can use it.

---

## 2. The Services You Need

Think of these like utilities you plug into your app:

| Service | What it does | Cost |
|---------|-------------|------|
| **Supabase** | Your database. Like Excel but for code. Free tier: 500MB | Free |
| **Vercel** | Hosts your website. Like putting your app on the internet. | Free |
| **Upstash** | Redis (fast memory storage). For rate limiting. | Free |
| **DoubleTick** | Sends WhatsApp messages. Uses Nippon Toyota's account. | Paid |

---

## 3. Step 1: Create Supabase (Your Database)

Supabase gives you a Postgres database in the cloud. Postgres is just a more powerful version of SQLite.

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (sign up with GitHub if needed)
3. Click **"New project"**
4. Fill in:
   - **Name:** `nippon-toyota-luckydraw` (anything works)
   - **Database Password:** Click "Generate" — copy it somewhere safe!
   - **Region:** Pick `Mumbai` (closest to your users in India)
5. Click **"Create new project"**
6. Wait 1-2 minutes while it spins up

---

## 4. Step 2: Get Your Database Connection String

Think of this like a URL that tells your app where the database lives.

1. In Supabase → left sidebar → **Project Settings** (gear icon)
2. Click **"Database"** in the menu
3. Scroll down to **"Connection string"**
4. Make sure **"URI"** is selected
5. Copy the whole string. It looks like this:

```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:6543/postgres
```

6. You'll see two ports mentioned:
   - **Port 6543** — for your app (uses a "pooler" — good for serverless)
   - **Port 5432** — for running migrations (direct connection)

Now go to your project on your laptop. Open `.env` and **replace** the old SQLite line:

```env
# OLD (SQLite — delete this):
DATABASE_URL="file:./dev.db"

# NEW (Postgres — paste what you copied):
DATABASE_URL="postgresql://postgres:YOUR_PW@db.xxxxx.supabase.co:6543/postgres"

# Also add this (for migrations):
DIRECT_URL="postgresql://postgres:YOUR_PW@db.xxxxx.supabase.co:5432/postgres"
```

> ⚠️ Replace `YOUR_PW` with the password you saved.  
> ⚠️ Replace `xxxxx` with your project's random string.

---

## 5. Step 3: Switch Prisma from SQLite to Postgres

Prisma is the tool we use to talk to the database. We need to tell it we're using Postgres now.

**Open `prisma/schema.prisma`** and change line 5-6:

```prisma
// OLD:
datasource db {
  provider = "sqlite"      // ← change this
  url      = env("DATABASE_URL")
}

// NEW:
datasource db {
  provider = "postgresql"  // ← to this
  url      = env("DATABASE_URL")
}
```

That's it. Just one word change. Prisma handles the rest.

---

## 6. Step 4: Run Migrations

Migrations are like "save version 1" of your database structure. Think of it like creating all the tables in your new database.

Open a terminal in your project folder and run:

```bash
# Step 4a: Create the migration files
npx prisma migrate dev --name init
```

This creates a folder `prisma/migrations/` with the instructions to build your database.

```bash
# Step 4b: Apply them to your Supabase database
npx prisma migrate deploy
```

> 💡 **Note:** `migrate dev` is for creating migrations. `migrate deploy` is for applying them. In production, you run `migrate deploy`.

**Verify it worked:**

```bash
# Opens a browser with a GUI to see your tables
npx prisma studio
```

You should see 5 empty tables: `branches`, `models`, `colours`, `entries`, `winners`, `whatsapp_logs`.

---

## 7. Step 5: Seed Your Database

"Seeding" means adding initial data — your 5 showroom branches and 4 Toyota models with their colours.

```bash
npx prisma db seed
```

This runs the `seed.ts` file. You should see:

```
Seeding data...
Seeding complete!
```

Check Prisma Studio again — your tables should now have data.

---

## 8. Step 6: Set Up Upstash Redis (Rate Limiting)

Redis is a super-fast memory storage. We use it to count how many times someone submits the form.

**Why not stay with the in-memory Map?**  
Because Vercel turns off your server when nobody visits. When it turns back on, the Map is empty. Redis stays alive forever.

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Click **"Create Database"**
4. Give it a name: `nippon-luckydraw`
5. Region: `Mumbai` (same as your database)
6. Click **"Create"**
7. On the next screen, copy two things:
   - **REST URL** (looks like `https://xxxx.upstash.io`)
   - **REST Token** (long random string)

Add these to your `.env`:

```env
UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

Then in your code (`src/app/actions/entry.ts`), you need to **replace the Map-based rate limiter** with Redis calls. We'll note this in the checklist.

---

## 9. Step 7: Set Up DoubleTick (WhatsApp)

DoubleTick sends WhatsApp messages using Nippon Toyota's business account.

### Get your API credentials:

1. Go to [DoubleTick.io](https://doubletick.io)
2. Log in with Nippon Toyota's business account
3. Go to **Settings → API Keys**
4. Click **"Generate New Key"**
5. Copy the key

### Create a message template:

1. In DoubleTick, go to **Templates**
2. Click **"Create Template"**
3. Name it: `luckydraw_confirmation` (must match what the code expects)
4. Add these placeholder variables that will be filled in:
   - `{{name}}` — customer name
   - `{{branchName}}` — showroom name
   - `{{vehicle}}` — model + colour
   - `{{vin}}` — VIN number
   - `{{confirmationUrl}}` — link to their confirmation page
5. Submit for approval (this takes a few hours)

Add to `.env`:

```env
DOUBLETICK_API_KEY="dbt-your-api-key"
DOUBLETICK_API_URL="https://api.doubletick.io/v1"
DOUBLETICK_WEBHOOK_SECRET="whsec-your-webhook-secret"
```

---

## 10. Step 8: Deploy to Vercel

Vercel hosts your app. Every time you push code to GitHub, Vercel automatically updates your live site.

### 8a: Push your code to GitHub (if you haven't)

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 8b: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New → Project"**
4. Find your GitHub repo (`nippon-luckydraw`) and click **"Import"**
5. Vercel will auto-detect it's a Next.js app — leave everything as-is
6. **Do NOT click "Deploy" yet** — we need to add environment variables first

---

## 11. Step 9: Add All Environment Variables in Vercel

Environment variables are like secret settings. Your app reads them at runtime.

In the Vercel project setup screen, scroll to **"Environment Variables"** and add these one by one:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Supabase connection string (port 6543) |
| `DIRECT_URL` | Your Supabase connection string (port 5432) |
| `SESSION_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in your terminal |
| `ADMIN_PASSWORD` | A strong password you choose |
| `ADMIN_EMAIL` | `admin@nippontoyota.com` |
| `NEXT_PUBLIC_APP_URL` | `https://nippontoyota-onam.vercel.app` |
| `CRON_SECRET` | Another random string (`openssl rand -base64 32`) |
| `DOUBLETICK_API_KEY` | From DoubleTick dashboard |
| `DOUBLETICK_API_URL` | `https://api.doubletick.io/v1` |
| `UPSTASH_REDIS_REST_URL` | From Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash |

> ⚠️ **Add EVERY variable to both "Production" and "Preview" environments** (toggle at the top).

Now click **"Deploy"**. Wait 1-2 minutes.

**Your app is now live at:** `https://nippontoyota-onam.vercel.app`

---

## 12. Step 10: Set Up Vercel Cron Job

A cron job is like an alarm clock that runs a task every 5 minutes.  
Our WhatsApp queue uses this to retry failed messages.

Create a file called `vercel.json` in your project root (if it doesn't exist):

```json
{
  "crons": [
    {
      "path": "/api/cron/whatsapp",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This tells Vercel: "Every 5 minutes, call `/api/cron/whatsapp` to check for unsent WhatsApp messages."

Push this change to GitHub — Vercel will auto-deploy.

> 💡 Vercel Cron Jobs run on the **Pro plan** ($20/month). On the free plan, the WhatsApp retry feature won't auto-run. But the messages will still be stored in the database and can be sent later.

---

## 13. Step 11: Replace the WhatsApp Mock

The current `src/lib/doubletick.ts` just logs to the console. We need it to actually call DoubleTick.

Replace the entire file with:

```typescript
export async function sendWhatsAppMessage(
  phone: string,
  templateName: string,
  variables: Record<string, string>
) {
  const apiKey = process.env.DOUBLETICK_API_KEY;
  const apiUrl = process.env.DOUBLETICK_API_URL || "https://api.doubletick.io/v1";

  if (!apiKey) {
    throw new Error("DOUBLETICK_API_KEY not configured");
  }

  const response = await fetch(`${apiUrl}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to: phone,
      template: templateName,
      params: variables,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`DoubleTick API error (${response.status}): ${errorBody}`);
  }

  return response.json();
}
```

---

## 14. Step 12: Wire Up Redis for Rate Limiting

The current rate limiter uses an in-memory Map. On Vercel, this Map disappears whenever the server goes to sleep.

You need to replace the `checkRateLimit` function in `src/app/actions/entry.ts` with Redis code.

**Simple approach using Upstash REST API:**

```typescript
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisSet(key: string, value: string, ttlSeconds: number) {
  await fetch(`${UPSTASH_URL}/set/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    body: JSON.stringify(value),
  });
  await fetch(`${UPSTASH_URL}/expire/${key}/${ttlSeconds}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
}

async function redisIncr(key: string): Promise<number> {
  const res = await fetch(`${UPSTASH_URL}/incr/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const data = await res.json();
  return data.result;
}
```

Then replace the Map-based checks with:
```typescript
const ipCount = await redisIncr(`rate:ip:${ip}`);
// If this is the first request, set expiry
if (ipCount === 1) {
  await fetch(`${UPSTASH_URL}/expire/rate:ip:${ip}/60`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
}
if (ipCount > 5) return { error: "Too many requests" };
```

---

## 15. Final Checklist

Before telling customers to use it, go through this:

- [ ] **Can you visit the site?** Go to `https://nippontoyota-onam.vercel.app/enter/kochi-edappally`
- [ ] **Can you submit a form?** Fill it out, see the confirmation page
- [ ] **Duplicate phone rejected?** Try submitting with the same phone → should show error
- [ ] **Duplicate VIN rejected?** Same test with VIN
- [ ] **Admin login works?** Visit `/admin/login`, use your credentials
- [ ] **Dashboard shows entries?** You should see the test entry you submitted
- [ ] **Draw works?** Click "Draw 3 Winners At Once" → should pick winners
- [ ] **Winners page shows?** Visit `/winners` — should show the branch and winners
- [ ] **WhatsApp message sent?** Check console logs or DoubleTick dashboard
- [ ] **Vercel deployment logs clean?** Vercel Dashboard → Deployments → Latest → Logs
- [ ] **No error in browser console?** Open DevTools (F12) → Console

---

## 16. Troubleshooting

### "Prisma: Can't reach database server"

- Check `DATABASE_URL` is correct in Vercel environment variables
- Make sure Supabase project is not paused (free tier pauses after 1 week of inactivity)
- Go to Supabase Dashboard → hit "Restart project" if paused

### "Connection refused" on migrations

- Make sure you're using port **5432** for `DIRECT_URL` (migrations) and **6543** for `DATABASE_URL` (app)
- Check Supabase project hasn't run out of connections

### "Admin login doesn't work"

- Make sure `ADMIN_PASSWORD` and `ADMIN_EMAIL` are set in Vercel env vars
- Clear your browser cookies for the site
- Try again

### "npm run build fails on Vercel"

Common fix: make sure `next.config.ts` has:
```ts
const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  // ... other config
};
```

### "Entry submitted but I don't get WhatsApp"

- The current code has a **mock** — it just logs to console. Replace it with real DoubleTick code (Step 11)
- Check `/api/cron/whatsapp` is running (Vercel Pro plan needed)
- Check DoubleTick API key is valid and template is approved

### "Rate limiting doesn't work"

- If you're still using the in-memory Map (Step 12 not done), it resets on every Vercel cold start
- You must wire Upstash Redis for rate limiting to actually work in production

---

## Quick Reference: All Commands in One Place

```bash
# === Local Development ===

# Start the dev server
npm run dev

# Open database GUI
npx prisma studio

# Run Prisma migration
npx prisma migrate dev --name init

# Apply migration to database
npx prisma migrate deploy

# Seed data
npx prisma db seed

# === Deployment ===

# Push to GitHub (triggers Vercel auto-deploy)
git add .
git commit -m "message"
git push origin main

# === Production Checks ===

# TypeScript check
npx tsc --noEmit

# Production build (same as Vercel)
npm run build
```

---

That's it. You've moved from a local SQLite file on your laptop to a cloud-hosted Postgres database on Supabase, with your app live on Vercel, WhatsApp integration through DoubleTick, and rate limiting through Upstash Redis.
