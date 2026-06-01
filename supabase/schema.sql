-- ============================================================
-- UBUMWE BUTCHERY — Supabase Schema v2
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ─── HELPER FUNCTION ──────────────────────────────────────────
-- Avoids self-referential RLS recursion when checking admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─── 1. USERS TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone       TEXT UNIQUE,
  email       TEXT UNIQUE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  push_token  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins read all users"
  ON public.users FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins update all users"
  ON public.users FOR UPDATE USING (public.is_admin());

CREATE INDEX IF NOT EXISTS users_role_idx  ON public.users(role);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- ─── 2. PRODUCTS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category      TEXT NOT NULL CHECK (category IN ('cow', 'goat', 'fish', 'chicken')),
  name_en       TEXT NOT NULL,
  name_rw       TEXT NOT NULL,
  description   TEXT,
  price_per_kg  NUMERIC(10,2) NOT NULL,
  image_url     TEXT,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products readable by all"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE USING (public.is_admin());

CREATE INDEX IF NOT EXISTS products_category_idx   ON public.products(category);
CREATE INDEX IF NOT EXISTS products_available_idx  ON public.products(is_available);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at DESC);

-- ─── 3. ORDERS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id),
  items               JSONB NOT NULL DEFAULT '[]',
  total_amount        NUMERIC(10,2) NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','delivered','cancelled')),
  delivery_minutes    INTEGER NOT NULL DEFAULT 30,
  customer_phone      TEXT NOT NULL,
  customer_name       TEXT NOT NULL,
  customer_address    TEXT NOT NULL DEFAULT '',
  payment_proof_url   TEXT,
  whatsapp_notified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at         TIMESTAMPTZ
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers create own orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers read own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Customers update own orders"
  ON public.orders FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins read all orders"
  ON public.orders FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins update all orders"
  ON public.orders FOR UPDATE USING (public.is_admin());

CREATE INDEX IF NOT EXISTS orders_user_id_idx    ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);

-- ─── 4. REALTIME ──────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ─── 5. STORAGE — product-images ──────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 'product-images', true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- ─── 6. STORAGE — payment-proofs ──────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs', 'payment-proofs', false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Customers can upload their own payment proof
CREATE POLICY "Customers upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid() IS NOT NULL);

-- Only admins can view payment proofs
CREATE POLICY "Admins read payment proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs' AND public.is_admin());

-- ─── MIGRATIONS (run after initial setup) ────────────────────
-- Run these if your database was created before v2:
--
--   ALTER TABLE public.users ADD COLUMN IF NOT EXISTS push_token TEXT;
--   ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
--   ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
--   ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
--     CHECK (status IN ('pending','approved','delivered','cancelled'));
--   CREATE POLICY "Customers update own orders"
--     ON public.orders FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- ADMIN ACCOUNT SETUP
-- ============================================================
--
-- 1. Sign up in the app with:
--    Email:    boygatete@gmail.com
--    Password: Gateteboy12345
--
-- 2. Run this in SQL Editor to grant admin role:
--    UPDATE public.users SET role = 'admin'
--    WHERE email = 'boygatete@gmail.com';
--
-- 3. Sign in → auto-redirected to /admin dashboard.
-- ============================================================
