-- Apply this after reviews_migration.sql on databases where the original
-- migration was already run. It removes all Discord identity data from the
-- columns available to browsers, including authenticated visitors.

begin;

alter table public.reviews
  add column if not exists public_display_name text,
  add column if not exists public_avatar_token uuid not null default gen_random_uuid();

create unique index if not exists reviews_public_avatar_token_idx
  on public.reviews (public_avatar_token);

drop index if exists public.reviews_one_pending_per_auth_user_idx;
drop index if exists public.reviews_one_pending_per_discord_user_idx;

update public.reviews
set public_display_name = case
  when char_length(btrim(coalesce(discord_display_name, discord_username, 'Client'))) >= 3
    then left(btrim(coalesce(discord_display_name, discord_username, 'Client')), 2)
      || '***'
      || right(btrim(coalesce(discord_display_name, discord_username, 'Client')), 1)
  else left(btrim(coalesce(discord_display_name, discord_username, 'Client')), 2) || '***'
end;

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
  discord_id := coalesce(nullif(user_metadata ->> 'provider_id', ''), nullif(user_metadata ->> 'discord_id', ''));
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
  new.public_display_name := case
    when char_length(btrim(new.discord_display_name)) >= 3
      then left(btrim(new.discord_display_name), 2) || '***' || right(btrim(new.discord_display_name), 1)
    else left(btrim(new.discord_display_name), 2) || '***'
  end;
  new.discord_avatar_url := coalesce(nullif(user_metadata ->> 'avatar_url', ''), nullif(user_metadata ->> 'picture', ''));
  new.status := 'approved';
  new.reviewed_at := now();
  new.discord_verified := true;
  new.project_type := btrim(new.project_type);
  new.review := btrim(new.review);

  if to_jsonb(new) ? 'username' then
    new := jsonb_populate_record(new, jsonb_build_object('username', discord_name));
  end if;

  return new;
end
$function$;

revoke all on function public.secure_new_review_identity() from public, anon, authenticated;

drop policy if exists reviews_read_own_pending on public.reviews;
drop policy if exists reviews_discord_insert_pending on public.reviews;
drop policy if exists reviews_discord_insert_approved on public.reviews;

create policy reviews_discord_insert_approved
on public.reviews
for insert
to authenticated
with check (
  auth_user_id = auth.uid()
  and status = 'approved'
  and discord_verified = true
);

alter table public.reviews
  alter column status set default 'approved';

update public.reviews
set status = 'approved',
    reviewed_at = coalesce(reviewed_at, now())
where status = 'pending'
  and discord_verified = true;

revoke all on table public.reviews from anon, authenticated;

grant select (
  public_display_name,
  public_avatar_token,
  discord_verified,
  project_type,
  rating,
  review,
  created_at
) on public.reviews to anon;

grant select (
  id,
  public_display_name,
  public_avatar_token,
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
