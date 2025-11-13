# StartupShowcasePortal

A Next.js + Supabase starter for sharing student startup ideas. This repo provides a small showcase app with user auth, idea submission, featured ideas, and file uploads backed by Supabase.

**Key Features**
- User authentication (Supabase)
- Submit and browse ideas with categories and tags
- Featured ideas section and admin moderation pages
- File uploads stored in Supabase Storage
- API routes for admin operations and signed file URLs


**Project Structure (high level)**
- `app/` - Next.js app routes and pages (server components)
- `components/` - Reusable React components and UI primitives
- `lib/supabase/` - Supabase client helpers (`client.ts`, `server.ts`) and auth helpers
- `api/` - Route handlers under `app/api/...` for actions like admin, uploads, signed URLs
- `scripts/` - Helper scripts:
  - `001_create_tables.sql` — DB schema SQL
  - `ensure_bucket.js` — Ensures the Supabase storage bucket exists (requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`)
- `public/` - Static assets
- `styles/` - Global CSS
- `types/` - Type definitions



**Contact / Maintainers**
- Owner: `notankith` (GitHub)

---

