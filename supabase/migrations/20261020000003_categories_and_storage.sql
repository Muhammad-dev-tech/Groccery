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
