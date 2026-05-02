# Deploying Backend to Render.com

This guide walks through deploying **Edda's Ledger backend** to Render.com's managed platform.

## Prerequisites

- GitHub account with backend repo pushed
- Render.com account (free or paid)
- Supabase PostgreSQL database with `DATABASE_URL` ready
- OpenRouter API key for Edda AI
- JWT secret generated (use `openssl rand -base64 32`)

## Step 1: Connect GitHub to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Select **Build and deploy from a Git repository**
4. Click **Connect account** (authorize GitHub)
5. Find and select `khalifa/eds-ledger` repository
6. Select `backend` as the root directory (if prompted)

## Step 2: Configure Build & Deploy Settings

In the Render form:

| Field | Value |
|-------|-------|
| **Name** | `eds-ledger-backend` (or your preferred service name) |
| **Environment** | `Node` |
| **Region** | `Oregon (us-west)` or closest to your users |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |

**Runtime**: Render auto-detects from Node.js and `.nvmrc` ✓

## Step 3: Add Environment Variables

In Render's **Environment** tab, add these variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres?schema=public
JWT_SECRET=[generate with: openssl rand -base64 32]
OPENROUTER_API_KEY=sk-or-v1-[your-key]
FRONTEND_URL=https://[frontend-domain]  # Update after frontend deployed
NODE_ENV=production
PORT=3001
```

> **Note**: Leave `PORT=3001`. Render automatically exposes this port.

**Never commit these secrets to git** — add them in Render UI only.

## Step 4: Configure Instance & Plan

- **Instance Type**: `Starter` (free tier) or `Standard` (paid, recommended for production)
- **Auto-deploy**: Enable ("Deploy latest commit to main")
- **Persistent Disk**: Not needed for stateless API (can add later if needed)

## Step 5: Deploy

Click **Create Web Service** to start deployment.

**Render will automatically**:
- Clone your repository
- Install dependencies (`npm install`)
- Build TypeScript (`npm run build`)
- Start the server (`node dist/main.js`)

**First deployment takes 3–5 minutes**. Watch the logs in real-time on the Render dashboard.

## Step 6: Verify Deployment

Once deployment completes:

1. **Check Render logs**:
   - Green checkmark = deployment successful
   - Look for: `listening on port 3001`

2. **Test API endpoints** (replace `your-service-name` with your actual Render service name):

   ```bash
   # Health check
   curl https://your-service-name.onrender.com/health
   
   # Test auth endpoint
   curl -X POST https://your-service-name.onrender.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Check Render URL**:
   - Your backend is now live at: `https://your-service-name.onrender.com`
   - Share this with frontend for `NEXT_PUBLIC_API_URL`

## Step 7: Update Frontend with Backend URL

After backend is live:

1. Get your Render backend URL: `https://your-service-name.onrender.com`
2. Update frontend `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-service-name.onrender.com
   ```
3. Redeploy frontend to pick up new URL

## Troubleshooting

### Deployment Fails During Build

**Error**: `npm ERR! code ERESOLVE`
- **Fix**: Render may have limited build resources. Try clearing Render's build cache:
  - In Render dashboard, go to Settings → Redeploy

**Error**: `Prisma Client Generation Failed`
- **Fix**: Add to package.json postinstall:
  ```json
  "postinstall": "prisma generate"
  ```

### Application Crashes on Startup

**Error**: `DATABASE_URL is not defined`
- **Fix**: Verify all env vars are set in Render dashboard (Settings → Environment)

**Error**: `Port already in use`
- **Fix**: Ensure `PORT` env var is 3001 (Render default)

### API Returns 500 Errors

**Check Render Logs**:
- Click on recent deployment
- Scroll to **Logs** section
- Look for stack traces

**Common Issues**:
1. Database connection → Verify `DATABASE_URL` is correct
2. Missing env var → Check all vars in Render Settings
3. Prisma schema out of sync → Run migrations manually (see below)

## Running Migrations on Render

If you need to manually run Prisma migrations:

### Option 1: Run via Render Shell (One-time)

1. Open Render dashboard → Your service → **Shell**
2. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed  # if you have seeds
   ```

### Option 2: Add Migration Step to Build

Edit build command to include migrations:
```
npm install && npm run build && npx prisma migrate deploy
```

> **Note**: This adds ~30 seconds to every deployment. Use Option 1 for one-time migrations.

## Monitoring & Maintenance

### View Logs
- Render Dashboard → Service → **Logs** → Real-time streaming

### Set Up Alerts
- Render Dashboard → Service → **Settings** → Notifications
- Enable email alerts for deploy failures

### Manual Redeploy
- Render Dashboard → Service → **Manual Deploy** → Choose branch
- Useful if you forgot to commit/push a change

## Cost Estimates

| Plan | Pricing | Ideal For |
|------|---------|-----------|
| **Free** | $0/month | Development, testing |
| **Starter** | $7/month | Low-traffic production |
| **Standard** | $25+/month | Production with guaranteed uptime |

> Render free tier sleeps after 15 min of inactivity. First request after sleep takes 30 sec to wake. Upgrade to Starter for consistent performance.

## Next Steps

1. ✅ Backend deployed on Render
2. Deploy frontend (Next.js) to Vercel
3. Connect frontend & backend via API URLs
4. Set up monitoring & error tracking (Sentry recommended)
5. Configure custom domain (optional)

## Useful Links

- [Render Documentation](https://render.com/docs)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Prisma on Render](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/overview#connection-pooling) (optional performance tuning)
