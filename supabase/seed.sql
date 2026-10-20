-- ==============================================================================
-- MULTI-VENDOR ONLINE GROCERY MARKETPLACE — DEVELOPMENT & EVALUATION SEED DATA
-- seed.sql
-- ==============================================================================

-- 1. Ensure test categories exist
INSERT INTO public.categories (id, name, slug, description, icon, display_order)
VALUES
    ('c0000000-0000-4000-8000-000000000001', 'Rice & Grains', 'rice-grains', 'Rice, flour, oats, pasta, and dry legumes', '🌾', 1),
    ('c0000000-0000-4000-8000-000000000002', 'Cooking Oil', 'cooking-oil', 'Olive oil, sunflower oil, vegetable oil, and ghee', '🫒', 2),
    ('c0000000-0000-4000-8000-000000000003', 'Beverages', 'beverages', 'Fresh juices, tea, coffee, mineral water, and soft drinks', '🧃', 3),
    ('c0000000-0000-4000-8000-000000000004', 'Dairy & Eggs', 'dairy-eggs', 'Fresh milk, farm eggs, cheese, butter, and yogurt', '🥛', 4),
    ('c0000000-0000-4000-8000-000000000005', 'Fresh Vegetables', 'fresh-vegetables', 'Farm-fresh leafy greens, roots, and vegetables', '🥦', 5),
    ('c0000000-0000-4000-8000-000000000006', 'Fresh Fruits', 'fresh-fruits', 'Seasonal and exotic fresh fruits', '🍎', 6)
ON CONFLICT (id) DO NOTHING;

-- 2. Test Vendor Profiles (Mock profile records for seed)
INSERT INTO public.profiles (id, full_name, phone, role)
VALUES
    ('u0000000-0000-4000-8000-000000000001', 'Marcus Vance (Organic Valley)', '+1 555-0101', 'vendor'),
    ('u0000000-0000-4000-8000-000000000002', 'Elena Rostova (Corner Grocers)', '+1 555-0102', 'vendor'),
    ('u0000000-0000-4000-8000-000000000003', 'Tariq Al-Mansoor (Metro Food)', '+1 555-0103', 'vendor')
ON CONFLICT (id) DO UPDATE SET role = 'vendor';

-- 3. Approved Vendor Stores
INSERT INTO public.vendor_stores (id, owner_id, name, slug, description, contact_email, contact_phone, address, city, state, postal_code, status)
VALUES
    (
        'v0000000-0000-4000-8000-000000000001',
        'u0000000-0000-4000-8000-000000000001',
        'Organic Valley Market',
        'organic-valley-market',
        'Certified organic staples, farm-fresh produce, and natural pantry essentials.',
        'marcus@organicvalleymarket.com',
        '+1 555-0101',
        '104 Green Grove Way',
        'Springfield',
        'IL',
        '62701',
        'approved'
    ),
    (
        'v0000000-0000-4000-8000-000000000002',
        'u0000000-0000-4000-8000-000000000002',
        'Corner Grocers & Deli',
        'corner-grocers-deli',
        'Your trusted neighborhood market with value prices and wholesale grocery sizes.',
        'elena@cornergrocers.com',
        '+1 555-0102',
        '552 Maple Street',
        'Springfield',
        'IL',
        '62702',
        'approved'
    ),
    (
        'v0000000-0000-4000-8000-000000000003',
        'u0000000-0000-4000-8000-000000000003',
        'Metro Food Mart',
        'metro-food-mart',
        'Imported specialty foods, bulk grains, and everyday pantry provisions.',
        'tariq@metrofoodmart.com',
        '+1 555-0103',
        '889 Commerce Boulevard',
        'Springfield',
        'IL',
        '62704',
        'approved'
    )
ON CONFLICT (id) DO UPDATE SET status = 'approved';

