-- Swift Shoe Shop - Real admin assignment
-- Run after 01_schema_and_policies.sql
--
-- Flow:
-- 1) Create/sign-in user through Supabase Auth (UI or /admin/login signup).
-- 2) Set v_admin_email below to that real user email.
-- 3) Run this script to promote the user role to admin.

do $$
declare
  v_admin_email text := 'admin@yourdomain.com';
  v_user_id uuid;
begin
  select u.id
  into v_user_id
  from auth.users u
  where lower(u.email) = lower(v_admin_email)
  limit 1;

  if v_user_id is null then
    raise exception 'No auth user found for email %. Create/sign-in this user first.', v_admin_email;
  end if;

  insert into public.profiles (id, email, full_name, role)
  select
    u.id,
    u.email,
    coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
    'admin'
  from auth.users u
  where u.id = v_user_id
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = 'admin';

  raise notice 'Admin role granted to %', v_admin_email;
end $$;
