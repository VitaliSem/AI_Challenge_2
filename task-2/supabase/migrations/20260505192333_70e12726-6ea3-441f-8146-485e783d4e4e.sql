
-- =========================================================
-- ENUMS
-- =========================================================
create type public.host_role as enum ('host', 'checker');
create type public.event_state as enum ('draft', 'published', 'unpublished');
create type public.event_visibility as enum ('public', 'unlisted');
create type public.rsvp_status as enum ('confirmed', 'waitlisted', 'cancelled');
create type public.gallery_status as enum ('pending', 'approved', 'rejected');
create type public.report_target as enum ('event', 'gallery_photo');
create type public.report_status as enum ('open', 'hidden', 'dismissed');

-- =========================================================
-- PROFILES
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- HOSTS
-- =========================================================
create table public.hosts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  bio text,
  contact_email text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.hosts enable row level security;

create table public.host_members (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.host_role not null,
  created_at timestamptz not null default now(),
  unique (host_id, user_id, role)
);
alter table public.host_members enable row level security;

-- Security definer helpers (avoid RLS recursion)
create or replace function public.is_host_member(_user uuid, _host uuid, _role public.host_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.host_members
    where user_id = _user and host_id = _host and role = _role
  );
$$;

create or replace function public.is_host_manager(_user uuid, _host uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.host_members
    where user_id = _user and host_id = _host and role = 'host'
  );
$$;

create or replace function public.is_host_team(_user uuid, _host uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.host_members
    where user_id = _user and host_id = _host
  );
$$;

-- Hosts policies
create policy "hosts_select_all" on public.hosts for select using (true);
create policy "hosts_insert_signed_in" on public.hosts for insert with check (auth.uid() = owner_id);
create policy "hosts_update_managers" on public.hosts for update using (public.is_host_manager(auth.uid(), id));
create policy "hosts_delete_owner" on public.hosts for delete using (auth.uid() = owner_id);

-- Auto-add creator as host member
create or replace function public.handle_new_host()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.host_members (host_id, user_id, role)
  values (new.id, new.owner_id, 'host')
  on conflict do nothing;
  return new;
end; $$;
create trigger on_host_created after insert on public.hosts
for each row execute function public.handle_new_host();

-- Host members policies
create policy "host_members_select_team" on public.host_members for select
  using (public.is_host_team(auth.uid(), host_id) or user_id = auth.uid());
create policy "host_members_insert_managers" on public.host_members for insert
  with check (public.is_host_manager(auth.uid(), host_id) or user_id = auth.uid());
create policy "host_members_delete_managers" on public.host_members for delete
  using (public.is_host_manager(auth.uid(), host_id) or user_id = auth.uid());

-- =========================================================
-- HOST INVITES (copyable links)
-- =========================================================
create table public.host_invites (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts(id) on delete cascade,
  role public.host_role not null,
  token text unique not null default replace(gen_random_uuid()::text, '-', ''),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz
);
alter table public.host_invites enable row level security;

create policy "host_invites_select_anyone" on public.host_invites for select using (true);
create policy "host_invites_insert_managers" on public.host_invites for insert
  with check (public.is_host_manager(auth.uid(), host_id));
create policy "host_invites_delete_managers" on public.host_invites for delete
  using (public.is_host_manager(auth.uid(), host_id));

-- =========================================================
-- EVENTS
-- =========================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  venue text,
  online_url text,
  location_text text,
  capacity int not null default 0,
  cover_url text,
  state public.event_state not null default 'draft',
  visibility public.event_visibility not null default 'public',
  is_paid boolean not null default false,
  hidden boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;

create index events_state_starts_idx on public.events (state, starts_at);
create index events_host_idx on public.events (host_id);

create policy "events_select_public" on public.events for select
  using (
    (state = 'published' and visibility = 'public' and not hidden)
    or visibility = 'unlisted'
    or public.is_host_team(auth.uid(), host_id)
  );
create policy "events_insert_managers" on public.events for insert
  with check (public.is_host_manager(auth.uid(), host_id));
create policy "events_update_managers" on public.events for update
  using (public.is_host_manager(auth.uid(), host_id));
create policy "events_delete_managers" on public.events for delete
  using (public.is_host_manager(auth.uid(), host_id));

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger events_touch before update on public.events
for each row execute function public.touch_updated_at();

-- =========================================================
-- RSVPS
-- =========================================================
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.rsvp_status not null,
  ticket_code text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
alter table public.rsvps enable row level security;

create index rsvps_event_status_idx on public.rsvps (event_id, status, created_at);

-- Helper to check if user is on host team for an event
create or replace function public.event_is_managed_by(_user uuid, _event uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.events e
    join public.host_members hm on hm.host_id = e.host_id
    where e.id = _event and hm.user_id = _user
  );
$$;

create policy "rsvps_select_self_or_team" on public.rsvps for select
  using (user_id = auth.uid() or public.event_is_managed_by(auth.uid(), event_id));
create policy "rsvps_insert_self" on public.rsvps for insert
  with check (user_id = auth.uid());
create policy "rsvps_update_self_or_team" on public.rsvps for update
  using (user_id = auth.uid() or public.event_is_managed_by(auth.uid(), event_id));
create policy "rsvps_delete_self" on public.rsvps for delete
  using (user_id = auth.uid());

-- Auto-set status based on capacity (for new confirmed attempts)
create or replace function public.assign_rsvp_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  cap int;
  confirmed_count int;