-- 4. Cross-Vendor Equivalent Products for Price Comparison Demonstrations
-- Demonstrates:
-- Product A: Royal Basmati Rice (Vendor 1 sells 1kg for $4.50 -> $4.50/kg; Vendor 2 sells 5kg bulk for $18.00 -> $3.60/kg; Vendor 3 sells 500g for $2.50 -> $5.00/kg)
-- Product B: Extra Virgin Olive Oil (Vendor 1 sells 500ml for $6.00 -> $12.00/L; Vendor 2 sells 1L for $10.50 -> $10.50/L; Vendor 3 sells 750ml for $8.25 -> $11.00/L)
-- Product C: Farm Fresh Whole Milk (Vendor 1 sells 1L for $1.80 -> $1.80/L; Vendor 2 sells 2L for $3.20 -> $1.60/L)
INSERT INTO public.products (id, vendor_id, category_id, name, description, price, currency, package_quantity, unit_of_measurement, stock_quantity, is_available, is_archived)
VALUES
    -- Royal Basmati Rice across 3 vendors with different package sizes
    ('p0000000-0000-4000-8000-000000000001', 'v0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Royal Himalayan Basmati Rice 1kg', 'Aged fragrant long grain basmati rice, naturally cultivated.', 4.50, 'USD', 1.000, 'kg', 65, true, false),
    ('p0000000-0000-4000-8000-000000000002', 'v0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'Royal Himalayan Basmati Rice 5kg Sack', 'Bulk sack of aged aromatic basmati rice for family cooking.', 18.00, 'USD', 5.000, 'kg', 30, true, false),
    ('p0000000-0000-4000-8000-000000000003', 'v0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'Royal Himalayan Basmati Rice 500g', 'Convenient half-kilo pack of extra long grain basmati.', 2.50, 'USD', 500.000, 'g', 45, true, false),

    -- Extra Virgin Olive Oil across 3 vendors
    ('p0000000-0000-4000-8000-000000000004', 'v0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'Cold Pressed Extra Virgin Olive Oil 500ml', 'First cold-pressed Mediterranean extra virgin olive oil.', 6.00, 'USD', 500.000, 'ml', 25, true, false),
    ('p0000000-0000-4000-8000-000000000005', 'v0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'Cold Pressed Extra Virgin Olive Oil 1L', 'Family bottle of 100% pure extra virgin olive oil.', 10.50, 'USD', 1.000, 'l', 40, true, false),
    ('p0000000-0000-4000-8000-000000000006', 'v0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002', 'Cold Pressed Extra Virgin Olive Oil 750ml', 'Glass bottle of premium aromatic olive oil.', 8.25, 'USD', 750.000, 'ml', 35, true, false),

    -- Fresh Milk across 2 vendors
    ('p0000000-0000-4000-8000-000000000007', 'v0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 'Pure Farm Fresh Whole Milk 1L', 'Pasteurized, rich whole dairy milk from local farms.', 1.80, 'USD', 1.000, 'l', 50, true, false),
    ('p0000000-0000-4000-8000-000000000008', 'v0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000004', 'Pure Farm Fresh Whole Milk 2L Jug', 'Large 2-litre value jug of farm-fresh homogenized whole milk.', 3.20, 'USD', 2.000, 'l', 35, true, false),

    -- Fresh Vegetables & Fruits
    ('p0000000-0000-4000-8000-000000000009', 'v0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000005', 'Organic Crisp Gala Apples 1kg', 'Sweet, crunchy gala apples harvested from local orchards.', 2.99, 'USD', 1.000, 'kg', 80, true, false),
    ('p0000000-0000-4000-8000-000000000010', 'v0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000005', 'Fresh Gala Apples 1.5kg Bag', 'Pre-bagged crisp gala snacking apples.', 3.89, 'USD', 1.500, 'kg', 50, true, false)
ON CONFLICT (id) DO UPDATE 
SET 
    price = EXCLUDED.price,
    package_quantity = EXCLUDED.package_quantity,
    stock_quantity = EXCLUDED.stock_quantity;

-- 5. Vendor Service Areas (Geographic Delivery Zones by Postal Code and Neighborhood)
INSERT INTO public.vendor_service_areas (id, vendor_id, city, state, zone_name, postal_code)
VALUES
    -- Organic Valley Market (Springfield)
    ('a1000000-0000-4000-8000-000000000001', 'v0000000-0000-4000-8000-000000000001', 'Springfield', 'IL', 'Downtown & Capitol District', '62701'),
    ('a1000000-0000-4000-8000-000000000002', 'v0000000-0000-4000-8000-000000000001', 'Springfield', 'IL', 'Westside & Laketown', '62704'),

    -- Corner Grocers & Deli (Springfield)
    ('a1000000-0000-4000-8000-000000000003', 'v0000000-0000-4000-8000-000000000002', 'Springfield', 'IL', 'Downtown & Capitol District', '62701'),
    ('a1000000-0000-4000-8000-000000000004', 'v0000000-0000-4000-8000-000000000002', 'Springfield', 'IL', 'North End & Eastside', '62702'),

    -- Metro Food Mart (Chicago)
    ('a1000000-0000-4000-8000-000000000005', 'v0000000-0000-4000-8000-000000000003', 'Chicago', 'IL', 'The Loop & River North', '60601'),
    ('a1000000-0000-4000-8000-000000000006', 'v0000000-0000-4000-8000-000000000003', 'Chicago', 'IL', 'West Loop & Fulton Market', '60607')
ON CONFLICT (id) DO UPDATE
SET
    zone_name = EXCLUDED.zone_name,
    postal_code = EXCLUDED.postal_code;
