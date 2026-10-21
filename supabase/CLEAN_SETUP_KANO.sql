-- ==============================================================================
-- MULTI-VENDOR ONLINE GROCERY MARKETPLACE — CORE DATABASE SCHEMA
-- Migration: 20261020000001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE store_status AS ENUM ('pending', 'approved', 'rejected', 'suspended'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE unit_of_measure AS ENUM ('kg', 'g', 'l', 'ml', 'piece', 'pack', 'bundle'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. VENDOR STORES
CREATE TABLE IF NOT EXISTS public.vendor_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    status store_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_vendor_stores_owner ON public.vendor_stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_vendor_stores_status ON public.vendor_stores(status);
CREATE INDEX IF NOT EXISTS idx_vendor_stores_city ON public.vendor_stores(city);

-- 4. VENDOR SERVICE AREAS (Flexible location-aware service zones)
CREATE TABLE IF NOT EXISTS public.vendor_service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendor_stores(id) ON DELETE CASCADE,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zone_name TEXT NOT NULL,
    postal_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_service_areas_vendor ON public.vendor_service_areas(vendor_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_city ON public.vendor_service_areas(city);

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_display ON public.categories(display_order);

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendor_stores(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    package_quantity NUMERIC(10, 3) NOT NULL CHECK (package_quantity > 0),
    unit_of_measurement unit_of_measure NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(is_available, is_archived);

-- 7. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- 8. CUSTOMER ORDERS (Parent Order)
CREATE TABLE IF NOT EXISTS public.customer_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    delivery_address TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    order_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customer_orders_customer ON public.customer_orders(customer_id);

-- 9. VENDOR ORDERS (Vendor Sub-order)
CREATE TABLE IF NOT EXISTS public.vendor_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_order_id UUID NOT NULL REFERENCES public.customer_orders(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.vendor_stores(id) ON DELETE RESTRICT,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    status order_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_vendor_orders_vendor ON public.vendor_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_parent ON public.vendor_orders(customer_order_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_status ON public.vendor_orders(status);

-- 10. ORDER ITEMS (Snapshot at purchase time)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_order_id UUID NOT NULL REFERENCES public.vendor_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name_snapshot TEXT NOT NULL,
    unit_price_snapshot NUMERIC(12, 2) NOT NULL,
    package_quantity_snapshot NUMERIC(10, 3) NOT NULL,
    unit_snapshot TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_vendor_order ON public.order_items(vendor_order_id);

-- 11. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_order_id UUID NOT NULL REFERENCES public.vendor_orders(id) ON DELETE CASCADE,
    from_status order_status,
    to_status order_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_history_order ON public.order_status_history(vendor_order_id);

-- 12. SHOPPING LISTS & ITEMS
CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.shopping_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    target_quantity NUMERIC(10, 3) NOT NULL DEFAULT 1 CHECK (target_quantity > 0),
    target_unit unit_of_measure NOT NULL DEFAULT 'piece',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_shopping_list_user ON public.shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items ON public.shopping_list_items(list_id);

-- 13. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON public.admin_audit_logs(admin_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
CREATE POLICY "Public read profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile except role" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Admins have full access to profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- VENDOR STORES POLICIES
CREATE POLICY "Public can view approved stores" ON public.vendor_stores
    FOR SELECT USING (status = 'approved' OR owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Vendors can register store" ON public.vendor_stores
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Vendors can update own store" ON public.vendor_stores
    FOR UPDATE USING (auth.uid() = owner_id AND status != 'suspended')
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Admins manage all stores" ON public.vendor_stores
    FOR ALL USING (public.is_admin());

-- CATEGORIES POLICIES
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admins manage categories" ON public.categories
    FOR ALL USING (public.is_admin());

-- PRODUCTS POLICIES
CREATE POLICY "Public can view active products of approved vendors" ON public.products
    FOR SELECT USING (
        (is_available = true AND is_archived = false AND EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = products.vendor_id AND vendor_stores.status = 'approved'
        )) OR 
        EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = products.vendor_id AND vendor_stores.owner_id = auth.uid()
        ) OR 
        public.is_admin()
    );

CREATE POLICY "Approved vendors can insert products" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = vendor_id 
              AND vendor_stores.owner_id = auth.uid() 
              AND vendor_stores.status = 'approved'
        )
    );

CREATE POLICY "Vendors can update own products" ON public.products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = vendor_id 
              AND vendor_stores.owner_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can delete own products" ON public.products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = vendor_id 
              AND vendor_stores.owner_id = auth.uid()
        )
    );

-- PRODUCT IMAGES POLICIES
CREATE POLICY "Anyone can view product images" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Vendors manage own product images" ON public.product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.products
            JOIN public.vendor_stores ON vendor_stores.id = products.vendor_id
            WHERE products.id = product_images.product_id AND vendor_stores.owner_id = auth.uid()
        )
    );

-- ORDERS POLICIES
CREATE POLICY "Customers view own orders" ON public.customer_orders
    FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());

