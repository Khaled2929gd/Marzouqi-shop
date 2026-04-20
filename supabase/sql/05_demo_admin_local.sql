-- Swift Shoe Shop - Optional LOCAL demo admin bootstrap
-- Run after 01_schema_and_policies.sql
--
-- WARNING:
-- - For local/testing only. Do NOT use in production.
-- - This script creates/updates a demo auth user with a known password.
-- - Remove or rotate this account after testing.

do $$
declare
  v_admin_email text := 'demo-admin@marzouki.com';
  v_admin_password text := 'DemoAdmin123!';
  v_full_name text := 'Demo Admin';
  v_email_normalized text := lower('demo-admin@marzouki.com');
  v_user_id uuid;
begin
  select u.id
  into v_user_id
  from auth.users u
  where lower(u.email) = v_email_normalized
  limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email_normalized,
      crypt(v_admin_password, gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('full_name', v_full_name),
      now(),
      now()
    );
  else
    update auth.users
    set
      aud = 'authenticated',
      role = 'authenticated',
      email = v_email_normalized,
      encrypted_password = crypt(v_admin_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', v_full_name),
      updated_at = now()
    where id = v_user_id;
  end if;

  -- Rebuild email identity in a format expected by GoTrue for password flow.
  delete from auth.identities
  where user_id = v_user_id
    and provider = 'email';

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at,
    last_sign_in_at
  )
  values (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email_normalized,
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    v_email_normalized,
    now(),
    now(),
    now()
  );

  insert into public.profiles (id, email, full_name, role)
  values (v_user_id, v_email_normalized, v_full_name, 'admin')
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = 'admin';

  raise notice 'Demo admin ready. Email: %, Password: %', v_email_normalized, v_admin_password;
end $$;
