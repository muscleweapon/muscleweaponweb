-- ==============================================================================
-- MUSCLE WEAPON: CREATE INITIAL ADMIN USER
-- Run this in Supabase Dashboard -> SQL Editor (or Authentication -> Users)
-- ==============================================================================

-- 1. Ensure handle_new_user has search_path set to public and user_role is qualified
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'admin'::public.user_role),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 2. Create the initial Super Admin user in auth.users (if not already present)
DO $$
DECLARE
  v_user_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_email TEXT := 'admin@muscleweapon.com';
  v_password TEXT := 'MuscleWeapon@2050!';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    INSERT INTO auth.users (
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
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"role":"super_admin","full_name":"Muscle Weapon Admin"}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;

  -- 3. Ensure public.profiles has super_admin role for this user
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    v_user_id,
    v_email,
    'super_admin'::public.user_role,
    'Muscle Weapon Admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'super_admin'::public.user_role,
    updated_at = NOW();
END $$;

-- Verify creation:
SELECT id, email, role, full_name, created_at FROM public.profiles WHERE email = 'admin@muscleweapon.com';
