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