CREATE POLICY "Customers create own orders" ON public.customer_orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Vendors view own suborders" ON public.vendor_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vendor_stores
            WHERE vendor_stores.id = vendor_orders.vendor_id AND vendor_stores.owner_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM public.customer_orders
            WHERE customer_orders.id = vendor_orders.customer_order_id AND customer_orders.customer_id = auth.uid()
        ) OR 
        public.is_admin()
    );

CREATE POLICY "Vendors update own suborder status" ON public.vendor_orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.vendor_stores
            WHERE vendor_stores.id = vendor_orders.vendor_id AND vendor_stores.owner_id = auth.uid()
        ) OR public.is_admin()
    );

-- ORDER ITEMS POLICIES
CREATE POLICY "View order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vendor_orders
            JOIN public.customer_orders ON customer_orders.id = vendor_orders.customer_order_id
            JOIN public.vendor_stores ON vendor_stores.id = vendor_orders.vendor_id
            WHERE vendor_orders.id = order_items.vendor_order_id 
              AND (customer_orders.customer_id = auth.uid() OR vendor_stores.owner_id = auth.uid() OR public.is_admin())
        )
    );

-- SHOPPING LISTS POLICIES
CREATE POLICY "Users manage own shopping lists" ON public.shopping_lists
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own shopping list items" ON public.shopping_list_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.shopping_lists
            WHERE shopping_lists.id = shopping_list_items.list_id AND shopping_lists.user_id = auth.uid()
        )
    );

-- ADMIN AUDIT LOGS POLICIES
CREATE POLICY "Admins view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins insert audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (public.is_admin());

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Grocery User'),
        CASE 
            WHEN new.raw_user_meta_data->>'role' = 'vendor' THEN 'vendor'::user_role
            ELSE 'customer'::user_role
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================

-- ==============================================================================
-- Migration: 20261020000002_security_hardening.sql
-- Fixes privilege-escalation gaps found in review of the initial schema:
--   1. Vendors could INSERT a store with status='approved' (bypassing review).
--   2. Vendors could UPDATE their own store status.
--   3. profiles was world-readable (leaked phone numbers).
--   4. Role-change protection relied on a self-referencing RLS subquery.
--   5. SECURITY DEFINER functions lacked a pinned search_path.
-- ==============================================================================

-- 5. Pin search_path on definer functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Public sign-up may only ever produce 'customer' or 'vendor'.
    -- 'admin' in metadata is deliberately ignored.
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), 'Grocery User'),
        NULLIF(trim(NEW.raw_user_meta_data->>'phone'), ''),
        CASE WHEN NEW.raw_user_meta_data->>'role' = 'vendor'
             THEN 'vendor'::user_role
             ELSE 'customer'::user_role
        END
    );
    RETURN NEW;
END;
$$;

-- Helper: true when the current request is a trusted backend context
-- (service role / direct DB connection) rather than an end user.
CREATE OR REPLACE FUNCTION public.is_privileged_context()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT auth.uid() IS NULL
        OR coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role', '') = 'service_role';
$$;

