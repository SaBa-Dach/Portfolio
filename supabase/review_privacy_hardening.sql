-- Apply this after reviews_migration.sql on databases where the original
-- migration was already run. It removes all Discord identity data from the
-- columns available to browsers, including authenticated visitors.

begin;

revoke all on table public.reviews from anon, authenticated;

grant select (
  discord_verified,
  project_type,
  rating,
  review,
  created_at
) on public.reviews to anon;

grant select (
  id,
  discord_verified,
  project_type,
  rating,
  review,
  status,
  created_at
) on public.reviews to authenticated;

grant insert (project_type, rating, review)
on public.reviews to authenticated;

commit;
