-- ============================================================
-- UBUMWE BUTCHERY — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone       TEXT UNIQUE,
  email       TEXT UNIQUE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"   ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins read all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
);

-- 2. PRODUCTS TABLE
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

CREATE POLICY "Products readable by all"    ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products"  ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update products"  ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete products"  ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.users(id),
  items               JSONB NOT NULL DEFAULT '[]',
  total_amount        NUMERIC(10,2) NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','delivered')),
  delivery_minutes    INTEGER NOT NULL DEFAULT 30,
  customer_phone      TEXT NOT NULL,
  customer_name       TEXT NOT NULL,
  customer_address    TEXT NOT NULL DEFAULT '',
  whatsapp_notified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at         TIMESTAMPTZ
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers create own orders"  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Customers read own orders"    ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins read all orders"       ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins update all orders"     ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 4. ENABLE REALTIME on orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 5. STORAGE BUCKET (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- CREATE POLICY "Public read product images"   ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Admins upload product images" ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id = 'product-images' AND
--   EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
-- );

-- ============================================================
-- HOW TO CREATE AN ADMIN USER:
-- 1. Sign up normally in the app
-- 2. Then run in SQL Editor:
--    UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
-- ============================================================
