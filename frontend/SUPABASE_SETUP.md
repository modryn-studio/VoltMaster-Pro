# Phase 2: Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Enter:
   - **Name**: VoltMaster Pro
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is fine for development
4. Click **Create new project** (takes ~2 minutes)

## 2. Run Database Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the contents of `supabase-schema.sql` from this directory
5. Paste into the SQL editor
6. Click **Run** (bottom right)
7. Verify all tables were created in **Table Editor**

## 3. Configure Storage Buckets

1. Go to **Storage** in the left sidebar
2. Create bucket: `job-photos`
   - **Public bucket**: ✓ Yes
   - **Allowed MIME types**: image/jpeg, image/png, image/webp
   - **Max file size**: 5 MB
3. Create bucket: `company-logos`
   - **Public bucket**: ✓ Yes
   - **Allowed MIME types**: image/jpeg, image/png, image/svg+xml
   - **Max file size**: 2 MB

## 4. Get API Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (e.g., `https://abc123xyz.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## 5. Configure Environment Variables

1. In the `frontend/` directory, create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your actual credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 6. Test the Connection

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000 - the Dashboard should now show "No jobs yet" instead of mock data (since the database is empty).

## 7. Setup Authentication (Optional - for testing)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Disable **Email confirmations** (for dev only)
4. Create a test user in **Authentication** → **Users** → **Add user**
   - Email: test@voltmaster.com
   - Password: test123456
   - Confirm password: test123456

## Next Steps

Once the database is connected:
- Dashboard will fetch real jobs from the `jobs` table
- You can test creating customers, jobs, and invoices
- Ready to proceed with Phase 3 (Authentication UI)

## Troubleshooting

**"Invalid API key" error:**
- Verify credentials in `.env.local` match Supabase dashboard
- Restart dev server after changing `.env.local`

**"relation does not exist" error:**
- Re-run `supabase-schema.sql` in SQL Editor
- Check SQL Editor for error messages

**CORS errors:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` includes `https://` protocol
- Check Network tab for actual URL being called
