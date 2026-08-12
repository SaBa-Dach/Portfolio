# inbo developer portfolio

The portfolio is a static site with a Discord-authenticated, manually moderated review system backed by Supabase.

## Review system setup

### Supabase

1. Open the Supabase project, go to **SQL Editor**, and run [`supabase/reviews_migration.sql`](supabase/reviews_migration.sql). The migration preserves existing rows and marks legacy reviews as approved. If the original migration was already applied, also run [`supabase/review_privacy_hardening.sql`](supabase/review_privacy_hardening.sql).
2. Go to **Authentication → Providers → Discord**, enable Discord, and enter the Discord application's Client ID and Client Secret. Keep the Client Secret only in Supabase.
3. In **Authentication → URL Configuration**, set the production Site URL to `https://inbodev.com` and allow `https://inbodev.com` as a redirect URL. Add the exact localhost origin separately when testing locally.
4. Moderate submissions in **Table Editor → reviews** by changing `status` from `pending` to `approved` or `rejected`. `reviewed_at` is filled automatically when the status changes. Pending submissions are never returned to the public review grid, including to their author.

### Discord Developer Portal

1. Create or select an application at the Discord Developer Portal and open **OAuth2 → General**.
2. Add this exact redirect URL:

   `https://elagiztpcujnyfpnhjwn.supabase.co/auth/v1/callback`

3. Copy the application's Client ID and Client Secret into the Supabase Discord provider settings—not into this repository or any browser JavaScript.

## Security model

- Anonymous visitors can select only approved reviews. Public review responses expose only a server-generated masked name such as `Sa***h` and a random avatar proxy token; they exclude Supabase user IDs, Discord user IDs, full Discord usernames, full display names, and Discord CDN avatar URLs.
- Discord-authenticated users can insert only `project_type`, `rating`, and `review`.
- A database trigger derives the Supabase UUID and Discord identity from the authenticated JWT, and always forces new submissions to `pending`.
- Browser roles receive no update or delete permission, so reviewers cannot moderate records.
- A client may submit multiple reviews; every submission starts as `pending` and requires moderation independently.
- The Supabase anon key in `reviews.js` is intentionally public; security depends on the included RLS policies and column grants. Never add a service-role key, database password, or Discord Client Secret to frontend code.
