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
