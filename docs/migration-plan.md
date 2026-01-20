**Migration Plan (Supabase/Postgres → MongoDB + Supabase Storage → Cloudflare R2)**

- **Goal:** Migrate relational Postgres data and Supabase storage to MongoDB + Cloudflare R2 with zero frontend breaking changes.

**High-level steps**
1. Audit current schema and usages (done). See `scripts/001_create_tables.sql` for canonical Postgres schema.
2. Deploy MongoDB cluster and prepare target DB (env vars `MONGODB_URI`, `MONGODB_DB`).
3. Ensure Cloudflare R2 bucket is created and credentials are available (`R2_*` envs).
4. Run one-time data migration using `scripts/migrate_postgres_to_mongo.js` (requires `POSTGRES_URL`).
5. Verify data integrity and run app against MongoDB + R2 in a staging environment.
6. Switch production environment variables and deploy.

**Design choices / Schema mapping**
- Keep top-level collections mirroring tables: `profiles`, `ideas`, `idea_files`, `contact_requests`, `events`.
- Preserve original UUIDs by storing them as `_id` (string) so existing queries using `id` continue to work.
- Relationships remain reference-based (e.g., `idea_files.idea_id` -> `ideas._id`) to preserve current API patterns and minimize frontend changes.
- Justification: referencing keeps existing API contracts (`.from('idea_files').select().eq('idea_id', ...)`) intact and avoids changing queries.

**Data access layer**
- A Mongo adapter (`lib/mongo/adapter.ts`) exposes a supabase-like `from()` QueryBuilder used by existing server code. This preserves API shapes and pagination.
- For client code, `lib/supabase/client.ts` exposes `auth.getUser()` via `/api/auth/user` so client bundles don't include server-only libraries.

**Storage migration (Supabase Storage → Cloudflare R2)**
- Files are copied to R2 keeping original path structure (e.g. `ideaId/timestamp-filename`).
- The server-side upload path is adapted to call `lib/storage/r2.ts` which uses AWS SDK S3-compatible API for R2.
- Signed URLs are created via S3 presigner and returned by existing `app/api/files/signed` logic.
- Public URL pattern: `${R2_ENDPOINT}/${R2_BUCKET}/${encodeURIComponent(key)}`. If you used different public routing, adapt accordingly.

**Auth changes**
- Supabase Auth replaced with JWT-based auth for the app.
- New API routes: `/api/auth/sign-up`, `/api/auth/sign-in`, `/api/auth/sign-out`, `/api/auth/user`.
- Session cookie: `session` (httpOnly cookie). JWT secret in `JWT_SECRET` env var.
- The server-side `createClient()` checks JWT cookie and returns `{ data: { user } }` to match previous `supabase.auth.getUser()`.

**Rollback strategy**
- Keep the original Postgres database and Supabase storage unchanged until migration is validated.
- Migration is copy-only; original systems remain primary until cutover.
- To rollback after cutover, redeploy app with original Supabase configs and switch envs back.

**Test checklist**
- [ ] Sign-up/sign-in flows create accounts and set cookie.
- [ ] Server-side pages return same shapes for `ideas`, `profiles`, `events`.
- [ ] File upload: successful upload stores metadata in `idea_files` collection and file is present in R2.
- [ ] Signed URL generation returns working temporary URLs.
- [ ] Permissions: only idea owners can upload/delete files for their ideas.
- [ ] Pagination and ordering behave identically.
- [ ] Edge cases: very large files, duplicate filenames, concurrent uploads.

**Operational notes**
- Keep both systems running and route staging traffic to the new stack for validation.
- Monitor error rates and storage access logs.
- After validation, flip production envs to new Mongo + R2 endpoints.

**Scripts**
- `scripts/migrate_postgres_to_mongo.js` — sample migration tool that copies key tables preserving UUIDs.

**Security**
- Store secrets in environment variables; never leak them to client bundles.
- Use httpOnly cookies for session tokens.
- Use short-lived signed URLs for private file access.

**Future writes**
- Application code now uses `lib/mongo/adapter.ts` and `lib/storage/r2.ts` for all reads/writes in server contexts.
- Ensure any background jobs or imports use the Mongo client via `lib/mongo/client.ts`.
