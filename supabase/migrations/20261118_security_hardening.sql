-- Find the Donor - Security Hardening & Blood Group Migration
-- Non-destructive migration: preserves existing data, normalizes A1B+ -> AB+,
-- fixes recursive RLS, restricts donor PII, and adds secure matching RPCs.

-- 1. Safely normalize any legacy A1B+ blood group rows to AB+ before updating constraints
update public.blood_donations
set blood_type = 'AB+'
where upper(trim(blood_type)) = 'A1B+';

update public.blood_requests
set blood_type = 'AB+'
where upper(trim(blood_type)) = 'A1B+';

-- 2. Update blood_type CHECK constraints to the 8 standard ABO/Rh groups
alter table public.blood_donations
  drop constraint if exists blood_donations_blood_type_check;
alter table public.blood_donations
  add constraint blood_donations_blood_type_check
  check (blood_type in ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'));

alter table public.blood_requests
  drop constraint if exists blood_requests_blood_type_check;
alter table public.blood_requests
  add constraint blood_requests_blood_type_check
  check (blood_type in ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'));

-- 3. Non-recursive admin check helper (hardened search_path & permissions)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 4. Hardened RLS policies for public.profiles
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can insert their own client profile" on public.profiles;
create policy "Users can insert their own client profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id and role = 'client');

drop policy if exists "Users can update their own profile without changing role" on public.profiles;
create policy "Users can update their own profile without changing role"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = 'client'
    and not public.is_admin()
  );

-- 5. Hardened RLS policies for public.blood_donations
-- Restrict direct SELECT to owner or verified admin (protects email, medical_conditions, exact GPS).
drop policy if exists "Authenticated users can read donors" on public.blood_donations;
drop policy if exists "Owners or admins can read donor records" on public.blood_donations;
create policy "Owners or admins can read donor records"
  on public.blood_donations for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert their own donor registration" on public.blood_donations;
create policy "Users can insert their own donor registration"
  on public.blood_donations for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own donor registration" on public.blood_donations;
create policy "Users can update their own donor registration"
  on public.blood_donations for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own donor registration" on public.blood_donations;
create policy "Users can delete their own donor registration"
  on public.blood_donations for delete
  to authenticated
  using (auth.uid() = user_id);

-- 6. Hardened RLS policies for public.blood_requests
drop policy if exists "Users can view their own requests or admins can view all" on public.blood_requests;
create policy "Users can view their own requests or admins can view all"
  on public.blood_requests for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create their own blood request" on public.blood_requests;
create policy "Users can create their own blood request"
  on public.blood_requests for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'open');

drop policy if exists "Owners or admins can update blood requests" on public.blood_requests;
create policy "Owners can cancel their own blood requests"
  on public.blood_requests for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status in ('open', 'cancelled'));

drop policy if exists "Admins can update any blood request status" on public.blood_requests;
create policy "Admins can update any blood request status"
  on public.blood_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Owners can delete their own blood requests" on public.blood_requests;
create policy "Owners can delete their own blood requests"
  on public.blood_requests for delete
  to authenticated
  using (auth.uid() = user_id);

-- 7. Secure donor matching RPC (returns only matching fields + distance, no email/medical/exact GPS)
create or replace function public.match_compatible_donors(
  recipient_blood_type text,
  req_lat double precision default null,
  req_lng double precision default null
)
returns table (
  id uuid,
  name text,
  phone text,
  blood_type text,
  distance_km double precision,
  has_location boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  normalized_type text := upper(trim(coalesce(recipient_blood_type, '')));
  compatible_types text[];
  valid_req_coords boolean := (
    req_lat is not null and req_lng is not null
    and req_lat between -90 and 90
    and req_lng between -180 and 180
  );
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  compatible_types := case normalized_type
    when 'O-'  then array['O-']
    when 'O+'  then array['O-', 'O+']
    when 'A-'  then array['O-', 'A-']
    when 'A+'  then array['O-', 'O+', 'A-', 'A+']
    when 'B-'  then array['O-', 'B-']
    when 'B+'  then array['O-', 'O+', 'B-', 'B+']
    when 'AB-' then array['O-', 'A-', 'B-', 'AB-']
    when 'AB+' then array['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
    else array[]::text[]
  end;

  if array_length(compatible_types, 1) is null then
    return;
  end if;

  return query
  select
    d.id,
    d.name,
    d.phone,
    d.blood_type,
    case
      when valid_req_coords
        and d.latitude between -90 and 90
        and d.longitude between -180 and 180
      then round((
        6371 * 2 * asin(
          sqrt(
            power(sin(radians(d.latitude - req_lat) / 2), 2)
            + cos(radians(req_lat)) * cos(radians(d.latitude))
            * power(sin(radians(d.longitude - req_lng) / 2), 2)
          )
        )
      )::numeric, 2)::double precision
      else null
    end as distance_km,
    (d.latitude between -90 and 90 and d.longitude between -180 and 180) as has_location
  from public.blood_donations d
  where d.available = true
    and d.blood_type = any(compatible_types)
  order by distance_km asc nulls last, d.name asc;
end;
$$;

revoke all on function public.match_compatible_donors(text, double precision, double precision) from public;
grant execute on function public.match_compatible_donors(text, double precision, double precision) to authenticated;

-- 8. Coarse donor map markers RPC (rounds GPS to ~1.1 km grid; no email or medical info)
create or replace function public.get_donor_map_markers()
returns table (
  id uuid,
  name text,
  blood_type text,
  phone text,
  approx_latitude double precision,
  approx_longitude double precision
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  return query
  select
    d.id,
    d.name,
    d.blood_type,
    d.phone,
    round(d.latitude::numeric, 2)::double precision as approx_latitude,
    round(d.longitude::numeric, 2)::double precision as approx_longitude
  from public.blood_donations d
  where d.available = true
    and d.latitude between -90 and 90
    and d.longitude between -180 and 180;
end;
$$;

revoke all on function public.get_donor_map_markers() from public;
grant execute on function public.get_donor_map_markers() to authenticated;
