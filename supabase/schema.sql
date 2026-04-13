create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text,
  bio text,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  status text not null default 'active' check (status in ('active', 'restricted', 'banned')),
  restricted_until timestamptz,
  moderation_note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.spots (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  latitude double precision not null,
  longitude double precision not null,
  campus_area text not null,
  best_time text not null,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden', 'rejected', 'merged')),
  tips text[] not null default '{}',
  tags text[] not null default '{}',
  canonical_spot_id uuid references public.spots(id) on delete set null,
  duplicate_of uuid references public.spots(id) on delete set null,
  is_duplicate boolean not null default false,
  merged_into_spot_id uuid references public.spots(id) on delete set null,
  merged_at timestamptz,
  merged_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  moderation_note text,
  rejection_reason text,
  hide_reason text,
  is_featured boolean not null default false,
  featured_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  image_url text not null,
  title text not null,
  caption text,
  photographer_name text not null,
  visitor_id text,
  shot_time timestamptz,
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden', 'rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  moderation_note text,
  rejection_reason text,
  hide_reason text,
  is_featured boolean not null default false,
  featured_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  visitor_id text,
  spot_id uuid not null references public.spots(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('spot', 'photo')),
  target_id uuid not null,
  reason text not null check (reason in ('wrong location', 'inappropriate image', 'spam', 'duplicate', 'other')),
  note text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  resolution_note text,
  internal_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('spot', 'photo', 'report')),
  target_id uuid not null,
  action text not null check (
    action in (
      'publish',
      'hide',
      'reject',
      'restore',
      'mark_duplicate',
      'set_canonical',
      'merge_spot',
      'resolve_report',
      'dismiss_report',
      'move_to_reviewing',
      'edit_spot',
      'edit_photo'
    )
  ),
  previous_status text,
  new_status text,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.spot_merges (
  id uuid primary key default gen_random_uuid(),
  source_spot_id uuid not null references public.spots(id) on delete cascade,
  target_spot_id uuid not null references public.spots(id) on delete cascade,
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists status text not null default 'active';
alter table public.profiles add column if not exists restricted_until timestamptz;
alter table public.profiles add column if not exists moderation_note text;
alter table public.spots add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.spots add column if not exists status text not null default 'pending';
alter table public.spots add column if not exists canonical_spot_id uuid references public.spots(id) on delete set null;
alter table public.spots add column if not exists duplicate_of uuid references public.spots(id) on delete set null;
alter table public.spots add column if not exists is_duplicate boolean not null default false;
alter table public.spots add column if not exists merged_into_spot_id uuid references public.spots(id) on delete set null;
alter table public.spots add column if not exists merged_at timestamptz;
alter table public.spots add column if not exists merged_by uuid references auth.users(id) on delete set null;
alter table public.spots add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table public.spots add column if not exists reviewed_at timestamptz;
alter table public.spots add column if not exists moderation_note text;
alter table public.spots add column if not exists rejection_reason text;
alter table public.spots add column if not exists hide_reason text;
alter table public.spots add column if not exists is_featured boolean not null default false;
alter table public.spots add column if not exists featured_at timestamptz;
alter table public.photos add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.photos add column if not exists visitor_id text;
alter table public.photos add column if not exists status text not null default 'pending';
alter table public.photos add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table public.photos add column if not exists reviewed_at timestamptz;
alter table public.photos add column if not exists moderation_note text;
alter table public.photos add column if not exists rejection_reason text;
alter table public.photos add column if not exists hide_reason text;
alter table public.photos add column if not exists is_featured boolean not null default false;
alter table public.photos add column if not exists featured_at timestamptz;
alter table public.favorites add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.favorites add column if not exists visitor_id text;
alter table public.reports add column if not exists resolution_note text;
alter table public.reports add column if not exists internal_note text;
alter table public.reports add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table public.reports add column if not exists reviewed_at timestamptz;

create index if not exists spots_coordinates_idx on public.spots (latitude, longitude);
create index if not exists spots_status_idx on public.spots (status, created_at desc);
create index if not exists spots_campus_area_idx on public.spots (campus_area);
create index if not exists spots_created_by_idx on public.spots (created_by);
create index if not exists spots_reviewed_at_idx on public.spots (reviewed_at desc);
create index if not exists spots_duplicate_of_idx on public.spots (duplicate_of);
create index if not exists spots_canonical_idx on public.spots (canonical_spot_id);
create index if not exists spots_merged_into_idx on public.spots (merged_into_spot_id);
create index if not exists spots_featured_idx on public.spots (is_featured, featured_at desc);
create index if not exists photos_spot_id_idx on public.photos (spot_id);
create index if not exists photos_status_idx on public.photos (status, created_at desc);
create index if not exists photos_user_id_idx on public.photos (user_id, created_at desc);
create index if not exists photos_reviewed_at_idx on public.photos (reviewed_at desc);
create index if not exists photos_featured_idx on public.photos (is_featured, featured_at desc);
create index if not exists profiles_role_status_idx on public.profiles (role, status, created_at desc);
create index if not exists favorites_user_id_idx on public.favorites (user_id, created_at desc);
create index if not exists favorites_visitor_id_idx on public.favorites (visitor_id, created_at desc);
create index if not exists reports_status_idx on public.reports (status, created_at desc);
create index if not exists reports_target_idx on public.reports (target_type, target_id);
create index if not exists reports_reporter_idx on public.reports (reporter_user_id, created_at desc);
create index if not exists moderation_actions_target_idx on public.moderation_actions (target_type, target_id, created_at desc);
create index if not exists moderation_actions_admin_idx on public.moderation_actions (admin_user_id, created_at desc);
create index if not exists spot_merges_source_idx on public.spot_merges (source_spot_id, created_at desc);
create index if not exists spot_merges_target_idx on public.spot_merges (target_spot_id, created_at desc);
create unique index if not exists favorites_user_spot_unique_idx
on public.favorites (user_id, spot_id)
where user_id is not null;
create unique index if not exists favorites_visitor_spot_unique_idx
on public.favorites (visitor_id, spot_id)
where visitor_id is not null;

insert into storage.buckets (id, name, public)
values ('spot-photos', 'spot-photos', true)
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, avatar_url, bio, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nickname', ''), split_part(new.email, '@', 1), 'NUFE Explorer'),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    nullif(new.raw_user_meta_data->>'bio', ''),
      'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.spots enable row level security;
alter table public.photos enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.spot_merges enable row level security;

drop policy if exists "profiles are viewable by everyone" on public.profiles;
drop policy if exists "users can insert their own profile" on public.profiles;
drop policy if exists "users can update their own profile" on public.profiles;
drop policy if exists "spots are viewable by everyone" on public.spots;
drop policy if exists "users can create spots" on public.spots;
drop policy if exists "photos are viewable by everyone" on public.photos;
drop policy if exists "owners can view their own photos" on public.photos;
drop policy if exists "users can upload photos" on public.photos;
drop policy if exists "users can read their favorites" on public.favorites;
drop policy if exists "users can create favorites" on public.favorites;
drop policy if exists "users can delete favorites" on public.favorites;
drop policy if exists "users can create reports" on public.reports;
drop policy if exists "users can read their own reports" on public.reports;
drop policy if exists "public uploads can be read" on storage.objects;
drop policy if exists "authenticated uploads to bucket" on storage.objects;
drop policy if exists "authenticated users can update uploads" on storage.objects;
drop policy if exists "authenticated users can delete uploads" on storage.objects;

create policy "profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id and role = 'user');

create policy "users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (
    select existing.role
    from public.profiles as existing
    where existing.id = auth.uid()
  )
);

