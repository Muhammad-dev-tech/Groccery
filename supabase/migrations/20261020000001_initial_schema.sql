-- ==============================================================================
-- MULTI-VENDOR ONLINE GROCERY MARKETPLACE — CORE DATABASE SCHEMA
-- Migration: 20261020000001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE store_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE unit_of_measure AS ENUM ('kg', 'g', 'l', 'ml', 'piece', 'pack', 'bundle');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled', 'rejected');

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
