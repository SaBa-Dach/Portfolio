-- Discord-authenticated, moderated reviews migration.
-- Safe for the existing public.reviews table: existing rows are retained and approved.

begin;

alter table public.reviews
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists discord_user_id text,
  add column if not exists discord_username text,
  add column if not exists discord_display_name text,
  add column if not exists discord_avatar_url text,
  add column if not exists status text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists discord_verified boolean not null default false;

-- Keep existing legitimate reviews public without inventing authenticated identity data.
update public.reviews
set status = 'approved'
where status is null;

-- Populate legacy display fields from the old username column when it exists.
do $migration$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'reviews'
      and column_name = 'username'
  ) then
    execute $sql$
      update public.reviews
      set discord_username = coalesce(discord_username, username),
          discord_display_name = coalesce(discord_display_name, username)
      where auth_user_id is null
    $sql$;
  end if;
end
$migration$;

alter table public.reviews
  alter column status set default 'pending',
  alter column status set not null,
  alter column created_at set default now();

-- Add constraints idempotently. NOT VALID preserves any unusual legacy row while
-- still enforcing the rules for every new or changed row.
do $migration$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_status_check' and conrelid = 'public.reviews'::regclass) then
    alter table public.reviews add constraint reviews_status_check
      check (status in ('pending', 'approved', 'rejected')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_rating_check' and conrelid = 'public.reviews'::regclass) then
    alter table public.reviews add constraint reviews_rating_check
      check (rating is not null and rating between 1 and 5) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_project_type_check' and conrelid = 'public.reviews'::regclass) then
    alter table public.reviews add constraint reviews_project_type_check
      check (project_type is not null and char_length(btrim(project_type)) between 2 and 80) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_review_check' and conrelid = 'public.reviews'::regclass) then
    alter table public.reviews add constraint reviews_review_check
      check (review is not null and char_length(btrim(review)) between 20 and 600) not valid;
  end if;
end
$migration$;

create index if not exists reviews_approved_created_at_idx
  on public.reviews (created_at desc)
  where status = 'approved';

create index if not exists reviews_auth_user_id_idx
  on public.reviews (auth_user_id);

-- Database-backed spam protection: one pending submission per account/Discord ID.
create unique index if not exists reviews_one_pending_per_auth_user_idx
  on public.reviews (auth_user_id)
  where status = 'pending' and auth_user_id is not null;

create unique index if not exists reviews_one_pending_per_discord_user_idx
  on public.reviews (discord_user_id)
  where status = 'pending' and discord_user_id is not null;

create or replace function public.secure_new_review_identity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  user_metadata jsonb;
  discord_id text;
  discord_name text;
begin
  if auth.uid() is null then
    raise exception 'Discord authentication is required';
  end if;

  -- Read the identity from Supabase Auth's protected tables, never from the insert payload.
  select u.raw_user_meta_data
  into user_metadata
  from auth.users as u
  where u.id = auth.uid()
    and exists (
      select 1
      from auth.identities as auth_identity
      where auth_identity.user_id = u.id
        and auth_identity.provider = 'discord'
    );

  if user_metadata is null then
    raise exception 'Discord authentication is required';
  end if;

  user_metadata := coalesce(user_metadata, '{}'::jsonb);

  discord_id := coalesce(
    nullif(user_metadata ->> 'provider_id', ''),
    nullif(user_metadata ->> 'discord_id', '')
  );
  discord_name := coalesce(
    nullif(user_metadata ->> 'user_name', ''),
    nullif(user_metadata ->> 'preferred_username', ''),
    nullif(user_metadata ->> 'name', '')
  );

  if discord_id is null or discord_name is null then
    raise exception 'Discord identity metadata is incomplete';
  end if;

  new.auth_user_id := auth.uid();
  new.discord_user_id := discord_id;
  new.discord_username := discord_name;
  new.discord_display_name := coalesce(
    nullif(user_metadata ->> 'full_name', ''),
    nullif(user_metadata ->> 'global_name', ''),
    nullif(user_metadata ->> 'name', ''),
    discord_name
  );
  new.discord_avatar_url := coalesce(
    nullif(user_metadata ->> 'avatar_url', ''),
    nullif(user_metadata ->> 'picture', '')
  );
  new.status := 'pending';
  new.reviewed_at := null;
  new.discord_verified := true;
  new.project_type := btrim(new.project_type);
  new.review := btrim(new.review);

  -- Retain compatibility if the legacy username column is still NOT NULL.
  if to_jsonb(new) ? 'username' then
    new := jsonb_populate_record(new, jsonb_build_object('username', discord_name));
  end if;

  return new;
end
$function$;

revoke all on function public.secure_new_review_identity() from public, anon, authenticated;

drop trigger if exists secure_new_review_identity_trigger on public.reviews;
create trigger secure_new_review_identity_trigger
before insert on public.reviews
for each row execute function public.secure_new_review_identity();

create or replace function public.set_reviewed_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $function$
begin
  if new.status is distinct from old.status then
    new.reviewed_at := case
      when new.status in ('approved', 'rejected') then now()
      else null
    end;
  end if;
  return new;
end
$function$;

revoke all on function public.set_reviewed_at() from public, anon, authenticated;

drop trigger if exists set_reviewed_at_trigger on public.reviews;
create trigger set_reviewed_at_trigger
before update on public.reviews
for each row execute function public.set_reviewed_at();

alter table public.reviews enable row level security;
alter table public.reviews force row level security;

-- Remove every previous policy so an older permissive rule cannot bypass moderation.
do $migration$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'reviews'
  loop
    execute format('drop policy if exists %I on public.reviews', policy_record.policyname);
  end loop;
end
$migration$;

create policy reviews_public_read_approved
on public.reviews
for select
to anon, authenticated
using (status = 'approved');

create policy reviews_read_own_pending
on public.reviews
for select
to authenticated
using (auth_user_id = auth.uid() and status = 'pending');

create policy reviews_discord_insert_pending
on public.reviews
for insert
to authenticated
with check (
  auth_user_id = auth.uid()
  and status = 'pending'
  and discord_verified = true
);

-- Column privileges prevent approved rows from leaking private IDs and prevent
-- browser clients from supplying identity or moderation fields on insert.
revoke all on table public.reviews from anon, authenticated;

grant select (
  discord_username,
  discord_display_name,
  discord_avatar_url,
  discord_verified,
  project_type,
  rating,
  review,
  created_at
) on public.reviews to anon;

grant select (
  id,
  discord_username,
  discord_display_name,
  discord_avatar_url,
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