create policy "spots are viewable by everyone"
on public.spots for select
using (status = 'published');

create policy "users can create spots"
on public.spots for insert
to authenticated
with check (auth.uid() = created_by);

create policy "photos are viewable by everyone"
on public.photos for select
using (status = 'published');

create policy "owners can view their own photos"
on public.photos for select
to authenticated
using (auth.uid() = user_id);

create policy "users can upload photos"
on public.photos for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can read their favorites"
on public.favorites for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create favorites"
on public.favorites for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can delete favorites"
on public.favorites for delete
to authenticated
using (auth.uid() = user_id);

create policy "users can create reports"
on public.reports for insert
to authenticated
with check (auth.uid() = reporter_user_id);

create policy "users can read their own reports"
on public.reports for select
to authenticated
using (auth.uid() = reporter_user_id);

create policy "public uploads can be read"
on storage.objects for select
using (bucket_id = 'spot-photos');

create policy "authenticated uploads to bucket"
on storage.objects for insert
to authenticated
with check (bucket_id = 'spot-photos');

create policy "authenticated users can update uploads"
on storage.objects for update
to authenticated
using (bucket_id = 'spot-photos')
with check (bucket_id = 'spot-photos');

create policy "authenticated users can delete uploads"
on storage.objects for delete
to authenticated
using (bucket_id = 'spot-photos');