begin
  if new.status is null or new.status = 'confirmed' then
    select capacity into cap from public.events where id = new.event_id;
    select count(*) into confirmed_count from public.rsvps
      where event_id = new.event_id and status = 'confirmed';
    if cap > 0 and confirmed_count >= cap then
      new.status := 'waitlisted';
    else
      new.status := 'confirmed';
    end if;
  end if;
  return new;
end; $$;
create trigger rsvps_assign_status before insert on public.rsvps
for each row execute function public.assign_rsvp_status();

-- Promote next waitlisted on cancellation / status change away from confirmed
create or replace function public.promote_waitlist()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  cap int;
  confirmed_count int;
  next_id uuid;
begin
  select capacity into cap from public.events where id = coalesce(new.event_id, old.event_id);
  loop
    select count(*) into confirmed_count from public.rsvps
      where event_id = coalesce(new.event_id, old.event_id) and status = 'confirmed';
    exit when cap = 0 or confirmed_count >= cap;
    select id into next_id from public.rsvps
      where event_id = coalesce(new.event_id, old.event_id) and status = 'waitlisted'
      order by created_at asc limit 1;
    exit when next_id is null;
    update public.rsvps set status = 'confirmed' where id = next_id;
  end loop;
  return null;
end; $$;

create trigger rsvps_promote_after_change
after update of status on public.rsvps
for each row when (old.status = 'confirmed' and new.status <> 'confirmed')
execute function public.promote_waitlist();

create trigger rsvps_promote_after_delete
after delete on public.rsvps
for each row when (old.status = 'confirmed')
execute function public.promote_waitlist();

-- Promote when capacity grows
create or replace function public.promote_on_capacity_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  confirmed_count int;
  next_id uuid;
begin
  if new.capacity is distinct from old.capacity and new.capacity > coalesce(old.capacity, 0) then
    loop
      select count(*) into confirmed_count from public.rsvps
        where event_id = new.id and status = 'confirmed';
      exit when new.capacity = 0 or confirmed_count >= new.capacity;
      select id into next_id from public.rsvps
        where event_id = new.id and status = 'waitlisted'
        order by created_at asc limit 1;
      exit when next_id is null;
      update public.rsvps set status = 'confirmed' where id = next_id;
    end loop;
  end if;
  return null;
end; $$;
create trigger events_promote_on_capacity after update of capacity on public.events
for each row execute function public.promote_on_capacity_change();

-- =========================================================
-- FEEDBACK
-- =========================================================
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
alter table public.feedback enable row level security;

create policy "feedback_select_all" on public.feedback for select using (true);
create policy "feedback_insert_attendee_post_event" on public.feedback for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.events e
      where e.id = event_id and e.ends_at < now()
    )
    and exists (
      select 1 from public.rsvps r
      where r.event_id = feedback.event_id and r.user_id = auth.uid() and r.status = 'confirmed'
    )
  );
create policy "feedback_update_self" on public.feedback for update using (user_id = auth.uid());
create policy "feedback_delete_self_or_team" on public.feedback for delete
  using (user_id = auth.uid() or public.event_is_managed_by(auth.uid(), event_id));

-- =========================================================
-- GALLERY PHOTOS
-- =========================================================
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  status public.gallery_status not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.gallery_photos enable row level security;

create policy "gallery_select_visible" on public.gallery_photos for select
  using (
    status = 'approved'
    or user_id = auth.uid()
    or public.event_is_managed_by(auth.uid(), event_id)
  );
create policy "gallery_insert_signed_in" on public.gallery_photos for insert
  with check (user_id = auth.uid());
create policy "gallery_update_team" on public.gallery_photos for update
  using (public.event_is_managed_by(auth.uid(), event_id));
create policy "gallery_delete_self_or_team" on public.gallery_photos for delete
  using (user_id = auth.uid() or public.event_is_managed_by(auth.uid(), event_id));

-- =========================================================
-- REPORTS
-- =========================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type public.report_target not null,
  target_id uuid not null,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text,
  status public.report_status not null default 'open',
  host_id uuid references public.hosts(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;

create policy "reports_select_team_or_self" on public.reports for select
  using (
    reporter_id = auth.uid()
    or (host_id is not null and public.is_host_team(auth.uid(), host_id))
  );
create policy "reports_insert_signed_in" on public.reports for insert
  with check (auth.uid() is not null and reporter_id = auth.uid());
create policy "reports_update_team" on public.reports for update
  using (host_id is not null and public.is_host_manager(auth.uid(), host_id));

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
insert into storage.buckets (id, name, public) values
  ('host-logos', 'host-logos', true),
  ('event-covers', 'event-covers', true),
  ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "host_logos_public_read" on storage.objects for select using (bucket_id = 'host-logos');
create policy "event_covers_public_read" on storage.objects for select using (bucket_id = 'event-covers');
create policy "gallery_public_read" on storage.objects for select using (bucket_id = 'gallery');

create policy "auth_uploads_host_logos" on storage.objects for insert
  with check (bucket_id = 'host-logos' and auth.uid() is not null);
create policy "auth_uploads_event_covers" on storage.objects for insert
  with check (bucket_id = 'event-covers' and auth.uid() is not null);
create policy "auth_uploads_gallery" on storage.objects for insert
  with check (bucket_id = 'gallery' and auth.uid() is not null);

create policy "owner_update_objects" on storage.objects for update
  using (auth.uid() = owner) with check (auth.uid() = owner);
create policy "owner_delete_objects" on storage.objects for delete
  using (auth.uid() = owner);

-- =========================================================
-- REALTIME
-- =========================================================
alter publication supabase_realtime add table public.rsvps;
alter publication supabase_realtime add table public.events;
