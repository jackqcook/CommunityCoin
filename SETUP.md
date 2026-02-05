# CommunityCoin Setup Guide

This guide walks you through setting up Supabase database and Alchemy webhooks for real-time blockchain indexing.

---

## 1. Supabase Setup

### Option A: Cloud Supabase (Recommended for Production)

1. **Create a project** at [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose your organization
   - Name it `communitycoin` (or your preferred name)
   - Choose a strong database password
   - Select a region close to your users

2. **Get your credentials** from Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY` (keep this secret!)

3. **Run the migration**:
   
   Go to the **SQL Editor** in your Supabase dashboard and paste the contents of:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
   
   Then click "Run".

### Option B: Local Supabase (For Development)

1. **Install Docker** if you haven't: [docker.com/get-started](https://docker.com/get-started)

2. **Start local Supabase**:
   ```bash
   cd /Users/jackcook/Desktop/CommunityCoin
   supabase init
   supabase start
   ```

3. **Get local credentials**:
   ```bash
   supabase status
   ```
   This will show you the local URL and keys.

4. **Run migration locally**:
   ```bash
   supabase db push
   ```

### Add Environment Variables

Add these to your `.env` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Alchemy Webhook Setup

Alchemy webhooks provide **real-time** blockchain event notifications—much faster than polling!

### Step 1: Create Alchemy Account

1. Sign up at [alchemy.com](https://alchemy.com)
2. Create a new app:
   - Name: `CommunityCoin`
   - Chain: **Polygon**
   - Network: **Mumbai** (testnet) or **Mainnet**

3. Copy your **API Key** → `NEXT_PUBLIC_ALCHEMY_API_KEY`

### Step 2: Deploy Your App

Before setting up webhooks, you need a public URL. Deploy to Vercel:

```bash
vercel deploy
```

Note your deployment URL (e.g., `https://communitycoin.vercel.app`)

### Step 3: Create Webhook

1. Go to [Alchemy Dashboard → Webhooks](https://dashboard.alchemy.com/webhooks)
2. Click **"Create Webhook"**
3. Configure:
   - **Chain**: Polygon
   - **Network**: Mumbai (or Mainnet)
   - **Webhook URL**: `https://your-app.vercel.app/api/webhooks/alchemy`
   - **Webhook Type**: Select "Address Activity"

4. Add the addresses to monitor:
   - Your **GroupFactory contract address**
   - Any existing **CommunityToken contract addresses**

5. Save and copy the **Signing Key** → `ALCHEMY_WEBHOOK_SIGNING_KEY`

### Step 4: Configure Event Filters (Optional but Recommended)

For more efficient indexing, filter to only the events you care about:

1. In the webhook settings, add event filters
2. Filter by these event signatures:
   - `GroupCreated(address,address,address,string,string,string,bool)`
   - `TokensPurchased(address,uint256,uint256,uint256)`
   - `TokensSold(address,uint256,uint256,uint256)`

---

## 3. Environment Variables Summary

Here's everything you need in your `.env` file:

```bash
# ===========================================
# AUTHENTICATION (Already set up with Privy)
# ===========================================
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# ===========================================
# DATABASE - Supabase
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...

# ===========================================
# BLOCKCHAIN - Alchemy + Polygon
# ===========================================
NEXT_PUBLIC_CHAIN_ID=80001
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_GROUP_FACTORY_ADDRESS=0x...

# ===========================================
# WEBHOOKS
# ===========================================
ALCHEMY_WEBHOOK_SIGNING_KEY=your_webhook_signing_key
CRON_SECRET=generate_a_random_string_here

# ===========================================
# OPTIONAL - Messaging & Storage
# ===========================================
NEXT_PUBLIC_XMTP_ENV=dev
PINATA_JWT=your_pinata_jwt
```

---

## 4. Verify Setup

### Test Supabase Connection

```bash
npm run dev
```

Open the app and check the browser console. You should see successful Supabase connections.

### Test Webhook (Manual)

You can test the webhook endpoint manually:

```bash
curl -X POST https://your-app.vercel.app/api/webhooks/alchemy \
  -H "Content-Type: application/json" \
  -d '{"type":"MINED_TRANSACTION","event":{"activity":[]}}'
```

Should return: `{"success":true}`

### Test Cron Job

```bash
curl https://your-app.vercel.app/api/cron/index-groups \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 5. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   HOW DATA STAYS FRESH                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. User buys tokens on Polygon                                │
│      ↓                                                          │
│   2. Alchemy detects event (1-3 seconds)                        │
│      ↓                                                          │
│   3. Webhook calls /api/webhooks/alchemy                        │
│      ↓                                                          │
│   4. Indexer updates Supabase                                   │
│      ↓                                                          │
│   5. Supabase Realtime pushes to UI                            │
│      ↓                                                          │
│   6. TanStack Query updates cache                               │
│      ↓                                                          │
│   7. UI reflects new balance instantly!                         │
│                                                                  │
│   Backup: Cron job polls every 5 minutes for missed events      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Troubleshooting

### "supabaseUrl is required" error
- Make sure your `.env` file has `NEXT_PUBLIC_SUPABASE_URL` set
- Restart your dev server after adding env vars

### Webhook not receiving events
- Check the webhook URL is correct and publicly accessible
- Verify the signing key matches
- Check Alchemy dashboard for delivery logs

### Data not updating in real-time
- Enable Realtime in Supabase dashboard for your tables
- Check browser console for WebSocket connection errors

### Migration fails
- Make sure you're running the SQL in the correct project
- Check for any existing tables that might conflict

---

## Quick Commands Reference

```bash
# Start development
npm run dev

# Run Supabase locally
supabase start

# Push migrations
supabase db push

# Check Supabase status
supabase status

# Deploy to Vercel
vercel deploy --prod

# Generate types from Supabase (optional)
supabase gen types typescript --local > lib/types/supabase.ts
```

---

## Next Steps

1. ✅ Set up Supabase (you're here!)
2. ✅ Set up Alchemy webhooks
3. Deploy smart contracts (Phase 5)
4. Connect XMTP for messaging (Phase 2)
5. Add IPFS for file storage (Phase 3)

Happy building! 🚀