-- 4. Role column guard (replaces self-referencing RLS subquery)
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role
       AND NOT public.is_privileged_context() THEN
        RAISE EXCEPTION 'Changing a user role is not permitted from client requests'
            USING ERRCODE = '42501';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
        RAISE EXCEPTION 'Profile id is immutable' USING ERRCODE = '42501';
    END IF;
    NEW.updated_at := timezone('utc', now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role ON public.profiles;
CREATE TRIGGER trg_guard_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- NOTE: role changes for admins go through the server action, which uses the
-- service-role client AFTER verifying the caller is an admin, and writes an audit log.

DROP POLICY IF EXISTS "Users can update own profile except role" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. Profiles: own row + admins only
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- 1 & 2. Store status guard
CREATE OR REPLACE FUNCTION public.guard_vendor_store()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF public.is_privileged_context() OR public.is_admin() THEN
        NEW.updated_at := timezone('utc', now());
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        NEW.status := 'pending';
        NEW.owner_id := auth.uid();
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            RAISE EXCEPTION 'Only administrators can change store status' USING ERRCODE = '42501';
        END IF;
        IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
            RAISE EXCEPTION 'Store ownership cannot be transferred' USING ERRCODE = '42501';
        END IF;
    END IF;

    NEW.updated_at := timezone('utc', now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_vendor_store ON public.vendor_stores;
CREATE TRIGGER trg_guard_vendor_store
    BEFORE INSERT OR UPDATE ON public.vendor_stores
    FOR EACH ROW EXECUTE FUNCTION public.guard_vendor_store();

-- Only vendor-role users may register a store, one store per owner (initial launch rule).
DROP POLICY IF EXISTS "Vendors can register store" ON public.vendor_stores;
CREATE POLICY "Vendors can register store" ON public.vendor_stores
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id
        AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'vendor')
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_vendor_stores_owner ON public.vendor_stores(owner_id);

-- Audit logs are append-only even for admins.
REVOKE UPDATE, DELETE ON public.admin_audit_logs FROM authenticated, anon;

-- Least privilege: anon role never writes.
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;


-- ==============================================================================

-- ==============================================================================
-- Migration: 20261020000003_categories_and_storage.sql
-- Seeds standardized grocery categories and defines storage policies
-- ==============================================================================

-- 1. SEED STANDARDIZED GROCERY CATEGORIES
INSERT INTO public.categories (name, slug, description, icon, display_order)
VALUES
    ('Rice & Grains', 'rice-grains', 'Rice, wheat flour, oats, pasta, and dry legumes', '🌾', 1),
    ('Cooking Oil', 'cooking-oil', 'Olive oil, sunflower oil, vegetable oil, and ghee', '🫒', 2),
    ('Beverages', 'beverages', 'Fresh juices, tea, coffee, mineral water, and soft drinks', '🧃', 3),
    ('Dairy & Eggs', 'dairy-eggs', 'Fresh milk, farm eggs, cheese, butter, and yogurt', '🥛', 4),
    ('Fresh Vegetables', 'fresh-vegetables', 'Farm-fresh leafy greens, roots, and vegetables', '🥦', 5),
    ('Fresh Fruits', 'fresh-fruits', 'Seasonal and exotic fresh fruits', '🍎', 6),
    ('Meat & Fish', 'meat-fish', 'Fresh poultry, red meat cuts, fish, and seafood', '🥩', 7),
    ('Snacks', 'snacks', 'Nuts, dried fruits, crackers, and healthy bites', '🥜', 8),
    ('Household Grocery Essentials', 'household-essentials', 'Cleaning supplies, kitchen paper, and pantry staples', '🧼', 9)
ON CONFLICT (slug) DO UPDATE 
SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order;

-- 2. STORAGE BUCKET CONFIGURATION (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies for product-images bucket
-- Anyone can view public product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Only approved vendors can upload product images into their designated folder
CREATE POLICY "Approved vendors can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
        SELECT 1 FROM public.vendor_stores
        WHERE vendor_stores.owner_id = auth.uid()
          AND vendor_stores.status = 'approved'
    )
);

-- Vendors can update or delete their own product images
CREATE POLICY "Vendors can update own product images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Vendors can delete own product images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);


-- ==============================================================================

-- ==============================================================================
-- Migration: 20261020000004_location_and_service_zones.sql
-- Description: Row Level Security, Indexes, and Constraints for Location-Aware
--              Vendor Service Areas.
-- ==============================================================================

-- 1. Unique constraint to prevent duplicate zones per vendor
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_vendor_service_areas_zone'
    ) THEN
        ALTER TABLE public.vendor_service_areas
        ADD CONSTRAINT uq_vendor_service_areas_zone UNIQUE (vendor_id, city, zone_name);
    END IF;
END $$;

-- 2. Performance indexes for postal code & city matching
CREATE INDEX IF NOT EXISTS idx_vendor_service_areas_postal 
ON public.vendor_service_areas(postal_code);

CREATE INDEX IF NOT EXISTS idx_vendor_service_areas_city_state 
ON public.vendor_service_areas(city, state);

-- 3. Row Level Security Policies for vendor_service_areas
-- SELECT: Anyone can view service areas of approved vendors or vendors viewing their own store
DROP POLICY IF EXISTS "Public can view service areas of approved vendors" ON public.vendor_service_areas;
CREATE POLICY "Public can view service areas of approved vendors" ON public.vendor_service_areas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = vendor_service_areas.vendor_id 
              AND vendor_stores.status = 'approved'
        ) OR 
        EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = vendor_service_areas.vendor_id 
              AND vendor_stores.owner_id = auth.uid()
        ) OR 
        public.is_admin()
    );

-- INSERT: Approved or pending vendors can configure service areas for their own store
DROP POLICY IF EXISTS "Vendors can insert service areas for own store" ON public.vendor_service_areas;
CREATE POLICY "Vendors can insert service areas for own store" ON public.vendor_service_areas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = vendor_service_areas.vendor_id 
              AND vendor_stores.owner_id = auth.uid()
              AND vendor_stores.status != 'suspended'
        ) OR public.is_admin()
    );

-- UPDATE: Vendors can update their own store's service areas
DROP POLICY IF EXISTS "Vendors can update service areas for own store" ON public.vendor_service_areas;
CREATE POLICY "Vendors can update service areas for own store" ON public.vendor_service_areas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = vendor_service_areas.vendor_id 
              AND vendor_stores.owner_id = auth.uid()
              AND vendor_stores.status != 'suspended'
        ) OR public.is_admin()
    );

-- DELETE: Vendors can delete their own store's service areas
DROP POLICY IF EXISTS "Vendors can delete service areas for own store" ON public.vendor_service_areas;
CREATE POLICY "Vendors can delete service areas for own store" ON public.vendor_service_areas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.vendor_stores 
            WHERE vendor_stores.id = vendor_service_areas.vendor_id 
              AND vendor_stores.owner_id = auth.uid()
        ) OR public.is_admin()
    );
